// MTWTU Youth Forum 2026 — PLAI//OS
// Zero-framework Node server: static files, public API, organizer admin,
// Web Push and a Claude-powered concierge grounded only in the program data.
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
const MODE = process.env.SITE_MODE || 'preview'; // preview | live

/* ---------------- storage ---------------- */
let store;
function loadStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(STORE_FILE)) {
    try { store = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')); } catch { store = null; }
  }
  if (!store) {
    const seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
    store = { events: seed.events, announcements: seed.announcements || [], subscriptions: [], vapid: null, updatedAt: new Date().toISOString() };
  }
  store.subscriptions ||= [];
  if (webpush) {
    let pub = process.env.VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
    if (!pub || !priv) {
      store.vapid ||= webpush.generateVAPIDKeys();
      pub = store.vapid.publicKey; priv = store.vapid.privateKey;
    }
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:youth@mtwtu.org.ua', pub, priv);
    store.vapidPublicKey = pub;
  }
  saveStore();
}
let saving = Promise.resolve();
function saveStore() {
  store.updatedAt = new Date().toISOString();
  const snapshot = JSON.stringify(store, null, 1);
  saving = saving.then(async () => {
    const tmp = STORE_FILE + '.tmp';
    await fsp.writeFile(tmp, snapshot);
    await fsp.rename(tmp, STORE_FILE);
  }).catch(err => console.error('[store]', err));
  return saving;
}

/* ---------------- helpers ---------------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8' };
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https://raw.githubusercontent.com https://storage.mtwtu.org.ua; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; frame-src https://player.vimeo.com; base-uri 'self'; form-action 'self'"
};
function send(res, status, body, headers = {}) {
  res.writeHead(status, { ...SECURITY_HEADERS, ...headers });
  res.end(body);
}
const json = (res, status, obj) => send(res, status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
async function readBody(req, limit = 64 * 1024) {
  let size = 0; const chunks = [];
  for await (const c of req) { size += c.length; if (size > limit) throw Object.assign(new Error('Завеликий запит'), { status: 413 }); chunks.push(c); }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { throw Object.assign(new Error('Некоректний JSON'), { status: 400 }); }
}
const str = (v, max) => String(v ?? '').trim().slice(0, max);
const isTime = v => v === '' || v == null || /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const DAYS = ['2026-12-07', '2026-12-08', '2026-12-09', '2026-12-10'];

/* ---------------- sessions ---------------- */
function sign(v) { return crypto.createHmac('sha256', SESSION_SECRET).update(v).digest('base64url'); }
function makeSession() { const exp = String(Date.now() + 12 * 3600e3); return exp + '.' + sign(exp); }
function isAdmin(req) {
  const m = /(?:^|;\s*)plai_admin=([^;]+)/.exec(req.headers.cookie || '');
  if (!m) return false;
  const [exp, sig] = m[1].split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const good = sign(exp);
  return good.length === sig.length && crypto.timingSafeEqual(Buffer.from(good), Buffer.from(sig));
}
const loginAttempts = new Map();
function rateLimit(map, key, max, windowMs) {
  const now = Date.now();
  const list = (map.get(key) || []).filter(t => now - t < windowMs);
  if (list.length >= max) { map.set(key, list); return false; }
  list.push(now); map.set(key, list); return true;
}
const ipOf = req => (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'unknown';

/* ---------------- public data ---------------- */
function publicPayload() {
  return {
    updatedAt: store.updatedAt,
    mode: MODE,
    events: store.events.filter(e => e.published !== false),
    announcements: [...store.announcements].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    webPushAvailable: Boolean(webpush && store.vapidPublicKey),
    vapidPublicKey: store.vapidPublicKey || '',
    ai: Boolean(ANTHROPIC_API_KEY)
  };
}

/* ---------------- push ---------------- */
async function broadcast(payload) {
  if (!webpush) return { sent: 0, failed: 0 };
  let sent = 0, failed = 0; const dead = [];
  await Promise.all(store.subscriptions.map(async sub => {
    try { await webpush.sendNotification(sub, JSON.stringify(payload), { TTL: 3600 }); sent++; }
    catch (err) { failed++; if (err.statusCode === 404 || err.statusCode === 410) dead.push(sub.endpoint); }
  }));
  if (dead.length) { store.subscriptions = store.subscriptions.filter(s => !dead.includes(s.endpoint)); saveStore(); }
  return { sent, failed };
}

/* ---------------- Claude concierge ---------------- */
const FACTS = `
ЗАГАЛЬНЕ: MTWTU Youth Forum 2026 — форум Молодіжної ради ПРМТУ (Профспілка робітників морського транспорту України). 7–10 грудня 2026, гірськолижний комплекс «Плай» (Плав'я, Карпати). Офіційний сайт комплексу з інтерактивною картою: https://play-karpaty.com/
ЛОКАЦІЇ ЗА ПРОГРАМОЮ: Великий зал — відкриття, Unionize та загальні сесії. Малий зал — паралельні тренінги. Ресторан — основні прийоми їжі. Боулінг — вечірня активність 8 грудня. Рецепція/готель — прибуття та поселення. Екоферма — екскурсія 9 грудня; місце збору уточнюється.
ТРАНСФЕР (попередньо): 06 грудня о 22:30 — попередній виїзд автобусом з Одеси, точка збору не підтверджена. 10 грудня о 12:30 — попередній виїзд з «Плаю». 11 грудня близько 05:00 — попереднє прибуття до Одеси, може змінитися. Організований трансфер зі Львова чи Києва НЕ підтверджено — лише самостійна поїздка.
НЕ ПІДТВЕРДЖЕНО: контакт координатора, перелік партнерів, посилання на сторінки спільнот, схема укриттів/евакуації та порядок дій під час тривоги — ці дані з'являться лише після офіційного підтвердження організаторами.
СПІКЕРИ: Олег Григорюк — Голова ПРМТУ (відкриття). Інші імена — у полі speakerNames подій, попередньо.
`;
function systemPrompt() {
  const program = store.events.filter(e => e.published !== false).map(e => ({ id: e.id, date: e.date, start: e.start, end: e.end, title: e.title, venue: e.venue, status: e.status, track: e.track, details: e.details, teaser: e.teaser, why: e.why, speakers: e.speakerNames }));
  const ann = store.announcements.slice(0, 15).map(a => ({ title: a.title, text: a.text, kind: a.kind, createdAt: a.createdAt }));
  return `Ти — «Claude у Плаї», цифровий консьєрж MTWTU Youth Forum 2026. Відповідай українською, тепло, коротко (до 120 слів), по суті.

ЖОРСТКІ ПРАВИЛА:
1. Використовуй ЛИШЕ факти з блоків ПРОГРАМА, ОГОЛОШЕННЯ та ФАКТИ нижче. Нічого не вигадуй: ні часу, ні місць, ні імен, ні правил ігор, ні контактів.
2. Якщо інформації немає або вона позначена як попередня/уточнюється — прямо скажи це і порадь стежити за розділом «Оголошення».
3. Статус "tentative" = попередньо. Завжди згадуй це, коли називаєш час чи місце.
4. Коли згадуєш конкретну подію, додай її маркер у форматі [[id]] (наприклад [[088]]) — сайт перетворить його на картку. Не більше 4 маркерів.
5. Питання поза темою форуму ввічливо поверни до форуму. Не давай медичних, юридичних чи безпекових інструкцій — для тривог і укриттів відсилай до офіційних вказівок організаторів і адміністрації комплексу.
6. Поточний київський час: ${new Intl.DateTimeFormat('uk-UA', { timeZone: 'Europe/Kyiv', dateStyle: 'full', timeStyle: 'short' }).format(new Date())}.

ПРОГРАМА (JSON):
${JSON.stringify(program)}

ОГОЛОШЕННЯ ОРГАНІЗАТОРІВ (JSON, найновіші першими):
${JSON.stringify(ann)}

ФАКТИ:
${FACTS}`;
}
const askAttempts = new Map();
async function handleAsk(req, res) {
  if (!ANTHROPIC_API_KEY) return json(res, 503, { error: 'AI вимкнено', fallback: true });
  if (!rateLimit(askAttempts, ipOf(req), 25, 10 * 60e3)) return json(res, 429, { error: 'Забагато запитань. Спробуй за кілька хвилин.' });
  const body = await readBody(req, 32 * 1024);
  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
  const messages = history
    .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));
  const q = str(body.question, 600);
  if (!q) return json(res, 400, { error: 'Порожнє запитання' });
  messages.push({ role: 'user', content: q });
  while (messages.length && messages[0].role !== 'user') messages.shift();

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 700, stream: true, system: systemPrompt(), messages })
  }).catch(() => null);
  if (!upstream || !upstream.ok || !upstream.body) {
    const detail = upstream ? await upstream.text().catch(() => '') : '';
    console.error('[claude]', upstream?.status, detail.slice(0, 300));
    return json(res, 502, { error: 'Claude зараз недоступний', fallback: true });
  }
  res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no', Connection: 'keep-alive' });
  const decoder = new TextDecoder(); let buf = '';
  try {
    for await (const chunk of upstream.body) {
      buf += decoder.decode(chunk, { stream: true });
      let idx;
      while ((idx = buf.indexOf('\n\n')) >= 0) {
        const block = buf.slice(0, idx); buf = buf.slice(idx + 2);
        const line = block.split('\n').find(l => l.startsWith('data:'));
        if (!line) continue;
        let evt; try { evt = JSON.parse(line.slice(5)); } catch { continue; }
        if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') res.write(`data: ${JSON.stringify({ t: evt.delta.text })}\n\n`);
        if (evt.type === 'error') res.write(`data: ${JSON.stringify({ error: 'Помилка відповіді' })}\n\n`);
      }
    }
  } catch (err) { console.error('[claude stream]', err.message); }
  res.write('data: {"done":true}\n\n');
  res.end();
}

/* ---------------- event validation ---------------- */
const EVENT_FIELDS = { title: 130, venue: 90, details: 600, posterTitle: 140, teaser: 650, why: 500, speakerNames: 220, category: 40 };
function cleanEvent(input, base = {}) {
  const e = { ...base };
  for (const [k, max] of Object.entries(EVENT_FIELDS)) if (k in input) e[k] = str(input[k], max);
  if ('date' in input) { if (!DAYS.includes(input.date)) throw Object.assign(new Error('Невірна дата'), { status: 400 }); e.date = input.date; }
  for (const k of ['start', 'end']) if (k in input) { if (!isTime(input[k])) throw Object.assign(new Error('Невірний час'), { status: 400 }); e[k] = input[k] || null; }
  if ('status' in input) e.status = ['tentative', 'confirmed', 'canceled'].includes(input.status) ? input.status : 'tentative';
  if ('track' in input) e.track = input.track === 'parallel' ? 'parallel' : 'all';
  if ('published' in input) e.published = Boolean(input.published);
  if ('feature' in input) e.feature = Boolean(input.feature);
  if (!e.title) throw Object.assign(new Error('Потрібна назва'), { status: 400 });
  if (!e.date) throw Object.assign(new Error('Потрібна дата'), { status: 400 });
  return e;
}

/* ---------------- router ---------------- */
async function api(req, res, url) {
  const p = url.pathname, m = req.method;
  if (p === '/api/public' && m === 'GET') return json(res, 200, publicPayload());
  if (p === '/api/ask' && m === 'POST') return handleAsk(req, res);
  if (p === '/api/health') return json(res, 200, { ok: true });

  if (p === '/api/push/subscribe' && m === 'POST') {
    const sub = await readBody(req);
    if (!sub?.endpoint || !/^https:\/\//.test(sub.endpoint) || !sub.keys?.p256dh || !sub.keys?.auth) return json(res, 400, { error: 'Невірна підписка' });
    if (!store.subscriptions.some(s => s.endpoint === sub.endpoint)) { store.subscriptions.push({ endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } }); saveStore(); }
    return json(res, 200, { ok: true });
  }
  if (p === '/api/push/unsubscribe' && m === 'POST') {
    const { endpoint } = await readBody(req);
    store.subscriptions = store.subscriptions.filter(s => s.endpoint !== endpoint); saveStore();
    return json(res, 200, { ok: true });
  }

  if (p === '/api/admin/me') return json(res, 200, { admin: isAdmin(req), enabled: Boolean(ADMIN_PASSWORD) });
  if (p === '/api/admin/login' && m === 'POST') {
    if (!ADMIN_PASSWORD) return json(res, 503, { error: 'Задайте ADMIN_PASSWORD на сервері' });
    if (!rateLimit(loginAttempts, ipOf(req), 8, 15 * 60e3)) return json(res, 429, { error: 'Забагато спроб. Зачекайте 15 хвилин.' });
    const { password } = await readBody(req);
    const a = crypto.createHash('sha256').update(String(password || '')).digest();
    const b = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest();
    if (!crypto.timingSafeEqual(a, b)) return json(res, 401, { error: 'Невірний пароль' });
    const secure = (req.headers['x-forwarded-proto'] || '').includes('https') ? '; Secure' : '';
    return send(res, 200, '{"ok":true}', { 'Content-Type': 'application/json', 'Set-Cookie': `plai_admin=${makeSession()}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${secure}` });
  }
  if (p === '/api/admin/logout' && m === 'POST') return send(res, 200, '{"ok":true}', { 'Content-Type': 'application/json', 'Set-Cookie': 'plai_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' });

  if (p.startsWith('/api/admin/')) {
    if (!isAdmin(req)) return json(res, 401, { error: 'Потрібен вхід' });
    if (p === '/api/admin/state' && m === 'GET') return json(res, 200, { events: store.events, announcements: store.announcements, subscriberCount: store.subscriptions.length });
    if (p === '/api/admin/announcements' && m === 'POST') {
      const b = await readBody(req);
      const a = { id: crypto.randomUUID(), title: str(b.title, 90), text: str(b.text, 650), kind: ['info', 'important', 'urgent'].includes(b.kind) ? b.kind : 'info', createdAt: new Date().toISOString() };
      if (!a.title || !a.text) return json(res, 400, { error: 'Заповніть заголовок і текст' });
      store.announcements.unshift(a); await saveStore();
      const push = b.push ? await broadcast({ title: a.title, body: a.text.slice(0, 180), url: '/#/updates', tag: a.id }) : null;
      return json(res, 200, { ok: true, announcement: a, push });
    }
    const delA = /^\/api\/admin\/announcements\/([\w-]+)$/.exec(p);
    if (delA && m === 'DELETE') { store.announcements = store.announcements.filter(a => a.id !== delA[1]); await saveStore(); return json(res, 200, { ok: true }); }
    if (p === '/api/admin/events' && m === 'POST') {
      const e = cleanEvent(await readBody(req), { id: 'x' + crypto.randomBytes(3).toString('hex'), status: 'tentative', track: 'all', published: true });
      store.events.push(e); await saveStore(); return json(res, 200, { ok: true, event: e });
    }
    const ev = /^\/api\/admin\/events\/([\w-]+)$/.exec(p);
    if (ev) {
      const i = store.events.findIndex(e => e.id === ev[1]);
      if (i < 0) return json(res, 404, { error: 'Подію не знайдено' });
      if (m === 'PUT') { store.events[i] = cleanEvent(await readBody(req), store.events[i]); await saveStore(); return json(res, 200, { ok: true, event: store.events[i] }); }
      if (m === 'DELETE') { store.events.splice(i, 1); await saveStore(); return json(res, 200, { ok: true }); }
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
    // SPA fallback
    const html = await fsp.readFile(path.join(PUBLIC_DIR, 'index.html'));
    send(res, 200, html, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-cache' });
  }
}

loadStore();
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname.startsWith('/api/')) await api(req, res, url);
    else await serveStatic(req, res, url);
  } catch (err) {
    if (!res.headersSent) json(res, err.status || 500, { error: err.status ? err.message : 'Помилка сервера' });
    if (!err.status) console.error(err);
  }
}).listen(PORT, () => console.log(`PLAI//OS → http://localhost:${PORT}  · AI: ${ANTHROPIC_API_KEY ? ANTHROPIC_MODEL : 'off'} · admin: ${ADMIN_PASSWORD ? 'on' : 'off'}`));
