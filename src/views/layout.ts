import { getExamDate } from '../db.js';
import type { ExamContent } from '../exams/types.js';
import { planPosition } from '../practice.js';

export const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Escape, then render `backtick` spans as <code>. */
export const rich = (s: string) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');

export const pct = (v: number | null | undefined, digits = 0) => (v === null || v === undefined ? '—' : `${(v * 100).toFixed(digits)}%`);

export const DOMAIN_COLORS = ['', 'var(--d1)', 'var(--d2)', 'var(--d3)', 'var(--d4)', 'var(--d5)', 'var(--d6)', 'var(--d7)', 'var(--d8)'];

/** Local calendar date as YYYY-MM-DD. */
export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const daysBetween = (a: string, b: string) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86_400_000);
export const addDays = (iso: string, n: number) => new Date(Date.parse(iso + 'T00:00:00Z') + n * 86_400_000).toISOString().slice(0, 10);
export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }) =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' });
export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

const I = (d: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

export const icons = {
  home: I('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>'),
  plan: I('<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18M8 15l2 2 4-4"/>'),
  guide: I('<path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>'),
  domains: I('<path d="M12 2 2 7l10 5 10-5z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>'),
  scenarios: I('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
  cheat: I('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>'),
  practice: I('<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/>'),
  history: I('<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-6"/>'),
  bank: I('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M8 7h8M8 11h6"/>'),
  settings: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  flag: I('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>'),
  bookmark: I('<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>'),
  menu: I('<path d="M3 6h18M3 12h18M3 18h18"/>'),
  external: I('<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'),
};

// Claude-style spark mark.
export const logo = (size = 30) => `<svg width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true">
  <g fill="var(--clay)">${Array.from({ length: 8 }, (_, i) => `<rect x="14.6" y="2.5" width="2.8" height="12" rx="1.4" transform="rotate(${i * 45} 16 16)"/>`).join('')}</g>
</svg>`;

const NAV: [string, string, keyof typeof icons][] = [
  ['/', 'Dashboard', 'home'],
  ['/plan', 'Study plan', 'plan'],
  ['/guide', 'Exam focus', 'guide'],
  ['/domains', 'Domain guide', 'domains'],
  ['/scenarios', 'Scenarios', 'scenarios'],
  ['/cheatsheet', 'Cheat sheet', 'cheat'],
];
const NAV2: [string, string, keyof typeof icons][] = [
  ['/practice', 'Practice & mock exams', 'practice'],
  ['/history', 'Results & history', 'history'],
  ['/bank', 'Question bank', 'bank'],
  ['/settings', 'Settings', 'settings'],
];

/** Doctype + <head> shared by every page (fonts, stylesheet, favicon, saved theme). */
export const documentHead = (title: string) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;450;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/static/styles.css">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(logo(32).replace('var(--clay)', '#d97757'))}">
<script>try{const t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t}catch{}</script>
</head>`;

export function layout(opts: { exam: ExamContent; title: string; active: string; body: string; scripts?: string[] }) {
  const { exam } = opts;
  const B = exam.base;
  const pos = planPosition(exam);
  const examDate = getExamDate(exam.slug);
  const daysLeft = examDate ? daysBetween(todayISO(), examDate) : null;
  const subtitle = exam.name.replace('Claude Certified ', '');
  const link = ([href, label, icon]: [string, string, keyof typeof icons]) =>
    `<a href="${B}${href}" class="${opts.active === href ? 'active' : ''}">${icons[icon]}<span>${label}</span></a>`;
  const nav = NAV.filter(([href]) => href !== '/scenarios' || exam.scenarios.length);
  return `${documentHead(`${opts.title} · ${exam.brand} Prep`)}
<body data-base="${B}">
<div class="mobile-bar"><a class="brand" href="${B}/" style="padding:0">${logo(24)}<b>${esc(exam.brand)} Prep</b></a><button class="btn sm ghost" data-nav-toggle aria-label="Menu">${icons.menu}</button></div>
<div class="shell">
  <aside class="sidebar">
    <a class="back-home" href="/">← All certifications</a>
    <a class="brand" href="${B}/">${logo()}<div><b>${esc(exam.brand)} Prep</b><small>${esc(subtitle)}</small></div></a>
    <nav class="nav">${nav.map(link).join('')}</nav>
    <div class="nav-label">Practice</div>
    <nav class="nav">${NAV2.map(link).join('')}</nav>
    <div class="sidebar-foot">
      <div class="countdown-pill">${pos.complete ? 'Plan complete' : `Day <b>${pos.day}</b> of ${pos.totalDays}`}</div>
      <div>${daysLeft === null ? 'Exam not booked yet · <a href="' + B + '/settings">set date</a>' : daysLeft >= 0 ? `Exam in ${daysLeft} day${daysLeft === 1 ? '' : 's'} · ${esc(fmtDate(examDate, { month: 'short', day: 'numeric' }))}` : 'Exam date passed'}</div>
      <div style="margin-top:10px"><button class="theme-toggle" data-theme-toggle>Toggle theme</button></div>
    </div>
  </aside>
  <main>${opts.body}</main>
</div>
<script src="/static/app.js"></script>
${(opts.scripts ?? []).map((src) => `<script src="${src}"></script>`).join('')}
</body>
</html>`;
}

export const pageHead = (eyebrow: string, title: string, lead?: string, extra = '') =>
  `<header class="page-head"><div class="eyebrow">${esc(eyebrow)}</div><div class="spread"><h1>${esc(title)}</h1>${extra}</div>${lead ? `<p class="lead">${lead}</p>` : ''}</header>`;

export const ring = (p: number, label: string, color = 'var(--clay)') =>
  `<div class="weight-ring" style="--p:${p};--c:${color}"><span>${esc(label)}</span></div>`;

export const meter = (label: string, value: number | null, sub = '', color = 'var(--clay)') =>
  `<div class="meter-row"><div>${label}${sub ? `<div class="small muted">${sub}</div>` : ''}</div>
   <div class="bar"><span style="width:${value === null ? 0 : Math.round(value * 100)}%;background:${color}"></span><i class="target" title="80% target"></i></div>
   <div class="pct">${pct(value)}</div></div>`;
