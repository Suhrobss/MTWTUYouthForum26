/* MTWTU Youth Forum 2026 — PLAI//OS client. Vanilla JS, no build step. */
(() => {
'use strict';

/* ============ constants ============ */
const FORUM_START = Date.parse('2026-12-07T00:00:00+02:00');
const DAYS = ['2026-12-07', '2026-12-08', '2026-12-09', '2026-12-10'];
const WEEKDAY = { '2026-12-07': 'Понеділок', '2026-12-08': 'Вівторок', '2026-12-09': 'Середа', '2026-12-10': 'Четвер' };
const CHAPTERS = [
  { id: '2026-12-07', idx: '01', small: 'ПРИБУТТЯ', name: 'Знайомство', tag: 'Починається нова історія', sub: 'Від реєстрації до першого спільного вечора.', trail: 'green', trailName: 'Зелена траса', trailNote: 'М’який старт: знайомимось і заселяємось.' },
  { id: '2026-12-08', idx: '02', small: 'ЛЮДИ ТА ІДЕЇ', name: 'У русі', tag: 'Досвід, який проживаємо разом', sub: 'Дискусії, практичні блоки, Unionize і Bowling Night.', trail: 'blue', trailName: 'Синя траса', trailNote: 'Набираємо швидкість: найнасиченіший день.' },
  { id: '2026-12-09', idx: '03', small: 'СПІЛЬНА ДІЯ', name: 'Більше ніж слова', tag: 'Від кейсів до власних рішень', sub: 'Навчання, екскурсія, підсумки та фінальний вечір.', trail: 'red', trailName: 'Червона траса', trailNote: 'Від кейсів — до гір і фінальної ночі.' },
  { id: '2026-12-10', idx: '04', small: 'ПРОДОВЖЕННЯ', name: 'Що далі?', tag: 'Найважливіше відбувається після', sub: 'Завершальний ранок і повернення додому.', trail: 'black', trailName: 'Чорна траса', trailNote: 'Найскладніше — попрощатися.' }
];
const HIGHLIGHTS = ['082', '085', '086', '088', '08d', '093', '095', '097', '09a'];
const PLACES = [
  ['Великий зал', 'Відкриття, Unionize та загальні сесії.'],
  ['Малий зал', 'Паралельні тренінги.'],
  ['Ресторан', 'Основні прийоми їжі.'],
  ['Боулінг', 'Вечірня активність 8 грудня.'],
  ['Рецепція / готель', 'Прибуття та поселення.'],
  ['Екоферма', 'Екскурсія 9 грудня; місце збору уточнюється.']
];
const CITIES = [
  { name: 'Одеса', note: 'Автобус з Одеси попередньо заплановано на 6 грудня о 22:30. Точка збору уточнюється.', bus: true },
  { name: 'Львів', note: 'Орієнтир для самостійної поїздки. Організований трансфер із цього міста не підтверджено.' },
  { name: 'Київ', note: 'Орієнтир для самостійної поїздки. Організований трансфер із цього міста не підтверджено.' }
];
const GALLERY = ['forum.jpg', 'FIL_1376.jpg', 'img-77.jpg'].map(f => 'https://raw.githubusercontent.com/Suhrobss/MY/main/images/' + f);
const PEOPLE_ROLES = { 'Олег Григорюк': 'Голова ПРМТУ' };
const SUGGESTIONS = ['Що відбувається зараз?', 'Коли Bowling Night?', 'Які паралельні сесії 8 грудня?', 'Як доїхати з Одеси?', 'Що взяти на підйомники?', 'Де проходить Unionize?'];

/* ============ helpers ============ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, f) { try { const v = localStorage.getItem(k); return v == null ? f : JSON.parse(v); } catch { return f; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } }
};
const kyivParts = () => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Kyiv', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map(x => [x.type, x.value]));
  return { day: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
};
const mins = t => { if (!t) return null; const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const endMins = e => { const s = mins(e.start), en = mins(e.end); return en == null ? null : (s != null && en < s ? en + 1440 : en); };
const formatRange = e => e.start && e.end ? `${e.start}–${e.end}${e.end < e.start ? ' (+1 день)' : ''}` : e.start ? `з ${e.start}` : e.end ? `до ${e.end}` : 'Час уточнюється';
const statusLabel = s => s === 'confirmed' ? 'Підтверджено' : s === 'canceled' ? 'Скасовано' : 'Попередньо';
const sortEv = list => [...list].sort((a, b) => a.date.localeCompare(b.date) || (mins(a.start) ?? -1) - (mins(b.start) ?? -1) || a.id.localeCompare(b.id));
const chapterOf = d => CHAPTERS.find(c => c.id === d) || CHAPTERS[0];
const fmtDate = iso => { try { return new Intl.DateTimeFormat('uk-UA', { timeZone: 'Europe/Kyiv', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)); } catch { return ''; } };
const isMinor = e => !e.feature && !HIGHLIGHTS.includes(e.id);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const ICON = {
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M20 14v6H4V4h6"/>',
  pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/>',
  alert: '<path d="m12 3 10 18H2L12 3ZM12 9v5M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7h.01"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
  share: '<path d="M4 12v8h16v-8M12 3v13M7 8l5-5 5 5"/>',
  send: '<path d="m22 2-7 20-4-9-9-4 20-7ZM11 13 22 2"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6m1 3a5 5 0 0 1 3 5v2"/>',
  bus: '<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M8 18v3M16 18v3M8 14.5h.01M16 14.5h.01"/>',
  edit: '<path d="m4 20 5-.8L20 8l-4-4L5 15l-1 5Z"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  x: '<path d="M5 5l14 14M19 5 5 19"/>',
  play: '<path d="M7 4v16l13-8Z"/>',
  wifi: '<path d="M2 9a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0m-11 4a5 5 0 0 1 8 0M12 20h.01"/>',
  mountain: '<path d="m2 20 7-13 4 7 3-5 6 11H2Z"/>',
  download: '<path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'
};
const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n] || ''}</svg>`;
const trailShape = (t, size = 14) => {
  const s = size, h = s / 2;
  const shapes = {
    green: `<circle cx="${h}" cy="${h}" r="${h - 1}"/>`,
    blue: `<rect x="1" y="1" width="${s - 2}" height="${s - 2}"/>`,
    red: `<path d="M${h} 0.5 ${s - .5} ${h} ${h} ${s - .5} .5 ${h}Z"/>`,
    black: `<path d="M${h * .55} 1 ${h * 1.1} ${h} ${h * .55} ${s - 1} 0 ${h}Z M${h * 1.45} 1 ${s} ${h} ${h * 1.45} ${s - 1} ${h * .9} ${h}Z"/>`
  };
  return `<svg class="trail trail-${t}" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" aria-hidden="true">${shapes[t]}</svg>`;
};

/* ============ state ============ */
const S = {
  data: store.get('plai:cache', null),
  offline: false,
  saved: new Set(store.get('plai:saved', [])),
  seen: store.get('plai:seen', ''),
  chat: [],
  asking: false,
  admin: { me: null, data: null, tab: 'announcements' },
  filter: 'all',
  route: { name: 'home', arg: '' }
};
const events = () => (S.data?.events || []);
const evById = id => events().find(e => e.id === id);

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2600);
}
async function api(url, opts = {}) {
  const r = await fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) }, credentials: 'same-origin' });
  let body = null; try { body = await r.json(); } catch { /* empty */ }
  if (!r.ok) throw Object.assign(new Error(body?.error || 'Помилка запиту'), { status: r.status, body });
  return body;
}

/* ============ data ============ */
async function load(silent = false) {
  try {
    const d = await api('/api/public');
    const prevLatest = S.data?.announcements?.[0]?.id;
    S.data = d; S.offline = false; store.set('plai:cache', d);
    if (silent && d.announcements[0] && d.announcements[0].id !== prevLatest) toast('Нове оголошення організаторів');
  } catch {
    S.offline = true;
    if (!S.data) { $('#app').innerHTML = `<div class="wrap empty"><h2>Не вдалося завантажити дані</h2><p>Перевірте з’єднання та спробуйте ще раз.</p><button class="btn" data-act="reload">Повторити</button></div>`; return false; }
  }
  marks();
  return true;
}
function marks() {
  const latest = S.data?.announcements?.[0]?.id || '';
  $$('.dot').forEach(d => d.hidden = !latest || latest === S.seen || S.route.name === 'updates');
  $$('.count').forEach(c => { c.hidden = !S.saved.size; c.textContent = S.saved.size; });
}

/* ============ live clock ============ */
function liveState() {
  const { day, time } = kyivParts();
  const now = mins(time);
  const list = sortEv(events().filter(e => e.status !== 'canceled'));
  let current = null, next = null;
  for (const e of list) {
    const s = mins(e.start), en = endMins(e);
    if (e.date === day && s != null && en != null && now >= s && now < en) current ||= e;
    const startsLater = e.date > day || (e.date === day && s != null && s > now);
    if (!next && startsLater && e.start) next = e;
  }
  return { day, time, now, current, next, before: day < DAYS[0], after: day > DAYS[3] };
}
function countdown() {
  const diff = Math.max(0, FORUM_START - Date.now());
  const d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24, m = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
  return { d, h, m, s, done: diff === 0 };
}
const pad = n => String(n).padStart(2, '0');

/* ============ shared fragments ============ */
function preview() {
  return S.data?.mode === 'preview' ? `<p class="note-line">${ic('info')} Робочий макет · інформація з попередньої програми уточнюється</p>` : '';
}
function offlineBar() {
  return S.offline ? `<div class="bar bar-warn">${ic('wifi')}<span><b>Немає з’єднання</b> · показано останню збережену версію</span><button class="link" data-act="reload">Оновити</button></div>` : '';
}
function saveBtn(e, cls = '') {
  const on = S.saved.has(e.id);
  return `<button class="save ${on ? 'on' : ''} ${cls}" data-save="${esc(e.id)}" aria-pressed="${on}" aria-label="${on ? 'Прибрати з мого маршруту' : 'Додати в мій маршрут'}: ${esc(e.title)}">${ic('star')}</button>`;
}
function poster(e, variant = '') {
  const ch = chapterOf(e.date);
  const photo = e.speakerPhotoUrl && /^https:\/\//.test(e.speakerPhotoUrl) ? e.speakerPhotoUrl : '';
  return `<article class="poster ${variant} t-${ch.trail} tone-${esc(e.tone || 'feature')} ${e.status === 'canceled' ? 'is-canceled' : ''}">
    <a class="poster-hit" href="#/event/${esc(e.id)}" aria-label="Афіша: ${esc(e.title)}"></a>
    <div class="poster-art" aria-hidden="true">
      <span class="poster-day">${e.date.slice(8)}<small>ГРУ</small></span>
      ${photo ? `<img loading="lazy" src="${esc(photo)}" alt="">` : `<svg class="poster-topo" viewBox="0 0 200 120" preserveAspectRatio="none">${topoPaths(e.id)}</svg>`}
      <span class="poster-cat">${esc(e.category || 'EVENT')}</span>
    </div>
    <div class="poster-body">
      <div class="poster-meta">${trailShape(ch.trail, 10)}<span>${esc(formatRange(e))}</span><span>${esc(e.venue || 'Локація уточнюється')}</span></div>
      <h3>${esc(e.title)}</h3>
      <p>${esc(e.posterTitle || e.teaser || e.details || 'Подробиці готуються.')}</p>
      <div class="poster-foot"><span class="status s-${esc(e.status)}">${statusLabel(e.status)}</span>${saveBtn(e)}</div>
    </div>
  </article>`;
}
// deterministic mini contour art per event id
function topoPaths(seed) {
  let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const rnd = () => ((h = (h * 1664525 + 1013904223) >>> 0) / 4294967296);
  const cx = 40 + rnd() * 120, cy = 30 + rnd() * 60; let out = '';
  for (let i = 1; i <= 9; i++) {
    const r = i * 11; let d = '';
    for (let a = 0; a <= 24; a++) {
      const t = a / 24 * Math.PI * 2, wob = 1 + Math.sin(t * 3 + i + rnd() * .3) * .12 + Math.cos(t * 2 - i) * .08;
      d += (a ? 'L' : 'M') + (cx + Math.cos(t) * r * 1.5 * wob).toFixed(1) + ' ' + (cy + Math.sin(t) * r * wob).toFixed(1);
    }
    out += `<path d="${d}Z" class="${i === 4 ? 'hot' : ''}"/>`;
  }
  return out;
}
function footer() {
  return `<footer class="foot wrap">
    <div class="foot-big" aria-hidden="true">ПЛАЙ<span>’26</span></div>
    <div class="foot-row">
      <span>MTWTU Youth Forum 2026 · Молодіжна рада ПРМТУ</span>
      <span>ГК «Плай» · 07–10.12.2026</span>
      <a href="#/admin">Організаторам</a>
    </div>
    <p class="foot-made"><span class="spark" aria-hidden="true"></span> Спроєктовано та написано разом із Claude від Anthropic</p>
  </footer>`;
}
function pageHead(kicker, title, lead, extra = '') {
  return `<header class="phead wrap"><span class="kicker">${esc(kicker)}</span><h1>${title}</h1><p class="lead">${esc(lead)}</p>${extra}</header>`;
}

/* ============ views ============ */
function viewHome() {
  const L = liveState();
  const live = L.current || L.next;
  const urgent = (S.data.announcements || []).find(a => a.kind === 'urgent' || a.kind === 'important');
  const featured = HIGHLIGHTS.map(evById).filter(e => e && e.status !== 'canceled');
  const cd = countdown();
  const people = speakers();
  return `
  <section class="hero">
    <canvas class="topo" aria-hidden="true"></canvas>
    <div class="hero-grid wrap">
      <div class="hero-title">
        <p class="kicker"><span class="live-dot"></span> MTWTU YOUTH FORUM 2026 · Карпати</p>
        <h1 class="mega">Молодь<br><span class="mega-outline">збирається.</span></h1>
      </div>
      <div class="hero-copy">
        <p class="hero-lead">Чотири дні у Плаї: дискусії, практичні лаби, Unionize, гори й фінальна ніч. Обирай свою трасу — і збирай власний маршрут форуму.</p>
        <div class="hero-cta">
          <a class="btn btn-lift" href="#/program">Програма 7–10 грудня ${ic('arrow')}</a>
          <button class="btn btn-ghost" data-act="film">${ic('play')} Відео форуму</button>
        </div>
        <dl class="cd" aria-label="До початку форуму" ${cd.done ? 'hidden' : ''}>
          <div><dt>днів</dt><dd data-cd="d">${pad(cd.d)}</dd></div>
          <div><dt>год</dt><dd data-cd="h">${pad(cd.h)}</dd></div>
          <div><dt>хв</dt><dd data-cd="m">${pad(cd.m)}</dd></div>
          <div><dt>сек</dt><dd data-cd="s">${pad(cd.s)}</dd></div>
        </dl>
      </div>
      <div class="pass-stage">
        <div class="pass" tabindex="0" aria-label="Фото з архіву форуму у вигляді ски-пасу">
          <div class="pass-photo"><img src="${GALLERY[0]}" alt="Групове фото з архіву MTWTU Youth Forum" fetchpriority="high"></div>
          <div class="pass-body">
            <div class="pass-row"><span>SKI·PASS / FORUM</span><span>№ 2026</span></div>
            <strong>MTWTU<br>YOUTH FORUM</strong>
            <div class="pass-grid">
              <div><small>Власник</small><b>Учасник форуму</b></div>
              <div><small>Зона</small><b>ГК «Плай»</b></div>
              <div><small>Діє</small><b>07—10.12.2026</b></div>
              <div><small>Траси</small><b class="pass-trails">${CHAPTERS.map(c => trailShape(c.trail, 12)).join('')}</b></div>
            </div>
            <div class="pass-code" aria-hidden="true">${Array.from({ length: 38 }, (_, i) => `<i style="--w:${[1, 2, 1, 3, 1, 2][i % 6]}"></i>`).join('')}</div>
          </div>
          <div class="pass-holo" aria-hidden="true"></div>
        </div>
      </div>
    </div>
    <div class="hero-meta wrap">
      <span>${L.before ? `ДО ФОРУМУ · ${Math.ceil((FORUM_START - Date.now()) / 864e5)} ДН.` : L.after ? 'ПІДСУМКИ ФОРУМУ' : `ДЕНЬ ФОРУМУ · ${L.day.slice(8)} ГРУДНЯ`}</span>
      <span>07—10.12.2026 / ГК «ПЛАЙ»</span>
      <span class="hide-sm">48.66° N · Карпати</span>
    </div>
  </section>

  <div class="wrap stack-sm">${preview()}${offlineBar()}
    ${urgent ? `<a class="bar bar-alert" href="#/updates">${ic('alert')}<span><b>${esc(urgent.title)}</b></span><span class="link">Деталі ${ic('arrow')}</span></a>` : ''}
  </div>

  ${live ? `<section class="wrap">
    <a class="nownext" href="#/event/${esc(live.id)}">
      <span class="nn-kicker"><span class="live-dot"></span>${L.current ? 'ЗАРАЗ ВІДБУВАЄТЬСЯ' : L.before ? 'НАБЛИЖАЄТЬСЯ ФОРУМ · ПЕРША ПОДІЯ' : 'НАСТУПНА ПОДІЯ'}</span>
      <span class="nn-title">${esc(live.title)}</span>
      <span class="nn-meta">${esc(live.date.slice(8))}.12 · ${esc(formatRange(live))} · ${esc(live.venue || 'Локація уточнюється')}</span>
      <span class="nn-go">Про подію ${ic('arrow')}</span>
    </a>
  </section>` : ''}

  <section class="wrap sec">
    <div class="sec-head"><span class="kicker">07—10 ГРУДНЯ</span><h2>Чотири глави<br><em>форуму.</em></h2><p>Кожен день — інший ритм, нові люди й нові історії. Обери главу та відкрий її події.</p></div>
    <div class="chapters">${CHAPTERS.map(c => `
      <a class="chapter t-${c.trail}" href="#/program/${c.id}">
        <span class="ch-top"><span>${c.idx} / 04</span>${trailShape(c.trail, 16)}</span>
        <span class="ch-date">${c.id.slice(8)}<small>ГРУДНЯ · ${WEEKDAY[c.id].toUpperCase()}</small></span>
        <span class="ch-small">${esc(c.small)}</span>
        <span class="ch-name">${esc(c.name)}</span>
        <span class="ch-tag">${esc(c.tag)}</span>
        <span class="ch-trail">${esc(c.trailName)} — ${esc(c.trailNote)}</span>
        <span class="ch-arrow" aria-hidden="true">↗</span>
      </a>`).join('')}
    </div>
  </section>

  <section class="wrap sec">
    <div class="sec-head row"><div><span class="kicker">ПРОГРАМА</span><h2>Афіші подій.</h2><p>Досліджуй теми, формати та спікерів. Деякі деталі ще погоджуються.</p></div><a class="btn btn-ghost" href="#/program">Усі події ${ic('arrow')}</a></div>
    <div class="posters">${featured.map((e, i) => poster(e, i === 0 ? 'poster-xl' : '')).join('')}</div>
  </section>

  <section class="claude-band">
    <div class="wrap claude-grid">
      <div>
        <span class="kicker kicker-inv"><span class="spark"></span> НОВЕ · ТІЛЬКИ ТУТ</span>
        <h2>Запитай форум.<br><em>Claude відповість.</em></h2>
        <p>Консьєрж на базі Claude від Anthropic знає всю програму, оголошення та логістику — і нічого не вигадує. Якщо чогось ще не підтверджено, він так і скаже.</p>
        <a class="btn btn-lift" href="#/ask">Поставити запитання ${ic('arrow')}</a>
      </div>
      <div class="claude-demo" aria-hidden="true">
        <div class="bubble me">Що в мене 8 грудня о 12:00?</div>
        <div class="bubble ai"><span class="spark"></span><span>О 12:00 — дві паралельні сесії: <b>Медіація</b> (Малий зал) і <b>CV</b> (Великий зал). Обидві попередні; розподіл учасників ще підтверджується.</span></div>
        <div class="chips">${SUGGESTIONS.slice(0, 3).map(s => `<span>${esc(s)}</span>`).join('')}</div>
      </div>
    </div>
  </section>

  <section class="wrap sec" id="speakers">
    <div class="sec-head"><span class="kicker">ЛЮДИ</span><h2>Спікери.</h2><p>Участь за попередньою програмою.</p></div>
    <div class="people">${people.map(p => `
      <article class="person">
        <div class="person-face">${p.photo ? `<img loading="lazy" src="${esc(p.photo)}" alt="Фото: ${esc(p.name)}">` : `<span aria-hidden="true">${esc(p.name.split(' ').map(w => w[0]).join('').slice(0, 2))}</span>`}</div>
        <div><strong>${esc(p.name)}</strong><small>${esc(p.role)}</small>
        <span class="person-ev">${p.events.map(e => `<a href="#/event/${esc(e.id)}">${esc(e.title)}</a>`).join(' · ')}</span>
        ${p.credit ? `<details class="credit"><summary>Джерело фото</summary><small>${esc(p.credit)}</small></details>` : ''}</div>
      </article>`).join('') || '<p>Склад спікерів уточнюється.</p>'}
    </div>
  </section>

  <section class="wrap sec">
    <div class="sec-head row"><div><span class="kicker">АРХІВ</span><h2>Фотоархів.</h2></div>
      <div class="gal-nav"><button class="icon-btn" data-gal="-1" aria-label="Попереднє фото">←</button><button class="icon-btn" data-gal="1" aria-label="Наступне фото">→</button></div></div>
    <div class="gallery">${GALLERY.map((src, i) => `<figure><a href="${src}" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="${src}" alt="Архівне фото Молодіжної ради ${i + 1}"></a><figcaption>${pad(i + 1)} / ${pad(GALLERY.length)}</figcaption></figure>`).join('')}</div>
  </section>

  <section class="wrap sec split">
    <div class="tile">
      <span class="kicker">ПАРТНЕРИ</span><h3>Партнери</h3>
      <p>Перелік партнерів буде опубліковано після підтвердження організаторами.</p>
    </div>
    <a class="tile tile-ink" href="#/updates">
      <span class="kicker kicker-inv">${ic('bell')} ЗВ’ЯЗОК</span><h3>Оголошення організаторів.</h3>
      <p>Оперативні зміни програми, повідомлення організаторів і push на телефон за твоєю згодою.</p>
      <span class="link">Оголошення ${ic('arrow')}</span>
    </a>
  </section>
  ${footer()}`;
}

function speakers() {
  const map = new Map();
  for (const e of sortEv(events())) {
    for (const raw of (e.speakerNames || '').split(' · ')) {
      const name = raw.trim();
      if (!name || name.includes('за робочою програмою') || name.startsWith('ГО «')) continue;
      if (!map.has(name)) map.set(name, { name, role: PEOPLE_ROLES[name] || 'Посада уточнюється', photo: '', credit: '', events: [] });
      const p = map.get(name); p.events.push(e);
      if (e.speakerPhotoUrl && name === 'Олег Григорюк') { p.photo = e.speakerPhotoUrl; p.credit = e.speakerPhotoCredit; }
    }
  }
  return [...map.values()];
}

function dayProfile(list, day) {
  // "Профіль дня": mountain silhouette, peak height = event weight
  const W = 1000, H = 120, from = 7 * 60, to = 25 * 60;
  const x = m => ((Math.min(Math.max(m, from), to) - from) / (to - from)) * W;
  const pts = [[0, H]];
  const peaks = [];
  for (const e of list) {
    const s = mins(e.start) ?? (mins(e.end) ? mins(e.end) - 60 : null), en = endMins(e) ?? (s != null ? s + 60 : null);
    if (s == null) continue;
    const h = e.feature ? 92 : HIGHLIGHTS.includes(e.id) ? 80 : /Кава|Сніданок|Обід|Вечеря/.test(e.title) ? 22 : 45;
    const mid = (x(s) + x(en)) / 2;
    pts.push([x(s), H - 6], [mid, H - h], [x(en), H - 6]);
    if (h >= 80) peaks.push({ e, x: mid, y: H - h });
  }
  pts.push([W, H]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ') + 'Z';
  const L = liveState();
  const nowX = L.day === day ? x(L.now) : null;
  const ticks = [8, 10, 12, 14, 16, 18, 20, 22, 24].map(h => `<g><line x1="${x(h * 60)}" x2="${x(h * 60)}" y1="${H}" y2="${H + 6}"/><text x="${x(h * 60)}" y="${H + 20}">${pad(h % 24)}:00</text></g>`).join('');
  return `<figure class="profile" aria-label="Профіль дня: інтенсивність програми за часом">
    <svg viewBox="0 -10 ${W} ${H + 34}" preserveAspectRatio="none" role="img" aria-label="Силует дня, піки — ключові події">
      <path class="pf-fill" d="${d}"/><path class="pf-line" d="${d}"/>
      <g class="pf-ticks">${ticks}</g>
      ${nowX != null ? `<line class="pf-now" x1="${nowX}" x2="${nowX}" y1="-10" y2="${H}"/>` : ''}
    </svg>
    <div class="pf-labels">${peaks.map(p => `<a href="#/event/${esc(p.e.id)}" style="left:${(p.x / W * 100).toFixed(2)}%;top:${(((p.y + 10) / (H + 34)) * 100).toFixed(2)}%">${esc(p.e.category || p.e.title)}</a>`).join('')}</div>
    <figcaption>Профіль дня — висота піку відповідає вазі події</figcaption>
  </figure>`;
}

function viewProgram(day) {
  if (!DAYS.includes(day)) { const t = kyivParts().day; day = DAYS.includes(t) ? t : DAYS[0]; }
  const ch = chapterOf(day);
  const L = liveState();
  let list = sortEv(events().filter(e => e.date === day));
  const all = list;
  if (S.filter === 'key') list = list.filter(e => !isMinor(e));
  if (S.filter === 'mine') list = list.filter(e => S.saved.has(e.id));
  const slots = new Map();
  for (const e of list) { const k = e.start || 'до ' + (e.end || 'уточнення'); if (!slots.has(k)) slots.set(k, []); slots.get(k).push(e); }
  const rows = [...slots].map(([time, group]) => {
    const isNow = group.some(e => L.current?.id === e.id);
    const past = L.day === day && group.every(e => endMins(e) != null && endMins(e) <= L.now) || L.day > day;
    return `<section class="slot ${isNow ? 'is-now' : ''} ${past ? 'is-past' : ''}">
      <div class="slot-time"><b>${esc(time)}</b>${group.length > 1 ? '<small>Паралельні сесії</small>' : ''}${isNow ? '<small class="now-tag"><span class="live-dot"></span>зараз</small>' : ''}</div>
      <div class="slot-cards ${group.length > 1 ? 'two' : ''}">${group.map(e => isMinor(e) && group.length === 1 ? rowMinor(e) : poster(e, 'poster-row')).join('')}</div>
    </section>`;
  }).join('');
  return `
  ${pageHead('07–10 ГРУДНЯ', 'Програма', 'Оберіть день і відкрийте афішу події.')}
  <div class="wrap">${preview()}${offlineBar()}</div>
  <div class="wrap days" role="tablist" aria-label="Дні форуму">${CHAPTERS.map(c => `
    <a role="tab" aria-selected="${c.id === day}" class="day t-${c.trail} ${c.id === day ? 'on' : ''}" href="#/program/${c.id}">
      ${trailShape(c.trail, 12)}<b>${c.id.slice(8)}</b><span>${WEEKDAY[c.id]}</span><small>${esc(c.name)}</small>
    </a>`).join('')}
  </div>
  <div class="wrap"><section class="chapter-band t-${ch.trail}">
    <div><span class="kicker">ГЛАВА ${ch.idx} / ${esc(ch.small)} · ${esc(ch.trailName).toUpperCase()}</span><h2>${esc(ch.name)}</h2><p>${esc(ch.sub)}</p></div>
    <strong aria-hidden="true">${day.slice(8)}</strong>
  </section></div>
  <div class="wrap">${dayProfile(all, day)}</div>
  <div class="wrap filters" role="group" aria-label="Фільтр подій">
    ${[['all', 'Усе'], ['key', 'Головне'], ['mine', `Мій маршрут${S.saved.size ? ' · ' + S.saved.size : ''}`]].map(([k, l]) => `<button class="chip ${S.filter === k ? 'on' : ''}" data-filter="${k}" aria-pressed="${S.filter === k}">${l}</button>`).join('')}
    <button class="chip" data-ics-day="${day}">${ic('cal')} Увесь день у календар</button>
  </div>
  <div class="wrap timeline">${rows || `<div class="empty">${S.filter === 'mine' ? 'У цей день у твоєму маршруті ще немає подій. Тисни ★ на афіші.' : 'Подій поки немає.'}</div>`}</div>
  ${footer()}`;
}
function rowMinor(e) {
  return `<a class="minor" href="#/event/${esc(e.id)}"><span>${esc(e.title)}</span><small>${esc(formatRange(e))}${e.venue ? ' · ' + esc(e.venue) : ''}</small><span class="status s-${esc(e.status)}">${statusLabel(e.status)}</span></a>`;
}

function viewEvent(id) {
  const e = evById(id);
  if (!e) return `<div class="wrap empty"><h2>Подію не знайдено</h2><a class="btn" href="#/program">У програму</a></div>`;
  const ch = chapterOf(e.date);
  const related = sortEv(events().filter(x => x.date === e.date && x.id !== e.id && x.status !== 'canceled' && !isMinor(x))).slice(0, 3);
  const photo = e.speakerPhotoUrl && /^https:\/\//.test(e.speakerPhotoUrl) ? e.speakerPhotoUrl : '';
  return `
  <section class="ev-hero t-${ch.trail} tone-${esc(e.tone || 'feature')}">
    <svg class="ev-topo" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${topoPaths(e.id + 'x')}</svg>
    <div class="wrap">
      <a class="back" href="#/program/${e.date}">← До програми</a>
      <span class="kicker">${trailShape(ch.trail, 12)} ГЛАВА ${ch.idx} / 04 · ${esc(e.category || 'EVENT')}</span>
      <div class="ev-time" aria-hidden="true">${esc(e.start || e.end || e.date.slice(8))}</div>
      <h1>${esc(e.title)}</h1>
      ${e.posterTitle ? `<p class="ev-poster">${esc(e.posterTitle)}</p>` : ''}
      <p class="ev-sub">${esc(e.date.slice(8))} грудня · ${WEEKDAY[e.date]} · ${esc(formatRange(e))}</p>
    </div>
  </section>
  <div class="wrap ev-grid">
    <article class="ev-story">
      ${photo ? `<figure class="ev-photo"><img src="${esc(photo)}" alt="Фото спікера: ${esc(e.speakerNames || 'спікер')}"><figcaption>${esc(e.speakerPhotoCredit || 'Фото надано організаторами')}</figcaption></figure>` : ''}
      <span class="kicker">ПРО ЩО ЦЯ ПОДІЯ</span>
      <p class="ev-lead">${esc(e.teaser || e.details || 'Деталі уточнюються організаторами.')}</p>
      <span class="kicker">ЧОМУ ЦЕ ЦІКАВО</span>
      <p>${esc(e.why || 'Поговоримо про цю тему в межах форумної програми.')}</p>
      ${e.details ? `<div class="source"><b>З робочої програми:</b> ${esc(e.details)}</div>` : ''}
      <a class="ask-inline" href="#/ask" data-ask-about="${esc(e.id)}"><span class="spark"></span> Запитати Claude про «${esc(e.title)}» ${ic('arrow')}</a>
    </article>
    <aside class="facts">
      <span class="kicker">КОРОТКО ПРО ГОЛОВНЕ</span>
      <dl>
        <div><dt>Дата</dt><dd>${esc(e.date.slice(8))} грудня 2026</dd></div>
        <div><dt>Час</dt><dd>${esc(formatRange(e))}</dd></div>
        <div><dt>Місце</dt><dd>${esc(e.venue || 'Уточнюється')}</dd></div>
        <div><dt>Статус</dt><dd><span class="status s-${esc(e.status)}">${statusLabel(e.status)}</span></dd></div>
        ${e.track === 'parallel' ? '<div><dt>Формат</dt><dd>Паралельна сесія</dd></div>' : ''}
        ${e.speakerNames ? `<div><dt>Учасники / спікери (попередньо)</dt><dd>${esc(e.speakerNames)}</dd></div>` : ''}
      </dl>
      ${photo ? '' : '<p class="fine">Портрети спікерів додадуть після погодження матеріалів.</p>'}
      <div class="facts-act">
        <button class="btn btn-lift full" data-save="${esc(e.id)}">${ic('star')} ${S.saved.has(e.id) ? 'У моєму маршруті' : 'Додати в мій маршрут'}</button>
        <button class="btn btn-ghost full" data-share="${esc(e.id)}">${ic('share')} Поділитися анонсом</button>
        ${e.start && e.end ? `<button class="btn btn-ghost full" data-ics="${esc(e.id)}">${ic('cal')} Додати у календар</button>` : ''}
      </div>
    </aside>
  </div>
  ${related.length ? `<section class="wrap sec"><div class="sec-head row"><div><span class="kicker">ТАКОЖ У ЦЕЙ ДЕНЬ</span><h2>Що ще ${esc(e.date.slice(8))} грудня.</h2></div><a class="btn btn-ghost" href="#/program/${e.date}">Уся програма ${ic('arrow')}</a></div><div class="posters three">${related.map(x => poster(x)).join('')}</div></section>` : ''}
  ${footer()}`;
}

function viewTravel() {
  return `
  ${pageHead('ЛОГІСТИКА', 'Твій Плай.', 'Локації з програми форуму. Точні маршрути та розташування точок ще мають бути підтверджені організаторами.')}
  <div class="wrap">${preview()}</div>
  <section class="wrap sec">
    <div class="loc">
      <div class="loc-copy">
        <span class="kicker kicker-inv">OFFICIAL LOCATION</span>
        <h2>Гірськолижний комплекс «Плай»</h2>
        <p>На офіційному сайті комплексу є інтерактивна карта. Поки що використовуємо саме її — без вигаданих координат і маршрутів.</p>
        <a class="btn btn-lift" href="https://play-karpaty.com/" target="_blank" rel="noopener noreferrer">Перейти на сайт комплексу ${ic('ext')}</a>
      </div>
      <svg class="loc-art" viewBox="0 0 400 260" aria-hidden="true">
        <path d="M0 260 90 120l40 50 70-120 60 90 40-40 100 160Z" class="m1"/>
        <path d="M0 260 60 190l50 30 80-70 70 60 50-30 90 80Z" class="m2"/>
        <path d="m200 50 14 22-14 7-13-7Z" class="snow"/>
        <path d="M120 180 330 70" class="lift"/><circle cx="180" cy="148" r="5" class="cab"/><circle cx="270" cy="101" r="5" class="cab"/>
      </svg>
    </div>
  </section>
  <section class="wrap sec">
    <div class="sec-head"><span class="kicker">ЯК ДІСТАТИСЯ</span><h2>Звідки їдеш?</h2></div>
    <div class="cities" role="group" aria-label="Місто виїзду">${CITIES.map((c, i) => `<button class="chip ${i === 0 ? 'on' : ''}" data-city="${i}" aria-pressed="${i === 0}">${esc(c.name)}</button>`).join('')}</div>
    <div class="route" aria-live="polite">${routeCard(0)}</div>
  </section>
  <section class="wrap sec">
    <div class="sec-head"><span class="kicker">ЗА ПРОГРАМОЮ</span><h2>Основні місця.</h2></div>
    <div class="places">${PLACES.map(([n, d], i) => `<article class="place"><span class="place-n">${pad(i + 1)}</span><div><strong>${esc(n)}</strong><p>${esc(d)}</p></div>${ic('pin')}</article>`).join('')}</div>
    <div class="bar bar-warn" style="margin-top:20px">${ic('alert')}<span><b>Маршрути та безпека:</b> не використовуйте цю сторінку як схему евакуації або укриттів. Вказівки на випадок тривоги повідомлятимуть лише після підтвердження з організаторами й адміністрацією комплексу.</span></div>
  </section>
  ${footer()}`;
}
function routeCard(i) {
  const c = CITIES[i];
  const url = 'https://www.google.com/maps/dir/?api=1&origin=' + encodeURIComponent(c.name) + '&destination=' + encodeURIComponent('Гірськолижний комплекс Плай, Плав’я');
  return `<div class="route-line"><b>${esc(c.name)}</b><span class="route-track" aria-hidden="true"><i></i>${c.bus ? ic('bus') : ic('compass')}</span><b>ГК «Плай»</b></div>
    <p>${esc(c.note)}</p><a class="btn btn-ghost" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Відкрити маршрут на карті ${ic('ext')}</a>`;
}

function viewInfo() {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const support = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const pushReady = support && S.data.webPushAvailable && !(ios && !standalone);
  return `
  ${pageHead('ДЛЯ УЧАСНИКІВ', 'Корисне.', 'Практична інформація, сповіщення та питання щодо участі у форумі.')}
  <div class="wrap">${preview()}</div>
  <div class="wrap bento">
    <article class="tile tile-ink b-push">
      <span class="kicker kicker-inv">${ic('bell')} STAY INFORMED</span>
      <h3>Сповіщення про важливе</h3>
      <p>Отримуйте повідомлення про зміни програми, точки збору та новини. Підписка добровільна, її можна вимкнути.</p>
      ${ios && !standalone ? `<ol class="steps"><li>У Safari натисніть «Поділитися» (Share).</li><li>Оберіть «На початковий екран» (Add to Home Screen).</li><li>Відкрийте доданий сайт та натисніть «Увімкнути сповіщення».</li></ol><p class="fine inv">На iPhone push працюють для сайту, доданого на головний екран.</p>` : ''}
      ${!support ? '<p class="fine inv">Цей браузер не підтримує Web Push або потрібен захищений HTTPS-доступ.</p>' : !S.data.webPushAvailable ? '<p class="fine inv">Відправлення push ще не налаштоване організатором.</p>' : ''}
      <div class="row-btns"><button class="btn btn-lift" data-act="sub" ${pushReady ? '' : 'disabled'}>${ic('bell')} Увімкнути сповіщення</button><button class="btn btn-ghost inv" data-act="unsub" ${support ? '' : 'disabled'}>Вимкнути</button></div>
      <p class="fine inv" id="push-status">Перевіряємо статус підписки…</p>
    </article>
    <article class="tile b-transfer">
      <span class="kicker">${ic('bus')} BEFORE YOU GO</span>
      <h3>Трансфер та від’їзд</h3>
      <ol class="legs">
        <li><b>06 грудня · 22:30</b><span>Попередній час виїзду автобусом з Одеси. Точка збору не підтверджена.</span></li>
        <li><b>10 грудня · 12:30</b><span>Попередній час виїзду з комплексу «Плай».</span></li>
        <li><b>11 грудня · 05:00</b><span>Попередній час прибуття до Одеси за робочою програмою. Може змінитися.</span></li>
      </ol>
    </article>
    <article class="tile">
      <span class="kicker">${ic('info')} NEED HELP?</span><h3>Потрібна допомога?</h3>
      <p>Контакт відповідального координатора ще не підтверджений. Після погодження він з’явиться тут.</p>
      <span class="tag">Контакт уточнюється</span>
    </article>
    <article class="tile">
      <span class="kicker">${ic('users')} OUR COMMUNITY</span><h3>Залишаймося на зв’язку</h3>
      <p>Тут з’являться перевірені прямі посилання на сторінки MTWTU Youth, ПРМТУ та ГО «Трудові Ініціативи».</p>
      <span class="tag">Посилання погоджуються</span>
    </article>
    <article class="tile tile-warn b-wide">
      <span class="kicker">${ic('alert')} ВАЖЛИВО</span>
      <p>Інформація щодо укриття, екстрених контактів і порядку дій під час тривоги буде додана тільки після офіційного підтвердження.</p>
    </article>
  </div>
  <section class="wrap sec faq">
    <div class="sec-head"><span class="kicker">FAQ</span><h2>Поширені питання.</h2></div>
    <details><summary>Де й коли проходить форум?</summary><p>7–10 грудня 2026 року, ГК «Плай».</p><a class="link" href="#/travel">Локації ${ic('arrow')}</a></details>
    <details><summary>Де перевіряти зміни програми?</summary><p>Оперативні повідомлення публікуються в оголошеннях.</p><a class="link" href="#/updates">Оголошення ${ic('arrow')}</a></details>
    <details><summary>Де дізнатися про трансфер?</summary><p>Попередні години виїзду наведено в розділі «Трансфер та від’їзд». Точка збору уточнюється.</p></details>
    <details><summary>Не знайшов відповіді?</summary><p>Запитай Claude — він відповідає лише з програми та оголошень організаторів.</p><a class="link" href="#/ask">Запитати ${ic('arrow')}</a></details>
  </section>
  ${footer()}`;
}

function viewUpdates() {
  const notes = S.data.announcements || [];
  S.seen = notes[0]?.id || ''; store.set('plai:seen', S.seen);
  return `
  ${pageHead('ЗВ’ЯЗОК З ОРГАНІЗАТОРАМИ', 'Оголошення.', 'Зміни програми, організаційні деталі та важливі повідомлення — в одному місці.')}
  <div class="wrap">${offlineBar()}</div>
  <section class="wrap">
    ${notes.length ? `<div class="feed">${notes.map(a => `
      <article class="note k-${esc(a.kind)}">
        <span class="note-kind">${ic(a.kind === 'urgent' ? 'alert' : 'bell')} ${a.kind === 'urgent' ? 'Терміново' : a.kind === 'important' ? 'Важливо' : 'Оголошення'}</span>
        <h3>${esc(a.title)}</h3><time>${esc(fmtDate(a.createdAt))} · Київський час</time>
        <p>${esc(a.text)}</p>
      </article>`).join('')}</div>`
      : `<div class="empty big">${ic('bell')}<h2>Повідомлень поки немає</h2><p>Усі оголошення організаторів з’являться тут, навіть якщо сповіщення на телефоні вимкнені.</p></div>`}
    <div class="tile" style="margin-top:20px"><h3>Хочете отримувати push на телефон?</h3><p>Увімкніть сповіщення в розділі «Корисне». На iPhone можна читати оголошення тут без встановлення сайту.</p><a class="btn btn-ghost" href="#/info">Налаштування сповіщень ${ic('arrow')}</a></div>
  </section>
  ${footer()}`;
}

function viewMy() {
  const list = sortEv(events().filter(e => S.saved.has(e.id)));
  const byDay = DAYS.map(d => [d, list.filter(e => e.date === d)]).filter(([, l]) => l.length);
  const clashes = [];
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const a = list[i], b = list[j];
    if (a.date === b.date && a.start && b.start && mins(a.start) < (endMins(b) ?? mins(b.start) + 1) && mins(b.start) < (endMins(a) ?? mins(a.start) + 1)) clashes.push([a, b]);
  }
  return `
  ${pageHead('ОСОБИСТЕ', 'Мій маршрут.', 'Збирай власну програму: тисни ★ на афіші. Маршрут зберігається лише на цьому пристрої.')}
  <section class="wrap">
    ${clashes.length ? `<div class="bar bar-warn">${ic('alert')}<span><b>Накладки в маршруті:</b> ${clashes.map(([a, b]) => `«${esc(a.title)}» і «${esc(b.title)}»`).join('; ')} — це паралельні сесії, обери одну.</span></div>` : ''}
    ${byDay.length ? byDay.map(([d, l]) => `<div class="my-day"><h2>${trailShape(chapterOf(d).trail, 14)} ${d.slice(8)} грудня · ${WEEKDAY[d]}</h2>${l.map(e => `<div class="my-row"><b>${esc(formatRange(e))}</b><a href="#/event/${esc(e.id)}">${esc(e.title)}</a><span>${esc(e.venue || '')}</span>${saveBtn(e)}</div>`).join('')}</div>`).join('')
      + `<div class="row-btns"><button class="btn btn-lift" data-act="ics-mine">${ic('download')} Експорт у календар (.ics)</button><button class="btn btn-ghost" data-act="clear-mine">Очистити</button></div>`
      : `<div class="empty big">${ic('star')}<h2>Маршрут поки порожній</h2><p>Відкрий програму та познач події, які не хочеш пропустити.</p><a class="btn btn-lift" href="#/program">До програми ${ic('arrow')}</a></div>`}
  </section>
  ${footer()}`;
}

function viewMore() {
  const items = [['#/travel', 'compass', 'Доїзд', 'Як дістатися та основні місця'], ['#/info', 'info', 'Корисне', 'Трансфер, push, FAQ'], ['#/my', 'star', 'Мій маршрут', `${S.saved.size} збережених подій`], ['#/#speakers', 'users', 'Спікери', 'Учасники програми'], ['#/admin', 'lock', 'Організаторам', 'Панель керування']];
  return `${pageHead('МЕНЮ', 'Ще.', 'Усі розділи форуму.')}<nav class="wrap more">${items.map(([h, i, t, s]) => `<a href="${h === '#/#speakers' ? '#/' : h}" ${h === '#/#speakers' ? 'data-scroll="speakers"' : ''}>${ic(i)}<span><b>${t}</b><small>${esc(s)}</small></span>${ic('arrow')}</a>`).join('')}<button class="more-theme" data-act="theme">Змінити тему (світла / темна)</button></nav>${footer()}`;
}

/* ============ Claude concierge ============ */
function viewAsk() {
  const ai = S.data?.ai;
  return `
  <section class="ask wrap">
    <header class="ask-head">
      <span class="ask-orb" aria-hidden="true"><span class="spark"></span></span>
      <div><span class="kicker">КОНСЬЄРЖ ФОРУМУ · POWERED BY CLAUDE</span><h1>Запитай форум.</h1>
      <p>${ai ? 'Відповіді лише з програми, оголошень і логістики. Якщо щось не підтверджено — Claude так і скаже.' : 'AI-режим ще не підключено на сервері — поки шукаю відповіді прямо в програмі.'}</p></div>
    </header>
    <div class="chat" id="chat" aria-live="polite">${S.chat.length ? S.chat.map(renderMsg).join('') : `
      <div class="chat-empty"><p>Спробуй:</p><div class="chips">${SUGGESTIONS.map(s => `<button class="chip" data-suggest="${esc(s)}">${esc(s)}</button>`).join('')}</div></div>`}
    </div>
    <form class="composer" id="ask-form">
      <label class="sr" for="ask-input">Твоє запитання</label>
      <textarea id="ask-input" rows="1" maxlength="600" placeholder="Наприклад: що робити, якщо я з Києва?" required></textarea>
      <button class="send" type="submit" aria-label="Надіслати">${ic('send')}</button>
    </form>
    <p class="fine center">Claude може помилятися — перевіряй важливе в «Оголошеннях». Не вводь особисті дані.</p>
  </section>`;
}
function md(text) {
  // tiny safe markdown: escape → **bold**, lists, paragraphs, [[id]] chips
  let h = esc(text).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  h = h.replace(/\[\[([\w-]+)\]\]/g, (m, id) => { const e = evById(id); return e && !h.includes(`<b>${esc(e.title)}</b>`) ? `<a class="evchip" href="#/event/${esc(id)}">${trailShape(chapterOf(e.date).trail, 9)}${esc(e.title)}</a>` : ''; });
  return h.split(/\n{2,}/).map(p => /^\s*[-•]\s/m.test(p) ? '<ul>' + p.split('\n').filter(Boolean).map(l => `<li>${l.replace(/^\s*[-•]\s*/, '')}</li>`).join('') + '</ul>' : `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
}
function renderMsg(m) {
  if (m.role === 'user') return `<div class="msg me"><p>${esc(m.content)}</p></div>`;
  const ids = [...new Set([...(m.content.matchAll(/\[\[([\w-]+)\]\]/g))].map(x => x[1]))].filter(evById).slice(0, 4);
  return `<div class="msg ai ${m.pending ? 'typing' : ''}"><span class="spark" aria-hidden="true"></span><div class="msg-body">${m.content ? md(m.content) : '<span class="dots"><i></i><i></i><i></i></span>'}
    ${!m.pending && ids.length ? `<div class="msg-cards">${ids.map(id => { const e = evById(id); return `<a href="#/event/${esc(id)}" class="mini t-${chapterOf(e.date).trail}"><small>${esc(e.date.slice(8))}.12 · ${esc(formatRange(e))}</small><b>${esc(e.title)}</b><span>${esc(e.venue || 'Локація уточнюється')} · ${statusLabel(e.status)}</span></a>`; }).join('')}</div>` : ''}
    ${m.local ? '<small class="fine">Локальний пошук по програмі · AI-режим не підключено</small>' : ''}</div></div>`;
}
function paintChat() {
  const c = $('#chat'); if (!c) return;
  c.innerHTML = S.chat.map(renderMsg).join('');
  c.lastElementChild?.scrollIntoView({ block: 'end', behavior: reduceMotion ? 'auto' : 'smooth' });
}
async function ask(q) {
  if (S.asking || !q.trim()) return;
  S.asking = true;
  const history = S.chat.filter(m => !m.local && !m.pending).map(({ role, content }) => ({ role, content }));
  S.chat.push({ role: 'user', content: q });
  const msg = { role: 'assistant', content: '', pending: true };
  S.chat.push(msg); paintChat();
  try {
    if (!S.data.ai) throw Object.assign(new Error('off'), { fallback: true });
    const r = await fetch('/api/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q, history }) });
    if (!r.ok) { const b = await r.json().catch(() => ({})); throw Object.assign(new Error(b.error || 'Помилка'), { fallback: b.fallback, status: r.status }); }
    const reader = r.body.getReader(); const dec = new TextDecoder(); let buf = '';
    for (;;) {
      const { value, done } = await reader.read(); if (done) break;
      buf += dec.decode(value, { stream: true });
      let i; while ((i = buf.indexOf('\n\n')) >= 0) {
        const line = buf.slice(0, i); buf = buf.slice(i + 2);
        if (!line.startsWith('data:')) continue;
        const d = JSON.parse(line.slice(5));
        if (d.t) { msg.content += d.t; paintChat(); }
        if (d.error) msg.content += '\n\n_' + d.error + '_';
      }
    }
    if (!msg.content) msg.content = 'Не вдалося отримати відповідь. Спробуй ще раз.';
  } catch (err) {
    if (err.fallback || err.status === 503 || err.status === 502) { Object.assign(msg, localAnswer(q), { local: true }); }
    else msg.content = err.message || 'Не вдалося отримати відповідь.';
  }
  msg.pending = false; S.asking = false; paintChat();
}
function localAnswer(q) {
  const s = q.toLowerCase();
  const L = liveState();
  if (/зараз|now|наступн/.test(s)) {
    const parts = [];
    if (L.current) parts.push(`Зараз: **${L.current.title}** [[${L.current.id}]]`);
    if (L.next) parts.push(`Наступна подія: **${L.next.title}** — ${L.next.date.slice(8)}.12, ${formatRange(L.next)} [[${L.next.id}]]`);
    return { content: parts.join('\n\n') || 'Зараз подій за програмою немає.' };
  }
  if (/доїх|доб|трансфер|автобус|одес|льв|київ|виїзд/.test(s)) return { content: 'За попередньою програмою:\n\n- 06 грудня о 22:30 — виїзд автобусом з Одеси (точка збору не підтверджена)\n- 10 грудня о 12:30 — виїзд з «Плаю»\n- 11 грудня ~05:00 — прибуття до Одеси\n\nОрганізований трансфер зі Львова чи Києва не підтверджено. Деталі — у розділі «Доїзд».' };
  const dayHit = DAYS.find(d => s.includes(String(+d.slice(8))) || s.includes(WEEKDAY[d].toLowerCase().slice(0, 5)));
  const STOP = new Set(['коли', 'який', 'яка', 'які', 'яке', 'де', 'що', 'буде', 'відбувається', 'проходить', 'мені', 'можна', 'про', 'для', 'там', 'цей', 'грудня', 'розкажи', 'night', 'форум', 'форуму']);
  const words = s.replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));
  const scored = events().map(e => {
    const hay = [e.title, e.category, e.teaser, e.venue, e.details, e.posterTitle, e.speakerNames].join(' ').toLowerCase();
    const title = (e.title + ' ' + (e.category || '')).toLowerCase();
    let sc = words.reduce((a, w) => { const stem = w.slice(0, Math.max(4, w.length - 2)); return a + (title.includes(stem) ? 4 : hay.includes(stem) ? 1.5 : 0); }, 0);
    if (dayHit && e.date === dayHit) sc += 1.5;
    if (/паралел/.test(s) && e.track === 'parallel') sc += 3;
    return [sc, e];
  }).filter(([sc]) => sc > 1).sort((a, b) => b[0] - a[0]);
  if (dayHit && scored.some(([, e]) => e.date === dayHit)) scored.splice(0, scored.length, ...scored.filter(([, e]) => e.date === dayHit));
  const top = scored.length ? scored.filter(([sc]) => sc >= scored[0][0] * .5).slice(0, 4).map(([, e]) => e) : [];
  if (!top.length) return { content: 'У програмі не знайшов нічого за цим запитом. Спробуй інакше сформулювати або переглянь «Програму» й «Оголошення».' };
  return { content: 'Ось що знайшлося в програмі (усі події — попередні):\n\n' + sortEv(top).map(e => `- **${e.title}** — ${e.date.slice(8)}.12, ${formatRange(e)}${e.venue ? ', ' + e.venue : ''} [[${e.id}]]`).join('\n') };
}

/* ============ admin ============ */
function viewAdmin() {
  const me = S.admin.me;
  const head = pageHead('ОРГАНІЗАТОРАМ', 'Панель організатора.', 'Публікуйте оголошення, надсилайте push і змінюйте розклад без програмування.');
  if (!me) { loadAdmin(); return head + '<div class="wrap empty"><span class="spin"></span></div>'; }
  if (!me.admin) return `${head}<section class="wrap"><form class="tile login" id="login-form">
    <span class="kicker">${ic('lock')} ЗАХИЩЕНИЙ ДОСТУП</span><h3>Вхід організатора</h3><p>Пароль налаштовується на сервері. Учасникам він не потрібен.</p>
    <label class="field"><span>Пароль організатора</span><input type="password" name="password" autocomplete="current-password" required></label>
    <button class="btn btn-lift full" type="submit">Увійти ${ic('arrow')}</button>
    ${me.enabled ? '' : '<p class="fine warn">Адмінпанель ще не активована: задайте ADMIN_PASSWORD на сервері.</p>'}
  </form></section>${footer()}`;
  const d = S.admin.data;
  if (!d) return head + '<div class="wrap empty"><span class="spin"></span></div>';
  return `${head}<section class="wrap">
    <div class="stats"><div><b>${d.events.length}</b><small>Подій у базі</small></div><div><b>${d.subscriberCount}</b><small>Push-підписок</small></div><div><b>${d.announcements.length}</b><small>Оголошень</small></div></div>
    <div class="filters"><button class="chip ${S.admin.tab === 'announcements' ? 'on' : ''}" data-atab="announcements">Повідомлення</button><button class="chip ${S.admin.tab === 'events' ? 'on' : ''}" data-atab="events">Програма</button><button class="chip" data-act="logout" style="margin-left:auto">Вийти</button></div>
    ${S.admin.tab === 'announcements' ? `<div class="admin-2">
      <form class="tile" id="ann-form"><span class="kicker">${ic('send')} НОВЕ ОГОЛОШЕННЯ</span><h3>Написати всім.</h3>
        <label class="field"><span>Заголовок</span><input name="title" maxlength="90" placeholder="Наприклад: Зміна локації тренінгу" required></label>
        <label class="field"><span>Текст повідомлення</span><textarea name="text" maxlength="650" rows="5" placeholder="Що саме учасникам потрібно знати?" required></textarea><small>Повідомлення залишиться в розділі «Оголошення» для всіх відвідувачів.</small></label>
        <label class="field"><span>Важливість</span><select name="kind"><option value="info">Звичайне</option><option value="important">Важливе</option><option value="urgent">Термінове</option></select></label>
        <label class="check"><input type="checkbox" name="push" checked> Надіслати push на телефони підписаних учасників</label>
        <button class="btn btn-lift full" type="submit">${ic('send')} Опублікувати повідомлення</button>
        <p class="fine">Підтвердження прийняття push-сервером не гарантує появу сповіщення на кожному телефоні. Оголошення у сайті доступне всім.</p>
      </form>
      <div class="tile"><span class="kicker">ОПУБЛІКОВАНІ</span>${d.announcements.length ? d.announcements.map(a => `<div class="adm-row"><div><b>${esc(a.title)}</b><small>${esc(fmtDate(a.createdAt))} · ${esc(a.kind)}</small><p>${esc(a.text)}</p></div><button class="icon-btn" data-del-ann="${esc(a.id)}" aria-label="Видалити ${esc(a.title)}">${ic('trash')}</button></div>`).join('') : '<p>Поки що нічого не опубліковано.</p>'}</div>
    </div>` : `<div class="tile"><div class="sec-head row"><div><span class="kicker">ПОДІЇ ФОРУМУ</span></div><button class="btn btn-lift" data-edit="new">${ic('plus')} Додати подію</button></div>
      ${sortEv(d.events).map(e => `<div class="adm-row"><div><b>${esc(e.title)}</b><small>${esc(e.date.slice(8))}.12 · ${esc(formatRange(e))} · ${esc(e.venue || 'Локація не встановлена')} · ${statusLabel(e.status)} · ${e.published !== false ? 'Видиме' : 'Приховане'}</small></div><button class="icon-btn" data-edit="${esc(e.id)}" aria-label="Редагувати ${esc(e.title)}">${ic('edit')}</button></div>`).join('')}</div>`}
  </section>${footer()}`;
}
async function loadAdmin() {
  try { S.admin.me = await api('/api/admin/me'); } catch { S.admin.me = { admin: false, enabled: false }; }
  if (S.admin.me.admin) { try { S.admin.data = await api('/api/admin/state'); } catch (e) { toast(e.message); } }
  if (S.route.name === 'admin') render();
}
function openEditor(id) {
  const blank = { id: '', title: '', date: DAYS[0], start: '', end: '', venue: '', details: '', status: 'tentative', track: 'all', published: true, posterTitle: '', teaser: '', why: '', speakerNames: '', category: '' };
  const e = id === 'new' ? blank : { ...blank, ...S.admin.data.events.find(x => x.id === id) };
  const f = (n, l, max, type = 'text') => `<label class="field"><span>${l}</span><input name="${n}" type="${type}" ${max ? `maxlength="${max}"` : ''} value="${esc(e[n] || '')}"></label>`;
  const t = (n, l, max) => `<label class="field"><span>${l}</span><textarea name="${n}" maxlength="${max}" rows="3">${esc(e[n] || '')}</textarea></label>`;
  const dlg = $('#editor');
  dlg.innerHTML = `<form id="event-form" data-id="${esc(e.id || 'new')}" class="editor-body">
    <div class="editor-head"><h2>${e.id ? 'Редагувати подію' : 'Нова подія'}</h2><button type="button" class="icon-btn" data-act="close-editor" aria-label="Закрити">${ic('x')}</button></div>
    ${f('title', 'Назва заходу', 130)}
    <div class="two-col"><label class="field"><span>Дата</span><select name="date">${DAYS.map(d => `<option value="${d}" ${d === e.date ? 'selected' : ''}>${d.slice(8)} грудня</option>`).join('')}</select></label>
    <label class="field"><span>Статус</span><select name="status">${[['tentative', 'Попередньо'], ['confirmed', 'Підтверджено'], ['canceled', 'Скасовано']].map(([k, v]) => `<option value="${k}" ${k === e.status ? 'selected' : ''}>${v}</option>`).join('')}</select></label></div>
    <div class="two-col">${f('start', 'Початок', 0, 'time')}${f('end', 'Кінець', 0, 'time')}</div>
    ${f('venue', 'Локація', 90)}${t('details', 'Короткий опис для учасників', 600)}
    <span class="kicker">АФІША ТА АНОНС</span>
    ${f('category', 'Категорія (англ., напр. SKILL LAB)', 40)}${f('posterTitle', 'Постерний заголовок', 140)}${t('teaser', 'Анонс події', 650)}${t('why', 'Чому це цікаво учаснику', 500)}${f('speakerNames', 'Спікери / учасники (лише погоджені)', 220)}
    <div class="two-col"><label class="field"><span>Тип події</span><select name="track"><option value="all" ${e.track === 'all' ? 'selected' : ''}>Спільна</option><option value="parallel" ${e.track === 'parallel' ? 'selected' : ''}>Паралельна сесія</option></select></label>
    <label class="check"><input name="published" type="checkbox" ${e.published !== false ? 'checked' : ''}> Показувати учасникам</label></div>
    <div class="row-btns"><button class="btn btn-lift" type="submit">Зберегти зміни</button>${e.id ? `<button class="btn btn-ghost" type="button" data-del-ev="${esc(e.id)}">${ic('trash')} Видалити</button>` : ''}</div>
  </form>`;
  dlg.showModal();
}

/* ============ calendar / share ============ */
function ics(list, name) {
  const valid = list.filter(e => e.start && e.end && e.status !== 'canceled');
  if (!valid.length) { toast('Немає подій із точним часом'); return; }
  const x = s => String(s ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  const dt = (d, t) => d.replace(/-/g, '') + 'T' + t.replace(':', '') + '00';
  const nextDay = d => { const n = new Date(d + 'T12:00:00Z'); n.setUTCDate(n.getUTCDate() + 1); return n.toISOString().slice(0, 10); };
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const rows = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MTWTU Youth Forum//PLAI//UK', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  for (const e of valid) rows.push('BEGIN:VEVENT', `UID:${x(e.id)}@mtwtu-youth-forum`, `DTSTAMP:${stamp}`, `DTSTART;TZID=Europe/Kyiv:${dt(e.date, e.start)}`, `DTEND;TZID=Europe/Kyiv:${dt(e.end < e.start ? nextDay(e.date) : e.date, e.end)}`, `SUMMARY:${x(e.title)}`, `LOCATION:${x(e.venue || 'Місце уточнюється')}`, `DESCRIPTION:${x('Попередня програма MTWTU Youth Forum 2026. Час і локацію уточнюйте на сайті. ' + (e.details || ''))}`, 'END:VEVENT');
  rows.push('END:VCALENDAR');
  const blob = new Blob([rows.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  toast(`Завантажено подій: ${valid.length}`);
}
async function share(e) {
  const url = location.origin + '/#/event/' + encodeURIComponent(e.id);
  if (navigator.share) { try { await navigator.share({ title: e.title, text: e.posterTitle || e.teaser || '', url }); } catch { /* cancelled */ } return; }
  try { await navigator.clipboard.writeText(url); toast('Посилання скопійовано'); } catch { toast(url); }
}

/* ============ push ============ */
const b64ToU8 = s => { const p = '='.repeat((4 - s.length % 4) % 4); const r = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(r, c => c.charCodeAt(0)); };
async function swReg() { return navigator.serviceWorker.register('/sw.js'); }
async function subscribe() {
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') throw new Error(perm === 'denied' ? 'Браузер заблокував сповіщення. Дозвольте їх у налаштуваннях сайту.' : 'Дозвіл на сповіщення не наданий.');
    const reg = await swReg(); await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(S.data.vapidPublicKey) });
    await api('/api/push/subscribe', { method: 'POST', body: JSON.stringify(sub) });
    toast('Сповіщення увімкнено!'); pushStatus();
  } catch (e) { toast(e.message); }
}
async function unsubscribe() {
  try { const reg = await swReg(); const sub = await reg.pushManager.getSubscription(); if (sub) { await api('/api/push/unsubscribe', { method: 'POST', body: JSON.stringify({ endpoint: sub.endpoint }) }); await sub.unsubscribe(); } toast('Підписку вимкнено'); pushStatus(); } catch (e) { toast(e.message); }
}
async function pushStatus() {
  const el = $('#push-status'); if (!el) return;
  if (!S.data.webPushAvailable) { el.textContent = 'Сервер поки не приймає push-підписки.'; return; }
  if (!('Notification' in window) || !('PushManager' in window)) { el.textContent = 'Оголошення доступні тут на сайті.'; return; }
  if (Notification.permission === 'denied') { el.textContent = 'Дозвіл заблоковано в налаштуваннях браузера.'; return; }
  try { const reg = await swReg(); const sub = await reg.pushManager.getSubscription(); el.textContent = sub ? 'Сповіщення на цьому пристрої увімкнені.' : 'На цьому пристрої підписку ще не ввімкнено.'; } catch { el.textContent = 'Не вдалося перевірити статус.'; }
}

/* ============ hero: generative topography ============ */
let topoStop = null;
function startTopo() {
  topoStop?.();
  const cv = $('.topo'); if (!cv) return;
  const ctx = cv.getContext('2d');
  let w, h, dpr, cols, rows, cell = 16, raf = 0, t = Math.random() * 100, last = 0;
  const ptr = { x: -9999, y: -9999, k: 0 };
  const resize = () => { dpr = Math.min(devicePixelRatio || 1, 2); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); cell = w < 700 ? 14 : 18; cols = Math.ceil(w / cell) + 1; rows = Math.ceil(h / cell) + 1; };
  const field = new Float32Array(400 * 200);
  const f = (x, y) => {
    const nx = x / 260, ny = y / 260;
    let v = Math.sin(nx * 1.7 + t * .21) + Math.sin(ny * 2.3 - t * .17) + Math.sin((nx + ny) * 1.3 + t * .11) * 1.2 + Math.sin(Math.hypot(nx - 2.2, ny - .9) * 2.4 - t * .25) * 1.3;
    const dx = x - ptr.x, dy = y - ptr.y; v += 2.6 * ptr.k * Math.exp(-(dx * dx + dy * dy) / 18000);
    return v;
  };
  const styles = getComputedStyle(document.documentElement);
  const draw = now => {
    raf = requestAnimationFrame(draw);
    if (now - last < 40) return; last = now;
    t += reduceMotion ? 0 : .02; ptr.k += ((ptr.x > -999 ? 1 : 0) - ptr.k) * .08;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) field[j * cols + i] = f(i * cell, j * cell);
    ctx.clearRect(0, 0, w, h);
    const line = styles.getPropertyValue('--topo').trim() || 'rgba(0,0,0,.12)', hot = styles.getPropertyValue('--lift').trim() || '#ff5a1f';
    for (let L = -3.5; L <= 4.5; L += .5) {
      ctx.beginPath();
      ctx.strokeStyle = Math.abs(L - 2) < .01 ? hot : line; ctx.lineWidth = Math.abs(L - 2) < .01 ? 1.6 : Number.isInteger(L) ? 1.1 : .6;
      for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
        const a = field[j * cols + i], b = field[j * cols + i + 1], c = field[(j + 1) * cols + i + 1], d = field[(j + 1) * cols + i];
        const idx = (a > L) | (b > L) << 1 | (c > L) << 2 | (d > L) << 3;
        if (idx === 0 || idx === 15) continue;
        const x = i * cell, y = j * cell;
        const lerp = (p, q) => (L - p) / (q - p);
        const T = [x + cell * lerp(a, b), y], R = [x + cell, y + cell * lerp(b, c)], B = [x + cell * lerp(d, c), y + cell], Lf = [x, y + cell * lerp(a, d)];
        const seg = { 1: [Lf, T], 2: [T, R], 3: [Lf, R], 4: [R, B], 5: [Lf, T, R, B], 6: [T, B], 7: [Lf, B], 8: [B, Lf], 9: [T, B], 10: [T, R, B, Lf], 11: [R, B], 12: [R, Lf], 13: [T, R], 14: [T, Lf] }[idx];
        for (let s = 0; s < seg.length; s += 2) { ctx.moveTo(seg[s][0], seg[s][1]); ctx.lineTo(seg[s + 1][0], seg[s + 1][1]); }
      }
      ctx.stroke();
    }
    if (reduceMotion) cancelAnimationFrame(raf);
  };
  const move = e => { const r = cv.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; };
  const leave = () => { ptr.x = ptr.y = -9999; };
  const hero = cv.parentElement;
  resize(); addEventListener('resize', resize); hero.addEventListener('pointermove', move); hero.addEventListener('pointerleave', leave);
  const io = new IntersectionObserver(([en]) => { cancelAnimationFrame(raf); if (en.isIntersecting) raf = requestAnimationFrame(draw); });
  io.observe(cv);
  // ski-pass tilt
  const pass = $('.pass');
  const tilt = e => { const r = pass.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height; pass.style.setProperty('--rx', ((.5 - py) * 14).toFixed(2) + 'deg'); pass.style.setProperty('--ry', ((px - .5) * 18).toFixed(2) + 'deg'); pass.style.setProperty('--mx', (px * 100).toFixed(1) + '%'); };
  const untilt = () => { pass.style.setProperty('--rx', '0deg'); pass.style.setProperty('--ry', '0deg'); };
  if (pass && !reduceMotion) { pass.addEventListener('pointermove', tilt); pass.addEventListener('pointerleave', untilt); }
  topoStop = () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener('resize', resize); };
}

/* ============ router ============ */
function parseRoute() {
  const [, name = '', arg = ''] = (location.hash.replace(/^#/, '') || '/').split('/');
  return { name: name || 'home', arg: decodeURIComponent(arg) };
}
const VIEWS = { home: viewHome, program: () => viewProgram(S.route.arg), event: () => viewEvent(S.route.arg), travel: viewTravel, info: viewInfo, updates: viewUpdates, my: viewMy, more: viewMore, ask: viewAsk, admin: viewAdmin };
const TITLES = { home: 'MTWTU Youth Forum 2026 · Плай', program: 'Програма', event: 'Подія', travel: 'Доїзд', info: 'Корисне', updates: 'Оголошення', my: 'Мій маршрут', more: 'Меню', ask: 'Запитай Claude', admin: 'Організаторам' };
function render(scrollTop = false) {
  if (!S.data) return;
  const app = $('#app');
  const v = VIEWS[S.route.name] || viewHome;
  topoStop?.(); topoStop = null;
  app.innerHTML = v();
  app.dataset.view = S.route.name;
  document.title = S.route.name === 'event' && evById(S.route.arg) ? evById(S.route.arg).title + ' · MTWTU Youth Forum' : (S.route.name === 'home' ? TITLES.home : TITLES[S.route.name] + ' · MTWTU Youth Forum');
  $$('[data-route]').forEach(a => a.classList.toggle('on', a.dataset.route === S.route.name || (S.route.name === 'event' && a.dataset.route === 'program') || (['travel', 'info', 'my', 'admin'].includes(S.route.name) && a.dataset.route === 'more' && a.closest('.dock'))));
  if (S.route.name === 'home') startTopo();
  if (S.route.name === 'info') pushStatus();
  if (S.route.name === 'ask') { const i = $('#ask-input'); i && matchMedia('(min-width: 900px)').matches && i.focus(); $('#chat')?.lastElementChild?.scrollIntoView({ block: 'end' }); }
  marks();
  if (scrollTop) scrollTo({ top: 0, behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
  revealInit();
}
function revealInit() {
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.sec, .poster, .chapter, .slot, .tile, .person').forEach(el => { el.classList.add('reveal'); io.observe(el); });
}
addEventListener('hashchange', () => { S.route = parseRoute(); render(true); });

/* ============ events ============ */
document.addEventListener('click', async ev => {
  const t = ev.target.closest('button, a'); if (!t) return;
  const d = t.dataset;
  if (d.save) { ev.preventDefault(); S.saved.has(d.save) ? S.saved.delete(d.save) : S.saved.add(d.save); store.set('plai:saved', [...S.saved]); toast(S.saved.has(d.save) ? '★ Додано в мій маршрут' : 'Прибрано з маршруту'); const y = scrollY; render(); scrollTo(0, y); return; }
  if (d.filter) { S.filter = d.filter; const y = scrollY; render(); scrollTo(0, y); return; }
  if (d.city) { $$('[data-city]').forEach(b => { b.classList.toggle('on', b === t); b.setAttribute('aria-pressed', b === t); }); $('.route').innerHTML = routeCard(+d.city); return; }
  if (d.share) { const e = evById(d.share); e && share(e); return; }
  if (d.ics) { const e = evById(d.ics); e && ics([e], `MTWTU-${e.id}.ics`); return; }
  if (d.icsDay) { ics(sortEv(events().filter(e => e.date === d.icsDay)), `MTWTU-${d.icsDay}.ics`); return; }
  if (d.suggest) { ask(d.suggest); return; }
  if (d.askAbout) { const e = evById(d.askAbout); setTimeout(() => ask(`Розкажи про «${e.title}» ${e.date.slice(8)}.12: що це, де і коли?`), 50); return; }
  if (d.gal) { const g = $('.gallery'); g.scrollBy({ left: g.clientWidth * .8 * +d.gal, behavior: 'smooth' }); return; }
  if (d.scroll) { ev.preventDefault(); const go = () => document.getElementById(d.scroll)?.scrollIntoView({ behavior: 'smooth' }); if (S.route.name !== 'home') { location.hash = '#/'; setTimeout(go, 120); } else go(); return; }
  if (d.atab) { S.admin.tab = d.atab; render(); return; }
  if (d.edit) { openEditor(d.edit); return; }
  if (d.delAnn) { if (!confirm('Видалити оголошення?')) return; try { await api('/api/admin/announcements/' + d.delAnn, { method: 'DELETE' }); await loadAdmin(); load(); } catch (e) { toast(e.message); } return; }
  if (d.delEv) { if (!confirm('Видалити подію назавжди?')) return; try { await api('/api/admin/events/' + d.delEv, { method: 'DELETE' }); $('#editor').close(); await loadAdmin(); load(); } catch (e) { toast(e.message); } return; }
  switch (d.act) {
    case 'film': { const dlg = $('#film'); const fr = document.createElement('iframe'); fr.src = 'https://player.vimeo.com/video/1175179620?dnt=1&autoplay=1'; fr.allow = 'autoplay; fullscreen; picture-in-picture'; fr.title = 'Відео Молодіжної ради ПРМТУ'; $('.film-frame').replaceChildren(fr); dlg.addEventListener('close', () => $('.film-frame').replaceChildren(), { once: true }); dlg.showModal(); break; }
    case 'reload': await load(); render(); break;
    case 'sub': subscribe(); break;
    case 'unsub': unsubscribe(); break;
    case 'theme': toggleTheme(); break;
    case 'ics-mine': ics(sortEv(events().filter(e => S.saved.has(e.id))), 'MTWTU-my-route.ics'); break;
    case 'clear-mine': S.saved.clear(); store.set('plai:saved', []); render(); break;
    case 'logout': await api('/api/admin/logout', { method: 'POST' }).catch(() => {}); S.admin = { me: null, data: null, tab: 'announcements' }; render(); break;
    case 'close-editor': $('#editor').close(); break;
  }
});
document.addEventListener('submit', async ev => {
  const f = ev.target; ev.preventDefault();
  const data = Object.fromEntries(new FormData(f));
  try {
    if (f.id === 'ask-form') { const i = $('#ask-input'); const q = i.value; i.value = ''; i.style.height = ''; ask(q); return; }
    if (f.id === 'login-form') { await api('/api/admin/login', { method: 'POST', body: JSON.stringify(data) }); S.admin.me = null; await loadAdmin(); toast('Вітаємо!'); return; }
    if (f.id === 'ann-form') { const r = await api('/api/admin/announcements', { method: 'POST', body: JSON.stringify({ ...data, push: !!data.push }) }); toast(r.push ? `Опубліковано · push: ${r.push.sent} надіслано` : 'Опубліковано'); await load(); await loadAdmin(); return; }
    if (f.id === 'event-form') { const id = f.dataset.id; data.published = !!data.published; await api(id === 'new' ? '/api/admin/events' : '/api/admin/events/' + id, { method: id === 'new' ? 'POST' : 'PUT', body: JSON.stringify(data) }); $('#editor').close(); toast('Збережено'); await load(); await loadAdmin(); }
  } catch (e) { toast(e.message); }
});
document.addEventListener('input', e => { if (e.target.id === 'ask-input') { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'; } });
document.addEventListener('keydown', e => { if (e.target.id === 'ask-input' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#ask-form').requestSubmit(); } });

/* ============ theme ============ */
function applyTheme(t) { if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme; }
function toggleTheme() {
  const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = cur === 'dark' ? 'light' : 'dark'; applyTheme(next); store.set('plai:theme', next);
  if (S.route.name === 'home') startTopo();
}
$('#theme-btn').addEventListener('click', toggleTheme);
applyTheme(store.get('plai:theme', null));

/* ============ tickers ============ */
setInterval(() => {
  const cd = countdown();
  for (const k of ['d', 'h', 'm', 's']) { const el = $(`[data-cd="${k}"]`); if (el) el.textContent = pad(cd[k]); }
}, 1000);
setInterval(async () => { await load(true); if (!['ask', 'admin'].includes(S.route.name) && !document.querySelector('dialog[open]') && !document.activeElement?.matches('input,textarea,select')) { const y = scrollY; render(); scrollTo(0, y); } }, 60000);

/* ============ boot ============ */
(async () => {
  S.route = parseRoute();
  if (S.data) render();
  else $('#app').innerHTML = '<div class="boot"><span class="spin"></span><p>Завантажуємо твій форум…</p></div>';
  const ok = await load(); if (ok) render();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
})();
})();
