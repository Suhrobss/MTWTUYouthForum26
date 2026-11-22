/* MTWTU Youth Forum 2026 — PLAI//OS client. Vanilla JS, no build step. */
(() => {
'use strict';

/* ============ constants ============ */
const FORUM_START = Date.parse('2026-12-07T00:00:00+02:00');
const DAYS = ['2026-12-07', '2026-12-08', '2026-12-09', '2026-12-10'];
const ALL_DAYS = ['2026-12-06', '2026-12-07', '2026-12-08', '2026-12-09', '2026-12-10', '2026-12-11'];
const CHAPTER_DAYS = { '2026-12-07': ['2026-12-06', '2026-12-07'], '2026-12-08': ['2026-12-08'], '2026-12-09': ['2026-12-09'], '2026-12-10': ['2026-12-10', '2026-12-11'] };
const GROUP_LABEL = { izmail: 'учасники з Ізмаїла', odesa: 'учасники з Одеси', kyiv: 'учасники з Києва', guests: 'запрошені гості' };

/* ============ Юніончик — помічник форуму ============ */
const UNI_NAME = 'Юніончик';
const UNI_SVG = `<svg class="uni-svg" viewBox="-14 -14 228 234" aria-hidden="true" focusable="false"><g class="u-bob"><g class="u-head"><circle cx="100" cy="115" r="78" fill="#fff"/><g class="u-swirl"><g class="u-spin"><circle cx="100" cy="115" r="66" fill="none" stroke="#1D6FA8" stroke-width="15" stroke-linecap="round" stroke-dasharray="330 30" transform="rotate(-70 100 115)"/><circle cx="100" cy="115" r="58" fill="none" stroke="#1D6FA8" stroke-width="4" stroke-linecap="round" stroke-dasharray="120 40 90 60" opacity=".75"/><circle cx="100" cy="115" r="72" fill="none" stroke="#1D6FA8" stroke-width="3" stroke-linecap="round" stroke-dasharray="60 30 140 200" opacity=".6"/><path d="M140 52 Q170 60 176 88" fill="none" stroke="#1D6FA8" stroke-width="9" stroke-linecap="round"/><path d="M150 48 Q168 50 178 66" fill="none" stroke="#1D6FA8" stroke-width="4" stroke-linecap="round" opacity=".8"/></g></g><g class="u-cheeks"><ellipse cx="74" cy="132" rx="9" ry="6" fill="#FF8FA3" opacity=".8"/><ellipse cx="126" cy="132" rx="9" ry="6" fill="#FF8FA3" opacity=".8"/></g><g class="u-look"><g class="u-eyes"><g class="u-eye u-eye-l"><ellipse cx="82" cy="112" rx="7.5" ry="10" fill="#0D1411"/><circle cx="84.5" cy="108" r="2.6" fill="#fff"/></g><g class="u-eye u-eye-r"><ellipse cx="118" cy="112" rx="7.5" ry="10" fill="#0D1411"/><circle cx="120.5" cy="108" r="2.6" fill="#fff"/></g></g><g class="u-lids" stroke="#0D1411" stroke-width="4" fill="none" stroke-linecap="round"><path d="M74 114 Q82 120 90 114"/><path d="M110 114 Q118 120 126 114"/></g><g class="u-joy" stroke="#0D1411" stroke-width="4.5" fill="none" stroke-linecap="round"><path d="M74 115 Q82 104 90 115"/><path d="M110 115 Q118 104 126 115"/></g><g class="u-winkeye" stroke="#0D1411" stroke-width="4.5" fill="none" stroke-linecap="round"><path d="M110 113 Q118 108 126 113"/></g><g class="u-hearteyes"><path transform="translate(82 110) scale(0.9)" d="M0 -4 C-3 -10 -12 -8 -12 -1 C-12 6 -4 10 0 14 C4 10 12 6 12 -1 C12 -8 3 -10 0 -4 Z" fill="#FF4D6D"/><path transform="translate(118 110) scale(0.9)" d="M0 -4 C-3 -10 -12 -8 -12 -1 C-12 6 -4 10 0 14 C4 10 12 6 12 -1 C12 -8 3 -10 0 -4 Z" fill="#FF4D6D"/></g><g class="u-stareyes" fill="#FFD21E" stroke="#0D1411" stroke-width="2"><path d="M82 100 L85 108 L93 109 L87 114 L89 122 L82 118 L75 122 L77 114 L71 109 L79 108 Z"/><path d="M118 100 L121 108 L129 109 L123 114 L125 122 L118 118 L111 122 L113 114 L107 109 L115 108 Z"/></g></g><path class="u-mouth" d="M90 136 Q100 145 110 136" stroke="#0D1411" stroke-width="4" fill="none" stroke-linecap="round"/><path class="u-open" d="M88 134 Q100 134 112 134 Q110 152 100 152 Q90 152 88 134 Z" fill="#0D1411"/><path class="u-tongue" d="M94 146 Q100 141 106 146 Q104 151 100 151 Q96 151 94 146 Z" fill="#FF4D6D"/><ellipse class="u-o" cx="100" cy="142" rx="6" ry="7.5" fill="#0D1411"/><path class="u-frown" d="M90 145 Q100 136 110 145" stroke="#0D1411" stroke-width="4" fill="none" stroke-linecap="round"/><path class="u-cat" d="M89 137 Q94 143 100 138 Q106 143 111 137" stroke="#0D1411" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path class="u-sweat" d="M150 78 Q156 90 150 95 Q144 90 150 78 Z" fill="#7CC6F2" stroke="#fff" stroke-width="2"/></g><g class="u-arm u-arm-l"><path d="M34 140 Q14 150 12 178" stroke="#fff" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M34 140 Q14 150 12 178" stroke="#1D6FA8" stroke-width="11" fill="none" stroke-linecap="round"/><circle cx="12" cy="179" r="10" fill="#fff"/><circle cx="12" cy="179" r="6.5" fill="#1D6FA8"/></g><g class="u-arm u-arm-r"><path d="M166 140 Q186 150 188 178" stroke="#fff" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M166 140 Q186 150 188 178" stroke="#1D6FA8" stroke-width="11" fill="none" stroke-linecap="round"/><circle cx="188" cy="179" r="10" fill="#fff"/><circle cx="188" cy="179" r="6.5" fill="#1D6FA8"/></g><g class="u-dots" fill="#1D6FA8"><circle cx="150" cy="30" r="5"/><circle cx="166" cy="22" r="5"/><circle cx="182" cy="14" r="5"/></g><g class="u-zzz" font-family="Unbounded, sans-serif" font-weight="900" fill="#1D6FA8"><text x="150" y="40" font-size="18">z</text><text x="160" y="30" font-size="14">z</text><text x="168" y="22" font-size="11">z</text></g><g class="u-hearts"><path transform="translate(40 40) scale(1)" d="M0 -4 C-3 -10 -12 -8 -12 -1 C-12 6 -4 10 0 14 C4 10 12 6 12 -1 C12 -8 3 -10 0 -4 Z" fill="#FF4D6D"/><path transform="translate(160 30) scale(0.8)" d="M0 -4 C-3 -10 -12 -8 -12 -1 C-12 6 -4 10 0 14 C4 10 12 6 12 -1 C12 -8 3 -10 0 -4 Z" fill="#FF4D6D"/><path transform="translate(100 10) scale(1.1)" d="M0 -4 C-3 -10 -12 -8 -12 -1 C-12 6 -4 10 0 14 C4 10 12 6 12 -1 C12 -8 3 -10 0 -4 Z" fill="#FF4D6D"/></g><g class="u-spark" fill="#FFD21E" stroke="#0D1411" stroke-width="2"><path d="M30 50 L34 60 L44 64 L34 68 L30 78 L26 68 L16 64 L26 60 Z"/><path d="M168 46 L171 54 L179 57 L171 60 L168 68 L165 60 L157 57 L165 54 Z"/></g><text class="u-q" x="160" y="40" font-family="Unbounded, sans-serif" font-weight="900" font-size="30" fill="#1D6FA8" stroke="#fff" stroke-width="2" paint-order="stroke">?</text><text class="u-ex" x="160" y="40" font-family="Unbounded, sans-serif" font-weight="900" font-size="32" fill="#FF5A1F" stroke="#fff" stroke-width="2" paint-order="stroke">!</text></g></svg>`;
const UNI_SAY = {
  idle: 'Привіт! Я Юніончик. Питай про форум', listen: 'Слухаю уважно…', think: 'Шукаю в програмі…', happy: 'Готово! Ось відповідь',
  salute: 'Передав організаторам! Відповідь прийде сюди', sleep: 'Zzz… Торкнись, щоб розбудити', love: 'Дуже приємно! Звертайся ще', oops: 'Ой… щось пішло не так. Спробуй ще раз',
  wow: 'Ого, цікаве питання!', giggle: 'Хі-хі, лоскотно!', wink: 'Я все знаю про форум 😉'.replace(' 😉', ''), wave: 'Привіт-привіт!', stretch: 'Розімнуся трішки…', yawn: 'Ох, довгий був день…', look: 'Хтось мене кликав?', hop: 'Гоп!', spin: 'Вжух!'
};
const UNI_STATES = ['listen', 'think', 'happy', 'salute', 'sleep', 'love', 'oops', 'wow', 'giggle', 'wink', 'wave', 'stretch', 'yawn', 'look', 'hop', 'spin'];
const uni = (cls = '', live = false) => `<span class="uni ${cls}"${live ? ' data-uni-live' : ''} aria-hidden="true">${UNI_SVG}</span>`;
const kyivHour = () => +new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Kyiv', hour: '2-digit', hour12: false }).format(new Date()) % 24;
const uniNight = () => { const h = kyivHour(); return h >= 23 || h < 7; };
function uniGreeting() { const h = kyivHour(); return h < 5 ? 'Ще не спиш? Я теж!' : h < 12 ? 'Доброго ранку! Я Юніончик' : h < 18 ? 'Привіт! Я Юніончик. Питай про форум' : 'Добрий вечір! Чим допомогти?'; }
function uniBase() { return !S.uniAwake && uniNight() ? 'sleep' : 'idle'; }
document.querySelectorAll('[data-uni-static]').forEach(el => { el.innerHTML = UNI_SVG; });
let uniTimer = 0;
function uniPaint(state, say) {
  document.querySelectorAll('[data-uni-live]').forEach(el => { UNI_STATES.forEach(st => el.classList.remove('is-' + st)); if (state !== 'idle') el.classList.add('is-' + state); });
  document.querySelectorAll('[data-uni-say]').forEach(el => { const t = say || (state === 'idle' ? uniGreeting() : UNI_SAY[state] || uniGreeting()); if (el.textContent !== t) { el.textContent = t; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); } });
}
function setUni(state, ms, say) {
  clearTimeout(uniTimer);
  S.uni = state || uniBase();
  uniPaint(S.uni, say);
  if (ms) uniTimer = setTimeout(() => setUni(uniBase()), ms);
}
/* «живий» Юніончик: мікродії в спокої, погляд за курсором, реакції на дотик */
const UNI_IDLE = [['wave', 1800], ['wink', 1300], ['look', 2400], ['giggle', 1500], ['stretch', 2000], ['hop', 900], ['spin', 1300], ['wow', 1400]];
let uniIdleTimer = 0, uniTipIdx = 0;
function uniIdleTick() {
  clearTimeout(uniIdleTimer);
  uniIdleTimer = setTimeout(() => {
    const live = document.querySelector('[data-uni-live]');
    if (live && !document.hidden && !S.asking && (S.uni === 'idle' || !S.uni)) {
      const h = kyivHour();
      if (Math.random() < .35 && document.querySelector('[data-uni-say]')) { const tips = TL('uni.tips'); if (tips.length) uniPaint('idle', tips[uniTipIdx++ % tips.length]); }
      else { const [st, ms] = h >= 21 && Math.random() < .3 ? ['yawn', 2600] : UNI_IDLE[Math.floor(Math.random() * UNI_IDLE.length)]; uniPaint(st); clearTimeout(uniTimer); uniTimer = setTimeout(() => { if (S.uni === 'idle' || !S.uni) uniPaint('idle'); }, ms); }
    }
    uniIdleTick();
  }, 5000 + Math.random() * 6000);
}
uniIdleTick();
const UNI_POKES = [['giggle', 1500], ['love', 1800], ['hop', 900], ['wink', 1300], ['spin', 1300], ['wave', 1600]];
function uniPoke() {
  S.uniAwake = true; if (S.asking) return;
  const [st, ms] = S.uni === 'sleep' ? ['wow', 1500] : UNI_POKES[Math.floor(Math.random() * UNI_POKES.length)];
  setUni(st, ms);
}
let uniLookRaf = 0;
document.addEventListener('pointermove', e => {
  if (uniLookRaf || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  uniLookRaf = requestAnimationFrame(() => {
    uniLookRaf = 0;
    document.querySelectorAll('[data-uni-live]').forEach(el => {
      const r = el.getBoundingClientRect(); const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); const d = Math.hypot(dx, dy) || 1; const k = Math.min(1, d / 300);
      el.style.setProperty('--lx', (dx / d * 5 * k).toFixed(2) + 'px'); el.style.setProperty('--ly', (dy / d * 4 * k).toFixed(2) + 'px');
    });
  });
}, { passive: true });
const WEEKDAY = { '2026-12-06': 'Неділя', '2026-12-11': 'П’ятниця', '2026-12-07': 'Понеділок', '2026-12-08': 'Вівторок', '2026-12-09': 'Середа', '2026-12-10': 'Четвер' };
const CHAPTERS = [
  { id: '2026-12-07', idx: '01', trail: 'green', trailName: 'Зелена траса' },
  { id: '2026-12-08', idx: '02', trail: 'blue', trailName: 'Синя траса' },
  { id: '2026-12-09', idx: '03', trail: 'red', trailName: 'Червона траса' },
  { id: '2026-12-10', idx: '04', trail: 'black', trailName: 'Чорна траса' }
].map((c, i) => Object.defineProperties(c, Object.fromEntries(['small', 'name', 'tag', 'note', 'sub'].map(f => [f, { get: () => T(`day${i + 1}.${f}`), enumerable: true }]))));

/* ============ editable site texts (admin → «Тексти сайту») ============ */
const TX = [
  ['home.kicker', 'Головна · перший екран', 'Надпис над заголовком', 'MTWTU YOUTH FORUM 2026 · Карпати'],
  ['home.title1', 'Головна · перший екран', 'Заголовок — перший рядок', 'Сила молоді —'],
  ['home.title2', 'Головна · перший екран', 'Заголовок — другий рядок (контурний)', 'сила сьогодення'],
  ['home.lead', 'Головна · перший екран', 'Текст під заголовком (порожньо — не показувати)', '', 'text'],
  ['home.cta', 'Головна · перший екран', 'Кнопка програми', 'Програма 7–10 грудня'],
  ['home.place', 'Головна · перший екран', 'Місце в нижньому рядку', 'Плав’я · Львівська обл.'],
  ['home.daysKicker', 'Головна · чотири дні', 'Надпис над заголовком', '07—10 ГРУДНЯ'],
  ['home.daysTitle1', 'Головна · чотири дні', 'Заголовок — перший рядок', 'Чотири дні'],
  ['home.daysTitle2', 'Головна · чотири дні', 'Заголовок — другий рядок', 'форуму.'],
  ['home.daysLead', 'Головна · чотири дні', 'Текст під заголовком', 'Кожен день — новий ритм та нові знання'],
  ['day1.small', 'День 1 · 07 грудня', 'Мітка', 'ПРИБУТТЯ'],
  ['day1.name', 'День 1 · 07 грудня', 'Назва дня', 'Знайомство'],
  ['day1.tag', 'День 1 · 07 грудня', 'Підзаголовок', 'Починається нова історія'],
  ['day1.note', 'День 1 · 07 грудня', 'Рядок внизу картки (головна)', 'М’який старт: заселяємось і знайомимось'],
  ['day1.sub', 'День 1 · 07 грудня', 'Опис дня (сторінка «Програма»)', 'Від реєстрації до першого спільного вечора.'],
  ['day2.small', 'День 2 · 08 грудня', 'Мітка', 'ЛЮДИ ТА ІДЕЇ'],
  ['day2.name', 'День 2 · 08 грудня', 'Назва дня', 'Навчаємось та граємо'],
  ['day2.tag', 'День 2 · 08 грудня', 'Підзаголовок', 'Нові знання та обмін досвідом'],
  ['day2.note', 'День 2 · 08 грудня', 'Рядок внизу картки (головна)', 'Набираємо швидкість: найнасиченіший день.'],
  ['day2.sub', 'День 2 · 08 грудня', 'Опис дня (сторінка «Програма»)', 'Дискусії, практичні блоки, Unionize і Bowling Night.'],
  ['day3.small', 'День 3 · 09 грудня', 'Мітка', 'СПІЛЬНА ДІЯ'],
  ['day3.name', 'День 3 · 09 грудня', 'Назва дня', 'Коріння і крила'],
  ['day3.tag', 'День 3 · 09 грудня', 'Підзаголовок', 'Історія руху, органайзинг на практиці та екскурсія на екоферму'],
  ['day3.note', 'День 3 · 09 грудня', 'Рядок внизу картки (головна)', 'Від кейсів — до гір і фінальної ночі.'],
  ['day3.sub', 'День 3 · 09 грудня', 'Опис дня (сторінка «Програма»)', 'Навчання, екскурсія, підсумки та фінальний вечір.'],
  ['day4.small', 'День 4 · 10 грудня', 'Мітка', 'ДОРОГА ДОДОМУ'],
  ['day4.name', 'День 4 · 10 грудня', 'Назва дня', 'До зустрічі!'],
  ['day4.tag', 'День 4 · 10 грудня', 'Підзаголовок', 'Виселяємось, підйомник і дорога додому'],
  ['day4.note', 'День 4 · 10 грудня', 'Рядок внизу картки (головна)', 'Останній погляд на Карпати з висоти — і вирушаємо додому.'],
  ['day4.sub', 'День 4 · 10 грудня', 'Опис дня (сторінка «Програма»)', 'Виселення, підйомники та повернення додому.'],
  ['home.postersTitle', 'Головна · інші блоки', 'Афіші — заголовок', 'Афіші подій.'],
  ['home.postersLead', 'Головна · інші блоки', 'Афіші — текст', 'Досліджуй теми, формати та спікерів.'],
  ['home.uniKicker', 'Головна · інші блоки', 'Юніончик — надпис', 'ПОМІЧНИК ФОРУМУ · ТІЛЬКИ ТУТ'],
  ['home.uniTitle1', 'Головна · інші блоки', 'Юніончик — заголовок, рядок 1', 'Запитай форум.'],
  ['home.uniTitle2', 'Головна · інші блоки', 'Юніончик — заголовок, рядок 2', 'Юніончик відповість.'],
  ['home.uniLead', 'Головна · інші блоки', 'Юніончик — текст', 'Юніончик знає всю програму, оголошення, доїзд і спікерів — і нічого не вигадує. Якщо чогось ще не підтверджено, так і скаже, а складне питання передасть організаторам.', 'text'],
  ['home.uniBtn', 'Головна · інші блоки', 'Юніончик — кнопка', 'Запитати Юніончика'],
  ['home.speakersTitle', 'Головна · інші блоки', 'Спікери — заголовок', 'Спікери.'],
  ['home.speakersLead', 'Головна · інші блоки', 'Спікери — текст (порожньо — не показувати)', ''],
  ['home.galleryTitle', 'Головна · інші блоки', 'Фотоархів — заголовок', 'Фотоархів.'],
  ['home.updTitle', 'Головна · інші блоки', 'Плашка оголошень — заголовок', 'Оголошення організаторів.'],
  ['home.updText', 'Головна · інші блоки', 'Плашка оголошень — текст', 'Оперативні зміни програми, повідомлення організаторів і push на телефон за твоєю згодою.', 'text'],
  ['home.tgTitle', 'Головна · інші блоки', 'Плашка Telegram — заголовок', 'Telegram-канал форуму.'],
  ['home.tgText', 'Головна · інші блоки', 'Плашка Telegram — текст', 'Новини, фото й спілкування учасників в одному каналі.'],
  ['home.tgSoon', 'Головна · інші блоки', 'Плашка Telegram — поки немає посилання', 'Канал готується — посилання з’явиться тут.'],
  ['home.sponsorsTitle', 'Головна · інші блоки', 'Спонсори — заголовок', 'Спонсори та партнери.'],
  ['page.program.k', 'Заголовки сторінок', 'Програма — надпис', '07–10 ГРУДНЯ'],
  ['page.program.t', 'Заголовки сторінок', 'Програма — заголовок', 'Програма'],
  ['page.program.l', 'Заголовки сторінок', 'Програма — текст', 'Одна програма для всіх. На паралельні сесії записуйтесь у «Мій форум».'],
  ['page.travel.k', 'Заголовки сторінок', 'Доїзд — надпис', 'ЛОГІСТИКА'],
  ['page.travel.t', 'Заголовки сторінок', 'Доїзд — заголовок', 'Твій Плай.'],
  ['page.travel.l', 'Заголовки сторінок', 'Доїзд — текст', 'Як учасники добираються до «Плаю» і де що знаходиться за програмою.'],
  ['page.info.k', 'Заголовки сторінок', 'Корисне — надпис', 'ДЛЯ УЧАСНИКІВ'],
  ['page.info.t', 'Заголовки сторінок', 'Корисне — заголовок', 'Корисне.'],
  ['page.info.l', 'Заголовки сторінок', 'Корисне — текст', 'Практична інформація, сповіщення, фото та зв’язок з організаторами.'],
  ['page.updates.k', 'Заголовки сторінок', 'Оголошення — надпис', 'ЗВ’ЯЗОК З ОРГАНІЗАТОРАМИ'],
  ['page.updates.t', 'Заголовки сторінок', 'Оголошення — заголовок', 'Оголошення.'],
  ['page.updates.l', 'Заголовки сторінок', 'Оголошення — текст', 'Зміни програми, організаційні деталі та важливі повідомлення — в одному місці.'],
  ['page.me.k', 'Заголовки сторінок', 'Мій форум — надпис', 'ОСОБИСТЕ'],
  ['page.me.t', 'Заголовки сторінок', 'Мій форум — заголовок (до входу)', 'Мій форум.'],
  ['page.me.l', 'Заголовки сторінок', 'Мій форум — текст (до входу)', 'Ваш стіл, ваші сесії, ваша група доїзду й особистий розклад — за персональним кодом від організаторів.'],
  ['page.me.l2', 'Заголовки сторінок', 'Мій форум — текст (після входу)', 'Це ваш персональний форум: сесії, місце на Unionize, група доїзду й розклад по днях.'],
  ['page.more.t', 'Заголовки сторінок', 'Меню «Ще» — заголовок', 'Ще.'],
  ['page.more.l', 'Заголовки сторінок', 'Меню «Ще» — текст', 'Усі розділи форуму.'],
  ['travel.locTitle', 'Сторінка «Доїзд»', 'Локація — заголовок', 'Гірськолижний комплекс «Плай»'],
  ['travel.locText', 'Сторінка «Доїзд»', 'Локація — текст', 'с. Плав’я, Львівська область. На офіційному сайті комплексу є інтерактивна карта території.', 'text'],
  ['travel.routesTitle', 'Сторінка «Доїзд»', 'Групи доїзду — заголовок', 'Три шляхи до «Плаю».'],
  ['travel.back', 'Сторінка «Доїзд»', 'Повернення — по рядку: дата | текст', '10 грудня · 15:00 | Виїзд автобусом з «Плаю» до Одеси (після обіду 14:00–15:00).\n11 грудня · 05:00 | Орієнтовне прибуття до Одеси.\n11 грудня | Учасники з Ізмаїла: автобус Одеса → Ізмаїл (час уточнюється).', 'list'],
  ['travel.placesTitle', 'Сторінка «Доїзд»', 'Основні місця — заголовок', 'Основні місця.'],
  ['travel.places', 'Сторінка «Доїзд»', 'Основні місця — по рядку: назва | опис', 'Велика зала | Відкриття, Unionize та загальні сесії.\nМала зала | Паралельні тренінги.\nРесторан | Основні прийоми їжі.\nБоулінг | Bowling Night 8 грудня.\nРецепція / готель | Прибуття й поселення до 16:00, реєстрація 7 грудня о 17:00, виселення 10 грудня о 09:00.\nЕкоферма «Плай» | Екскурсія 9 грудня, 14:30–17:30.\nРесторан «Карпатська ружа» | Вечеря для запрошених гостей 9 грудня.', 'list'],
  ['travel.safety', 'Сторінка «Доїзд»', 'Плашка безпеки (порожньо — не показувати)', 'Маршрути та безпека: не використовуйте цю сторінку як схему евакуації або укриттів. Вказівки на випадок тривоги повідомлятимуть лише після підтвердження з організаторами й адміністрацією комплексу.', 'text'],
  ['info.transfer', 'Сторінка «Корисне»', 'Трансфер — по рядку: дата | текст', '06 грудня · 10:00 | Учасники з Ізмаїла: автобус від залізничного вокзалу до Одеси. Учасники з Ізмаїла та Києва — готель Leomare.\n06 грудня · 22:30 | Спільний автобус Одеса → «Плай», збір — Гагарін Плаза.\n10 грудня · 15:00 | Виїзд автобусом з «Плаю» до Одеси.\n11 грудня · 05:00 | Орієнтовний час прибуття до Одеси.', 'list'],
  ['info.help', 'Сторінка «Корисне»', 'Допомога — коли контакт координатора не вказано', 'Контакт координатора з’явиться тут найближчим часом.'],
  ['info.warn', 'Сторінка «Корисне»', 'Плашка «Важливо» (порожньо — не показувати)', 'Інформація щодо укриття, екстрених контактів і порядку дій під час тривоги буде додана тільки після офіційного підтвердження.', 'text'],
  ['info.faq', 'Сторінка «Корисне»', 'FAQ — по рядку: питання | відповідь | посилання | текст посилання', 'Де й коли проходить форум? | 7–10 грудня 2026 року, ГК «Плай», с. Плав’я, Львівська область. | #/travel | Локації\nЯк записатися на паралельну сесію? | Увійдіть у «Мій форум» за персональним кодом від організаторів і оберіть сесію. У кожній 25 місць, тож краще записатися швидше. | #/me | Мій форум\nДе моє місце на Unionize? | Після входу в «Мій форум» ви бачите свій стіл, місце й сусідів на схемі залу. | #/event/088 | Unionize\nДе перевіряти зміни програми? | Оперативні повідомлення публікуються в оголошеннях. | #/updates | Оголошення\nНе знайшов відповіді? | Запитай Юніончика. Якщо він не знає точної відповіді, питання піде організаторам, а відповідь прийде сюди ж. | #/ask | Запитати', 'list'],
  ['ask.kicker', 'Юніончик', 'Надпис над заголовком', 'ПОМІЧНИК ФОРУМУ · ЮНІОНЧИК'],
  ['ask.title', 'Юніончик', 'Заголовок', 'Запитай форум.'],
  ['ask.lead', 'Юніончик', 'Текст під заголовком', 'Юніончик відповідає лише з програми, оголошень і відповідей організаторів. Якщо він не знає точно — передасть питання організаторам, і відповідь прийде сюди.', 'text'],
  ['ask.placeholder', 'Юніончик', 'Підказка в полі вводу', 'Наприклад: коли виїзд з Ізмаїла?'],
  ['ask.fine', 'Юніончик', 'Дрібний текст під полем', 'Юніончик може помилятися — перевіряй важливе в «Оголошеннях». Не вводь особисті дані.'],
  ['ask.suggestions', 'Юніончик', 'Кнопки-підказки — по одній на рядок', 'Що відбувається зараз?\nЯк записатися на паралельну сесію?\nДе моє місце на Unionize?\nКоли Bowling Night?\nЯк доїхати з Ізмаїла?\nХто ведучі столів Unionize?', 'list'],
  ['uni.tips', 'Юніончик', 'Що Юніончик каже в бульбашці — по одній фразі на рядок', 'Спитай, що зараз відбувається\nЗнаю, де твій стіл на Unionize\nПідкажу, коли автобус\nРозкажу про будь-якого спікера\nНе знаю відповіді — спитаю організаторів\nСпитай про паралельні тренінги', 'list'],
  ['foot.org', 'Футер (низ кожної сторінки)', 'Перший рядок', 'MTWTU Youth Forum 2026 · Молодіжна рада ПРМТУ'],
  ['foot.place', 'Футер (низ кожної сторінки)', 'Другий рядок', 'ГК «Плай» · 07–10.12.2026'],
  ['foot.note', 'Футер (низ кожної сторінки)', 'Додатковий рядок (порожньо — не показувати)', '', 'text']
];
const TXD = Object.fromEntries(TX.map(x => [x[0], x[3]]));
const T = k => { const v = S.data?.texts?.[k]; return typeof v === 'string' ? v : (TXD[k] ?? ''); };
const TL = k => T(k).split('\n').map(x => x.trim()).filter(Boolean);
const TP = k => TL(k).map(x => x.split('|').map(y => y.trim()));
const HIGHLIGHTS = ['082', '085', '086', '088', '08d', '093', '095', '097', '09a'];
const GALLERY = ['forum.jpg', 'FIL_1376.jpg', 'img-77.jpg'].map(f => 'https://raw.githubusercontent.com/Suhrobss/MY/main/images/' + f);
const PEOPLE_ROLES = { 'Олег Григорюк': 'Голова ПРМТУ' };

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
const statusBadge = s => s === 'canceled' ? `<span class="status s-canceled">Скасовано</span>` : '';
const sortKey = e => e.seq ?? mins(e.start) ?? -1;
const sortEv = list => [...list].sort((a, b) => a.date.localeCompare(b.date) || sortKey(a) - sortKey(b) || a.id.localeCompare(b.id));
const chapterOf = d => CHAPTERS.find(c => (CHAPTER_DAYS[c.id] || [c.id]).includes(d)) || CHAPTERS[0];
const fmtDate = iso => { try { return new Intl.DateTimeFormat('uk-UA', { timeZone: 'Europe/Kyiv', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)); } catch { return ''; } };
const isMinor = e => !e.feature && !HIGHLIGHTS.includes(e.id);
const forMe = e => !e.group || !S.me || S.me.group === e.group;
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
  me: null,
  asker: store.get('plai:asker', '') || (() => { const a = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now()); store.set('plai:asker', a); return a; })(),
  myQuestions: [],
  seen: store.get('plai:seen', ''),
  chat: [],
  asking: false,
  admin: { me: null, data: null, tab: 'todo' },
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
  $$('.me-dot').forEach(c => { c.hidden = !S.me; });
}

/* ============ live clock ============ */
function liveState() {
  const { day, time } = kyivParts();
  const now = mins(time);
  const list = sortEv(events().filter(e => e.status !== 'canceled' && (e.group ? S.me?.group === e.group : true)));
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
const daysWord = n => { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? 'ДЕНЬ' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'ДНІ' : 'ДНІВ'; };

/* ============ shared fragments ============ */
function preview() {
  return '';
}
function offlineBar() {
  return S.offline ? `<div class="bar bar-warn">${ic('wifi')}<span><b>Немає з’єднання</b> · показано останню збережену версію</span><button class="link" data-act="reload">Оновити</button></div>` : '';
}
function saveBtn() { return ''; }
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
      ${e.status === 'canceled' ? `<div class="poster-foot">${statusBadge(e.status)}</div>` : ''}
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
      <span>${esc(T('foot.org'))}</span>
      <span>${esc(T('foot.place'))}</span>
      <a href="#/admin">Організаторам</a>
    </div>
    ${T('foot.note') ? `<p class="foot-made">${esc(T('foot.note'))}</p>` : ''}
  </footer>`;
}
function pageHead(kicker, title, lead, extra = '') {
  return `<header class="phead wrap"><span class="kicker">${esc(kicker)}</span><h1>${title}</h1>${lead ? `<p class="lead">${esc(lead)}</p>` : ''}${extra}</header>`;
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
        <p class="kicker"><span class="live-dot"></span> ${esc(T('home.kicker'))}</p>
        <h1 class="mega">${esc(T('home.title1')).replace(/ ([—–-])/g, '&nbsp;$1')}<br><span class="mega-outline">${esc(T('home.title2'))}</span></h1>
      </div>
      <div class="hero-copy">
        ${T('home.lead') ? `<p class="hero-lead">${esc(T('home.lead'))}</p>` : ''}
        <div class="hero-cta">
          <a class="btn btn-lift" href="#/program">${esc(T('home.cta'))} ${ic('arrow')}</a>
          <a class="btn btn-ghost" href="#/me">${ic('star')} ${S.me ? 'Мій форум' : 'Увійти за кодом'}</a>
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
      <span>${L.before ? `ДО ФОРУМУ · <span data-cd="d">${pad(cd.d)}</span> ${daysWord(cd.d)}` : L.after ? 'ПІДСУМКИ ФОРУМУ' : `ДЕНЬ ФОРУМУ · ${L.day.slice(8)} ГРУДНЯ`}</span>
      <span>07—10.12.2026 / ГК «ПЛАЙ»</span>
      <span class="hide-sm">${S.data.settings?.participantsLabel ? esc(S.data.settings.participantsLabel) + ' · ' : ''}${esc(T('home.place'))}</span>
    </div>
  </section>

  <div class="wrap stack-sm">${preview()}${offlineBar()}
    ${urgent ? `<a class="bar bar-alert" href="#/updates">${ic('alert')}<span><b>${esc(urgent.title)}</b></span><span class="link">Деталі ${ic('arrow')}</span></a>` : ''}
  </div>

  ${live ? `<section class="wrap">
    <a class="nownext" href="#/event/${esc(live.id)}">
      <span class="nn-kicker"><span class="live-dot"></span>${L.current ? 'ЗАРАЗ' : 'ДАЛІ'}</span>
      <span class="nn-title">${esc(live.title)}</span>
      <span class="nn-meta">${esc(live.date.slice(8))}.12 · ${esc(formatRange(live))} · ${esc(live.venue || 'Локація уточнюється')}</span>
      <span class="nn-go">Про подію ${ic('arrow')}</span>
    </a>
  </section>` : ''}

  <section class="wrap sec">
    <div class="sec-head"><span class="kicker">${esc(T('home.daysKicker'))}</span><h2>${esc(T('home.daysTitle1'))}<br><em>${esc(T('home.daysTitle2'))}</em></h2>${T('home.daysLead') ? `<p>${esc(T('home.daysLead'))}</p>` : ''}</div>
    <div class="chapters">${CHAPTERS.map(c => `
      <a class="chapter t-${c.trail}" href="#/program/${c.id}">
        <span class="ch-top"><span>${c.idx} / 04</span>${trailShape(c.trail, 16)}</span>
        <span class="ch-date">${c.id.slice(8)}<small>ГРУДНЯ · ${WEEKDAY[c.id].toUpperCase()}</small></span>
        <span class="ch-small">${esc(c.small)}</span>
        <span class="ch-name">${esc(c.name)}</span>
        <span class="ch-tag">${esc(c.tag)}</span>
        <span class="ch-trail">${esc(c.note)}</span>
        <span class="ch-arrow" aria-hidden="true">↗</span>
      </a>`).join('')}
    </div>
  </section>

  <section class="wrap sec">
    <div class="sec-head row"><div><span class="kicker">ПРОГРАМА</span><h2>${esc(T('home.postersTitle'))}</h2>${T('home.postersLead') ? `<p>${esc(T('home.postersLead'))}</p>` : ''}</div><a class="btn btn-ghost" href="#/program">Усі події ${ic('arrow')}</a></div>
    <div class="posters">${featured.map((e, i) => poster(e, i === 0 ? 'poster-xl' : '')).join('')}</div>
  </section>

  <section class="claude-band">
    <div class="wrap claude-grid">
      <div>
        <a class="uni-hero" href="#/ask" aria-label="Поговорити з Юніончиком">${uni('uni-lg', true)}<span class="uni-say" data-uni-say>${uniGreeting()}</span></a>
        <span class="kicker kicker-inv">${esc(T('home.uniKicker'))}</span>
        <h2>${esc(T('home.uniTitle1'))}<br><em>${esc(T('home.uniTitle2'))}</em></h2>
        ${T('home.uniLead') ? `<p>${esc(T('home.uniLead'))}</p>` : ''}
        <a class="btn btn-lift" href="#/ask">${esc(T('home.uniBtn'))} ${ic('arrow')}</a>
      </div>
      <div class="claude-demo" aria-hidden="true">
        <div class="bubble me">Що в мене 8 грудня о 12:00?</div>
        <div class="bubble ai">${uni('uni-sm')}<span>О 12:00 — дві паралельні сесії: тренінги <b>«Медіація»</b> (Мала зала) і <b>«CV»</b> (Велика зала), до 25 учасників у кожному. Записатися можна в «Мій форум».</span></div>
        <div class="chips">${TL('ask.suggestions').slice(0, 3).map(s => `<span>${esc(s)}</span>`).join('')}</div>
      </div>
    </div>
  </section>

  <section class="wrap sec" id="speakers">
    <div class="sec-head"><span class="kicker">ЛЮДИ</span><h2>${esc(T('home.speakersTitle'))}</h2>${T('home.speakersLead') ? `<p>${esc(T('home.speakersLead'))}</p>` : ''}</div>
    <div class="people">${people.map(personCard).join('') || '<p>Склад спікерів уточнюється.</p>'}
    </div>
  </section>

  <section class="wrap sec">
    <div class="sec-head row"><div><span class="kicker">АРХІВ</span><h2>${esc(T('home.galleryTitle'))}</h2></div>
      <div class="gal-nav"><button class="icon-btn" data-gal="-1" aria-label="Попереднє фото">←</button><button class="icon-btn" data-gal="1" aria-label="Наступне фото">→</button></div></div>
    ${S.data.settings?.driveUrl ? `<p><a class="btn btn-ghost" href="${esc(S.data.settings.driveUrl)}" target="_blank" rel="noopener noreferrer">Усі фото форуму ${ic('ext')}</a></p>` : ''}
    <div class="gallery">${GALLERY.map((src, i) => `<figure><a href="${src}" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="${src}" alt="Архівне фото Молодіжної ради ${i + 1}"></a><figcaption>${pad(i + 1)} / ${pad(GALLERY.length)}</figcaption></figure>`).join('')}</div>
  </section>

  <section class="wrap sec split">
    <a class="tile tile-ink" href="#/updates">
      <span class="kicker kicker-inv">${ic('bell')} ЗВ’ЯЗОК</span><h3>${esc(T('home.updTitle'))}</h3>
      <p>${esc(T('home.updText'))}</p>
      <span class="link">Оголошення ${ic('arrow')}</span>
    </a>
    <a class="tile" href="${esc(S.data.settings?.telegramUrl || '#/info')}" ${S.data.settings?.telegramUrl ? 'target="_blank" rel="noopener noreferrer"' : ''}>
      <span class="kicker">${ic('users')} ЖИВЕ СПІЛКУВАННЯ</span><h3>${esc(T('home.tgTitle'))}</h3>
      <p>${esc(S.data.settings?.telegramUrl ? T('home.tgText') : T('home.tgSoon'))}</p>
      <span class="link">${S.data.settings?.telegramUrl ? 'Відкрити' : 'Корисне'} ${ic('arrow')}</span>
    </a>
  </section>
  <section class="wrap sec" id="sponsors">
    <div class="sec-head"><span class="kicker">ПІДТРИМКА</span><h2>${esc(T('home.sponsorsTitle'))}</h2></div>
    ${sponsorsBlock()}
  </section>
  ${footer()}`;
}

function speakers() {
  return [...(S.data.speakers || [])].sort((a, b) => (a.order || 0) - (b.order || 0)).map(p => ({ ...p, evs: (p.events || []).map(evById).filter(Boolean) }));
}
function initials(name) { return String(name || '').replace(/[«»"]/g, '').split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase(); }
function personCard(p) {
  return `<article class="person">
    <div class="person-face">${p.photo ? `<img loading="lazy" src="${esc(p.photo)}" alt="Фото: ${esc(p.name)}">` : `<span aria-hidden="true">${esc(initials(p.name))}</span>`}</div>
    <div><strong>${esc(p.name)}</strong><small>${esc([p.role, p.org].filter(Boolean).join(' · ') || 'Посада уточнюється')}</small>
    ${p.evs.length ? `<span class="person-ev">${p.evs.map(e => `<a href="#/event/${esc(e.id)}">${esc(e.title)}</a>`).join(' · ')}</span>` : ''}</div>
    ${p.logo ? `<img class="person-logo" loading="lazy" src="${esc(p.logo)}" alt="Логотип: ${esc(p.org || p.name)}">` : ''}
  </article>`;
}
function sponsorsBlock() {
  const list = [...(S.data.sponsors || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  if (!list.length) return `<div class="tile"><span class="kicker">СПОНСОРИ ТА ПАРТНЕРИ</span><h3>Спонсори</h3><p>Перелік спонсорів і партнерів буде опубліковано після підтвердження організаторами.</p></div>`;
  return `<div class="sponsors">${list.map(s => `<${s.url ? `a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer"` : 'div'} class="sponsor">
      <div class="sponsor-logo">${s.logo ? `<img loading="lazy" src="${esc(s.logo)}" alt="Логотип: ${esc(s.name)}">` : `<span>${esc(initials(s.name))}</span>`}</div>
      <div><strong>${esc(s.name)}</strong>${s.text ? `<p>${esc(s.text)}</p>` : ''}</div>
    </${s.url ? 'a' : 'div'}>`).join('')}</div>`;
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
    <figcaption>Профіль дня</figcaption>
  </figure>`;
}

const slotKeyOf = e => e.date + ' ' + e.start;
const slotClosed = slot => { const [d, t] = slot.split(' '); return Date.now() >= Date.parse(`${d}T${t}:00+02:00`); };
function sessionBar(slot, group) {
  const counts = S.data.sessionCounts || {};
  const mine = S.me?.sessions?.[slot];
  const closed = slotClosed(slot);
  return `<div class="signup">
    <div class="signup-head"><b>${mine ? 'Ви записані ✓' : 'Запис на паралельну сесію'}</b><span>${closed ? 'Запис закрито' : 'Місця обмежені — записуйтесь швидше'}</span></div>
    <div class="signup-opts">${group.map(e => {
      const n = counts[e.id] || 0, cap = e.capacity || 25, left = Math.max(0, cap - n), on = mine === e.id, full = left === 0 && !on;
      return `<div class="signup-opt ${on ? 'on' : ''}">
        <div class="signup-info"><strong>${esc(e.title)}</strong><small>${esc(e.venue || '')} · ${left > 0 ? `залишилось ${left} з ${cap}` : 'місць немає'}</small><span class="meter" aria-hidden="true"><i style="width:${Math.min(100, n / cap * 100).toFixed(0)}%"></i></span></div>
        ${S.me && !closed ? (on ? `<button class="btn btn-ghost" data-sess="${esc(slot)}" data-ev="">Скасувати</button>` : `<button class="btn btn-lift" data-sess="${esc(slot)}" data-ev="${esc(e.id)}" ${full ? 'disabled' : ''}>${mine ? 'Перейти сюди' : 'Записатися'}</button>`) : on ? '<span class="status s-confirmed">Ваша сесія</span>' : ''}
      </div>`;
    }).join('')}</div>
    ${S.me ? '' : `<a class="link" href="#/me">Увійдіть у «Мій форум» за персональним кодом, щоб записатися ${ic('arrow')}</a>`}
  </div>`;
}
function unionizeMap() {
  const tables = S.data.unionize?.tables || [];
  const me = S.me;
  const pos = i => ({ x: 130 + (i % 3) * 270, y: 130 + Math.floor(i / 3) * 250 });
  const g = tables.map((t, i) => {
    const { x, y } = pos(i), mine = me?.table === t.n, cap = t.capacity;
    const seats = Array.from({ length: cap }, (_, k) => {
      const a = -Math.PI / 2 + (k + 1) * 2 * Math.PI / (cap + 1), sx = (x + 80 * Math.cos(a)).toFixed(1), sy = (y + 80 * Math.sin(a)).toFixed(1);
      const isMe = mine && me.seat === k + 1, filled = k < (t.taken || 0);
      return `<circle cx="${sx}" cy="${sy}" r="12" class="seat ${isMe ? 'me' : filled ? 'taken' : ''}"/>${isMe ? `<text x="${sx}" y="${(+sy + 4).toFixed(1)}" class="seat-me-t">Ви</text>` : ''}`;
    }).join('');
    const label = t.host || (t.n === 1 ? (t.label || 'Керівництво') : '');
    return `<g class="utable ${mine ? 'mine' : ''}"><circle cx="${x}" cy="${y}" r="54" class="tbl"/><rect x="${x - 10}" y="${y - 104}" width="20" height="20" rx="5" class="host"/>${seats}<text x="${x}" y="${y - 4}" class="tn">Стіл ${t.n}</text><text x="${x}" y="${y + 17}" class="tl">${esc(label.length > 19 ? label.slice(0, 18) + '…' : label)}</text></g>`;
  }).join('');
  return `<figure class="umap"><svg viewBox="0 0 800 760" role="img" aria-label="Схема залу Unionize: 9 столів, вид зверху">${g}</svg>
    <figcaption><span><i class="lg lg-host"></i>Ведучий</span><span><i class="lg lg-taken"></i>Зайняте місце</span><span><i class="lg lg-me"></i>Ваше місце</span></figcaption></figure>`;
}
function unionizePanel() {
  if (!S.me) return `<div class="bar bar-info">${ic('lock')}<span>Увійдіть у <a href="#/me">«Мій форум»</a>, щоб побачити свій стіл, місце й сусідів.</span></div>`;
  if (!S.me.table) return `<div class="bar bar-info">${ic('info')}<span>Ваше місце на Unionize ще не призначене. Розсадку опублікують організатори.</span></div>`;
  const t = S.me.tableInfo || {};
  return `<div class="tile my-table"><span class="kicker">ВАШЕ МІСЦЕ</span><h3>Стіл ${S.me.table} · місце ${S.me.seat}</h3>
    <p>Ведучий: ${esc(t.host || 'уточнюється')}${t.n === 1 ? ` · ${esc(t.label || 'керівництво та гості')}` : ''}</p>
    ${S.me.neighbours.length ? `<p class="fine">За столом: ${S.me.neighbours.map(n => esc(n.name)).join(', ')}</p>` : ''}</div>`;
}

function viewProgram(day) {
  if (!DAYS.includes(day)) { const t = kyivParts().day; day = DAYS.includes(t) ? t : DAYS[0]; }
  if (S.filter === 'mine') S.filter = 'all';
  const ch = chapterOf(day);
  const L = liveState();
  const days = CHAPTER_DAYS[day] || [day];
  const all = sortEv(events().filter(e => days.includes(e.date)));
  const list = S.filter === 'key' ? all.filter(e => !isMinor(e) || e.date !== day) : all;
  const slots = new Map();
  for (const e of list) {
    const t = e.start || (e.end ? 'до ' + e.end : '—');
    const k = (e.date !== day ? e.date.slice(8) + '.12' + (t !== '—' ? ' · ' + t : '') : t) + (e.start ? '' : '#' + e.id);
    if (!slots.has(k)) slots.set(k, []); slots.get(k).push(e);
  }
  const rows = [...slots].map(([time, group]) => {
    const isNow = group.some(e => L.current?.id === e.id);
    const past = (L.day === day && group.every(e => endMins(e) != null && endMins(e) <= L.now)) || L.day > day;
    const parallel = group.length > 1 && group.every(e => e.track === 'parallel');
    return `<section class="slot ${isNow ? 'is-now' : ''} ${past ? 'is-past' : ''}">
      <div class="slot-time"><b>${esc(time.split('#')[0])}</b>${group[0].group ? `<small>${esc(GROUP_LABEL[group[0].group] || '')}</small>` : ''}${parallel ? '<small>Паралельні сесії</small>' : ''}${isNow ? '<small class="now-tag"><span class="live-dot"></span>зараз</small>' : ''}</div>
      <div><div class="slot-cards ${group.length > 1 ? 'two' : ''}">${group.map(e => isMinor(e) && group.length === 1 ? rowMinor(e) : poster(e, 'poster-row')).join('')}</div>
      ${parallel ? sessionBar(slotKeyOf(group[0]), group) : ''}</div>
    </section>`;
  }).join('');
  return `
  ${pageHead(T('page.program.k'), esc(T('page.program.t')), T('page.program.l'))}
  <div class="wrap">${preview()}${offlineBar()}</div>
  <div class="wrap days" role="tablist" aria-label="Дні форуму">${CHAPTERS.map(c => `
    <a role="tab" aria-selected="${c.id === day}" class="day t-${c.trail} ${c.id === day ? 'on' : ''}" href="#/program/${c.id}">
      ${trailShape(c.trail, 12)}<b>${c.id.slice(8)}</b><span>${WEEKDAY[c.id]}</span><small>${esc(c.name)}</small>
    </a>`).join('')}
  </div>
  <div class="wrap"><section class="chapter-band t-${ch.trail}">
    <div><span class="kicker">ДЕНЬ ${ch.idx} / ${esc(ch.small)} · ${esc(ch.trailName).toUpperCase()}</span><h2>${esc(ch.name)}</h2><p>${esc(ch.sub)}</p></div>
    <strong aria-hidden="true">${day.slice(8)}</strong>
  </section></div>
  <div class="wrap">${dayProfile(all.filter(e => e.date === day), day)}</div>
  <div class="wrap filters" role="group" aria-label="Фільтр подій">
    ${[['all', 'Усе'], ['key', 'Головне']].map(([k, l]) => `<button class="chip ${S.filter === k ? 'on' : ''}" data-filter="${k}" aria-pressed="${S.filter === k}">${l}</button>`).join('')}
    <button class="chip" data-ics-day="${day}">${ic('cal')} Увесь день у календар</button>
  </div>
  <div class="wrap timeline">${rows || '<div class="empty">Подій поки немає.</div>'}</div>
  ${footer()}`;
}
function rowMinor(e) {
  return `<a class="minor" href="#/event/${esc(e.id)}"><span>${esc(e.title)}</span><small>${e.date === '2026-12-06' || e.date === '2026-12-11' ? esc(e.date.slice(8)) + '.12 · ' : ''}${esc(formatRange(e))}${e.venue ? ' · ' + esc(e.venue) : ''}</small><span class="status s-${esc(e.status)}">${statusLabel(e.status)}</span></a>`;
}

function viewEvent(id) {
  const e = evById(id);
  if (!e) return `<div class="wrap empty"><h2>Подію не знайдено</h2><a class="btn" href="#/program">У програму</a></div>`;
  const ch = chapterOf(e.date);
  const related = sortEv(events().filter(x => x.date === e.date && x.id !== e.id && x.status !== 'canceled' && !isMinor(x))).slice(0, 3);
  const photo = e.speakerPhotoUrl && /^https:\/\//.test(e.speakerPhotoUrl) ? e.speakerPhotoUrl : '';
  const parallelGroup = e.track === 'parallel' && e.start ? sortEv(events().filter(x => x.track === 'parallel' && x.date === e.date && x.start === e.start)) : null;
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
      ${parallelGroup && parallelGroup.length > 1 ? sessionBar(slotKeyOf(e), parallelGroup) : ''}
      <span class="kicker">ПРО ЩО ЦЯ ПОДІЯ</span>
      <p class="ev-lead">${esc(e.teaser || e.details || 'Деталі уточнюються організаторами.')}</p>
      <span class="kicker">ЧОМУ ЦЕ ЦІКАВО</span>
      <p>${esc(e.why || 'Поговоримо про цю тему в межах форумної програми.')}</p>
      ${e.details ? `<div class="source"><b>З програми:</b> ${esc(e.details)}</div>` : ''}
      ${e.unionize ? `<span class="kicker">СХЕМА ЗАЛУ · ВИД ЗВЕРХУ</span>${unionizeMap()}${unionizePanel()}` : ''}
      <a class="ask-inline" href="#/ask" data-ask-about="${esc(e.id)}">${uni('uni-xs')} Запитати Юніончика про «${esc(e.title)}» ${ic('arrow')}</a>
    </article>
    <aside class="facts">
      <span class="kicker">КОРОТКО ПРО ГОЛОВНЕ</span>
      <dl>
        <div><dt>Дата</dt><dd>${esc(e.date.slice(8))} грудня 2026</dd></div>
        <div><dt>Час</dt><dd>${esc(formatRange(e))}</dd></div>
        <div><dt>Місце</dt><dd>${esc(e.venue || 'Уточнюється')}</dd></div>
        <div><dt>Статус</dt><dd><span class="status s-${esc(e.status)}">${statusLabel(e.status)}</span></dd></div>
        ${e.track === 'parallel' ? `<div><dt>Формат</dt><dd>Паралельна сесія${e.capacity ? `, ${e.capacity} місць` : ''}</dd></div>` : ''}
        ${e.speakerNames ? `<div><dt>Учасники / спікери</dt><dd>${esc(e.speakerNames)}</dd></div>` : ''}
      </dl>
      <div class="facts-act">
        ${e.link ? `<a class="btn btn-lift full" href="${esc(e.link)}" target="_blank" rel="noopener noreferrer">${ic('ext')} Про локацію на сайті «Плаю»</a>` : ''}
        <button class="btn btn-ghost full" data-share="${esc(e.id)}">${ic('share')} Поділитися анонсом</button>
        ${e.start && e.end ? `<button class="btn btn-ghost full" data-ics="${esc(e.id)}">${ic('cal')} Додати у календар</button>` : ''}
      </div>
    </aside>
  </div>
  ${related.length ? `<section class="wrap sec"><div class="sec-head row"><div><span class="kicker">ТАКОЖ У ЦЕЙ ДЕНЬ</span><h2>Що ще ${esc(e.date.slice(8))} грудня.</h2></div><a class="btn btn-ghost" href="#/program/${e.date}">Уся програма ${ic('arrow')}</a></div><div class="posters three">${related.map(x => poster(x)).join('')}</div></section>` : ''}
  ${footer()}`;
}

function legs(k) { return TP(k).map(([d, t = '']) => `<li><b>${esc(d)}</b><span>${esc(t)}</span></li>`).join(''); }
function routeStops(t) { return String(t.title || '').split('→').map(s => s.trim()).filter(Boolean); }
function transportCard(t) {
  const mine = S.me?.group === t.key;
  const stops = routeStops(t);
  const url = 'https://www.google.com/maps/dir/?api=1&origin=' + encodeURIComponent(stops[0] || '') + '&destination=' + encodeURIComponent('Гірськолижний комплекс Плай, Плав’я');
  return `<article class="tile route-card ${mine ? 'mine' : ''}">
    <span class="kicker">${ic(t.mode === 'car' ? 'compass' : 'bus')} ${t.mode === 'car' ? 'АВТОМОБІЛЬ' : 'АВТОБУС'}${mine ? ' · ВАША ГРУПА' : ''}</span>
    <div class="stops">${stops.map((s, i) => `${i ? '<span class="stop-line" aria-hidden="true"><i></i></span>' : ''}<b>${esc(s)}</b>`).join('')}</div>
    <p>${esc(t.note || '')}</p>
    <p class="meet"><b>Збір:</b> ${t.meet ? esc(t.meet) : 'точка і час збору уточнюються'}</p>
    <a class="link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Маршрут на карті ${ic('ext')}</a>
  </article>`;
}
function viewTravel() {
  return `
  ${pageHead(T('page.travel.k'), esc(T('page.travel.t')), T('page.travel.l'))}
  <div class="wrap">${preview()}</div>
  <section class="wrap sec">
    <div class="loc">
      <div class="loc-copy">
        <span class="kicker kicker-inv">OFFICIAL LOCATION</span>
        <h2>${esc(T('travel.locTitle'))}</h2>
        <p>${esc(T('travel.locText'))}</p>
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
    <div class="sec-head"><span class="kicker">ЯК ДІСТАТИСЯ</span><h2>${esc(T('travel.routesTitle'))}</h2><p>${S.me ? 'Вашу групу виділено.' : 'Свою групу доїзду бачитимете в «Мій форум».'}</p></div>
    <div class="routes">${(S.data.transport || []).map(transportCard).join('')}</div>
    <div class="tile" style="margin-top:14px"><span class="kicker">${ic('clock')} ПОВЕРНЕННЯ</span><ol class="legs">${legs('travel.back')}</ol></div>
  </section>
  <section class="wrap sec">
    <div class="sec-head"><span class="kicker">ЗА ПРОГРАМОЮ</span><h2>${esc(T('travel.placesTitle'))}</h2></div>
    <div class="places">${TP('travel.places').map(([n, d = ''], i) => `<article class="place"><span class="place-n">${pad(i + 1)}</span><div><strong>${esc(n)}</strong><p>${esc(d)}</p></div>${ic('pin')}</article>`).join('')}</div>
    ${T('travel.safety') ? `<div class="bar bar-warn" style="margin-top:20px">${ic('alert')}<span>${esc(T('travel.safety'))}</span></div>` : ''}
  </section>
  ${footer()}`;
}

function viewInfo() {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const support = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const pushReady = support && S.data.webPushAvailable && !(ios && !standalone);
  const st = S.data.settings || {};
  return `
  ${pageHead(T('page.info.k'), esc(T('page.info.t')), T('page.info.l'))}
  <div class="wrap">${preview()}</div>
  <div class="wrap bento">
    <article class="tile tile-ink b-push">
      <span class="kicker kicker-inv">${ic('bell')} STAY INFORMED</span>
      <h3>Сповіщення про важливе</h3>
      <p>Зміни програми, точки збору, відповіді організаторів на ваші питання. Підписка добровільна, її можна вимкнути.</p>
      ${ios && !standalone ? `<ol class="steps"><li>У Safari натисніть «Поділитися» (Share).</li><li>Оберіть «На початковий екран» (Add to Home Screen).</li><li>Відкрийте доданий сайт та натисніть «Увімкнути сповіщення».</li></ol><p class="fine inv">На iPhone push працюють для сайту, доданого на головний екран.</p>` : ''}
      ${!support ? '<p class="fine inv">Цей браузер не підтримує Web Push або потрібен захищений HTTPS-доступ.</p>' : !S.data.webPushAvailable ? '<p class="fine inv">Відправлення push ще не налаштоване організатором.</p>' : ''}
      <div class="row-btns"><button class="btn btn-lift" data-act="sub" ${pushReady ? '' : 'disabled'}>${ic('bell')} Увімкнути сповіщення</button><button class="btn btn-ghost inv" data-act="unsub" ${support ? '' : 'disabled'}>Вимкнути</button></div>
      <p class="fine inv" id="push-status">Перевіряємо статус підписки…</p>
    </article>
    <article class="tile b-transfer">
      <span class="kicker">${ic('bus')} BEFORE YOU GO</span>
      <h3>Трансфер та від’їзд</h3>
      <ol class="legs">${legs('info.transfer')}</ol>
      <a class="link" href="#/travel">Групи доїзду ${ic('arrow')}</a>
    </article>
    <article class="tile">
      <span class="kicker">${ic('info')} NEED HELP?</span><h3>Потрібна допомога?</h3>
      ${st.coordinator ? `<p>${esc(st.coordinator)}</p>` : `<p>${esc(T('info.help'))}</p>`}
      <a class="link" href="#/ask">Або запитайте Юніончика — якщо він не знає, передасть питання організаторам ${ic('arrow')}</a>
    </article>
    <article class="tile">
      <span class="kicker">${ic('users')} ЖИВЕ СПІЛКУВАННЯ</span><h3>Залишаймося на зв’язку</h3>
      ${st.telegramUrl ? `<p>Telegram-канал форуму: новини, фото, спілкування.</p><a class="btn btn-lift" href="${esc(st.telegramUrl)}" target="_blank" rel="noopener noreferrer">Відкрити Telegram ${ic('ext')}</a>` : '<p>Telegram-канал форуму з’явиться тут.</p><span class="tag">Канал готується</span>'}
      <a class="link" href="https://www.instagram.com/mtwtuyouth/" target="_blank" rel="noopener noreferrer">Instagram Молодіжної ради ${ic('ext')}</a>
    </article>
    <article class="tile">
      <span class="kicker">${ic('download')} ФОТОГРАФІЇ</span><h3>Фото форуму</h3>
      ${st.driveUrl ? `<p>Усі фото з форуму в одній папці.</p><a class="btn btn-lift" href="${esc(st.driveUrl)}" target="_blank" rel="noopener noreferrer">Відкрити фото ${ic('ext')}</a>` : '<p>Посилання на фотоархів форуму з’явиться тут.</p><span class="tag">Після форуму</span>'}
    </article>
    ${T('info.warn') ? `<article class="tile tile-warn b-wide">
      <span class="kicker">${ic('alert')} ВАЖЛИВО</span>
      <p>${esc(T('info.warn'))}</p>
    </article>` : ''}
  </div>
  <section class="wrap sec faq">
    <div class="sec-head"><span class="kicker">FAQ</span><h2>Поширені питання.</h2></div>
    ${TP('info.faq').map(([q, ans = '', href = '', lt = '']) => `<details><summary>${esc(q)}</summary><p>${esc(ans)}</p>${href && /^(#\/|https:\/\/)/.test(href) ? `<a class="link" href="${esc(href)}"${href.startsWith('https') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(lt || 'Детальніше')} ${ic('arrow')}</a>` : ''}</details>`).join('')}
  </section>
  ${footer()}`;
}

function viewUpdates() {
  const notes = S.data.announcements || [];
  S.seen = notes[0]?.id || ''; store.set('plai:seen', S.seen);
  return `
  ${pageHead(T('page.updates.k'), esc(T('page.updates.t')), T('page.updates.l'))}
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

function myAgenda() {
  const me = S.me; const slots = new Map();
  for (const e of events()) if (e.track === 'parallel' && e.start) { const k = slotKeyOf(e); if (!slots.has(k)) slots.set(k, []); slots.get(k).push(e); }
  const items = [];
  const tr = me.transport;
  if (me.group === 'kyiv') items.push({ date: '2026-12-06', time: '', title: 'Дорога з Києва до Одеси', sub: 'Розміщення в готелі Leomare (вул. Генуезька, 3б), о 22:30 спільний автобус до «Плаю». Деталі дороги з Києва уточнюються.', kind: 'travel' });
  for (const e of sortEv(events())) {
    if (e.status === 'canceled' || !forMe(e)) continue;
    if (me.group === 'kyiv' && ['061', '113'].includes(e.id)) continue;
    if (me.group === 'odesa' && ['061', '062', '113'].includes(e.id)) continue;
    if (e.id === '098g') continue;
    if (e.id === '063' && tr?.meet) { items.push({ date: e.date, time: e.start, title: e.title, sub: `Збір: ${tr.meet}`, kind: 'travel', link: '#/event/063' }); continue; }
    if (e.track === 'parallel' && e.start) {
      const k = slotKeyOf(e); const chosen = me.sessions?.[k];
      if (chosen && chosen !== e.id) continue;
      if (!chosen) { if (slots.get(k)[0].id !== e.id) continue; items.push({ date: e.date, time: e.start, title: 'Оберіть паралельну сесію', sub: slots.get(k).map(x => x.title).join(' або '), kind: 'choose', link: '#/event/' + e.id }); continue; }
      items.push({ date: e.date, time: e.start, title: e.title, sub: `${e.venue || ''} · ваша сесія`, kind: 'mine', link: '#/event/' + e.id }); continue;
    }
    items.push({ date: e.date, time: e.start || (e.end ? 'до ' + e.end : ''), title: e.title, sub: e.unionize && me.table ? `${e.venue} · стіл ${me.table}, місце ${me.seat}` : (e.venue || ''), kind: isMinor(e) ? 'minor' : 'main', link: '#/event/' + e.id });
  }
  const days = [...new Set(items.map(i => i.date))];
  const dayName = { '2026-12-06': 'Неділя', '2026-12-11': 'П’ятниця', ...WEEKDAY };
  return days.map(d => `<div class="agenda-day"><h3>${d.slice(8)} грудня · ${dayName[d] || ''}</h3>${items.filter(i => i.date === d).map(i => `
    <${i.link ? `a href="${i.link}"` : 'div'} class="agenda-row k-${i.kind}"><b>${esc(i.time || '')}</b><span><strong>${esc(i.title)}</strong>${i.sub ? `<small>${esc(i.sub)}</small>` : ''}</span></${i.link ? 'a' : 'div'}>`).join('')}</div>`).join('');
}
function viewMe() {
  if (!S.me) return `
  ${pageHead(T('page.me.k'), esc(T('page.me.t')), T('page.me.l'))}
  <section class="wrap"><form class="tile login" id="code-form">
    <span class="kicker">${ic('lock')} ВХІД ЗА КОДОМ</span><h3>Введіть персональний код</h3>
    <p>Код виглядає як <b>PLAI-XXXX</b>. Ви отримаєте його від організаторів посиланням або QR-кодом на бейджі.</p>
    <label class="field"><span>Персональний код</span><input name="code" autocomplete="one-time-code" autocapitalize="characters" placeholder="PLAI-____" required></label>
    <button class="btn btn-lift full" type="submit">Увійти ${ic('arrow')}</button>
    <p class="fine">Немає коду? Напишіть організаторам або <a href="#/ask">запитайте Юніончика</a>.</p>
  </form></section>${footer()}`;
  const me = S.me;
  const slots = new Map();
  for (const e of sortEv(events())) if (e.track === 'parallel' && e.start) { const k = slotKeyOf(e); if (!slots.has(k)) slots.set(k, []); slots.get(k).push(e); }
  const qs = me.questions || [];
  return `
  ${pageHead(T('page.me.k'), `Привіт, ${esc(me.name.split(' ')[0] || me.name)}.`, T('page.me.l2'))}
  <div class="wrap me-grid">
    <article class="tile"><span class="kicker">${ic('bus')} ГРУПА ДОЇЗДУ</span><h3>${esc(me.transport?.title || 'Уточнюється')}</h3>
      <p>${esc(me.transport?.note || 'Організатори вкажуть вашу групу.')}</p><p class="meet"><b>Збір:</b> ${me.transport?.meet ? esc(me.transport.meet) : 'точка і час збору уточнюються'}</p></article>
    <article class="tile"><span class="kicker">${ic('users')} UNIONIZE</span><h3>${me.table ? `Стіл ${me.table} · місце ${me.seat}` : 'Місце ще не призначене'}</h3>
      ${me.table ? `<p>Ведучий: ${esc(me.tableInfo?.host || 'уточнюється')}${me.table === 1 ? ` · ${esc(me.tableInfo?.label || 'керівництво та гості')}` : ''}</p>${me.neighbours.length ? `<p class="fine">За столом: ${me.neighbours.map(n => esc(n.name)).join(', ')}</p>` : ''}` : '<p>Розсадку опублікують організатори.</p>'}
      <a class="link" href="#/event/088">Схема залу ${ic('arrow')}</a></article>
    ${me.team || me.room ? `<article class="tile"><span class="kicker">${ic('info')} ДЕТАЛІ</span>${me.team ? `<h3>Команда: ${esc(me.team)}</h3>` : ''}${me.room ? `<p>Кімната: ${esc(me.room)}</p>` : ''}</article>` : ''}
  </div>
  <section class="wrap sec"><div class="sec-head"><span class="kicker">ПАРАЛЕЛЬНІ СЕСІЇ</span><h2>Ваш вибір.</h2><p>По 25 місць у кожній сесії. Запис відкритий до початку сесії, але місця закінчуються — записуйтесь швидше.</p></div>
    ${[...slots].map(([k, g]) => `<div class="me-slot"><h3>${esc(k.slice(8, 10))} грудня · ${esc(k.slice(11))}</h3>${sessionBar(k, g)}</div>`).join('')}
  </section>
  <section class="wrap sec"><div class="sec-head"><span class="kicker">МІЙ ДЕНЬ</span><h2>Особистий розклад.</h2><p>Спільна програма разом із вашими сесіями, місцем і доїздом.</p></div>
    <div class="agenda">${myAgenda()}</div></section>
  <section class="wrap sec"><div class="sec-head"><span class="kicker">ПИТАННЯ</span><h2>Мої питання організаторам.</h2></div>
    ${qs.length ? `<div class="feed">${qs.map(questionCard).join('')}</div>` : `<p class="fine">Поки немає. Якщо Юніончик не знає відповіді, ваше питання з’явиться тут разом із відповіддю організаторів.</p>`}
    <div class="row-btns"><a class="btn btn-lift" href="#/ask">Запитати Юніончика ${ic('arrow')}</a><button class="btn btn-ghost" data-act="me-logout">Вийти</button></div>
  </section>
  ${footer()}`;
}
function questionCard(q) {
  return `<article class="note ${q.status === 'answered' ? 'k-answered' : ''}"><span class="note-kind">${ic(q.status === 'answered' ? 'info' : 'clock')} ${q.status === 'answered' ? 'Відповідь організаторів' : 'Чекає на відповідь'}</span>
    <h3>${esc(q.text)}</h3>${q.answer ? `<p>${esc(q.answer)}</p>` : '<p class="fine">Організатори вже бачать питання. Відповідь прийде сюди і push-сповіщенням, якщо їх увімкнено.</p>'}</article>`;
}
function viewMore() {
  const items = [['#/me', 'star', 'Мій форум', S.me ? S.me.name : 'Вхід за персональним кодом'], ['#/updates', 'bell', 'Оголошення', 'Зміни й повідомлення організаторів'], ['#/travel', 'compass', 'Доїзд', 'Групи доїзду та основні місця'], ['#/info', 'info', 'Корисне', 'Трансфер, push, фото, FAQ'], ['#/admin', 'lock', 'Організаторам', 'Панель керування']];
  return `${pageHead('МЕНЮ', esc(T('page.more.t')), T('page.more.l'))}<nav class="wrap more">${items.map(([h, i, t, s]) => `<a href="${h}">${ic(i)}<span><b>${t}</b><small>${esc(s)}</small></span>${ic('arrow')}</a>`).join('')}<button class="more-theme" data-act="theme">Змінити тему (світла / темна)</button></nav>${footer()}`;
}

/* ============ Юніончик: чат ============ */
function viewAsk() {
  const ai = S.data?.ai;
  S.uni = S.asking ? 'think' : (S.uni && S.uni !== 'idle' && S.uni !== 'sleep' ? S.uni : uniBase());
  const open = (S.myQuestions || []).filter(q => !S.chat.some(m => m.qid === q.id));
  return `
  <section class="ask wrap">
    <header class="ask-head">
      <button class="ask-uni" type="button" data-act="uni-poke" aria-label="Юніончик">${uni('uni-lg' + (S.uni !== 'idle' ? ' is-' + S.uni : ''), true)}<span class="uni-say" data-uni-say>${S.uni === 'idle' ? uniGreeting() : UNI_SAY[S.uni]}</span></button>
      <div><span class="kicker">${esc(T('ask.kicker'))}</span><h1>${esc(T('ask.title'))}</h1>
      ${T('ask.lead') || S.me ? `<p>${esc(T('ask.lead'))}${S.me ? ' Юніончик бачить ваш «Мій форум», тож може відповісти й про ваш стіл чи сесії.' : ''}</p>` : ''}</div>
    </header>
    ${open.length ? `<div class="feed">${open.map(questionCard).join('')}</div>` : ''}
    <div class="chat" id="chat" aria-live="polite">${S.chat.length ? S.chat.map(renderMsg).join('') : `
      <div class="chat-empty"><p>Спробуй:</p><div class="chips">${TL('ask.suggestions').map(s => `<button class="chip" data-suggest="${esc(s)}">${esc(s)}</button>`).join('')}</div></div>`}
    </div>
    <form class="composer" id="ask-form">
      <label class="sr" for="ask-input">Твоє запитання</label>
      <textarea id="ask-input" rows="1" maxlength="600" placeholder="${esc(T('ask.placeholder'))}" required></textarea>
      <button class="send" type="submit" aria-label="Надіслати">${ic('send')}</button>
    </form>
    ${T('ask.fine') ? `<p class="fine center">${esc(T('ask.fine'))}</p>` : ''}
  </section>`;
}
function md(text) {
  // tiny safe markdown: escape → **bold**, lists, paragraphs, [[id]] chips
  let h = esc(text).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  h = h.replace(/\[\[([\w-]+)\]\]/g, (m, id) => { const e = evById(id); return e && !h.includes(`<b>${esc(e.title)}</b>`) ? `<a class="evchip" href="#/event/${esc(id)}">${trailShape(chapterOf(e.date).trail, 9)}${esc(e.title)}</a>` : ''; });
  return h.split(/\n{2,}/).map(p => /^\s*[-•]\s/m.test(p) ? '<ul>' + p.split('\n').filter(Boolean).map(l => `<li>${l.replace(/^\s*[-•]\s*/, '')}</li>`).join('') + '</ul>' : `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
}
function renderMsg(m, i) {
  if (m.role === 'user') return `<div class="msg me"><p>${esc(m.content)}</p></div>`;
  const ids = [...new Set([...(m.content.matchAll(/\[\[([\w-]+)\]\]/g))].map(x => x[1]))].filter(evById).slice(0, 4);
  return `<div class="msg ai ${m.pending ? 'typing' : ''}">${uni('uni-sm' + (m.pending ? ' is-think' : m.qid ? ' is-salute' : ''))}<div class="msg-body">${m.content ? md(m.content) : '<span class="dots"><i></i><i></i><i></i></span>'}
    ${!m.pending && ids.length ? `<div class="msg-cards">${ids.map(id => { const e = evById(id); return `<a href="#/event/${esc(id)}" class="mini t-${chapterOf(e.date).trail}"><small>${esc(e.date.slice(8))}.12 · ${esc(formatRange(e))}</small><b>${esc(e.title)}</b><span>${esc(e.venue || 'Локація уточнюється')} · ${statusLabel(e.status)}</span></a>`; }).join('')}</div>` : ''}
    ${m.local ? '' : ''}
    ${m.pending ? '' : m.qid ? `<p class="escalated">${ic('send')} Питання передано організаторам. Відповідь з’явиться тут${S.me ? ' і в «Мій форум»' : ''}.</p>` : `<button class="link escalate" data-escalate="${i}">${ic('send')} Відповідь не допомогла? Передати питання організаторам</button>`}
  </div></div>`;
}
function paintChat() {
  const c = $('#chat'); if (!c) return;
  c.innerHTML = S.chat.map(renderMsg).join('');
  c.lastElementChild?.scrollIntoView({ block: 'end', behavior: reduceMotion ? 'auto' : 'smooth' });
}
async function refreshMyQuestions() {
  try { const r = await api('/api/questions/mine?asker=' + encodeURIComponent(S.asker)); S.myQuestions = r.questions || []; } catch { /* offline */ }
}
async function escalate(i) {
  const m = S.chat[i]; if (!m || m.qid) return;
  const q = [...S.chat.slice(0, i)].reverse().find(x => x.role === 'user');
  if (!q) return;
  try {
    const r = await api('/api/questions', { method: 'POST', body: JSON.stringify({ text: q.content, asker: S.asker, draft: m.content }) });
    m.qid = r.question.id; paintChat(); setUni('salute', 3500); toast('Питання передано організаторам');
    refreshMyQuestions(); refreshMe();
  } catch (e) { toast(e.message); }
}
async function ask(q) {
  if (S.asking || !q.trim()) return;
  S.asking = true;
  const history = S.chat.filter(m => !m.local && !m.pending).map(({ role, content }) => ({ role, content: content.replace(/\[\[ORG\]\]/g, '') }));
  S.chat.push({ role: 'user', content: q });
  const msg = { role: 'assistant', content: '', pending: true };
  S.chat.push(msg); paintChat(); setUni('think');
  try {
    if (!S.data.ai) throw Object.assign(new Error('off'), { fallback: true });
    const r = await fetch('/api/ask', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q, history, asker: S.asker }) });
    if (!r.ok) { const b = await r.json().catch(() => ({})); throw Object.assign(new Error(b.error || 'Помилка'), { fallback: b.fallback, status: r.status }); }
    const reader = r.body.getReader(); const dec = new TextDecoder(); let buf = '';
    for (;;) {
      const { value, done } = await reader.read(); if (done) break;
      buf += dec.decode(value, { stream: true });
      let k; while ((k = buf.indexOf('\n\n')) >= 0) {
        const line = buf.slice(0, k); buf = buf.slice(k + 2);
        if (!line.startsWith('data:')) continue;
        const d = JSON.parse(line.slice(5));
        if (d.t) { msg.content += d.t; paintChat(); }
        if (d.escalated) { msg.qid = d.escalated; refreshMyQuestions(); refreshMe(); }
        if (d.error) msg.content += '\n\n' + d.error;
      }
    }
    if (!msg.content) { msg.content = 'Не вдалося отримати відповідь. Спробуй ще раз.'; msg.failed = true; }
  } catch (err) {
    if (err.fallback || err.status === 503 || err.status === 502) Object.assign(msg, localAnswer(q), { local: true });
    else { msg.content = err.message || 'Не вдалося отримати відповідь.'; msg.failed = true; }
  }
  msg.pending = false; S.asking = false; paintChat();
  const thanks = /дяку|спасиб|thank|супер|клас|топ|круто|люблю|❤/i.test(q);
  if (msg.failed) setUni('oops', 3000); else if (msg.qid) setUni('salute', 3500); else if (thanks) setUni('love', 3000); else setUni('happy', 2600);
}
function localAnswer(q) {
  const s = q.toLowerCase();
  const L = liveState();
  if (/місце|стіл|unionize|юніон/.test(s) && S.me) return { content: S.me.table ? `Ваше місце на Unionize: **стіл ${S.me.table}, місце ${S.me.seat}**.${S.me.neighbours.length ? ' За столом: ' + S.me.neighbours.map(n => n.name).join(', ') + '.' : ''} [[088]]` : 'Ваше місце на Unionize ще не призначене. Розсадку опублікують організатори.' };
  if (/зараз|now|наступн/.test(s)) {
    const parts = [];
    if (L.current) parts.push(`Зараз: **${L.current.title}** [[${L.current.id}]]`);
    if (L.next) parts.push(`Наступна подія: **${L.next.title}** — ${L.next.date.slice(8)}.12, ${formatRange(L.next)} [[${L.next.id}]]`);
    return { content: parts.join('\n\n') || 'Зараз подій за програмою немає.' };
  }
  if (/доїх|доб|трансфер|автобус|одес|ізма|київ|виїзд|збір/.test(s)) return { content: 'Доїзд 6 грудня:\n\n- Ізмаїл → Одеса: автобус о 10:00 від залізничного вокзалу\n- Учасники з Ізмаїла та Києва: готель Leomare, вул. Генуезька, 3б\n- Одеса → «Плай»: спільний автобус о 22:30, збір — Гагарін Плаза\n\nПовернення: виїзд з «Плаю» 10 грудня о 15:00, прибуття до Одеси 11 грудня близько 05:00 (орієнтовно). Деталі — у розділі «Доїзд».' };
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
  if (!top.length) return { content: 'У програмі не знайшов точної відповіді. Можу передати питання організаторам — натисни кнопку нижче.' };
  return { content: 'Ось що знайшлося в програмі:\n\n' + sortEv(top).map(e => `- **${e.title}** — ${e.date.slice(8)}.12, ${formatRange(e)}${e.venue ? ', ' + e.venue : ''} [[${e.id}]]`).join('\n') };
}

/* ============ admin ============ */
const ADMIN_TABS = [
  ['todo', 'Огляд', 'info', 'Щодня', 'Що ще не заповнено на сайті. Натисніть пункт — відкриється потрібний розділ.'],
  ['questions', 'Питання', 'send', 'Щодня', 'Питання учасників, на які Юніончик не знав точної відповіді. Відповідайте тут або реплаєм (Reply) у Telegram.'],
  ['announcements', 'Оголошення', 'bell', 'Щодня', 'Повідомлення для всіх: з’являються в розділі «Оголошення» і на головній, можна одразу надіслати push на телефони.'],
  ['participants', 'Учасники', 'users', 'Люди', 'Список учасників, персональні коди входу в «Мій форум», групи доїзду та столи Unionize.'],
  ['unionize', 'Unionize', 'star', 'Люди', 'Ведучі та кількість місць за кожним столом гри Unionize.'],
  ['speakers', 'Спікери', 'users', 'Люди', 'Картки спікерів: ім’я, посада, організація, фото, події.'],
  ['sponsors', 'Спонсори', 'star', 'Люди', 'Логотипи, короткі описи й посилання спонсорів та партнерів.'],
  ['events', 'Програма', 'cal', 'Сайт', 'Усі події форуму: назва, час, місце, опис, спікери, видимість на сайті.'],
  ['texts', 'Тексти сайту', 'edit', 'Сайт', 'Усі тексти сторінок: заголовки, описи днів, блоки головної, FAQ, підказки Юніончика, футер. Події, спікери й оголошення редагуються у своїх вкладках.'],
  ['settings', 'Налаштування', 'compass', 'Сайт', 'Посилання на Telegram і фото, контакт координатора, підпис кількості учасників, точки збору груп доїзду.']
];
const GROUP_NAME = k => (S.admin.data?.transport || S.data.transport || []).find(t => t.key === k)?.title || '—';
const meLink = code => location.origin + '/?c=' + encodeURIComponent(code);
function adminTodo(d) {
  const t = [];
  if (!d.participants.length) t.push(['participants', 'Завантажте список учасників (ім’я, група доїзду, стіл, команда)']);
  const noTable = d.participants.filter(p => !p.table).length; if (d.participants.length && noTable) t.push(['participants', `${noTable} учасникам не призначено стіл Unionize`]);
  const noGroup = d.participants.filter(p => !p.group).length; if (d.participants.length && noGroup) t.push(['participants', `${noGroup} учасникам не вказано групу доїзду`]);
  const noHost = d.unionize.tables.filter(x => x.n !== 1 && !x.host).length; if (noHost) t.push(['unionize', `Ведучі не вказані для ${noHost} столів`]);
  const sp = d.speakers.filter(s => !s.photo || !s.role).length; if (sp) t.push(['speakers', `У ${sp} спікерів немає фото або посади`]);
  if (!d.sponsors.length) t.push(['sponsors', 'Додайте спонсорів: лого, 1–2 речення, посилання']);
  const meet = d.transport.filter(x => !x.meet).length; if (meet) t.push(['settings', `Точки і час збору не вказані для ${meet} груп доїзду`]);
  if (!d.settings.coordinator) t.push(['settings', 'Контакт координатора для учасників']);
  if (!d.settings.telegramUrl) t.push(['settings', 'Посилання на Telegram-канал (коли буде)']);
  if (!d.settings.driveUrl) t.push(['settings', 'Посилання на Google Drive з фото (коли буде)']);
  if (S.admin.tg?.configured && !S.admin.tg.connected) t.push(['questions', 'Підключіть групу Telegram для питань учасників']);
  const open = d.questions.filter(q => q.status === 'open').length; if (open) t.unshift(['questions', `${open} питань учасників чекають на відповідь`]);
  return t;
}
function viewAdmin() {
  const me = S.admin.me;
  const head = pageHead('ОРГАНІЗАТОРАМ', 'Панель організатора', 'Усе, що бачать учасники, редагується тут: питання, оголошення, люди, програма й тексти сайту.').replace('class="phead wrap"', 'class="phead phead-sm wrap"');
  if (!me) { loadAdmin(); return head + '<div class="wrap empty"><span class="spin"></span></div>'; }
  if (!me.admin) return `${head}<section class="wrap"><form class="tile login" id="login-form">
    <span class="kicker">${ic('lock')} ЗАХИЩЕНИЙ ДОСТУП</span><h3>Вхід організатора</h3><p>Пароль налаштовується на сервері. Учасникам він не потрібен.</p>
    <label class="field"><span>Пароль організатора</span><input type="password" name="password" autocomplete="current-password" required></label>
    <button class="btn btn-lift full" type="submit">Увійти ${ic('arrow')}</button>
    ${me.enabled ? '' : '<p class="fine warn">Адмінпанель ще не активована: задайте ADMIN_PASSWORD на сервері.</p>'}
  </form></section>${footer()}`;
  const d = S.admin.data;
  if (!d) return head + '<div class="wrap empty"><span class="spin"></span></div>';
  const todo = adminTodo(d);
  const openQ = d.questions.filter(q => q.status === 'open').length;
  const tab = S.admin.tab;
  const views = { todo: () => adminTodoView(todo), questions: () => adminQuestions(d), announcements: () => adminAnnouncements(d), participants: () => adminParticipants(d), unionize: () => adminUnionize(d), events: () => adminEvents(d), speakers: () => adminPeople(d, 'speakers'), sponsors: () => adminPeople(d, 'sponsors'), settings: () => adminSettings(d), texts: () => adminTexts(d) };
  return `${head}<section class="wrap">
    <div class="stats"><div><b>${d.participants.length}</b><small>Учасників</small></div><div><b>${openQ}</b><small>Питань без відповіді</small></div><div><b>${d.subscriberCount}</b><small>Push-підписок</small></div></div>
    <div class="admin-nav">${['Щодня', 'Люди', 'Сайт'].map(g => `<div class="admin-group"><small>${g}</small><div class="admin-tabs">${ADMIN_TABS.filter(x => x[3] === g).map(([k, l, icon]) => `<button class="chip ${tab === k ? 'on' : ''}" data-atab="${k}">${ic(icon)} ${l}${k === 'questions' && openQ ? ` <span class="count">${openQ}</span>` : ''}${k === 'todo' && todo.length ? ` <span class="count">${todo.length}</span>` : ''}</button>`).join('')}</div></div>`).join('')}
      <div class="admin-group"><small>Дії</small><div class="admin-tabs"><a class="chip" href="/" target="_blank" rel="noopener">${ic('ext')} Відкрити сайт</a><button class="chip" data-act="admin-push">${ic('bell')} Push мені про питання</button><button class="chip" data-act="logout">Вийти</button></div></div></div>
    <p class="admin-help">${ic('info')} <span>${esc((ADMIN_TABS.find(x => x[0] === tab) || ADMIN_TABS[0])[4])}</span></p>
    ${(views[tab] || views.todo)()}
  </section>${footer()}`;
}
function adminTodoView(todo) {
  return `<div class="tile"><span class="kicker">КОНТРОЛЬ НАПОВНЕННЯ</span><h3>${todo.length ? 'Ще треба заповнити' : 'Усе заповнено ✓'}</h3>
    ${todo.length ? `<ul class="todo">${todo.map(([tab, text]) => `<li><button class="link" data-atab="${tab}">${esc(text)} ${ic('arrow')}</button></li>`).join('')}</ul>` : '<p>Усі розділи мають дані. Юніончик знає відповіді на основні питання.</p>'}
    <p class="fine">Чим повніші дані, тим точніше відповідає Юніончик: він бере інформацію саме звідси.</p></div>`;
}
function tgCard() {
  const g = S.admin.tg;
  if (!g) return '';
  if (!g.configured) return `<div class="tile"><span class="kicker">TELEGRAM</span><h3>Бот ще не налаштований</h3><p class="fine">Додайте змінну TELEGRAM_BOT_TOKEN у Railway → Variables і перезапустіть сервіс.</p></div>`;
  if (!g.bot) return `<div class="tile"><span class="kicker">TELEGRAM</span><h3>Бот запускається…</h3><p class="fine">Токен є, але бот ще не відповів Telegram. Оновіть сторінку за хвилину або перевірте токен.</p><button class="btn btn-ghost" data-act="tg-refresh">Оновити</button></div>`;
  if (!g.connected) return `<div class="tile"><span class="kicker">TELEGRAM · @${esc(g.bot)}</span><h3>Підключіть групу організаторів</h3>
    <p class="fine">Натисніть кнопку, оберіть вашу групу — бот додасться туди й сам запам’ятає, куди надсилати питання. Після цього натисніть «Перевірити».</p>
    <div class="row-btns"><a class="btn btn-lift" href="${esc(g.linkGroup)}" target="_blank" rel="noopener noreferrer">Підключити групу ${ic('ext')}</a><a class="btn btn-ghost" href="${esc(g.linkPrivate)}" target="_blank" rel="noopener noreferrer">Лише мені в особисті</a><button class="btn btn-ghost" data-act="tg-refresh">Перевірити</button></div></div>`;
  return `<div class="tile"><span class="kicker">TELEGRAM · @${esc(g.bot)} · ПІДКЛЮЧЕНО</span><h3>Питання йдуть у «${esc(g.chatTitle)}»</h3>
    <p class="fine">Коли Юніончик не знає відповіді, питання миттєво з’являється в Telegram. Відповідайте реплаєм (Reply) — Юніончик відшліфує текст, учасник отримає відповідь на сайті й push, а відповідь піде в базу знань. Команда /open — показати всі питання без відповіді.</p>
    <div class="row-btns"><button class="btn btn-ghost" data-act="tg-test">Надіслати тест</button><button class="btn btn-ghost" data-act="tg-unlink">Відключити</button></div></div>`;
}
function adminQuestions(d) {
  const open = d.questions.filter(q => q.status === 'open'), done = d.questions.filter(q => q.status === 'answered');
  return `${tgCard()}<div class="admin-2">
    <div class="tile"><span class="kicker">${ic('clock')} ЧЕКАЮТЬ НА ВІДПОВІДЬ · ${open.length}</span>
      ${open.length ? open.map(q => `<form class="qa" data-qid="${esc(q.id)}">
        <b>${esc(q.text)}</b><small>${esc(q.participantName || 'Анонімний відвідувач')} · ${esc(fmtDate(q.createdAt))}</small>
        ${q.draft ? `<details><summary>Що відповів Юніончик</summary><p class="fine">${esc(q.draft.replace(/\[\[ORG\]\]/g, ''))}</p></details>` : ''}
        <label class="field"><span>Ваша відповідь (коротко)</span><textarea name="answer" rows="3" required></textarea></label>
        <label class="check"><input type="checkbox" name="polish" checked> Юніончик допрацює текст (без нових фактів)</label>
        <label class="check"><input type="checkbox" name="kb" checked> Додати в базу знань Юніончика</label>
        <div class="row-btns"><button class="btn btn-lift" type="submit">${ic('send')} Відповісти</button><button class="btn btn-ghost" type="button" data-del-q="${esc(q.id)}">${ic('trash')}</button></div>
      </form>`).join('') : '<p>Нових питань немає.</p>'}
    </div>
    <div class="tile"><span class="kicker">БАЗА ЗНАНЬ ЮНІОНЧИКА · ${d.knowledge.length}</span>
      ${d.knowledge.length ? d.knowledge.map(k => `<div class="adm-row"><div><b>${esc(k.q)}</b><p>${esc(k.a)}</p></div><button class="icon-btn" data-del-kb="${esc(k.id)}" aria-label="Прибрати з бази знань">${ic('trash')}</button></div>`).join('') : '<p>Тут з’являтимуться ваші відповіді. Юніончик використовує їх для наступних учасників.</p>'}
      ${done.length ? `<details><summary>Відповідені питання (${done.length})</summary>${done.map(q => `<div class="adm-row"><div><b>${esc(q.text)}</b><small>${esc(q.participantName || 'Анонімно')}${q.answeredBy === 'telegram' ? ` · відповідь з Telegram${q.answeredByName ? ' (' + esc(q.answeredByName) + ')' : ''}` : ''}</small><p>${esc(q.final)}</p></div></div>`).join('')}</details>` : ''}
    </div></div>`;
}
function adminAnnouncements(d) {
  return `<div class="admin-2">
    <form class="tile" id="ann-form"><span class="kicker">${ic('send')} НОВЕ ОГОЛОШЕННЯ</span><h3>Написати всім.</h3>
      <label class="field"><span>Заголовок</span><input name="title" maxlength="90" placeholder="Наприклад: Зміна локації тренінгу" required></label>
      <label class="field"><span>Текст повідомлення</span><textarea name="text" maxlength="650" rows="5" placeholder="Що саме учасникам потрібно знати?" required></textarea><small>Повідомлення залишиться в розділі «Оголошення», Юніончик теж його знатиме.</small></label>
      <label class="field"><span>Важливість</span><select name="kind"><option value="info">Звичайне</option><option value="important">Важливе</option><option value="urgent">Термінове</option></select></label>
      <label class="check"><input type="checkbox" name="push" checked> Надіслати push на телефони підписаних учасників</label>
      <button class="btn btn-lift full" type="submit">${ic('send')} Опублікувати повідомлення</button>
    </form>
    <div class="tile"><span class="kicker">ОПУБЛІКОВАНІ</span>${d.announcements.length ? d.announcements.map(a => `<div class="adm-row"><div><b>${esc(a.title)}</b><small>${esc(fmtDate(a.createdAt))} · ${esc(a.kind)}</small><p>${esc(a.text)}</p></div><button class="icon-btn" data-del-ann="${esc(a.id)}" aria-label="Видалити ${esc(a.title)}">${ic('trash')}</button></div>`).join('') : '<p>Поки що нічого не опубліковано.</p>'}</div>
  </div>`;
}
function adminParticipants(d) {
  const evTitle = id => d.events.find(e => e.id === id)?.title || '';
  const list = [...d.participants].sort((a, b) => a.name.localeCompare(b.name, 'uk'));
  return `<div class="admin-2">
    <form class="tile" id="import-form"><span class="kicker">${ic('download')} ІМПОРТ СПИСКУ</span><h3>Вставте таблицю</h3>
      <p class="fine">Скопіюйте стовпці з Excel або Google Таблиці: <b>ім’я · група доїзду (Ізмаїл / Одеса / Київ) · стіл (1–9) · команда · кімната</b>. Перший рядок може бути заголовком. Учасник з тим самим ім’ям оновиться, а не задублюється.</p>
      <label class="field"><span>Дані</span><textarea name="csv" rows="7" placeholder="Ім’я;Група;Стіл;Команда&#10;Іван Петренко;Одеса;3;Чорноморськ"></textarea></label>
      <button class="btn btn-lift full" type="submit">Імпортувати</button></form>
    <div class="tile"><span class="kicker">${ic('users')} УЧАСНИКИ · ${list.length}</span>
      <div class="row-btns"><button class="btn btn-ghost" data-edit-p="new">${ic('plus')} Додати</button>${list.length ? `<button class="btn btn-ghost" data-act="export-codes">${ic('download')} Коди й посилання (CSV)</button>` : ''}</div>
      ${list.map(p => `<div class="adm-row"><div><b>${esc(p.name)}</b><small>${esc(p.code)} · ${esc(GROUP_NAME(p.group))} · ${p.table ? `стіл ${p.table}, місце ${p.seat}` : 'без столу'}${p.team ? ' · ' + esc(p.team) : ''}</small>
        <small>${Object.values(p.sessions || {}).map(evTitle).filter(Boolean).map(esc).join(' · ') || 'Сесії не обрані'}${p.lastLogin ? ' · заходив(ла)' : ''}</small></div>
        <div class="adm-acts"><button class="icon-btn" data-copy="${esc(meLink(p.code))}" aria-label="Копіювати посилання для ${esc(p.name)}">${ic('share')}</button><button class="icon-btn" data-edit-p="${esc(p.id)}" aria-label="Редагувати ${esc(p.name)}">${ic('edit')}</button></div></div>`).join('') || '<p>Список порожній.</p>'}
    </div></div>`;
}
function adminUnionize(d) {
  return `<form class="tile" id="unionize-form"><span class="kicker">UNIONIZE · 9 СТОЛІВ</span><h3>Столи й ведучі</h3>
    <p class="fine">Учасників за столи садять у вкладці «Учасники» (поле «Стіл»), місце призначається автоматично.</p>
    <div class="utable-edit">${d.unionize.tables.map(t => { const seated = d.participants.filter(p => p.table === t.n).sort((a, b) => a.seat - b.seat); return `<fieldset><legend>Стіл ${t.n} · ${seated.length}/${t.capacity}</legend>
      <label class="field"><span>${t.n === 1 ? 'Підпис' : 'Ведучий'}</span><input name="${t.n === 1 ? 'label' : 'host'}-${t.n}" value="${esc(t.n === 1 ? t.label : t.host)}"></label>
      <label class="field"><span>Місць</span><input type="number" min="1" max="12" name="cap-${t.n}" value="${t.capacity}"></label>
      <small>${seated.map(p => `${p.seat}. ${esc(p.name)}`).join('<br>') || 'нікого'}</small></fieldset>`; }).join('')}</div>
    <button class="btn btn-lift" type="submit">Зберегти</button></form>`;
}
function adminEvents(d) {
  return `<div class="tile"><div class="sec-head row"><div><span class="kicker">ПОДІЇ ФОРУМУ</span></div><button class="btn btn-lift" data-edit="new">${ic('plus')} Додати подію</button></div>
    ${sortEv(d.events).map(e => `<div class="adm-row"><div><b>${esc(e.title)}</b><small>${esc(e.date.slice(8))}.12 · ${esc(formatRange(e))} · ${esc(e.venue || 'Локація не встановлена')} · ${statusLabel(e.status)}${e.capacity ? ` · ${(d.sessionCounts[e.id] || 0)}/${e.capacity} записано` : ''} · ${e.published !== false ? 'Видиме' : 'Приховане'}</small></div><button class="icon-btn" data-edit="${esc(e.id)}" aria-label="Редагувати ${esc(e.title)}">${ic('edit')}</button></div>`).join('')}</div>`;
}
function adminPeople(d, col) {
  const sp = col === 'speakers';
  return `<div class="tile"><div class="sec-head row"><div><span class="kicker">${sp ? 'СПІКЕРИ' : 'СПОНСОРИ'} · ${d[col].length}</span><p class="fine">${sp ? 'Заміна спікера — відредагуйте картку або видаліть її. Фото й лого — посиланням https://.' : 'Лого посиланням https://, 1–2 речення про спонсора і посилання на його сайт.'}</p></div><button class="btn btn-lift" data-edit-x="${col}:new">${ic('plus')} Додати</button></div>
    ${[...d[col]].sort((a, b) => (a.order || 0) - (b.order || 0)).map(x => `<div class="adm-row"><div class="adm-person">${x.photo || x.logo ? `<img src="${esc(x.photo || x.logo)}" alt="">` : `<span>${esc(initials(x.name))}</span>`}<div><b>${esc(x.name)}</b><small>${esc(sp ? [x.role, x.org].filter(Boolean).join(' · ') || 'посада не вказана' : x.text || 'без опису')}</small></div></div><button class="icon-btn" data-edit-x="${col}:${esc(x.id)}" aria-label="Редагувати ${esc(x.name)}">${ic('edit')}</button></div>`).join('') || '<p>Поки порожньо.</p>'}</div>`;
}
function adminTexts(d) {
  const cur = d.texts || {};
  const groups = [...new Set(TX.map(x => x[1]))];
  const field = ([k, , label, def, kind]) => {
    const val = typeof cur[k] === 'string' ? cur[k] : def;
    const changed = typeof cur[k] === 'string' && cur[k] !== def;
    const rows = kind === 'list' ? Math.min(10, Math.max(3, def.split('\n').length + 1)) : 3;
    const input = kind === 'list' || kind === 'text' ? `<textarea name="${k}" rows="${rows}">${esc(val)}</textarea>` : `<input name="${k}" value="${esc(val)}">`;
    return `<label class="field tx-field ${changed ? 'is-changed' : ''}" data-tx="${esc((label + ' ' + val).toLowerCase())}"><span>${esc(label)}${changed ? ' <em>змінено</em>' : ''}</span>${input}
      <small class="tx-foot">${kind === 'list' ? 'Кожен пункт — з нового рядка. ' : ''}<button type="button" class="link" data-tx-reset="${k}">↺ Повернути початковий текст</button></small></label>`;
  };
  return `<form class="tile" id="texts-form"><span class="kicker">ТЕКСТИ САЙТУ</span><h3>Редагування текстів</h3>
    <p class="fine">Змініть текст і натисніть «Зберегти» — зміни одразу з’являться на сайті. Порожнє поле прибирає блок там, де це вказано. Кнопка «↺» повертає початковий текст.</p>
    <div class="tx-save" style="padding:0 0 6px"><button class="btn btn-lift" type="submit">Зберегти тексти</button><a class="btn btn-ghost" href="/" target="_blank" rel="noopener">${ic('ext')} Подивитися сайт</a></div>
    <label class="field"><span>Пошук</span><input type="search" id="tx-search" placeholder="Наприклад: футер, FAQ, день 3…"></label>
    ${groups.map((g, i) => `<details class="tx-group" ${i === 0 ? 'open' : ''}><summary>${esc(g)} <small>${TX.filter(x => x[1] === g).length}</small></summary>${TX.filter(x => x[1] === g).map(field).join('')}</details>`).join('')}
    <div class="tx-save"><button class="btn btn-lift" type="submit">Зберегти тексти</button></div></form>`;
}
function adminSettings(d) {
  const s = d.settings;
  return `<form class="tile" id="settings-form"><span class="kicker">НАЛАШТУВАННЯ</span><h3>Посилання, контакти, збір</h3>
    <label class="field"><span>Контакт координатора для учасників</span><input name="coordinator" value="${esc(s.coordinator)}" placeholder="Ім’я, телефон або Telegram"></label>
    <label class="field"><span>Telegram-канал форуму</span><input name="telegramUrl" value="${esc(s.telegramUrl)}" placeholder="https://t.me/..."></label>
    <label class="field"><span>Google Drive з фото</span><input name="driveUrl" value="${esc(s.driveUrl)}" placeholder="https://drive.google.com/..."></label>
    <label class="field"><span>Підпис кількості учасників на головній (порожньо — не показувати)</span><input name="participantsLabel" value="${esc(s.participantsLabel)}" placeholder="Наприклад: 50+ учасників"></label>
    <span class="kicker">ГРУПИ ДОЇЗДУ</span>
    ${d.transport.map(t => `<fieldset><legend>${esc(t.title)}</legend>
      <label class="field"><span>Опис</span><input name="note-${t.key}" value="${esc(t.note)}"></label>
      <label class="field"><span>Точка і час збору</span><input name="meet-${t.key}" value="${esc(t.meet)}" placeholder="Наприклад: 6 грудня, 18:00, автовокзал Ізмаїл"></label></fieldset>`).join('')}
    <button class="btn btn-lift" type="submit">Зберегти</button></form>`;
}
async function loadAdmin() {
  try { S.admin.me = await api('/api/admin/me'); } catch { S.admin.me = { admin: false, enabled: false }; }
  if (S.admin.me.admin) { try { S.admin.data = await api('/api/admin/state'); S.admin.tg = await api('/api/admin/telegram').catch(() => null); } catch (e) { toast(e.message); } }
  if (S.route.name === 'admin') { const y = scrollY; render(); scrollTo(0, y); }
}
function openDialog(html) { const dlg = $('#editor'); dlg.innerHTML = html; dlg.showModal(); }
const dlgHead = t => `<div class="editor-head"><h2>${t}</h2><button type="button" class="icon-btn" data-act="close-editor" aria-label="Закрити">${ic('x')}</button></div>`;
function openEditor(id) {
  const blank = { id: '', title: '', date: DAYS[0], start: '', end: '', venue: '', details: '', status: 'tentative', track: 'all', published: true, posterTitle: '', teaser: '', why: '', speakerNames: '', category: '', capacity: '', link: '' };
  const e = id === 'new' ? blank : { ...blank, ...S.admin.data.events.find(x => x.id === id) };
  const f = (n, l, max, type = 'text') => `<label class="field"><span>${l}</span><input name="${n}" type="${type}" ${max ? `maxlength="${max}"` : ''} value="${esc(e[n] ?? '')}"></label>`;
  const t = (n, l, max) => `<label class="field"><span>${l}</span><textarea name="${n}" maxlength="${max}" rows="3">${esc(e[n] || '')}</textarea></label>`;
  openDialog(`<form id="event-form" data-id="${esc(e.id || 'new')}" class="editor-body">${dlgHead(e.id ? 'Редагувати подію' : 'Нова подія')}
    ${f('title', 'Назва заходу', 130)}
    <div class="two-col"><label class="field"><span>Дата</span><select name="date">${ALL_DAYS.map(d => `<option value="${d}" ${d === e.date ? 'selected' : ''}>${d.slice(8)} грудня</option>`).join('')}</select></label>
    <label class="field"><span>Статус</span><select name="status">${[['tentative', 'Попередньо'], ['confirmed', 'Підтверджено'], ['canceled', 'Скасовано']].map(([k, v]) => `<option value="${k}" ${k === e.status ? 'selected' : ''}>${v}</option>`).join('')}</select></label></div>
    <div class="two-col">${f('start', 'Початок', 0, 'time')}${f('end', 'Кінець', 0, 'time')}</div>
    ${f('venue', 'Локація', 90)}${t('details', 'Короткий опис для учасників', 600)}
    <div class="two-col"><label class="field"><span>Тип події</span><select name="track"><option value="all" ${e.track === 'all' ? 'selected' : ''}>Спільна</option><option value="parallel" ${e.track === 'parallel' ? 'selected' : ''}>Паралельна сесія (із записом)</option></select></label>${f('capacity', 'Місць (для паралельної)', 0, 'number')}</div>
    ${f('link', 'Посилання (https://)', 300)}
    <span class="kicker">АФІША ТА АНОНС</span>
    ${f('category', 'Категорія (англ., напр. SKILL LAB)', 40)}${f('posterTitle', 'Постерний заголовок', 140)}${t('teaser', 'Анонс події', 650)}${t('why', 'Чому це цікаво учаснику', 500)}${f('speakerNames', 'Спікери / учасники (лише погоджені)', 260)}
    <label class="check"><input name="published" type="checkbox" ${e.published !== false ? 'checked' : ''}> Показувати учасникам</label>
    <div class="row-btns"><button class="btn btn-lift" type="submit">Зберегти зміни</button>${e.id ? `<button class="btn btn-ghost" type="button" data-del-ev="${esc(e.id)}">${ic('trash')} Видалити</button>` : ''}</div>
  </form>`);
}
function openParticipant(id) {
  const d = S.admin.data;
  const p = id === 'new' ? { id: '', name: '', group: '', table: '', team: '', room: '', sessions: {} } : d.participants.find(x => x.id === id);
  const slots = new Map();
  for (const e of sortEv(d.events)) if (e.track === 'parallel' && e.start && e.published !== false) { const k = e.date + ' ' + e.start; if (!slots.has(k)) slots.set(k, []); slots.get(k).push(e); }
  openDialog(`<form id="participant-form" data-id="${esc(p.id || 'new')}" class="editor-body">${dlgHead(p.id ? esc(p.name) : 'Новий учасник')}
    ${p.id ? `<div class="bar bar-info">${ic('lock')}<span>Код <b>${esc(p.code)}</b> · <button type="button" class="link" data-copy="${esc(meLink(p.code))}">копіювати посилання</button> · <button type="button" class="link" data-newcode="${esc(p.id)}">новий код</button></span></div>` : ''}
    <label class="field"><span>Ім’я та прізвище</span><input name="name" value="${esc(p.name)}" required maxlength="80"></label>
    <div class="two-col"><label class="field"><span>Група доїзду</span><select name="group"><option value="">—</option>${d.transport.map(t => `<option value="${t.key}" ${p.group === t.key ? 'selected' : ''}>${esc(t.title)}</option>`).join('')}</select></label>
    <label class="field"><span>Стіл Unionize</span><select name="table"><option value="">—</option>${d.unionize.tables.map(t => `<option value="${t.n}" ${p.table === t.n ? 'selected' : ''}>Стіл ${t.n}${t.n === 1 ? ' (керівництво та гості)' : ''}</option>`).join('')}</select></label></div>
    <div class="two-col"><label class="field"><span>Команда</span><input name="team" value="${esc(p.team || '')}" maxlength="60"></label><label class="field"><span>Кімната</span><input name="room" value="${esc(p.room || '')}" maxlength="20"></label></div>
    ${[...slots].map(([k, g]) => `<label class="field"><span>Сесія ${k.slice(8, 10)}.12, ${k.slice(11)}</span><select name="sess|${k}"><option value="">не обрано</option>${g.map(e => `<option value="${e.id}" ${p.sessions?.[k] === e.id ? 'selected' : ''}>${esc(e.title)}</option>`).join('')}</select></label>`).join('')}
    <div class="row-btns"><button class="btn btn-lift" type="submit">Зберегти</button>${p.id ? `<button class="btn btn-ghost" type="button" data-del-p="${esc(p.id)}">${ic('trash')} Видалити</button>` : ''}</div>
  </form>`);
}
function openPerson(col, id) {
  const d = S.admin.data, sp = col === 'speakers';
  const x = id === 'new' ? { id: '', name: '', role: '', org: '', photo: '', logo: '', url: '', text: '', events: [], order: 0 } : d[col].find(i => i.id === id);
  const f = (n, l, ph = '') => `<label class="field"><span>${l}</span><input name="${n}" value="${esc(x[n] || '')}" placeholder="${ph}"></label>`;
  openDialog(`<form id="person-form" data-col="${col}" data-id="${esc(x.id || 'new')}" class="editor-body">${dlgHead(x.id ? esc(x.name) : sp ? 'Новий спікер' : 'Новий спонсор')}
    ${f('name', sp ? 'Ім’я та прізвище' : 'Назва')}
    ${sp ? f('role', 'Посада') + f('org', 'Організація') + f('photo', 'Фото (посилання https://)', 'https://...') + f('logo', 'Лого організації (https://)', 'https://...')
      : `<label class="field"><span>Хто вони (1–2 речення)</span><textarea name="text" rows="3" maxlength="300">${esc(x.text || '')}</textarea></label>` + f('logo', 'Лого (посилання https://)', 'https://...') + f('url', 'Сайт (https://)', 'https://...')}
    ${f('order', 'Порядок показу (число)')}
    ${sp ? `<fieldset><legend>Події спікера</legend><div class="ev-checks">${sortEv(d.events).filter(e => !isMinor(e) || e.speakerNames).map(e => `<label class="check"><input type="checkbox" name="ev" value="${e.id}" ${x.events?.includes(e.id) ? 'checked' : ''}> ${esc(e.date.slice(8))}.12 ${esc(e.title)}</label>`).join('')}</div></fieldset>` : ''}
    <div class="row-btns"><button class="btn btn-lift" type="submit">Зберегти</button>${x.id ? `<button class="btn btn-ghost" type="button" data-del-x="${col}:${esc(x.id)}">${ic('trash')} Видалити</button>` : ''}</div>
  </form>`);
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
async function subscribe(asAdmin = false) {
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') throw new Error(perm === 'denied' ? 'Браузер заблокував сповіщення. Дозвольте їх у налаштуваннях сайту.' : 'Дозвіл на сповіщення не наданий.');
    const reg = await swReg(); await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(S.data.vapidPublicKey) });
    await api('/api/push/subscribe', { method: 'POST', body: JSON.stringify({ ...sub.toJSON(), asker: S.asker, admin: asAdmin }) });
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
const VIEWS = { home: viewHome, program: () => viewProgram(S.route.arg), event: () => viewEvent(S.route.arg), travel: viewTravel, info: viewInfo, updates: viewUpdates, me: viewMe, my: viewMe, more: viewMore, ask: viewAsk, admin: viewAdmin };
const TITLES = { home: 'MTWTU Youth Forum 2026 · Плай', program: 'Програма', event: 'Подія', travel: 'Доїзд', info: 'Корисне', updates: 'Оголошення', me: 'Мій форум', my: 'Мій форум', more: 'Меню', ask: 'Запитай Юніончика', admin: 'Організаторам' };
function render(scrollTop = false) {
  if (!S.data) return;
  const app = $('#app');
  const v = VIEWS[S.route.name] || viewHome;
  topoStop?.(); topoStop = null;
  app.innerHTML = v();
  app.dataset.view = S.route.name;
  document.title = S.route.name === 'event' && evById(S.route.arg) ? evById(S.route.arg).title + ' · MTWTU Youth Forum' : (S.route.name === 'home' ? TITLES.home : TITLES[S.route.name] + ' · MTWTU Youth Forum');
  $$('[data-route]').forEach(a => a.classList.toggle('on', a.dataset.route === S.route.name || (S.route.name === 'event' && a.dataset.route === 'program') || (['travel', 'info', 'updates', 'admin'].includes(S.route.name) && a.dataset.route === 'more' && a.closest('.dock'))));
  if (S.route.name === 'home') startTopo();
  if (S.route.name === 'info') pushStatus();
  if (S.route.name === 'ask' && !S.myQuestionsLoaded) { S.myQuestionsLoaded = true; refreshMyQuestions().then(() => { if (S.route.name === 'ask' && S.myQuestions.length) render(); }); }
  if ((S.route.name === 'ask' || S.route.name === 'home') && S.uni !== 'sleep' && !S.asking) setTimeout(() => { if (!S.uni || S.uni === 'idle') { uniPaint('wave', S.route.name === 'ask' ? uniGreeting() : null); setTimeout(() => { if (!S.uni || S.uni === 'idle') uniPaint('idle'); }, 1800); } }, 500);
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

/* ============ participant session ============ */
async function refreshMe() {
  try { const r = await api('/api/me'); S.me = r.me; } catch { /* offline: keep */ }
}
async function loginWithCode(code) {
  const r = await api('/api/me/login', { method: 'POST', body: JSON.stringify({ code }) });
  S.me = r.me; toast(`Вітаємо, ${S.me.name.split(' ')[0]}!`);
  if ('serviceWorker' in navigator && 'PushManager' in window) { try { const reg = await swReg(); const sub = await reg.pushManager.getSubscription(); if (sub) await api('/api/push/subscribe', { method: 'POST', body: JSON.stringify({ ...sub.toJSON(), asker: S.asker }) }); } catch { /* ignore */ } }
}
const rerender = () => { const y = scrollY; render(); scrollTo(0, y); };

/* ============ events ============ */
document.addEventListener('click', async ev => {
  const t = ev.target.closest('button, a'); if (!t) return;
  const d = t.dataset;
  try {
    if (d.sess !== undefined) {
      ev.preventDefault(); t.disabled = true;
      const r = await api('/api/me/session', { method: 'POST', body: JSON.stringify({ slot: d.sess, eventId: d.ev || null }) });
      S.me = r.me; S.data.sessionCounts = r.sessionCounts; toast(d.ev ? 'Ви записані ✓' : 'Запис скасовано'); rerender(); return;
    }
    if (d.filter) { S.filter = d.filter; rerender(); return; }
    if (d.share) { const e = evById(d.share); e && share(e); return; }
    if (d.ics) { const e = evById(d.ics); e && ics([e], `MTWTU-${e.id}.ics`); return; }
    if (d.icsDay) { ics(sortEv(events().filter(e => e.date === d.icsDay)), `MTWTU-${d.icsDay}.ics`); return; }
    if (d.suggest) { ask(d.suggest); return; }
    if (d.escalate !== undefined) { escalate(+d.escalate); return; }
    if (d.askAbout) { const e = evById(d.askAbout); setTimeout(() => ask(`Розкажи про «${e.title}» ${e.date.slice(8)}.12: що це, де і коли?`), 50); return; }
    if (d.gal) { const g = $('.gallery'); g.scrollBy({ left: g.clientWidth * .8 * +d.gal, behavior: 'smooth' }); return; }
    if (d.scroll) { ev.preventDefault(); const go = () => document.getElementById(d.scroll)?.scrollIntoView({ behavior: 'smooth' }); if (S.route.name !== 'home') { location.hash = '#/'; setTimeout(go, 120); } else go(); return; }
    if (d.copy) { ev.preventDefault(); try { await navigator.clipboard.writeText(d.copy); toast('Посилання скопійовано'); } catch { toast(d.copy); } return; }
    /* admin */
    if (d.atab) { S.admin.tab = d.atab; rerender(); return; }
    if (d.txReset) { const el = t.closest('form')?.elements[d.txReset]; if (el) { el.value = TXD[d.txReset] ?? ''; el.dispatchEvent(new Event('input', { bubbles: true })); toast('Початковий текст повернено — натисніть «Зберегти тексти»'); } return; }
    if (d.edit) { openEditor(d.edit); return; }
    if (d.editP) { openParticipant(d.editP); return; }
    if (d.editX) { const [col, id] = d.editX.split(':'); openPerson(col, id); return; }
    if (d.newcode) { if (!confirm('Створити новий код? Старий перестане працювати.')) return; await api(`/api/admin/participants/${d.newcode}/code`, { method: 'POST', body: '{}' }); $('#editor').close(); await loadAdmin(); openParticipant(d.newcode); return; }
    if (d.delP) { if (!confirm('Видалити учасника?')) return; await api('/api/admin/participants/' + d.delP, { method: 'DELETE' }); $('#editor').close(); await loadAdmin(); return; }
    if (d.delX) { const [col, id] = d.delX.split(':'); if (!confirm('Видалити?')) return; await api(`/api/admin/${col}/${id}`, { method: 'DELETE' }); $('#editor').close(); await loadAdmin(); load(); return; }
    if (d.delAnn) { if (!confirm('Видалити оголошення?')) return; await api('/api/admin/announcements/' + d.delAnn, { method: 'DELETE' }); await loadAdmin(); load(); return; }
    if (d.delQ) { if (!confirm('Видалити питання?')) return; await api('/api/admin/questions/' + d.delQ, { method: 'DELETE' }); await loadAdmin(); return; }
    if (d.delKb) { await api('/api/admin/knowledge/' + d.delKb, { method: 'DELETE' }); await loadAdmin(); return; }
    if (d.delEv) { if (!confirm('Видалити подію назавжди?')) return; await api('/api/admin/events/' + d.delEv, { method: 'DELETE' }); $('#editor').close(); await loadAdmin(); load(); return; }
    switch (d.act) {
      case 'reload': await load(); render(); break;
      case 'sub': subscribe(); break;
      case 'unsub': unsubscribe(); break;
      case 'theme': toggleTheme(); break;
      case 'me-logout': await api('/api/me/logout', { method: 'POST' }); S.me = null; toast('Ви вийшли'); render(); break;
      case 'uni-poke': uniPoke(); break;
      case 'admin-push': subscribe(true); break;
      case 'tg-refresh': await loadAdmin(); toast(S.admin.tg?.connected ? 'Telegram підключено' : 'Ще не підключено'); break;
      case 'tg-test': await api('/api/admin/telegram/test', { method: 'POST' }).then(() => toast('Тест надіслано в Telegram')).catch(e => toast(e.message)); break;
      case 'tg-unlink': if (!confirm('Відключити Telegram-групу?')) break; await api('/api/admin/telegram/unlink', { method: 'POST' }); await loadAdmin(); break;
      case 'export-codes': {
        const rows = [['Ім’я', 'Код', 'Посилання', 'Група', 'Стіл', 'Місце'], ...S.admin.data.participants.map(p => [p.name, p.code, meLink(p.code), GROUP_NAME(p.group), p.table || '', p.seat || ''])];
        const csv = '﻿' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
        const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })), download: 'MTWTU-forum-codes.csv' });
        document.body.append(a); a.click(); a.remove(); break;
      }
      case 'logout': await api('/api/admin/logout', { method: 'POST' }).catch(() => {}); S.admin = { me: null, data: null, tab: 'todo' }; render(); break;
      case 'close-editor': $('#editor').close(); break;
    }
  } catch (e) { toast(e.message); t.disabled = false; }
});
document.addEventListener('submit', async ev => {
  const f = ev.target; ev.preventDefault();
  const fd = new FormData(f), data = Object.fromEntries(fd);
  try {
    if (f.id === 'ask-form') { const i = $('#ask-input'); const q = i.value; i.value = ''; i.style.height = ''; ask(q); return; }
    if (f.id === 'code-form') { await loginWithCode(data.code); render(); return; }
    if (f.id === 'login-form') { await api('/api/admin/login', { method: 'POST', body: JSON.stringify(data) }); S.admin.me = null; await loadAdmin(); toast('Вітаємо!'); return; }
    if (f.id === 'ann-form') { const r = await api('/api/admin/announcements', { method: 'POST', body: JSON.stringify({ ...data, push: !!data.push }) }); toast(r.push ? `Опубліковано · push: ${r.push.sent} надіслано` : 'Опубліковано'); await load(); await loadAdmin(); return; }
    if (f.id === 'event-form') { const id = f.dataset.id; data.published = !!data.published; await api(id === 'new' ? '/api/admin/events' : '/api/admin/events/' + id, { method: id === 'new' ? 'POST' : 'PUT', body: JSON.stringify(data) }); $('#editor').close(); toast('Збережено'); await load(); await loadAdmin(); return; }
    if (f.id === 'import-form') { const r = await api('/api/admin/participants/import', { method: 'POST', body: JSON.stringify(data) }); toast(`Імпортовано: ${r.added}${r.errors.length ? ` · помилок: ${r.errors.length}` : ''}`); if (r.errors.length) alert(r.errors.join('\n')); await loadAdmin(); load(); return; }
    if (f.id === 'participant-form') {
      const id = f.dataset.id, sessions = {};
      for (const [k, v] of fd.entries()) if (k.startsWith('sess|')) sessions[k.slice(5)] = v;
      const body = { name: data.name, group: data.group, table: data.table, team: data.team, room: data.room, sessions };
      await api(id === 'new' ? '/api/admin/participants' : '/api/admin/participants/' + id, { method: id === 'new' ? 'POST' : 'PUT', body: JSON.stringify(body) });
      $('#editor').close(); toast('Збережено'); await loadAdmin(); load(); return;
    }
    if (f.id === 'person-form') {
      const { col, id } = f.dataset; const body = { ...data, events: fd.getAll('ev') }; delete body.ev;
      await api(id === 'new' ? `/api/admin/${col}` : `/api/admin/${col}/${id}`, { method: id === 'new' ? 'POST' : 'PUT', body: JSON.stringify(body) });
      $('#editor').close(); toast('Збережено'); await loadAdmin(); load(); return;
    }
    if (f.id === 'unionize-form') {
      const tables = S.admin.data.unionize.tables.map(t => ({ n: t.n, host: data['host-' + t.n] ?? t.host, label: data['label-' + t.n] ?? t.label, capacity: data['cap-' + t.n] }));
      await api('/api/admin/unionize', { method: 'PUT', body: JSON.stringify({ tables }) }); toast('Збережено'); await loadAdmin(); load(); return;
    }
    if (f.id === 'texts-form') {
      const texts = {};
      for (const [k, , , def] of TX) { if (!(k in data)) continue; const v = String(data[k]).replace(/\r/g, ''); texts[k] = v.trim() === def.trim() ? null : v; }
      await api('/api/admin/texts', { method: 'PUT', body: JSON.stringify({ texts }) });
      toast('Тексти збережено'); await loadAdmin(); load(); return;
    }
    if (f.id === 'settings-form') {
      const transport = S.admin.data.transport.map(t => ({ key: t.key, meet: data['meet-' + t.key], note: data['note-' + t.key] }));
      await api('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ coordinator: data.coordinator, telegramUrl: data.telegramUrl, driveUrl: data.driveUrl, participantsLabel: data.participantsLabel, transport }) });
      toast('Збережено'); await loadAdmin(); load(); return;
    }
    if (f.classList.contains('qa')) {
      const btn = f.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = 'Надсилаємо…';
      const r = await api(`/api/admin/questions/${f.dataset.qid}/answer`, { method: 'POST', body: JSON.stringify({ answer: data.answer, polish: !!data.polish, addToKnowledge: !!data.kb }) });
      toast(`Відповідь надіслано${r.push?.sent ? ` · push: ${r.push.sent}` : ''}`); await loadAdmin(); return;
    }
  } catch (e) { toast(e.message); const b = f.querySelector('[type=submit][disabled]'); if (b) { b.disabled = false; } }
});
document.addEventListener('input', e => { if (e.target.id !== 'tx-search') return; const q = e.target.value.trim().toLowerCase(); $$('#texts-form .tx-field').forEach(f => { f.hidden = q && !f.dataset.tx.includes(q); }); $$('#texts-form .tx-group').forEach(g => { if (q) g.open = [...g.querySelectorAll('.tx-field')].some(f => !f.hidden); g.hidden = q && ![...g.querySelectorAll('.tx-field')].some(f => !f.hidden); }); });
document.addEventListener('input', e => { if (e.target.id === 'ask-input') { if (!S.asking) { S.uniAwake = true; const v = e.target.value.trim(); if (/дяку|спасиб|thank/i.test(v)) setUni('love'); else if (/[?!]{2,}|!$/.test(v)) setUni('wow'); else setUni(v ? 'listen' : 'idle'); } e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'; } });
document.addEventListener('focusin', e => { if (e.target.id === 'ask-input') document.querySelectorAll('[data-uni-live]').forEach(el => { el.style.setProperty('--lx', '0px'); el.style.setProperty('--ly', '5px'); }); });
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
  for (const k of ['d', 'h', 'm', 's']) $$(`[data-cd="${k}"]`).forEach(el => { el.textContent = pad(cd[k]); });
}, 1000);
setInterval(async () => { await load(true); if (S.me) await refreshMe(); if (!['ask', 'admin'].includes(S.route.name) && !document.querySelector('dialog[open]') && !document.activeElement?.matches('input,textarea,select')) { const y = scrollY; render(); scrollTo(0, y); } }, 60000);

/* ============ boot ============ */
(async () => {
  S.route = parseRoute();
  if (S.data) render();
  else $('#app').innerHTML = '<div class="boot"><span class="spin"></span><p>Завантажуємо твій форум…</p></div>';
  const code = new URLSearchParams(location.search).get('c');
  if (code) { history.replaceState(null, '', '/' + (location.hash || '#/me')); if (!location.hash || location.hash === '#/') location.hash = '#/me'; S.route = parseRoute(); }
  const [ok] = await Promise.all([load(), refreshMe()]);
  if (code) { try { await loginWithCode(code); } catch (e) { toast(e.message); } }
  if (ok) render();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
})();
})();
