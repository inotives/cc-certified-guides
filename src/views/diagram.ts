import type { Diagram, DiagramTone } from '../exams/types.js';
import { esc } from './layout.js';

// Server-side SVG for study diagrams. Colours come from CSS classes (`.dg-*` in styles.css), so diagrams follow
// the light/dark theme. Text width is estimated per character; good enough for wrapping short labels.

const W = 640;
const P = 12;
const LINE = 18;
const SMALL_LINE = 16;
const CHAR = { body: 6.9, bold: 7.4, small: 6.5 };

type Font = keyof typeof CHAR;

/** Greedy word wrap by estimated width. Backticks are kept so code spans survive across lines. */
function wrap(text: string, width: number, font: Font = 'body'): string[] {
  const max = Math.max(8, Math.floor(width / CHAR[font]));
  const lines: string[] = [];
  let cur = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const len = (cur ? cur.length + 1 : 0) + word.replace(/`/g, '').length;
    if (cur && len > max) { lines.push(cur); cur = word; } else cur = cur ? `${cur} ${word}` : word;
  }
  if (cur) lines.push(cur);
  return lines;
}

/** One line of text with `code` spans as mono tspans. `open` carries an unclosed span across wrapped lines. */
function line(s: string, open: { code: boolean }) {
  return s.split('`').map((part, i) => {
    if (i > 0) open.code = !open.code;
    return part ? (open.code ? `<tspan class="dg-code">${esc(part)}</tspan>` : esc(part)) : '';
  }).join('');
}

/** Multi-line text block; `anchor` x is the left edge, or the centre when `center`. */
function text(lines: string[], x: number, y: number, cls: string, lh = LINE, center = false) {
  const open = { code: false };
  return lines.map((l, i) =>
    `<text x="${x}" y="${(y + i * lh).toFixed(1)}" class="${cls}"${center ? ' text-anchor="middle"' : ''}>${line(l, open)}</text>`).join('');
}

const box = (x: number, y: number, w: number, h: number, tone: DiagramTone = 'plain') =>
  `<rect x="${x}" y="${y.toFixed(1)}" width="${w}" height="${h.toFixed(1)}" rx="9" class="dg-${tone}"/>`;

/** Arrow from (x1,y1) to (x2,y2) along a straight line, head at the end. */
function arrow(x1: number, y1: number, x2: number, y2: number) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = (d: number) => `${(x2 - 8 * Math.cos(a + d)).toFixed(1)},${(y2 - 8 * Math.sin(a + d)).toFixed(1)}`;
  return `<line x1="${x1}" y1="${y1.toFixed(1)}" x2="${x2}" y2="${y2.toFixed(1)}" class="dg-line"/><polygon points="${x2},${y2.toFixed(1)} ${h(0.45)} ${h(-0.45)}" class="dg-head"/>`;
}

/** Vertical offset that centres `n` lines of height `lh` in a box of height `h` (baseline of the first line). */
const firstBaseline = (top: number, h: number, n: number, lh = LINE) => top + (h - n * lh) / 2 + lh * 0.72;

function flow(d: Extract<Diagram, { kind: 'flow' }>) {
  const hasNote = d.steps.some((s) => s.note);
  const bx = d.loop ? P + 34 : P;
  const bw = hasNote ? 270 : 400;
  const nx = bx + bw + 22;
  const nw = W - P - nx;
  const GAP = 26;
  let y = P;
  const parts: string[] = [];
  const mids: number[] = [];
  d.steps.forEach((s, i) => {
    const ls = wrap(s.label, bw - 28, 'bold');
    const ns = s.note ? wrap(s.note, nw, 'small') : [];
    const h = Math.max(42, ls.length * LINE + 20, ns.length * SMALL_LINE + 12);
    parts.push(box(bx, y, bw, h, s.tone));
    parts.push(text(ls, bx + 14, firstBaseline(y, h, ls.length), 'dg-t dg-b'));
    if (ns.length) parts.push(text(ns, nx, firstBaseline(y, h, ns.length, SMALL_LINE), 'dg-t dg-m', SMALL_LINE));
    mids.push(y + h / 2);
    y += h;
    if (i < d.steps.length - 1) { parts.push(arrow(bx + bw / 2, y + 2, bx + bw / 2, y + GAP - 2)); y += GAP; }
  });
  if (d.loop) {
    const lx = P + 12;
    const [top, bottom] = [mids[0], mids[mids.length - 1]];
    parts.push(`<path d="M${bx} ${bottom.toFixed(1)} H${lx} V${top.toFixed(1)}" class="dg-line dg-dash"/>`, arrow(lx, top, bx - 1, top));
    const my = (top + bottom) / 2;
    parts.push(`<text x="${lx - 4}" y="${my.toFixed(1)}" class="dg-t dg-m" text-anchor="middle" transform="rotate(-90 ${lx - 4} ${my.toFixed(1)})" dy="-2">${line(d.loop, { code: false })}</text>`);
  }
  return { body: parts.join(''), h: y + P };
}

function decision(d: Extract<Diagram, { kind: 'decision' }>) {
  const parts: string[] = [];
  const qs = wrap(d.question, W - 2 * P - 32, 'bold');
  const qh = qs.length * LINE + 20;
  parts.push(box(P, P, W - 2 * P, qh, 'accent'), text(qs, W / 2, firstBaseline(P, qh, qs.length), 'dg-t dg-b', LINE, true));
  const trunk = P + 12;
  const wx = P + 30;
  const ww = 250;
  const tx = wx + ww + 36;
  const tw = W - P - tx;
  let y = P + qh + 16;
  let lastMid = y;
  for (const b of d.branches) {
    const wl = wrap(b.when, ww - 24);
    const tl = wrap(b.then, tw - 24, 'bold');
    const h = Math.max(40, wl.length * LINE + 16, tl.length * LINE + 16);
    const mid = y + h / 2;
    parts.push(`<line x1="${trunk}" y1="${mid.toFixed(1)}" x2="${wx}" y2="${mid.toFixed(1)}" class="dg-line"/>`);
    parts.push(box(wx, y, ww, h, 'plain'), text(wl, wx + 12, firstBaseline(y, h, wl.length), 'dg-t'));
    parts.push(arrow(wx + ww + 4, mid, tx - 4, mid));
    parts.push(box(tx, y, tw, h, b.tone ?? 'good'), text(tl, tx + 12, firstBaseline(y, h, tl.length), 'dg-t dg-b'));
    lastMid = mid;
    y += h + 10;
  }
  parts.unshift(`<line x1="${trunk}" y1="${P + qh}" x2="${trunk}" y2="${lastMid.toFixed(1)}" class="dg-line"/>`);
  return { body: parts.join(''), h: y - 10 + P };
}

const COLUMN_TONES: DiagramTone[] = ['sky', 'good', 'accent', 'amber'];

function compare(d: Extract<Diagram, { kind: 'compare' }>) {
  const n = d.columns.length;
  const GAP = 12;
  const cw = (W - 2 * P - (n - 1) * GAP) / n;
  const heads = d.columns.map((c) => wrap(c.head, cw - 20, 'bold'));
  const hh = Math.max(...heads.map((h) => h.length)) * LINE + 18;
  const bodies = d.columns.map((c) => c.items.map((it) => wrap(it, cw - 34, 'small')));
  const bh = Math.max(...bodies.map((b) => b.reduce((s, ls) => s + ls.length * SMALL_LINE + 8, 0))) + 14;
  const parts: string[] = [];
  d.columns.forEach((c, i) => {
    const x = P + i * (cw + GAP);
    parts.push(box(x, P + hh - 9, cw, bh + 9, 'plain'));
    parts.push(box(x, P, cw, hh, c.tone ?? COLUMN_TONES[i % COLUMN_TONES.length]));
    parts.push(text(heads[i], x + cw / 2, firstBaseline(P, hh, heads[i].length), 'dg-t dg-b', LINE, true));
    let y = P + hh + 12;
    for (const ls of bodies[i]) {
      parts.push(`<circle cx="${(x + 14).toFixed(1)}" cy="${(y + 7).toFixed(1)}" r="2.5" class="dg-head"/>`);
      parts.push(text(ls, x + 24, y + 11, 'dg-t dg-s', SMALL_LINE));
      y += ls.length * SMALL_LINE + 8;
    }
  });
  return { body: parts.join(''), h: P + hh + bh + P };
}

function layers(d: Extract<Diagram, { kind: 'layers' }>) {
  const ax = d.axis ? 40 : 0;
  const left = P + ax;
  const full = W - P - left;
  const step = Math.min(36, (full * 0.35) / Math.max(1, d.layers.length - 1));
  const parts: string[] = [];
  let y = P;
  d.layers.forEach((l, i) => {
    const w = full - i * step;
    const x = left + (full - w) / 2;
    const ls = wrap(l.label, w - 30, 'bold');
    const ns = l.note ? wrap(l.note, w - 40, 'small') : [];
    const h = ls.length * LINE + ns.length * SMALL_LINE + 18;
    parts.push(box(x, y, w, h, l.tone ?? (i === 0 ? 'accent' : 'plain')));
    parts.push(text(ls, x + w / 2, y + 9 + LINE * 0.72, 'dg-t dg-b', LINE, true));
    if (ns.length) parts.push(text(ns, x + w / 2, y + 9 + ls.length * LINE + SMALL_LINE * 0.72, 'dg-t dg-m', SMALL_LINE, true));
    y += h + 6;
  });
  y -= 6;
  if (d.axis) {
    const x = P + 10;
    parts.push(d.axis.dir === 'up' ? arrow(x, y - 4, x, P + 4) : arrow(x, P + 4, x, y - 4));
    const my = (P + y) / 2;
    parts.push(`<text x="${x + 16}" y="${my.toFixed(1)}" class="dg-t dg-m" text-anchor="middle" transform="rotate(-90 ${x + 16} ${my.toFixed(1)})">${line(d.axis.label, { code: false })}</text>`);
  }
  return { body: parts.join(''), h: y + P };
}

const RENDER = { flow, decision, compare, layers } as const;

export function diagramSvg(d: Diagram) {
  const { body, h } = (RENDER[d.kind] as (x: Diagram) => { body: string; h: number })(d);
  return `<figure class="diagram">
    <figcaption>${esc(d.title)}</figcaption>
    <div class="diagram-scroll"><svg viewBox="0 0 ${W} ${Math.ceil(h)}" role="img" aria-label="${esc(d.title)}">${body}</svg></div>
  </figure>`;
}
