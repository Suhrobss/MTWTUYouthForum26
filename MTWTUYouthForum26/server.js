// MTWTU Youth Forum 2026 — PLAI//OS
// Zero-framework Node server: static files, public API, participant cabinets (personal codes),
// parallel-session sign-up, Unionize seating, organizer admin, Web Push and the Юніончик assistant (Claude-powered)
// that escalates questions it cannot answer to organizers.
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

let webpush = null;
try { webpush = require('web-push'); } catch { console.warn('[push] web-push не встановлено — push вимкнено'); }

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, '.data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const SEED_FILE = path.join(ROOT, 'data', 'program.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';
const MODE = process.env.SITE_MODE || 'preview';
const SCHEMA = 7;
const DAYS = ['2026-12-06', '2026-12-07', '2026-12-08', '2026-12-09', '2026-12-10', '2026-12-11'];

/* ---------------- storage ---------------- */
let store;
function loadStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
  if (fs.existsSync(STORE_FILE)) { try { store = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')); } catch { store = null; } }
  if (!store) store = { events: seed.events, announcements: [], subscriptions: [], vapid: null };
  const was = store.schema || 1;
  if (was < 2) store.events = seed.events; // v2: program from the organizers' PDF
  if (was < 3) {
    // v3: full speaker names and roles from the organizers
    store.events = store.events.map(e => { const s = seed.events.find(x => x.id === e.id); return s ? { ...e, speakerNames: s.speakerNames } : e; });
    store.speakers = (seed.speakers || []).map(sp => { const old = (store.speakers || []).find(x => x.id === sp.id); return old && old.photo && !sp.photo ? { ...sp, photo: old.photo } : sp; });
  }
  if (was < 4) {
    // v4: updated organizers' program (13.11): titles, descriptions, speakers, Unionize hosts, transfers
    store.events = seed.events;
    store.speakers = (seed.speakers || []).map(sp => { const old = (store.speakers || []).find(x => x.id === sp.id); return old && old.photo && !sp.photo ? { ...sp, photo: old.photo, logo: old.logo || sp.logo } : sp; });
    (store.unionize ||= seed.unionize).tables.forEach(t => { const s = seed.unionize.tables.find(x => x.n === t.n); if (s && !t.host) t.host = s.host; });
    store.transport = seed.transport.map(t => ({ ...t, meet: (store.transport || []).find(x => x.key === t.key)?.meet || '' }));
  }
  if (was < 5) {
    // v5: travel days 6 and 11 December, guests' dinner, free time at 23:00 (program of 13.11)
    for (const e of seed.events) if (!store.events.some(x => x.id === e.id)) store.events.push(e);
    store.events = store.events.map(e => { const s = seed.events.find(x => x.id === e.id); return s && s.seq != null ? { ...e, seq: s.seq, group: s.group } : e; });
    store.settings ||= {};
    if (!store.settings.participantsLabel) store.settings.participantsLabel = seed.settings.participantsLabel;
  }
  if (was < 6) {
    // v6: updated program (Nov 2026): registration 17:00, guests' transfers, Gagarin Plaza, party till 01:00, 10.12 timings, Unionize table 6
    const keep = new Map((store.events || []).map(e => [e.id, e]));
    store.events = seed.events.map(e => ({ ...e, published: keep.get(e.id)?.published ?? e.published }));
    store.speakers = (seed.speakers || []).map(sp => { const old = (store.speakers || []).find(x => x.id === sp.id); return old ? { ...sp, photo: old.photo || sp.photo, logo: old.logo || sp.logo } : sp; });
    const t6 = (store.unionize ||= seed.unionize).tables.find(t => t.n === 6); if (t6) t6.host = seed.unionize.tables.find(t => t.n === 6).host;
    store.transport = seed.transport.map(t => { const old = (store.transport || []).find(x => x.key === t.key); const { meetDefault, ...rest } = t; return { ...rest, meet: old?.meet || meetDefault || '' }; });
  }
  if (was < 7) {
    // v7: LAW HUB in the Great Hall right after the union-history training (not parallel); Kyiv route; participant categories
    for (const id of ['092', '093', '094']) { const sd = seed.events.find(x => x.id === id), i = store.events.findIndex(x => x.id === id); if (sd && i >= 0) store.events[i] = { ...sd, published: store.events[i].published ?? sd.published }; }
    for (const pp of store.participants || []) for (const k of Object.keys(pp.sessions || {})) if (k === '2026-12-09 10:00') delete pp.sessions[k];
    const kv = (store.transport || []).find(t => t.key === 'kyiv'), ks = seed.transport.find(t => t.key === 'kyiv'); if (kv && ks) kv.note = ks.note;
    for (const pp of store.participants || []) pp.category ||= 'participant';
  }
  store.schema = SCHEMA;
  store.announcements ||= [];
  store.subscriptions ||= [];
  store.participants ||= [];
  store.questions ||= [];
  store.knowledge ||= [];
  store.speakers ||= seed.speakers || [];
  store.sponsors ||= seed.sponsors || [];
  store.unionize ||= seed.unionize;
  store.transport ||= seed.transport;
  store.settings = { ...seed.settings, ...(store.settings || {}) };
  if (!store.texts || typeof store.texts !== 'object' || Array.isArray(store.texts)) store.texts = {};
  if (webpush) {
    let pub = process.env.VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
    if (!pub || !priv) { store.vapid ||= webpush.generateVAPIDKeys(); pub = store.vapid.publicKey; priv = store.vapid.privateKey; }
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:youth@mtwtu.org.ua', pub, priv);
    store.vapidPublicKey = pub;
  }
  saveStore();
}
let saving = Promise.resolve();
function saveStore() {
  store.updatedAt = new Date().toISOString();
  const snapshot = JSON.stringify(store, null, 1);
  saving = saving.then(async () => { const tmp = STORE_FILE + '.tmp'; await fsp.writeFile(tmp, snapshot); await fsp.rename(tmp, STORE_FILE); }).catch(err => console.error('[store]', err));
  return saving;
}

/* ---------------- helpers ---------------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8' };
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https:; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; frame-src 'none'; base-uri 'self'; form-action 'self'"
};
function send(res, status, body, headers = {}) { res.writeHead(status, { ...SECURITY_HEADERS, ...headers }); res.end(body); }
const json = (res, status, obj, headers = {}) => send(res, status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
const fail = (status, message) => Object.assign(new Error(message), { status });
async function readBody(req, limit = 64 * 1024) {
  let size = 0; const chunks = [];
  for await (const c of req) { size += c.length; if (size > limit) throw fail(413, 'Завеликий запит'); chunks.push(c); }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { throw fail(400, 'Некоректний JSON'); }
}
const str = (v, max) => String(v ?? '').trim().slice(0, max);
const isTime = v => v === '' || v == null || /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const isUrl = v => !v || /^https:\/\/[^\s"'<>]+$/.test(v);
const kyivTs = (date, time) => Date.parse(`${date}T${time || '00:00'}:00+02:00`);
const ipOf = req => (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
const limits = new Map();
function rateLimit(key, max, windowMs) {
  const now = Date.now(); const list = (limits.get(key) || []).filter(t => now - t < windowMs);
  if (list.length >= max) { limits.set(key, list); return false; }
  list.push(now); limits.set(key, list); return true;
}

/* ---------------- sessions (admin + participant) ---------------- */
const sign = v => crypto.createHmac('sha256', SESSION_SECRET).update(v).digest('base64url');
function makeToken(kind, id, ttlMs) { const exp = String(Date.now() + ttlMs); return `${id}.${exp}.${sign(kind + ':' + id + ':' + exp)}`; }
function readToken(req, cookie, kind) {
  const m = new RegExp(`(?:^|;\\s*)${cookie}=([^;]+)`).exec(req.headers.cookie || '');
  if (!m) return null;
  const [id, exp, sig] = m[1].split('.');
  if (!id || !exp || !sig || Number(exp) < Date.now()) return null;
  const good = sign(kind + ':' + id + ':' + exp);
  return good.length === sig.length && crypto.timingSafeEqual(Buffer.from(good), Buffer.from(sig)) ? id : null;
}
const isAdmin = req => readToken(req, 'plai_admin', 'admin') === 'admin';
const meOf = req => { const id = readToken(req, 'plai_p', 'p'); return id ? store.participants.find(p => p.id === id) || null : null; };
const secureFlag = req => ((req.headers['x-forwarded-proto'] || '').includes('https') ? '; Secure' : '');
const cookie = (req, name, value, maxAge) => `${name}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secureFlag(req)}`;

/* ---------------- participants ---------------- */
const CODE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function newCode() {
  for (;;) {
    let c = 'PLAI-'; const b = crypto.randomBytes(4);
    for (const x of b) c += CODE_ABC[x % CODE_ABC.length];
    if (!store.participants.some(p => p.code === c)) return c;
  }
}
const CATS = { participant: 'Учасник', guest: 'Запрошений гість', staff: 'Апарат', escort: 'Супровід' };
function catKey(v) {
  const s = String(v || '').toLowerCase().trim();
  if (CATS[s]) return s;
  if (/запрош|гіст|гост|guest/.test(s)) return 'guest';
  if (/апарат|staff|оргком|організ/.test(s)) return 'staff';
  if (/супров|escort|керівник груп/.test(s)) return 'escort';
  return 'participant';
}
const nameKey = n => String(n || '').toLowerCase().replace(/[’'`ʼ]/g, '').replace(/\s+/g, ' ').trim();
function hostTableOf(p) {
  if (p.hostTable) return p.hostTable;
  const k = nameKey(p.name); if (k.length < 5) return null;
  return store.unionize.tables.find(t => t.host && nameKey(t.host).includes(k))?.n || null;
}
const normCode = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^PLAI/, 'PLAI-');
function groupKey(v) {
  const s = String(v || '').toLowerCase();
  if (store.transport.some(t => t.key === s)) return s;
  if (/ізма|izma/.test(s)) return 'izmail';
  if (/киї|київ|kyiv|kiev/.test(s)) return 'kyiv';
  if (/одес|odes/.test(s)) return 'odesa';
  return '';
}
function freeSeat(table, exceptId) {
  const t = store.unionize.tables.find(x => x.n === table);
  if (!t) return null;
  const taken = new Set(store.participants.filter(p => p.table === table && p.id !== exceptId).map(p => p.seat));
  for (let s = 1; s <= t.capacity; s++) if (!taken.has(s)) return s;
  return null;
}
function placeAtTable(p, table) {
  if (!table) { p.table = null; p.seat = null; return; }
  const t = Number(table);
  if (!store.unionize.tables.some(x => x.n === t)) throw fail(400, `Стола ${table} немає`);
  if (p.table === t && p.seat) return;
  const s = freeSeat(t, p.id);
  if (!s) throw fail(409, `Стіл ${t} заповнений`);
  p.table = t; p.seat = s;
}
function cleanParticipant(input, base) {
  const p = base || { id: 'u' + crypto.randomBytes(5).toString('hex'), code: newCode(), sessions: {}, table: null, seat: null, createdAt: new Date().toISOString() };
  if ('name' in input) p.name = str(input.name, 80);
  if ('group' in input) p.group = groupKey(input.group);
  if ('team' in input) p.team = str(input.team, 60);
  if ('room' in input) p.room = str(input.room, 20);
  if ('note' in input) p.note = str(input.note, 200);
  if ('category' in input) p.category = catKey(input.category);
  p.category ||= 'participant';
  if ('role' in input) p.role = str(input.role, 140);
  if ('duties' in input) p.duties = String(input.duties ?? '').replace(/\r/g, '').trim().slice(0, 1500);
  if ('travel' in input) p.travel = String(input.travel ?? '').replace(/\r/g, '').trim().slice(0, 600);
  if ('events' in input) p.events = (Array.isArray(input.events) ? input.events : []).filter(id => store.events.some(e => e.id === id)).slice(0, 40);
  if (!p.name) throw fail(400, 'Потрібне ім’я');
  if ('code' in input && String(input.code || '').trim()) {
    const c = normCode(input.code);
    if (c.replace(/-/g, '').length < 4 || c.length > 24) throw fail(400, 'Код має містити 4–24 латинські літери або цифри');
    const other = store.participants.find(x => x.code === c && x.id !== p.id);
    if (other) throw fail(409, `Код ${c} уже має ${other.name}`);
    p.code = c;
  }
  if ('hostTable' in input) {
    const n = input.hostTable === '' || input.hostTable == null ? null : Number(input.hostTable);
    if (n && !store.unionize.tables.some(t => t.n === n)) throw fail(400, `Стола ${n} немає`);
    const old = p.hostTable ? store.unionize.tables.find(t => t.n === p.hostTable) : null;
    if (old && old.n !== n && nameKey(old.host) === nameKey(p.name)) old.host = '';
    p.hostTable = n || null;
    if (n) store.unionize.tables.find(x => x.n === n).host = p.name;
  }
  if ('table' in input) placeAtTable(p, input.table === '' || input.table == null ? null : input.table);
  return p;
}
function parseCsv(text) {
  const lines = String(text || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const sep = [';', '\t', ','].find(s => lines[0].includes(s)) || ';';
  let rows = lines.map(l => l.split(sep).map(c => c.trim().replace(/^"|"$/g, '')));
  const head = rows[0].map(h => h.toLowerCase());
  const hasHead = head.some(h => /ім|name|груп|стіл|команд|катег|посад|^код/.test(h));
  const idx = (re, d) => { const i = head.findIndex(h => re.test(h)); return hasHead ? i : d; };
  const cols = { name: idx(/ім|піб|name/, 0), group: idx(/груп|доїзд|місто|group/, 1), table: idx(/стіл|table/, 2), team: idx(/команд|team/, 3), room: idx(/кімн|room/, 4), category: idx(/катег|статус|category/, 5), role: idx(/посад|функц|роль|role/, 6), code: idx(/^код|code/, -1) };
  if (hasHead) rows = rows.slice(1);
  return rows.map(r => Object.fromEntries(Object.entries(cols).filter(([, i]) => i >= 0 && r[i] != null).map(([k, i]) => [k, r[i]])));
}
const parallelSlots = () => {
  const map = new Map();
  for (const e of store.events) if (e.track === 'parallel' && e.published !== false && e.start) {
    const k = e.date + ' ' + e.start; if (!map.has(k)) map.set(k, []); map.get(k).push(e);
  }
  return map;
};
const sessionCounts = () => {
  const c = {};
  for (const p of store.participants) for (const id of Object.values(p.sessions || {})) c[id] = (c[id] || 0) + 1;
  return c;
};
function myPayload(p) {
  const neighbours = p.table ? store.participants.filter(x => x.table === p.table && x.id !== p.id).sort((a, b) => a.seat - b.seat).map(x => ({ name: x.name, seat: x.seat })) : [];
  const table = p.table ? store.unionize.tables.find(t => t.n === p.table) : null;
  const hn = hostTableOf(p);
  const host = hn ? { n: hn, label: store.unionize.tables.find(t => t.n === hn)?.label || '', seated: store.participants.filter(x => x.table === hn && x.id !== p.id).sort((a, b) => a.seat - b.seat).map(x => ({ name: x.name, seat: x.seat })) } : null;
  return {
    id: p.id, name: p.name, group: p.group, team: p.team, room: p.room, sessions: p.sessions || {},
    category: p.category || 'participant', categoryLabel: CATS[p.category] || CATS.participant, role: p.role || '', duties: p.duties || '', travel: p.travel || '', events: p.events || [], host,
    table: p.table, seat: p.seat, tableInfo: table, neighbours,
    transport: store.transport.find(t => t.key === p.group) || null,
    questions: store.questions.filter(q => q.participantId === p.id).map(publicQuestion)
  };
}

/* ---------------- questions to organizers ---------------- */
const publicQuestion = q => ({ id: q.id, text: q.text, status: q.status, answer: q.final || null, createdAt: q.createdAt, answeredAt: q.answeredAt || null });
async function createQuestion({ text, participant, asker, draft }) {
  const q = { id: 'q' + crypto.randomBytes(5).toString('hex'), text: str(text, 600), participantId: participant?.id || null, participantName: participant?.name || '', asker: str(asker, 64) || null, draft: str(draft, 2000), status: 'open', createdAt: new Date().toISOString() };
  store.questions.unshift(q); await saveStore();
  broadcast({ title: 'Нове питання від учасника', body: q.text.slice(0, 160), url: '/#/admin', tag: q.id }, s => s.admin);
  tgNotifyQuestion(q).catch(err => console.error('[tg notify]', err.message));
  return q;
}
// level 0 — friendly rewrite; 1 — light edit close to the organizer's words; 2 — only spelling/punctuation; 3 — organizer's text as is
const POLISH = [
  'Ти редагуєш відповідь організаторів молодіжного форуму для учасника. Перепиши відповідь організатора українською: дружньо, коротко, чітко, без емодзі. Не додавай жодних фактів, яких немає у відповіді організатора. Поверни лише текст відповіді.',
  'Ти мінімально редагуєш відповідь організатора молодіжного форуму. Збережи його слова, порядок думок, довжину й тон якомога ближче до оригіналу; лише виправ граматику й пунктуацію та зроби незграбні місця трохи гладшими. Не додавай нових фактів, привітань, підписів чи пояснень, без емодзі. Поверни лише текст відповіді.',
  'Виправ у тексті організатора лише орфографію, пунктуацію та явні описки. Нічого не перефразовуй, не додавай і не прибирай, збережи всі слова й порядок. Поверни лише виправлений текст.'
];
const POLISH_NOTE = ['Варіант Юніончика', 'Ближче до вашого тексту', 'Ваш текст, виправлені лише помилки', 'Ваш текст без змін'];
async function polishAnswer(q, raw, level = 0) {
  level = Math.max(0, Math.min(3, Number(level) || 0));
  if (level >= 3) return { text: raw, level, ai: false };
  const t = await claudeOnce(POLISH[level], `Питання учасника: ${q.text}\n\nВідповідь організатора: ${raw}`);
  return t ? { text: t, level, ai: true } : { text: raw, level: 3, ai: false };
}
async function answerQuestion(q, rawText, { polish = true, addToKnowledge = true, by = 'admin', final: given = '' } = {}) {
  const raw = str(rawText, 1500); if (!raw) throw fail(400, 'Напишіть відповідь');
  let final = str(given, 2000) || raw;
  if (!str(given, 2000) && polish) final = (await polishAnswer(q, raw, 0)).text;
  Object.assign(q, { status: 'answered', raw, final, answeredAt: new Date().toISOString(), answeredBy: by });
  if (addToKnowledge) { store.knowledge = store.knowledge.filter(k => k.id !== q.id); store.knowledge.unshift({ id: q.id, q: q.text, a: final, createdAt: q.answeredAt }); }
  await saveStore();
  const push = await broadcast({ title: 'Організатори відповіли на ваше питання', body: final.slice(0, 160), url: '/#/ask', tag: q.id }, s => (q.participantId && s.participantId === q.participantId) || (q.asker && s.asker === q.asker));
  if (by !== 'telegram' && q.tg) tg('sendMessage', { chat_id: q.tg.chatId, reply_to_message_id: q.tg.messageId, allow_sending_without_reply: true, parse_mode: 'HTML', text: `✅ <b>Відповіли через сайт:</b>\n${tgEsc(final)}` });
  return { q, push };
}

/* ---------------- Telegram: questions to organizers' group ---------------- */
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
let tgBot = null, tgLastUpdate = null, tgLastError = null;
const tgEsc = v => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function tg(method, params = {}) {
  if (!TG_TOKEN) return null;
  try {
    const r = await fetch(`${process.env.TELEGRAM_API_URL || 'https://api.telegram.org'}/bot${TG_TOKEN}/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(params) });
    const d = await r.json();
    if (!d.ok) { console.warn('[tg]', method, d.description); if (method !== 'getUpdates' || !/terminated by other/.test(d.description)) tgLastError = `${method}: ${d.description}`; }
    return d.ok ? d.result : null;
  } catch (err) { console.warn('[tg]', method, err.message); return null; }
}
function tgState() { store.telegram ||= {}; if (!store.telegram.linkCode) store.telegram.linkCode = crypto.randomBytes(6).toString('hex'); return store.telegram; }
function tgWho(q) {
  const p = q.participantId ? store.participants.find(x => x.id === q.participantId) : null;
  if (!p) return q.participantName || 'Відвідувач сайту (без входу за кодом)';
  const grp = store.transport.find(t => t.key === p.group)?.title;
  return [p.name, p.table ? `стіл ${p.table}` : '', grp || '', p.team || ''].filter(Boolean).join(' · ');
}
async function tgNotifyQuestion(q) {
  const t = tgState(); if (!TG_TOKEN || !t.chatId) return;
  const m = await tg('sendMessage', { chat_id: t.chatId, parse_mode: 'HTML', text: `❓ <b>Питання учасника</b>\n${tgEsc(tgWho(q))}\n\n${tgEsc(q.text)}\n\n<i>Щоб відповісти — натисніть «Відповісти» (Reply) на це повідомлення. Юніончик відшліфує текст і надішле учаснику на сайт.</i>` });
  if (m) { q.tg = { chatId: t.chatId, messageId: m.message_id }; q.tgMsgs = [...new Set([...(q.tgMsgs || []), m.message_id])].slice(-10); await saveStore(); }
}
const tgKb = (q, level) => ({ inline_keyboard: [[{ text: '✅ Надіслати учаснику', callback_data: `s:${q.id}`, style: 'success' }], [...(level < 3 ? [{ text: '🔁 Перефразувати', callback_data: `r:${q.id}` }] : []), { text: '✖️ Скасувати', callback_data: `x:${q.id}` }]] });
const tgDraftText = (q, d) => `✍️ <b>Ось як піде учаснику</b> <i>(${tgEsc(POLISH_NOTE[d.level])})</i>:\n\n${tgEsc(d.text)}\n\n<i>Питання: ${tgEsc(q.text.slice(0, 200))}</i>\n${d.level < 3 ? '<i>«Перефразувати» — зробить текст ближчим до вашого.</i>' : '<i>Це ваш текст без змін.</i>'}`;
async function tgSendKb(params) {
  const r = await tg('sendMessage', params); if (r) return r;
  const kb = JSON.parse(JSON.stringify(params.reply_markup)); kb.inline_keyboard.flat().forEach(b => delete b.style);
  return tg('sendMessage', { ...params, reply_markup: kb });
}
async function tgEditKb(params) {
  const r = await tg('editMessageText', params); if (r || !params.reply_markup) return r;
  const kb = JSON.parse(JSON.stringify(params.reply_markup)); kb.inline_keyboard.flat().forEach(b => delete b.style);
  return tg('editMessageText', { ...params, reply_markup: kb });
}
async function tgCallback(cb) {
  const t = tgState(); const [act, qid] = String(cb.data || '').split(':');
  const msg = cb.message; const ack = text => tg('answerCallbackQuery', { callback_query_id: cb.id, ...(text ? { text } : {}) });
  if (!msg || msg.chat.id !== t.chatId) return ack();
  const q = store.questions.find(x => x.id === qid); const d = q?.tgDraft;
  if (!q || !d || d.msgId !== msg.message_id) { await ack('Ця чернетка вже неактуальна'); return tg('editMessageReplyMarkup', { chat_id: msg.chat.id, message_id: msg.message_id, reply_markup: { inline_keyboard: [] } }); }
  if (act === 's') {
    await ack('Надсилаю…');
    const { q: done, push } = await answerQuestion(q, d.raw, { final: d.text, by: 'telegram' });
    done.answeredByName = d.by; delete done.tgDraft; await saveStore();
    return tg('editMessageText', { chat_id: msg.chat.id, message_id: msg.message_id, parse_mode: 'HTML', text: `✅ <b>Надіслано учаснику:</b>\n${tgEsc(done.final)}\n\n<i>${done.participantId || done.asker ? 'Відповідь з’явилася в учасника на сайті' : 'Відповідь збережено'}${push?.sent ? ' і прийшла push-сповіщенням' : ''}. Додано в базу знань Юніончика.</i>` });
  }
  if (act === 'r') {
    if (d.level >= 3) return ack();
    await ack('Перефразовую ближче до вашого тексту…');
    const r = await polishAnswer(q, d.raw, d.level + 1);
    Object.assign(d, { text: r.text, level: r.level }); await saveStore();
    return tgEditKb({ chat_id: msg.chat.id, message_id: msg.message_id, parse_mode: 'HTML', text: tgDraftText(q, d), reply_markup: tgKb(q, d.level) });
  }
  if (act === 'x') {
    await ack('Скасовано'); delete q.tgDraft; await saveStore();
    return tg('editMessageText', { chat_id: msg.chat.id, message_id: msg.message_id, text: 'Скасовано. Щоб відповісти ще раз — зробіть Reply на повідомлення з питанням.' });
  }
  return ack();
}
async function tgHandle(u) {
  tgLastUpdate = new Date().toISOString();
  if (u.callback_query) return tgCallback(u.callback_query);
  const msg = u.message; if (!msg) return;
  const t = tgState(), chat = msg.chat;
  if (msg.migrate_to_chat_id && chat.id === t.chatId) {
    t.chatId = msg.migrate_to_chat_id;
    for (const q of store.questions) if (q.tg && q.tg.chatId === chat.id) q.tg.chatId = msg.migrate_to_chat_id;
    await saveStore(); return;
  }
  const text = msg.text || ''; if (!text) return;
  const start = text.match(/^\/start(?:@\w+)?(?:\s+(\S+))?/);
  if (start) {
    if (start[1] && start[1] === t.linkCode) {
      Object.assign(t, { chatId: chat.id, chatTitle: chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(' ') || 'чат', linkedAt: new Date().toISOString() });
      await saveStore();
      return tg('sendMessage', { chat_id: chat.id, text: 'Готово. Сюди надходитимуть питання учасників, на які Юніончик не знає відповіді.\n\nЩоб відповісти — зробіть Reply на повідомлення з питанням. Команда /open — показати всі питання без відповіді.' });
    }
    if (chat.type === 'private') return tg('sendMessage', { chat_id: chat.id, text: 'Підключення робиться з адмінки сайту форуму: «Налаштування» → «Підключити Telegram».' });
    return;
  }
  if (chat.id !== t.chatId) return;
  if (/^\/open(?:@\w+)?\b/.test(text)) {
    const open = store.questions.filter(q => q.status === 'open').slice(0, 15).reverse();
    if (!open.length) return tg('sendMessage', { chat_id: chat.id, text: 'Питань без відповіді немає.' });
    for (const q of open) await tgNotifyQuestion(q);
    return;
  }
  const reply = msg.reply_to_message; if (!reply) return;
  const rid = reply.message_id;
  const q = store.questions.find(x => (x.tgMsgs || []).includes(rid) || x.tg?.messageId === rid || x.tgDraft?.msgId === rid);
  if (!q) {
    if (reply.from?.id === tgBot?.id) return tg('sendMessage', { chat_id: chat.id, reply_to_message_id: msg.message_id, allow_sending_without_reply: true, text: 'Не знайшов, до якого питання ця відповідь. Зробіть Reply саме на повідомлення «❓ Питання учасника» або надішліть /open, щоб побачити всі відкриті питання.' });
    return;
  }
  if (text.startsWith('/')) return;
  const by = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ') || 'Telegram';
  await tg('sendChatAction', { chat_id: chat.id, action: 'typing' });
  const old = q.tgDraft; if (old?.msgId) tg('editMessageReplyMarkup', { chat_id: chat.id, message_id: old.msgId, reply_markup: { inline_keyboard: [] } });
  const raw = str(text, 1500);
  const r = await polishAnswer(q, raw, 0);
  const d = { raw, text: r.text, level: r.level, by };
  const sent = await tgSendKb({ chat_id: chat.id, reply_to_message_id: msg.message_id, allow_sending_without_reply: true, parse_mode: 'HTML', text: (q.status === 'answered' ? '<i>На це питання вже відповідали — нова відповідь замінить попередню.</i>\n' : '') + tgDraftText(q, d), reply_markup: tgKb(q, d.level) });
  if (sent) { d.msgId = sent.message_id; q.tgDraft = d; await saveStore(); }
}
async function tgLoop() {
  if (!TG_TOKEN) return;
  tgBot = await tg('getMe');
  if (!tgBot) { setTimeout(tgLoop, 60e3); return; }
  await tg('deleteWebhook', { drop_pending_updates: false });
  console.log(`[tg] бот @${tgBot.username} працює`);
  let offset = tgState().offset || 0;
  for (;;) {
    const ups = await tg('getUpdates', { offset, timeout: 25, allowed_updates: ['message', 'callback_query'] });
    if (!ups) { await sleep(5000); continue; }
    for (const up of ups) { offset = up.update_id + 1; try { await tgHandle(up); } catch (err) { console.error('[tg handle]', err.message); } }
    if (ups.length) { tgState().offset = offset; saveStore(); }
  }
}
async function claudeOnce(system, user, maxTokens = 500) {
  if (!ANTHROPIC_API_KEY) return null;
  const r = await fetch((process.env.ANTHROPIC_API_URL || 'https://api.anthropic.com') + '/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }) }).catch(() => null);
  if (!r || !r.ok) return null;
  const d = await r.json().catch(() => null);
  return d?.content?.map(c => c.text || '').join('').trim() || null;
}

/* ---------------- push ---------------- */
async function broadcast(payload, filter = () => true) {
  if (!webpush) return { sent: 0, failed: 0 };
  let sent = 0, failed = 0; const dead = [];
  await Promise.all(store.subscriptions.filter(filter).map(async sub => {
    try { await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, JSON.stringify(payload), { TTL: 3600 }); sent++; }
    catch (err) { failed++; if (err.statusCode === 404 || err.statusCode === 410) dead.push(sub.endpoint); }
  }));
  if (dead.length) { store.subscriptions = store.subscriptions.filter(s => !dead.includes(s.endpoint)); saveStore(); }
  return { sent, failed };
}

/* ---------------- public payload ---------------- */
function publicPayload() {
  const tablesTaken = {};
  for (const p of store.participants) if (p.table) tablesTaken[p.table] = (tablesTaken[p.table] || 0) + 1;
  return {
    updatedAt: store.updatedAt, mode: MODE,
    events: store.events.filter(e => e.published !== false),
    announcements: [...store.announcements].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    sessionCounts: sessionCounts(),
    unionize: { tables: store.unionize.tables.map(t => ({ ...t, taken: tablesTaken[t.n] || 0 })) },
    speakers: store.speakers, sponsors: store.sponsors, transport: store.transport, settings: store.settings, texts: store.texts,
    webPushAvailable: Boolean(webpush && store.vapidPublicKey), vapidPublicKey: store.vapidPublicKey || '',
    ai: Boolean(ANTHROPIC_API_KEY)
  };
}

/* ---------------- Claude concierge ---------------- */
const FACTS = `
ДЖЕРЕЛО: офіційна програма організаторів «MTWTUYOUTH FORUM 2026» (оновлена версія). Усі час і місця — попередні, можуть уточнюватися.
ЗАГАЛЬНЕ: MTWTU Youth Forum 2026 — Форум Молодіжної ради ПРМТУ (Профспілка робітників морського транспорту України). 7–10 грудня 2026, гірськолижний комплекс (ГК) «Плай», с. Плав'я, Львівська область. Учасників — 70. Дні: 06.12 — проїзд учасників Одеса → «Плай»; 07.12 — День 1 (прибуття, реєстрація, брифінг); 08.12 — День 2 (відкриття, дискусія, тренінги, UNIONIZE, боулінг); 09.12 — День 3 (тренінги, екоферма, підсумки, фінальна вечірка); 10.12 — День 4 (підйомники, виїзд); 11.12 — прибуття до Одеси та трансфер до Ізмаїла. Сайт комплексу: https://play-karpaty.com/
КЕРІВНИК: Олег Ігоревич Григорюк — Голова ПРМТУ, член Виконавчого комітету ITF, Віце-президент IFSMA.
СПІКЕРИ ТА МОДЕРАТОРИ: Олег Григорюк — голова ПРМТУ, член Виконавчого комітету ITF, Віце-президент IFSMA (відкриття, дискусія, тренінг «CV», MTWTU LAW HUB); Ірина Єріненко — голова Молодіжної ради ПРМТУ, юрист MTWTU LAW HUB (відкриття, ведуча столу 2); Георгій Сандул — директор, юрист ГО «Трудові ініціативи» (дискусія, «Історія профспілкового руху», «Профспілковий органайзинг»); Іванна Храпко — голова Молодіжної ради ФПУ, заступниця голови Профспілки працівників державних установ України (дискусія, органайзинг); Павло Олещук — помічник голови Професійної спілки працівників атомної енергетики та промисловості України (дискусія, органайзинг); Христина Левченко — голова Організації молоді Професійної спілки працівників атомної енергетики та промисловості України (дискусія, органайзинг); Юрій Верещака — голова Молодіжної ради Профспілки залізничників і транспортних будівельників України (дискусія); Юлія Пелих — адвокат, трудовий медіатор, Team Lead MTWTU LAW HUB (тренінг «Медіація», ведуча столу 3); Світлана Сергєєва — віцепрезидентка Української академії медіації, адвокат (тренінг «Медіація»); Юрій Сергєєв — керуючий партнер ТОВ «Юридичне бюро Сергєєвих», адвокат, голова відділення Асоціації правників України в Одеській області (тренінг «CV»); Сухроб Собіров — координатор та юрист MTWTU LAW HUB, член Молодіжної ради ПРМТУ (MTWTU LAW HUB, ведучий столу 1).
СКОРОЧЕННЯ: «ГО ТІ» = ГО «Трудові ініціативи» (директор Георгій Сандул); «Атомники» — Професійна спілка працівників атомної енергетики та промисловості України; «Залізничники» — Профспілка залізничників і транспортних будівельників України; ФПУ — Федерація профспілок України.
ЛОКАЦІЇ ЗА ПРОГРАМОЮ: Велика зала, Мала зала, Ресторан, Ресторан «Карпатська ружа» (вечеря для запрошених гостей), Боулінг, Готель/рецепція, Екоферма «Плай». Інших подробиць про розташування на території немає.
ДЕНЬ 1, 07.12: до 16:00 — прибуття та поселення (готель/рецепція); 17:00–18:00 — реєстрація учасників, отримання інформаційних матеріалів (готель/рецепція); 18:00–19:00 — вечеря (ресторан); 19:00–20:30 — організаційний брифінг: програма, організаційні питання, правила участі, представлення команд (Велика зала); з 20:30 — вільний час.
ДЕНЬ 2, 08.12: 09:00–10:00 сніданок; 10:00–10:20 офіційне відкриття (Велика зала) — Олег Григорюк та Ірина Єріненко; 10:20–11:45 вітальні слова партнерів і відкрита дискусія «Можливості профспілки» (Велика зала); 11:45–12:00 кава-пауза; 12:00–13:30 паралельні тренінги «Медіація» (Мала зала) і «CV» (Велика зала); 13:30–14:30 обід; 14:30–16:15 UNIONIZE, частина 1 (Велика зала); 16:15–16:30 кава-пауза; 16:30–18:30 UNIONIZE, частина 2 — учасники повертаються на свої місця; 18:30–19:00 підбиття підсумків гри; 19:00–20:00 вечеря; 20:00–22:00 BOWLING NIGHT: Battle of Crews — командний турнір з боулінгу (Боулінг); після 22:00 — вільний час.
ДЕНЬ 3, 09.12: 09:00–10:00 сніданок; з 10:00 у Великій залі для всіх: спершу «Історія профспілкового руху: інтерактивний тренінг» з тематичним квізом (Георгій Сандул), одразу після нього там само — «MTWTU LAW HUB», про сервіс MTWTU LAW HUB (Олег Григорюк, Сухроб Собіров), до 11:45 (точний час переходу між ними не вказано); це не паралельні сесії, запис не потрібен; 11:45–12:00 кава-пауза; 12:00–13:30 тренінг «Профспілковий органайзинг» (Велика зала); 13:30–14:30 обід; 14:30–17:30 екскурсія на екоферму «Плай»; 18:00–19:00 вечеря (ресторан), для запрошених гостей — окрема вечеря в ресторані «Карпатська ружа»; 19:00–20:00 підбиття підсумків форуму та нагородження (обговорення результатів і планів реалізації молодіжних ініціатив на місцях); 20:00–01:00 FINAL PARTY — DJ NIGHT: одна спільна фінальна вечірка для всіх учасників з ведучим і DJ; з 01:00 — відпочинок.
ДЕНЬ 4, 10.12: 08:00–09:00 сніданок; 09:00–09:30 виселення (звільнення номерів, готель/рецепція); 09:30–14:00 відпочинок у Карпатах: підйомники ГК «Плай» (залежить від погоди та роботи підйомників); 14:00–15:00 обід; 15:00 — виїзд учасників автобусом з «Плаю» до Одеси.
11.12: орієнтовно 05:00 — прибуття учасників до Одеси (час орієнтовний); далі автобус Одеса → Ізмаїл (час відправлення й прибуття уточнюється).
ПАРАЛЕЛЬНІ СЕСІЇ: 8.12 о 12:00 — «Медіація» (Мала зала) або «CV» (Велика зала). До 25 учасників у кожній. 9.12 паралельних сесій немає. Учасник записується сам у «Мій форум» (вхід за персональним кодом), запис відкритий до початку сесії; місця обмежені.
UNIONIZE: навчальна інтерактивна настільна командна гра, 9 ігрових столів під керівництвом ведучих. Стіл 1 — керівництво та гості (8 місць), столи 2–9 — до 6 учасників. Ведучі: 1 — Сухроб Собіров, 2 — Ірина Єріненко, 3 — Юлія Пелих, 4 — Вікторія Кернос, 5 — Діана Кожуріна, 6 — Даниела Гергі, 7 — Евеліна Лужанська, 8 — Наталя Іжиця, 9 — Олена Сухініна. Своє місце й сусідів учасник бачить у «Мій форум».
ДОЇЗД УЧАСНИКІВ: 6.12, 10:00–14:00 — організований автобус Ізмаїл (залізничний вокзал) → Одеса. Учасники з Ізмаїла та Києва розміщуються в готелі Leomare (Одеса, вул. Генуезька, 3б). 6.12 о 22:30 — спільний автобус Одеса → ГК «Плай» для учасників з Одеси та Ізмаїла, місце збору — Гагарін Плаза (Одеса). Учасники з Києва добираються до Одеси, а 6.12 о 22:30 їдуть разом з усіма спільним автобусом Одеса → «Плай» (як саме вони їдуть з Києва до Одеси, не вказано). Запрошені гості їдуть на автомобілях.
ДОЇЗД ЗАПРОШЕНИХ ГОСТЕЙ: 7.12 о 06:00 — трансфер Одеса → «Плай»; 7.12 о 07:00 — трансфер Київ → «Плай». Назад: 10.12 о 06:00 — «Плай» → Одеса; також трансфер «Плай» → Київ (час не вказано).
ПОВЕРНЕННЯ УЧАСНИКІВ: 10.12 о 15:00 автобус «Плай» → Одеса, 11.12 орієнтовно о 05:00 прибуття до Одеси; потім автобус Одеса → Ізмаїл (час уточнюється).
ПРО МОЛОДІЖНУ РАДУ: молодіжний рух ПРМТУ з 2002 року; включеність в ITF/ETF; напрями Sail Smart, MTWTU LAW HUB, форуми й Summer Leadership Camp, Union Quiz, Union Sport; присутність в Одесі, Ізмаїлі, Чорноморську. Голова Молодіжної ради — Ірина Єріненко. Instagram: https://www.instagram.com/mtwtuyouth/
`;
function systemPrompt(me) {
  const program = store.events.filter(e => e.published !== false).map(e => ({ id: e.id, forGroup: e.group, date: e.date, start: e.start, end: e.end, title: e.title, venue: e.venue, status: e.status, track: e.track, capacity: e.capacity, details: e.details, teaser: e.teaser, why: e.why, speakers: e.speakerNames }));
  const ann = store.announcements.slice(0, 15).map(a => ({ title: a.title, text: a.text, kind: a.kind, createdAt: a.createdAt }));
  const kb = store.knowledge.slice(0, 80).map(k => ({ q: k.q, a: k.a }));
  const s = store.settings;
  const extra = [s.coordinator && `Контакт координатора: ${s.coordinator}`, s.telegramUrl && `Telegram-канал форуму: ${s.telegramUrl}`, s.driveUrl && `Фото форуму: ${s.driveUrl}`].filter(Boolean).join('\n');
  const transport = store.transport.map(t => `${t.title}: ${t.note}${t.meet ? ' Збір: ' + t.meet : ' Точка і час збору уточнюються.'}`).join('\n');
  const speakers = store.speakers.map(p => `${[p.name, p.role].filter(Boolean).join(' — ')}${p.events?.length ? ' (події: ' + p.events.join(', ') + ')' : ''}`).join('; ');
  const sponsors = store.sponsors.map(p => `${p.name}: ${p.text}`).join('; ');
  let personal = 'Користувач не увійшов у «Мій форум».';
  if (me) {
    const sess = Object.values(me.sessions || {}).map(id => store.events.find(e => e.id === id)?.title).filter(Boolean);
    const tr = store.transport.find(t => t.key === me.group);
    personal = `Користувач увійшов: ${me.name}. Група доїзду: ${tr ? tr.title : 'не вказана'}. Записаний на сесії: ${sess.join(', ') || 'ще ні'}. Категорія: ${CATS[me.category] || CATS.participant}.${me.role ? ' Роль/посада: ' + me.role + '.' : ''} Unionize: ${me.table ? `стіл ${me.table}, місце ${me.seat}` : 'місце ще не призначене'}.${hostTableOf(me) ? ` Ведучий столу ${hostTableOf(me)} на Unionize.` : ''}${me.travel ? ' Особистий доїзд: ' + me.travel + '.' : ''}${me.duties ? ' Обов’язки на форумі: ' + me.duties.replace(/\n/g, '; ') + '.' : ''}${me.events?.length ? ' Задіяний у подіях: ' + me.events.map(id => store.events.find(e => e.id === id)?.title).filter(Boolean).join(', ') + '.' : ''}${me.team ? ' Команда: ' + me.team + '.' : ''}${me.room ? ' Кімната: ' + me.room + '.' : ''}`;
  }
  return `Ти — Юніончик, милий помічник-талісман MTWTU Youth Forum 2026 (персонаж за мотивами логотипа MTWTU Youth). Говори про себе в чоловічому роді від першої особи («я знайду», «я передам»). Відповідай українською, тепло, дружньо й коротко (до 110 слів), без емодзі. Якщо питають, хто ти або на чому працюєш: ти Юніончик, помічник форуму, працюєш на моделі Claude від Anthropic і відповідаєш лише з даних організаторів.

ЖОРСТКІ ПРАВИЛА:
1. Використовуй ЛИШЕ факти з блоків нижче. Не додавай від себе жодних деталей: місць, часу, імен, правил, описів території чи атмосфери.
2. Статус "tentative" = попередньо — згадуй це, коли називаєш час чи місце.
3. Коли згадуєш подію, додай її маркер [[id]] (наприклад [[088]]), не більше 4.
4. Якщо точної відповіді в даних немає або вона неповна — не вгадуй. Скажи одним реченням, що передаєш питання організаторам і відповідь прийде сюди, і додай у самому кінці маркер [[ORG]].
5. Питання поза темою форуму ввічливо поверни до форуму (без [[ORG]]). Медичних, юридичних і безпекових інструкцій не давай; щодо тривог і укриттів — лише офіційні вказівки організаторів і адміністрації комплексу.
6. Поточний київський час: ${new Intl.DateTimeFormat('uk-UA', { timeZone: 'Europe/Kyiv', dateStyle: 'full', timeStyle: 'short' }).format(new Date())}.

ПРО КОРИСТУВАЧА: ${personal}

ПРОГРАМА (JSON): ${JSON.stringify(program)}

ОГОЛОШЕННЯ ОРГАНІЗАТОРІВ (найновіші першими): ${JSON.stringify(ann)}

ВІДПОВІДІ ОРГАНІЗАТОРІВ НА ПИТАННЯ УЧАСНИКІВ (найточніше джерело): ${JSON.stringify(kb)}

ДОЇЗД ЗА ГРУПАМИ:
${transport}

СПІКЕРИ: ${speakers || '—'}
СПОНСОРИ: ${sponsors || 'ще не опубліковані'}
${extra}

ФАКТИ:
${FACTS}`;
}
async function handleAsk(req, res) {
  if (!ANTHROPIC_API_KEY) return json(res, 503, { error: 'AI вимкнено', fallback: true });
  if (!rateLimit('ask:' + ipOf(req), 25, 10 * 60e3)) return json(res, 429, { error: 'Забагато запитань. Спробуй за кілька хвилин.' });
  const body = await readBody(req, 32 * 1024);
  const me = meOf(req);
  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
  const messages = history.filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim()).map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));
  const q = str(body.question, 600);
  if (!q) return json(res, 400, { error: 'Порожнє запитання' });
  messages.push({ role: 'user', content: q });
  while (messages.length && messages[0].role !== 'user') messages.shift();
  const upstream = await fetch((process.env.ANTHROPIC_API_URL || 'https://api.anthropic.com') + '/v1/messages', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 700, stream: true, system: systemPrompt(me), messages })
  }).catch(() => null);
  if (!upstream || !upstream.ok || !upstream.body) {
    const detail = upstream ? await upstream.text().catch(() => '') : '';
    console.error('[claude]', upstream?.status, detail.slice(0, 300));
    return json(res, 502, { error: 'Юніончик зараз недоступний', fallback: true });
  }
  res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no', Connection: 'keep-alive' });
  const decoder = new TextDecoder(); let buf = '', full = '';
  try {
    for await (const chunk of upstream.body) {
      buf += decoder.decode(chunk, { stream: true });
      let idx;
      while ((idx = buf.indexOf('\n\n')) >= 0) {
        const block = buf.slice(0, idx); buf = buf.slice(idx + 2);
        const line = block.split('\n').find(l => l.startsWith('data:'));
        if (!line) continue;
        let evt; try { evt = JSON.parse(line.slice(5)); } catch { continue; }
        if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') { full += evt.delta.text; res.write(`data: ${JSON.stringify({ t: evt.delta.text })}\n\n`); }
        if (evt.type === 'error') res.write(`data: ${JSON.stringify({ error: 'Помилка відповіді' })}\n\n`);
      }
    }
  } catch (err) { console.error('[claude stream]', err.message); }
  if (full.includes('[[ORG]]') && rateLimit('q:' + ipOf(req), 15, 60 * 60e3)) {
    const qq = await createQuestion({ text: q, participant: me, asker: body.asker, draft: full });
    res.write(`data: ${JSON.stringify({ escalated: qq.id })}\n\n`);
  }
  res.write('data: {"done":true}\n\n');
  res.end();
}

/* ---------------- validation ---------------- */
const EVENT_FIELDS = { title: 130, venue: 90, details: 600, posterTitle: 140, teaser: 650, why: 500, speakerNames: 260, category: 40 };
function cleanEvent(input, base = {}) {
  const e = { ...base };
  for (const [k, max] of Object.entries(EVENT_FIELDS)) if (k in input) e[k] = str(input[k], max);
  if ('date' in input) { if (!DAYS.includes(input.date)) throw fail(400, 'Невірна дата'); e.date = input.date; }
  for (const k of ['start', 'end']) if (k in input) { if (!isTime(input[k])) throw fail(400, 'Невірний час'); e[k] = input[k] || null; }
  if ('status' in input) e.status = ['tentative', 'confirmed', 'canceled'].includes(input.status) ? input.status : 'tentative';
  if ('track' in input) e.track = input.track === 'parallel' ? 'parallel' : 'all';
  if ('capacity' in input) e.capacity = input.capacity ? Math.max(1, Math.min(200, Number(input.capacity) || 0)) : undefined;
  if ('link' in input) { if (!isUrl(input.link)) throw fail(400, 'Посилання має починатися з https://'); e.link = str(input.link, 300); }
  if ('published' in input) e.published = Boolean(input.published);
  if ('feature' in input) e.feature = Boolean(input.feature);
  if (!e.title) throw fail(400, 'Потрібна назва');
  if (!e.date) throw fail(400, 'Потрібна дата');
  return e;
}
function cleanPerson(input, base, kind) {
  const x = { ...base };
  x.name = str(input.name, 100); if (!x.name) throw fail(400, 'Потрібна назва');
  for (const k of ['photo', 'logo', 'url']) if (k in input) { if (!isUrl(input[k])) throw fail(400, 'Посилання на фото/лого має починатися з https://'); x[k] = str(input[k], 500); }
  if (kind === 'speaker') { x.role = str(input.role, 140); x.org = str(input.org, 100); x.events = Array.isArray(input.events) ? input.events.filter(id => store.events.some(e => e.id === id)) : (x.events || []); }
  else x.text = str(input.text, 300);
  x.order = Number(input.order) || 0;
  return x;
}

/* ---------------- router ---------------- */
async function api(req, res, url) {
  const p = url.pathname, m = req.method;
  if (p === '/api/public' && m === 'GET') return json(res, 200, publicPayload());
  if (p === '/api/ask' && m === 'POST') return handleAsk(req, res);
  if (p === '/api/health') return json(res, 200, { ok: true });

  /* participant */
  if (p === '/api/me/login' && m === 'POST') {
    if (!rateLimit('login:' + ipOf(req), 20, 15 * 60e3)) throw fail(429, 'Забагато спроб. Зачекайте 15 хвилин.');
    const { code } = await readBody(req);
    const me = store.participants.find(x => x.code === normCode(code));
    if (!me) throw fail(401, 'Код не знайдено. Перевірте його або зверніться до організаторів.');
    me.lastLogin = new Date().toISOString(); saveStore();
    return json(res, 200, { ok: true, me: myPayload(me) }, { 'Set-Cookie': cookie(req, 'plai_p', makeToken('p', me.id, 45 * 864e5), 45 * 86400) });
  }
  if (p === '/api/me/logout' && m === 'POST') return json(res, 200, { ok: true }, { 'Set-Cookie': cookie(req, 'plai_p', '', 0) });
  if (p === '/api/me' && m === 'GET') { const me = meOf(req); return json(res, 200, { me: me ? myPayload(me) : null }); }
  if (p === '/api/me/session' && m === 'POST') {
    const me = meOf(req); if (!me) throw fail(401, 'Увійдіть за персональним кодом');
    const { slot, eventId } = await readBody(req);
    const slots = parallelSlots(); const group = slots.get(slot);
    if (!group) throw fail(400, 'Невідома сесія');
    const startTs = kyivTs(...slot.split(' '));
    if (Date.now() >= startTs) throw fail(409, 'Запис на цю сесію вже закрито');
    me.sessions ||= {};
    if (!eventId) { delete me.sessions[slot]; await saveStore(); return json(res, 200, { ok: true, me: myPayload(me), sessionCounts: sessionCounts() }); }
    const ev = group.find(e => e.id === eventId); if (!ev) throw fail(400, 'Невідома сесія');
    const counts = sessionCounts();
    if (me.sessions[slot] !== eventId && ev.capacity && (counts[eventId] || 0) >= ev.capacity) throw fail(409, `На «${ev.title}» місць уже немає — оберіть іншу сесію`);
    me.sessions[slot] = eventId; await saveStore();
    return json(res, 200, { ok: true, me: myPayload(me), sessionCounts: sessionCounts() });
  }

  /* questions */
  if (p === '/api/questions' && m === 'POST') {
    if (!rateLimit('q:' + ipOf(req), 15, 60 * 60e3)) throw fail(429, 'Забагато питань. Спробуйте пізніше.');
    const b = await readBody(req);
    if (!str(b.text, 600)) throw fail(400, 'Порожнє питання');
    const q = await createQuestion({ text: b.text, participant: meOf(req), asker: b.asker, draft: b.draft });
    return json(res, 200, { ok: true, question: publicQuestion(q) });
  }
  if (p === '/api/questions/mine' && m === 'GET') {
    const asker = str(url.searchParams.get('asker'), 64); const me = meOf(req);
    const list = store.questions.filter(q => (me && q.participantId === me.id) || (asker && q.asker === asker));
    return json(res, 200, { questions: list.map(publicQuestion) });
  }

  /* push */
  if (p === '/api/push/subscribe' && m === 'POST') {
    const sub = await readBody(req);
    if (!sub?.endpoint || !/^https:\/\//.test(sub.endpoint) || !sub.keys?.p256dh || !sub.keys?.auth) throw fail(400, 'Невірна підписка');
    const me = meOf(req);
    const rec = { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth }, participantId: me?.id || null, asker: str(sub.asker, 64) || null, admin: Boolean(sub.admin && isAdmin(req)) };
    const i = store.subscriptions.findIndex(s => s.endpoint === sub.endpoint);
    if (i >= 0) store.subscriptions[i] = { ...store.subscriptions[i], ...rec, admin: rec.admin || store.subscriptions[i].admin }; else store.subscriptions.push(rec);
    saveStore();
    return json(res, 200, { ok: true });
  }
  if (p === '/api/push/unsubscribe' && m === 'POST') {
    const { endpoint } = await readBody(req);
    store.subscriptions = store.subscriptions.filter(s => s.endpoint !== endpoint); saveStore();
    return json(res, 200, { ok: true });
  }

  /* admin auth */
  if (p === '/api/admin/me') return json(res, 200, { admin: isAdmin(req), enabled: Boolean(ADMIN_PASSWORD) });
  if (p === '/api/admin/login' && m === 'POST') {
    if (!ADMIN_PASSWORD) throw fail(503, 'Задайте ADMIN_PASSWORD на сервері');
    if (!rateLimit('admin:' + ipOf(req), 8, 15 * 60e3)) throw fail(429, 'Забагато спроб. Зачекайте 15 хвилин.');
    const { password } = await readBody(req);
    const a = crypto.createHash('sha256').update(String(password || '')).digest(), b = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest();
    if (!crypto.timingSafeEqual(a, b)) throw fail(401, 'Невірний пароль');
    return json(res, 200, { ok: true }, { 'Set-Cookie': `plai_admin=${makeToken('admin', 'admin', 12 * 3600e3)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${secureFlag(req)}` });
  }
  if (p === '/api/admin/logout' && m === 'POST') return json(res, 200, { ok: true }, { 'Set-Cookie': 'plai_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' });

  if (p.startsWith('/api/admin/')) {
    if (!isAdmin(req)) throw fail(401, 'Потрібен вхід');
    const body = m === 'GET' || m === 'DELETE' ? {} : await readBody(req, 512 * 1024);
    const seg = p.slice('/api/admin/'.length).split('/');
    const [col, id, action] = seg;

    if (col === 'state' && m === 'GET') return json(res, 200, {
      events: store.events, announcements: store.announcements, subscriberCount: store.subscriptions.length,
      participants: store.participants, questions: store.questions, knowledge: store.knowledge,
      speakers: store.speakers, sponsors: store.sponsors, unionize: store.unionize, transport: store.transport, settings: store.settings, texts: store.texts, sessionCounts: sessionCounts()
    });

    if (col === 'announcements') {
      if (m === 'POST' && !id) {
        const a = { id: crypto.randomUUID(), title: str(body.title, 90), text: str(body.text, 650), kind: ['info', 'important', 'urgent'].includes(body.kind) ? body.kind : 'info', createdAt: new Date().toISOString() };
        if (!a.title || !a.text) throw fail(400, 'Заповніть заголовок і текст');
        store.announcements.unshift(a); await saveStore();
        const push = body.push ? await broadcast({ title: a.title, body: a.text.slice(0, 180), url: '/#/updates', tag: a.id }) : null;
        return json(res, 200, { ok: true, announcement: a, push });
      }
      if (m === 'DELETE' && id) { store.announcements = store.announcements.filter(a => a.id !== id); await saveStore(); return json(res, 200, { ok: true }); }
    }

    if (col === 'events') {
      if (m === 'POST' && !id) { const e = cleanEvent(body, { id: 'x' + crypto.randomBytes(3).toString('hex'), status: 'tentative', track: 'all', published: true }); store.events.push(e); await saveStore(); return json(res, 200, { ok: true, event: e }); }
      const i = store.events.findIndex(e => e.id === id);
      if (i < 0) throw fail(404, 'Подію не знайдено');
      if (m === 'PUT') { store.events[i] = cleanEvent(body, store.events[i]); await saveStore(); return json(res, 200, { ok: true, event: store.events[i] }); }
      if (m === 'DELETE') { store.events.splice(i, 1); await saveStore(); return json(res, 200, { ok: true }); }
    }

    if (col === 'participants') {
      if (id === 'import' && m === 'POST') {
        const rows = parseCsv(body.csv); const added = [], errors = [];
        for (const [n, r] of rows.entries()) {
          try {
            const exists = store.participants.find(x => x.name.toLowerCase() === String(r.name || '').trim().toLowerCase());
            const pp = cleanParticipant(r, exists);
            if (!exists) store.participants.push(pp);
            added.push(pp.name);
          } catch (e) { errors.push(`Рядок ${n + 1}: ${e.message}`); }
        }
        await saveStore();
        return json(res, 200, { ok: true, added: added.length, errors });
      }
      if (m === 'POST' && !id) { const pp = cleanParticipant(body); store.participants.push(pp); await saveStore(); return json(res, 200, { ok: true, participant: pp }); }
      const pp = store.participants.find(x => x.id === id);
      if (!pp) throw fail(404, 'Учасника не знайдено');
      if (action === 'code' && m === 'POST') { pp.code = newCode(); await saveStore(); return json(res, 200, { ok: true, participant: pp }); }
      if (m === 'PUT') {
        cleanParticipant(body, pp);
        if (body.sessions && typeof body.sessions === 'object') {
          const slots = parallelSlots(); pp.sessions = {};
          for (const [slot, ev] of Object.entries(body.sessions)) if (ev && slots.get(slot)?.some(e => e.id === ev)) pp.sessions[slot] = ev;
        }
        await saveStore(); return json(res, 200, { ok: true, participant: pp });
      }
      if (m === 'DELETE') { store.participants = store.participants.filter(x => x.id !== id); await saveStore(); return json(res, 200, { ok: true }); }
    }

    if (col === 'unionize' && m === 'PUT') {
      for (const t of store.unionize.tables) {
        const inp = (body.tables || []).find(x => Number(x.n) === t.n); if (!inp) continue;
        t.host = str(inp.host, 80); t.label = str(inp.label, 60);
        t.capacity = Math.max(1, Math.min(12, Number(inp.capacity) || t.capacity));
      }
      await saveStore(); return json(res, 200, { ok: true, unionize: store.unionize });
    }

    if (col === 'telegram') {
      const t = tgState();
      if (m === 'GET') return json(res, 200, { configured: Boolean(TG_TOKEN), bot: tgBot?.username || null, connected: Boolean(t.chatId), chatTitle: t.chatTitle || null, lastUpdateAt: tgLastUpdate, lastError: tgLastError,
        linkGroup: tgBot ? `https://t.me/${tgBot.username}?startgroup=${t.linkCode}` : null, linkPrivate: tgBot ? `https://t.me/${tgBot.username}?start=${t.linkCode}` : null });
      if (m === 'POST' && id === 'test') { if (!t.chatId) throw fail(400, 'Telegram ще не підключено'); const r = await tg('sendMessage', { chat_id: t.chatId, text: 'Тест: сайт форуму на зв’язку. Питання учасників приходитимуть сюди.' }); if (!r) throw fail(502, 'Telegram не прийняв повідомлення'); return json(res, 200, { ok: true }); }
      if (m === 'POST' && id === 'unlink') { delete t.chatId; delete t.chatTitle; t.linkCode = crypto.randomBytes(6).toString('hex'); await saveStore(); return json(res, 200, { ok: true }); }
    }
    if (col === 'questions') {
      const q = store.questions.find(x => x.id === id);
      if (!q) throw fail(404, 'Питання не знайдено');
      if (action === 'answer' && m === 'POST') {
        const { q: done, push } = await answerQuestion(q, body.answer, { polish: body.polish !== false, final: body.final, addToKnowledge: body.addToKnowledge !== false, by: 'admin' });
        return json(res, 200, { ok: true, question: done, push });
      }
      if (action === 'preview' && m === 'POST') {
        const raw = str(body.answer, 1500); if (!raw) throw fail(400, 'Напишіть відповідь');
        const r = await polishAnswer(q, raw, body.level);
        return json(res, 200, { ok: true, ...r, note: POLISH_NOTE[r.level] });
      }
      if (m === 'DELETE') { store.questions = store.questions.filter(x => x.id !== id); await saveStore(); return json(res, 200, { ok: true }); }
    }
    if (col === 'knowledge' && m === 'DELETE' && id) { store.knowledge = store.knowledge.filter(k => k.id !== id); await saveStore(); return json(res, 200, { ok: true }); }

    if (col === 'speakers' || col === 'sponsors') {
      const kind = col === 'speakers' ? 'speaker' : 'sponsor';
      if (m === 'POST' && !id) { const x = cleanPerson(body, { id: kind.slice(0, 2) + crypto.randomBytes(3).toString('hex') }, kind); store[col].push(x); await saveStore(); return json(res, 200, { ok: true, item: x }); }
      const i = store[col].findIndex(x => x.id === id);
      if (i < 0) throw fail(404, 'Не знайдено');
      if (m === 'PUT') { store[col][i] = cleanPerson(body, store[col][i], kind); await saveStore(); return json(res, 200, { ok: true, item: store[col][i] }); }
      if (m === 'DELETE') { store[col].splice(i, 1); await saveStore(); return json(res, 200, { ok: true }); }
    }

    if (col === 'texts' && m === 'PUT') {
      const inp = body.texts && typeof body.texts === 'object' ? body.texts : {};
      for (const [k, v] of Object.entries(inp).slice(0, 400)) {
        if (!/^[a-z0-9]+(\.[a-zA-Z0-9]+){1,3}$/.test(k)) continue;
        if (v === null) delete store.texts[k]; else store.texts[k] = String(v).replace(/\r/g, '').slice(0, 4000);
      }
      await saveStore(); return json(res, 200, { ok: true, texts: store.texts });
    }

    if (col === 'settings' && m === 'PUT') {
      for (const k of ['driveUrl', 'telegramUrl']) if (k in body) { if (!isUrl(body[k])) throw fail(400, 'Посилання має починатися з https://'); store.settings[k] = str(body[k], 300); }
      for (const k of ['participantsLabel', 'coordinator']) if (k in body) store.settings[k] = str(body[k], 200);
      if (Array.isArray(body.transport)) for (const t of store.transport) { const inp = body.transport.find(x => x.key === t.key); if (inp) { t.meet = str(inp.meet, 300); t.note = str(inp.note, 300) || t.note; } }
      await saveStore(); return json(res, 200, { ok: true, settings: store.settings, transport: store.transport });
    }
  }
  return json(res, 404, { error: 'Не знайдено' });
}

async function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel === '/') rel = '/index.html';
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR)) return send(res, 403, 'Forbidden');
  try {
    const stat = await fsp.stat(file);
    if (!stat.isFile()) throw new Error('dir');
    const ext = path.extname(file);
    const cache = ext === '.html' || rel === '/sw.js' ? 'no-cache' : 'public, max-age=3600';
    res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': cache });
    fs.createReadStream(file).pipe(res);
  } catch {
    const html = await fsp.readFile(path.join(PUBLIC_DIR, 'index.html'));
    send(res, 200, html, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-cache' });
  }
}

loadStore();
tgLoop();
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname.startsWith('/api/')) await api(req, res, url);
    else await serveStatic(req, res, url);
  } catch (err) {
    if (!res.headersSent) json(res, err.status || 500, { error: err.status ? err.message : 'Помилка сервера' });
    if (!err.status) console.error(err);
  }
}).listen(PORT, () => console.log(`PLAI//OS → http://localhost:${PORT} · AI: ${ANTHROPIC_API_KEY ? ANTHROPIC_MODEL : 'off'} · admin: ${ADMIN_PASSWORD ? 'on' : 'off'}`));
