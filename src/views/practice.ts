import type { ExamContent } from '../exams/types.js';
import { db, parseQuestion, type QuestionRow } from '../db.js';
import { attemptView, estimateScaled, stats } from '../practice.js';
import { DOMAIN_COLORS, esc, fmtDateTime, icons, layout, pageHead, pct, rich } from './layout.js';
import { objectiveTerm } from './pages.js';

const PASS_PCT = 0.72; // practice target that roughly corresponds to the 720 cut on a linear scale

/** Lookups and the base path for one exam, destructured at the top of each page. */
const ctx = (exam: ExamContent) => ({
  B: exam.base,
  domains: exam.domains,
  scenarios: exam.scenarios,
  domainById: (id: number) => exam.domains.find((d) => d.id === id),
  scenarioById: (id: number) => exam.scenarios.find((s) => s.id === id),
  taskById: (id: string) => exam.domains.flatMap((d) => d.tasks).find((t) => t.id === id),
});

const domainOptions = (exam: ExamContent, sel?: number) =>
  exam.domains.map((d) => `<option value="${d.id}" ${sel === d.id ? 'selected' : ''}>D${d.id} · ${esc(d.short)} (${d.weight}%)</option>`).join('');

export function practicePage(exam: ExamContent, error?: string) {
  const { B, domains, scenarios, domainById, scenarioById, taskById } = ctx(exam);

  const term = objectiveTerm(exam);
  const st = stats(exam);
  const counts = Object.fromEntries(st.byTask.map((t) => [t.task, t.bank]));
  const unseen = st.bank - st.seenUnique;
  const feedbackToggle = '<label class="switch"><input type="checkbox" name="feedback" value="1" checked> Instant feedback</label>';
  const body = `
  ${pageHead('Practice', 'Simulated exams & drills',
    `${st.bank} ${scenarios.length ? 'scenario-based ' : ''}questions, written against the ${domains.reduce((n, d) => n + d.tasks.length, 0)} official ${term}s and including the ${exam.officialSamples} official sample questions. Options are shuffled every attempt, and drills serve the questions you've seen least first.`)}
  ${error ? `<div class="callout" style="margin-bottom:16px">${esc(error)}</div>` : ''}

  <div class="card" style="margin-bottom:18px;border-color:var(--clay)">
    <div class="spread">
      <div><span class="badge clay">Exam simulation</span><h2 style="margin:8px 0 4px">Full mock exam</h2>
        <p class="muted" style="margin:0;max-width:640px">${exam.mock.items} questions · ${exam.mock.minutes}-minute timer${exam.mock.scenariosPerSitting ? ` · ${exam.mock.scenariosPerSitting} random scenarios of ${scenarios.length} · items grouped by scenario` : ''} · domain mix follows the ${domains.map((d) => d.weight).join('/')} blueprint (${Object.values(exam.mock.domainTargets).join('/')} items) · no feedback until you submit. Questions you haven't seen are preferred.</p></div>
      <a class="btn primary" href="${B}/practice/start?mode=full">Start mock exam</a>
    </div>
  </div>

  <div class="grid g3">
    <div class="card mode-card"><h3>Quick mixed set</h3><p class="small muted">Random across every domain${scenarios.length ? ' and scenario' : ''}, good as a daily warm-up.</p>
      <form action="${B}/practice/start"><input type="hidden" name="mode" value="quick">
        <select name="count">${[10, 15, 20, 30, 40].map((n) => `<option ${n === 15 ? 'selected' : ''}>${n}</option>`).join('')}</select>
        ${feedbackToggle}<button class="btn primary sm">Start</button></form></div>

    <div class="card mode-card"><h3>Domain drill</h3><p class="small muted">Focus on one blueprint domain.</p>
      <form action="${B}/practice/start"><input type="hidden" name="mode" value="domain">
        <select name="domain">${domainOptions(exam)}</select>
        <select name="count">${[10, 20, 30].map((n) => `<option ${n === 20 ? 'selected' : ''}>${n}</option>`).join('')}</select>
        ${feedbackToggle}<button class="btn primary sm">Start</button></form></div>

    ${scenarios.length ? `<div class="card mode-card"><h3>Scenario drill</h3><p class="small muted">Practise inside one production context, like an exam section.</p>
      <form action="${B}/practice/start"><input type="hidden" name="mode" value="scenario">
        <select name="scenario">${scenarios.map((s) => `<option value="${s.id}">S${s.id} · ${esc(s.name)}</option>`).join('')}</select>
        <select name="count">${[10, 15, 25].map((n) => `<option ${n === 15 ? 'selected' : ''}>${n}</option>`).join('')}</select>
        ${feedbackToggle}<button class="btn primary sm">Start</button></form></div>` : ''}

    <div class="card mode-card"><h3>${term[0].toUpperCase() + term.slice(1)} drill</h3><p class="small muted">Laser-focus a single objective from the guide.</p>
      <form action="${B}/practice/start"><input type="hidden" name="mode" value="task">
        <select name="task">${domains.flatMap((d) => d.tasks.map((t) => `<option value="${t.id}">${t.id} · ${esc(t.title.slice(0, 52))}${t.title.length > 52 ? '…' : ''} (${counts[t.id] ?? 0})</option>`)).join('')}</select>
        ${feedbackToggle}<button class="btn primary sm">Start</button></form></div>

    <div class="card mode-card"><h3>Weak areas</h3><p class="small muted">Questions you got wrong most recently, or miss more than a third of the time.</p>
      <form action="${B}/practice/start"><input type="hidden" name="mode" value="weak"><select name="count">${[10, 20, 30].map((n) => `<option ${n === 20 ? 'selected' : ''}>${n}</option>`).join('')}</select>${feedbackToggle}<button class="btn primary sm">Start</button></form></div>

    <div class="card mode-card"><h3>Unseen questions</h3><p class="small muted">${unseen} questions you haven't answered yet.</p>
      <form action="${B}/practice/start"><input type="hidden" name="mode" value="unseen"><select name="count">${[10, 20, 30].map((n) => `<option ${n === 20 ? 'selected' : ''}>${n}</option>`).join('')}</select>${feedbackToggle}<button class="btn primary sm">Start</button></form></div>

    <div class="card mode-card"><h3>Bookmarked</h3><p class="small muted">${st.bookmarks} saved question${st.bookmarks === 1 ? '' : 's'}. Bookmark any question during review.</p>
      <form action="${B}/practice/start"><input type="hidden" name="mode" value="bookmarked">${feedbackToggle}<button class="btn primary sm" ${st.bookmarks ? '' : 'disabled'}>Start</button></form></div>

    <div class="card mode-card"><h3>Official sample questions</h3><p class="small muted">The ${exam.officialSamples} sample items from Anthropic's exam guide, with the official explanations.</p>
      <form action="${B}/practice/start"><input type="hidden" name="mode" value="official">${feedbackToggle}<button class="btn primary sm">Start</button></form></div>

    <div class="card mode-card"><h3>Timed custom set</h3><p class="small muted">Any domain at exam pace (2 min per question), no feedback.</p>
      <form action="${B}/practice/start"><input type="hidden" name="mode" value="domain"><input type="hidden" name="timed" value="1">
        <select name="domain">${domainOptions(exam)}</select>
        <select name="count">${[10, 15, 20].map((n) => `<option ${n === 15 ? 'selected' : ''}>${n}</option>`).join('')}</select><button class="btn primary sm">Start</button></form></div>
  </div>
  <p class="small muted" style="margin-top:18px">Keyboard in sessions: <kbd>A</kbd>–<kbd>F</kbd> choose · <kbd>←</kbd>/<kbd>→</kbd> navigate · <kbd>Enter</kbd> check (feedback mode) · <kbd>F</kbd>lag with <kbd>Shift</kbd>+<kbd>F</kbd>.</p>`;
  return layout({ exam, title: 'Practice', active: '/practice', body });
}

export function examPage(exam: ExamContent, id: number, label: string) {
  const { B, domains, scenarios, domainById, scenarioById, taskById } = ctx(exam);

  const clientCtx = JSON.stringify({
    term: objectiveTerm(exam) === 'skill' ? 'Skill' : 'Task',
    scenarios: Object.fromEntries(scenarios.map((s) => [s.id, { name: s.name, context: s.context }])),
    domains: Object.fromEntries(domains.map((d) => [d.id, { name: d.name, short: d.short, color: DOMAIN_COLORS[d.id] }])),
    tasks: Object.fromEntries(domains.flatMap((d) => d.tasks.map((t) => [t.id, t.title]))),
  }).replace(/</g, '\\u003c');
  const body = `
  <div id="exam" data-attempt="${id}">
    <div class="exam-top"><div class="spread">
      <div><div class="small muted">${esc(label)}</div><div id="exam-progress" class="small"></div></div>
      <div class="row"><span id="timer" class="timer"></span><button class="btn sm" id="btn-submit">Submit</button></div>
    </div></div>
    <div class="exam-layout">
      <div id="qpane"><div class="qcard empty">Loading…</div></div>
      <aside class="palette card flat"><div class="spread"><b class="small">Questions</b><span class="small muted" id="answered-count"></span></div>
        <div class="palette-grid" id="palette" style="margin-top:10px"></div>
        <div class="legend"><span><i style="background:var(--ink-2)"></i>answered</span><span><i style="background:var(--amber);border-radius:50%"></i>flagged</span><span><i style="border:2px solid var(--clay)"></i>current</span></div>
      </aside>
    </div>
  </div>
  <script>window.__CTX__ = ${clientCtx};</script>`;
  return layout({ exam, title: label, active: '/practice', body, scripts: ['/static/exam.js'] });
}

function breakdownTable(rows: { name: string; color?: string; correct: number; total: number }[]) {
  return `<div class="table-wrap"><table><thead><tr><th>Area</th><th>Correct</th><th style="width:40%">Accuracy</th></tr></thead><tbody>
    ${rows.map((r) => `<tr><td>${r.color ? `<span class="dot" style="background:${r.color}"></span> ` : ''}${esc(r.name)}</td><td>${r.correct}/${r.total}</td>
      <td><div class="row" style="flex-wrap:nowrap"><div class="bar" style="flex:1"><span style="width:${r.total ? (r.correct / r.total) * 100 : 0}%;background:${r.color ?? 'var(--clay)'}"></span></div><b class="small" style="width:42px;text-align:right">${pct(r.total ? r.correct / r.total : null)}</b></div></td></tr>`).join('')}
  </tbody></table></div>`;
}

export function reviewPage(exam: ExamContent, id: number) {
  const { B, domains, scenarios, domainById, scenarioById, taskById } = ctx(exam);

  const v = attemptView(exam, id)!;
  const total = v.items.length;
  const correct = v.items.filter((i) => i.isCorrect).length;
  const p = total ? correct / total : 0;
  const passed = p >= PASS_PCT;
  const unanswered = v.items.filter((i) => !i.selected.length).length;
  const tally = <K extends string | number>(key: (i: (typeof v.items)[number]) => K) => {
    const m = new Map<K, { correct: number; total: number }>();
    for (const it of v.items) {
      const k = key(it);
      const e = m.get(k) ?? { correct: 0, total: 0 };
      e.total++;
      if (it.isCorrect) e.correct++;
      m.set(k, e);
    }
    return [...m.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
  };
  const byDomain = tally((i) => i.domain);
  const byScenario = tally((i) => i.scenario);
  const weakTasks = tally((i) => i.task).filter(([, e]) => e.correct < e.total).sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total).slice(0, 6);
  const elapsedMin = v.submittedAt ? Math.round((Date.parse(v.submittedAt) - Date.parse(v.startedAt)) / 60000) : 0;

  const body = `
  <p class="small"><a href="${B}/history">← Results & history</a></p>
  ${pageHead('Results', v.label, `${esc(fmtDateTime(v.startedAt))} · ${elapsedMin} min · ${total} questions${unanswered ? ` · ${unanswered} unanswered` : ''}`,
    `<div class="row"><a class="btn" href="${B}/practice">New session</a>${v.items.some((i) => !i.isCorrect) ? `<a class="btn primary" href="${B}/practice/start?mode=weak&count=20&feedback=1">Drill weak areas</a>` : ''}</div>`)}

  <section class="card score-hero">
    <div class="gauge" style="--p:${p * 100};--g:${passed ? 'var(--olive)' : 'var(--clay)'}"><div><div><b>${pct(p)}</b><span class="small muted">${correct}/${total}</span></div></div></div>
    <div>
      <h2 style="margin:0 0 6px">${passed ? 'On track to pass' : 'Below the passing line'}</h2>
      <p class="muted">Rough scaled estimate <b>${estimateScaled(p)}</b> / 1000 (pass = 720). Aim for <b>80%+</b> on practice to leave margin for unfamiliar wording on the real exam.</p>
      ${weakTasks.length ? `<div class="small"><b>Revisit these ${objectiveTerm(exam)}s:</b> ${weakTasks.map(([t, e]) => `<a class="badge" href="${B}/domains/${domainById(Number(t.split('.')[0]))!.slug}#t${t}">${t} · ${e.correct}/${e.total}</a>`).join(' ')}</div>` : '<div class="callout olive">Perfect score on this set.</div>'}
    </div>
  </section>

  <section class="grid g2" style="margin-top:18px">
    <div class="card"><h3>By domain</h3>${breakdownTable(byDomain.map(([d, e]) => ({ name: `D${d} · ${domainById(d)!.short}`, color: DOMAIN_COLORS[d], ...e })))}</div>
    ${scenarios.length ? `<div class="card"><h3>By scenario</h3>${breakdownTable(byScenario.map(([s, e]) => ({ name: `S${s} · ${scenarioById(s)?.name ?? ''}`, ...e })))}</div>`
      : `<div class="card"><h3>By ${objectiveTerm(exam)}</h3>${breakdownTable(tally((i) => i.task).map(([t, e]) => ({ name: `${t} · ${taskById(t)?.title ?? ''}`, ...e })))}</div>`}
  </section>

  <section class="card" style="margin-top:18px">
    <div class="spread"><h3>Question review</h3>
      <div class="tabs" style="margin:0" data-review-filter>
        <a href="#" class="active" data-f="all">All</a><a href="#" data-f="wrong">Incorrect (${total - correct})</a><a href="#" data-f="flagged">Flagged (${v.items.filter((i) => i.flagged).length})</a>
      </div></div>
    ${v.items.map((it) => reviewItem(exam, it)).join('')}
  </section>`;
  return layout({ exam, title: `Results · ${v.label}`, active: '/history', body });
}

type ViewItem = NonNullable<ReturnType<typeof attemptView>>['items'][number];

function reviewItem(exam: ExamContent, it: ViewItem) {
  const { B, domains, scenarios, domainById, scenarioById, taskById } = ctx(exam);

  const sc = scenarioById(it.scenario);
  const dm = domainById(it.domain)!;
  const task = taskById(it.task);
  return `<article class="review-item" data-correct="${it.isCorrect ? 1 : 0}" data-flagged="${it.flagged ? 1 : 0}">
    <div class="spread"><div class="row">
      <b>Q${it.position}</b>
      ${it.isCorrect ? '<span class="badge olive">Correct</span>' : it.selected.length ? '<span class="badge danger">Incorrect</span>' : '<span class="badge amber">Unanswered</span>'}
      ${it.flagged ? '<span class="badge amber">Flagged</span>' : ''}
      <span class="badge"><span class="dot" style="background:${DOMAIN_COLORS[it.domain]}"></span>${esc(dm.short)}</span>
      <a class="badge" href="${B}/domains/${dm.slug}#t${it.task}" title="${esc(task?.title ?? '')}">${objectiveTerm(exam) === 'skill' ? 'Skill' : 'Task'} ${it.task}</a>
      ${sc ? `<span class="badge">S${it.scenario} · ${esc(sc.name)}</span>` : ''}
      ${it.official ? '<span class="badge sky">Official sample</span>' : ''}
    </div>
    <button class="icon-btn bm ${it.bookmarked ? 'on' : ''}" data-bookmark="${it.questionId}">${icons.bookmark}<span>${it.bookmarked ? 'Saved' : 'Save'}</span></button></div>
    <div class="stem">${rich(it.stem)}</div>
    ${it.type === 'multi' ? `<p class="small muted">Select ${it.select}.</p>` : ''}
    ${it.options.map((o) => {
      const chosen = it.selected.includes(o.key);
      const cls = o.correct ? 'correct' : chosen ? 'wrong' : '';
      return `<div class="opt ${cls} ${it.type === 'multi' ? 'multi' : ''}" style="cursor:default"><span class="letter">${o.key}</span><span>${rich(o.text)}${chosen ? ' <span class="small muted">(your answer)</span>' : ''}</span>
        ${o.rationale ? `<span class="rationale">${rich(o.rationale)}</span>` : ''}</div>`;
    }).join('')}
    <div class="explain"><h4>Why ${(it.answer ?? []).join(' + ')}</h4>${rich(it.explanation ?? '')}</div>
  </article>`;
}

export function historyPage(exam: ExamContent) {
  const { B, domains, scenarios, domainById, scenarioById, taskById } = ctx(exam);

  const st = stats(exam);
  const done = st.attempts.filter((a) => a.submitted_at).slice().reverse();
  const W = 760, H = 220, P = 34;
  const pts = done.map((a, i) => ({
    x: P + (done.length === 1 ? (W - 2 * P) / 2 : (i * (W - 2 * P)) / (done.length - 1)),
    y: H - P - ((a.correct ?? 0) / a.total) * (H - 2 * P),
    a,
  }));
  const yFor = (v: number) => H - P - v * (H - 2 * P);
  const chart = pts.length
    ? `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Score trend">
      ${[0, 0.25, 0.5, 0.75, 1].map((g) => `<line x1="${P}" x2="${W - P}" y1="${yFor(g)}" y2="${yFor(g)}" stroke="var(--border)"/><text x="${P - 8}" y="${yFor(g) + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${g * 100}%</text>`).join('')}
      <line x1="${P}" x2="${W - P}" y1="${yFor(0.72)}" y2="${yFor(0.72)}" stroke="var(--olive)" stroke-dasharray="5 5"/>
      <text x="${W - P}" y="${yFor(0.72) - 6}" text-anchor="end" font-size="11" fill="var(--olive)">pass line ≈72%</text>
      <polyline fill="none" stroke="var(--clay)" stroke-width="2.5" stroke-linejoin="round" points="${pts.map((p) => `${p.x},${p.y}`).join(' ')}"/>
      ${pts.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="${p.a.mode === 'full' ? 6 : 4}" fill="${p.a.mode === 'full' ? 'var(--clay)' : 'var(--surface)'}" stroke="var(--clay)" stroke-width="2"><title>${esc(p.a.label)} · ${pct((p.a.correct ?? 0) / p.a.total)}</title></circle>`).join('')}
    </svg>`
    : '<p class="empty">Complete a session to see your trend.</p>';

  const body = `
  ${pageHead('Results & history', 'How you’re trending', 'Filled dots are full mock exams. Feedback-mode drills count once you finish them.')}
  <section class="card chart">${chart}</section>

  <section class="grid g2" style="margin-top:18px">
    <div class="card"><h3>Accuracy by domain (all time)</h3>${breakdownTable(st.byDomain.map((d) => ({ name: `D${d.domain} · ${domainById(d.domain)!.short}`, color: DOMAIN_COLORS[d.domain], correct: d.correct, total: d.answered })))}</div>
    ${scenarios.length ? `<div class="card"><h3>Accuracy by scenario (all time)</h3>${breakdownTable(st.byScenario.map((s) => ({ name: `S${s.scenario} · ${scenarioById(s.scenario)?.name ?? ''}`, correct: s.correct, total: s.answered })))}</div>`
      : `<div class="card"><h3>Weakest ${objectiveTerm(exam)}s (all time)</h3>${breakdownTable(st.byTask.filter((t) => t.answered).sort((a, b) => a.correct / a.answered - b.correct / b.answered).slice(0, 8).map((t) => ({ name: `${t.task} · ${taskById(t.task)?.title ?? ''}`, correct: t.correct, total: t.answered })))}</div>`}
  </section>

  <section class="card" style="margin-top:18px"><h3>All sessions</h3>
  ${st.attempts.length ? `<div class="table-wrap"><table><thead><tr><th>Session</th><th>Started</th><th>Questions</th><th>Score</th><th></th></tr></thead><tbody>
    ${st.attempts.map((a) => `<tr><td>${esc(a.label)}${a.feedback ? ' <span class="badge sky">feedback</span>' : ''}${a.time_limit_sec ? ' <span class="badge">timed</span>' : ''}</td>
      <td class="muted">${esc(fmtDateTime(a.started_at))}</td><td>${a.total}</td>
      <td>${a.submitted_at ? `<b>${pct((a.correct ?? 0) / a.total)}</b> <span class="muted small">${a.correct}/${a.total} · est. ${estimateScaled((a.correct ?? 0) / a.total)}</span>` : '<span class="badge amber">in progress</span>'}</td>
      <td style="text-align:right;white-space:nowrap"><a class="btn sm" href="${B}/exam/${a.id}${a.submitted_at ? '/review' : ''}">${a.submitted_at ? 'Review' : 'Resume'}</a>
      <button class="btn sm ghost" data-delete-attempt="${a.id}" title="Delete session">✕</button></td></tr>`).join('')}
  </tbody></table></div>` : '<p class="empty">No sessions yet.</p>'}
  </section>`;
  return layout({ exam, title: 'Results & history', active: '/history', body });
}

export function bankPage(exam: ExamContent, q: { domain?: number; scenario?: number; task?: string; status?: string; search?: string }) {
  const { B, domains, scenarios, domainById, scenarioById, taskById } = ctx(exam);

  const where: string[] = ['q.active = 1', 'q.cert = ?'];
  const params: (string | number)[] = [exam.slug];
  if (q.domain) { where.push('q.domain = ?'); params.push(q.domain); }
  if (q.scenario) { where.push('q.scenario = ?'); params.push(q.scenario); }
  if (q.task) { where.push('q.task = ?'); params.push(q.task); }
  if (q.search) { where.push('(q.stem LIKE ? OR q.options LIKE ? OR q.tags LIKE ?)'); params.push(`%${q.search}%`, `%${q.search}%`, `%${q.search}%`); }
  if (q.status === 'bookmarked') where.push('q.id IN (SELECT question_id FROM bookmarks)');
  if (q.status === 'unseen') where.push('q.id NOT IN (SELECT question_id FROM attempt_items WHERE is_correct IS NOT NULL)');
  if (q.status === 'missed') where.push('q.id IN (SELECT question_id FROM attempt_items WHERE is_correct = 0)');
  const rows = db.prepare(`SELECT q.* FROM questions q WHERE ${where.join(' AND ')} ORDER BY q.scenario, q.id`).all(...params) as unknown as QuestionRow[];
  const marks = new Set((db.prepare('SELECT question_id FROM bookmarks').all() as { question_id: string }[]).map((r) => r.question_id));
  const hist = new Map(
    (db.prepare('SELECT question_id, COUNT(*) n, SUM(is_correct) c FROM attempt_items WHERE is_correct IS NOT NULL GROUP BY question_id').all() as { question_id: string; n: number; c: number }[])
      .map((r) => [r.question_id, r]),
  );
  const sel = (name: string, opts: [string | number, string][], cur?: string | number) =>
    `<select name="${name}" onchange="this.form.submit()"><option value="">${name === 'status' ? 'Any status' : `All ${name}s`}</option>${opts.map(([v, l]) => `<option value="${v}" ${String(cur ?? '') === String(v) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;

  const body = `
  ${pageHead('Question bank', `${rows.length} question${rows.length === 1 ? '' : 's'}`, 'Browse and study the full pool. Answers are hidden until you expand a question.')}
  <form class="card flat row" style="margin-bottom:18px" method="get">
    ${sel('domain', domains.map((d) => [d.id, `D${d.id} · ${d.short}`]), q.domain)}
    ${scenarios.length ? sel('scenario', scenarios.map((s) => [s.id, `S${s.id} · ${s.name}`]), q.scenario) : ''}
    ${sel('task', domains.flatMap((d) => d.tasks.map((t): [string, string] => [t.id, `${t.id} · ${t.title.slice(0, 40)}…`])), q.task)}
    ${sel('status', [['unseen', 'Not yet answered'], ['missed', 'Missed at least once'], ['bookmarked', 'Bookmarked']], q.status)}
    <input type="text" name="search" placeholder="Search text…" value="${esc(q.search ?? '')}" style="flex:1 1 180px;width:auto">
    <button class="btn sm">Filter</button><a class="btn sm ghost" href="${B}/bank">Reset</a>
  </form>
  <div class="card">
  ${rows.length ? rows.map((r) => {
    const x = parseQuestion(r);
    const h = hist.get(x.id);
    return `<details class="review-item">
      <summary><div class="spread"><div class="row"><b class="small muted">${x.id}</b>
        <span class="badge"><span class="dot" style="background:${DOMAIN_COLORS[x.domain]}"></span>${objectiveTerm(exam) === 'skill' ? 'Skill' : 'Task'} ${x.task}</span>
        ${x.scenario ? `<span class="badge">S${x.scenario}</span>` : ''}${x.type === 'multi' ? `<span class="badge amber">Select ${x.select}</span>` : ''}
        ${x.official ? '<span class="badge sky">Official</span>' : ''}<span class="small muted" title="difficulty">${'●'.repeat(x.difficulty)}${'○'.repeat(3 - x.difficulty)}</span>
        ${h ? `<span class="small muted">${h.c}/${h.n} correct</span>` : ''}</div>
        <button type="button" class="icon-btn bm ${marks.has(x.id) ? 'on' : ''}" data-bookmark="${x.id}">${icons.bookmark}<span>${marks.has(x.id) ? 'Saved' : 'Save'}</span></button></div>
        <div class="stem" style="font-size:1rem;margin:8px 0 0">${rich(x.stem)}</div></summary>
      <div style="margin-top:12px">${x.options.map((o) => `<div class="opt ${x.answer.includes(o.key) ? 'correct' : ''}" style="cursor:default"><span class="letter">${o.key}</span><span>${rich(o.text)}</span>${x.distractors[o.key] ? `<span class="rationale">${rich(x.distractors[o.key])}</span>` : ''}</div>`).join('')}
      <div class="explain"><h4>Explanation</h4>${rich(x.explanation)}</div></div>
    </details>`;
  }).join('') : '<p class="empty">No questions match these filters.</p>'}
  </div>`;
  return layout({ exam, title: 'Question bank', active: '/bank', body });
}
