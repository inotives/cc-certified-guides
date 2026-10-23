import type { Domain, ExamContent, PlanDay, PlanItem, TaskStatement } from '../exams/types.js';
import { getExamDate, getSettings } from '../db.js';
import { estimateScaled, planItems, planPosition, stats } from '../practice.js';
import {
  DOMAIN_COLORS, daysBetween, esc, fmtDate, fmtDateTime, icons, layout, meter, pageHead, pct, rich, ring, todayISO,
} from './layout.js';
import { diagramSvg } from './diagram.js';
import { examPages } from './exam-pages.js';

const domainOf = (exam: ExamContent, id: number) => exam.domains.find((d) => d.id === id)!;
/** "task statement" for CCAR-F, "skill" for exams whose guide lists weighted skills. */
export const objectiveTerm = (exam: ExamContent) => (exam.domains.some((d) => d.tasks.some((t) => t.weight !== undefined)) ? 'skill' : 'task statement');

const domainBadge = (exam: ExamContent, id: number) => {
  const d = domainOf(exam, id);
  return `<span class="badge"><span class="dot" style="background:${DOMAIN_COLORS[id]}"></span>D${id} ${esc(d.short)}</span>`;
};

const isExternal = (href: string) => /^https?:/.test(href);

function planItem(exam: ExamContent, it: PlanItem, done: Set<string>) {
  const B = exam.base;
  const checked = done.has(it.id);
  // Plan content uses site-relative paths; prefix them with this exam's base.
  const href = it.href && !isExternal(it.href) ? B + it.href : it.href;
  const link = href
    ? ` <a href="${esc(href)}"${isExternal(href) ? ' target="_blank" rel="noopener"' : ''} class="small">${isExternal(href) ? 'Open ↗' : 'Go →'}</a>`
    : '';
  return `<label class="check ${checked ? 'done' : ''}">
    <input type="checkbox" data-plan-item="${it.id}" ${checked ? 'checked' : ''}>
    <span><span class="kind ${it.kind}">${it.kind}</span><span class="txt">${rich(it.text)}</span>${it.minutes ? ` <span class="small muted">· ${it.minutes} min</span>` : ''}${link}</span>
  </label>`;
}

const dayMinutes = (d: PlanDay) => d.items.reduce((m, i) => m + i.minutes, 0);

/** Optional exam booking: days left, or null when no date is set. */
function examCountdown(exam: ExamContent) {
  const date = getExamDate(exam.slug);
  return date ? { date, daysLeft: daysBetween(todayISO(), date) } : null;
}

// ---------------- dashboard ----------------

export function dashboardPage(exam: ExamContent) {
  const B = exam.base;
  const { domains, scenarios, plan } = exam;
  const domainById = (id: number) => domainOf(exam, id);

  const s = getSettings();
  const pos = planPosition(exam);
  const booking = examCountdown(exam);
  const st = stats(exam);
  const done = pos.done;
  const planPct = planItems(exam).length ? done.size / planItems(exam).length : 0;
  const days = plan.flatMap((w) => w.days);
  const current = pos.complete ? undefined : days.find((d) => d.day === pos.day);
  const mocks = st.attempts.filter((a) => a.mode === 'full' && a.submitted_at);
  const lastMock = mocks[0];
  const bestMock = mocks.reduce<number | null>((m, a) => Math.max(m ?? 0, (a.correct ?? 0) / a.total), null);
  const ranked = st.byDomain.filter((d) => d.recentPct !== null).sort((a, b) => (a.recentPct ?? 0) - (b.recentPct ?? 0));
  const weakest = ranked[0];
  const untouched = st.byDomain.filter((d) => d.answered === 0);
  const ready = bestMock !== null && bestMock >= 0.8;

  const recommendation = untouched.length
    ? `You haven't practised <b>${untouched.map((d) => esc(domainById(d.domain)!.short)).join(', ')}</b> yet.`
    : weakest
      ? `Your weakest domain right now is <b>${esc(domainById(weakest.domain)!.name)}</b> at ${pct(weakest.recentPct)} recent accuracy.`
      : '';

  const greeting = s.name ? `Welcome back, ${esc(s.name)}` : 'Your exam command centre';
  const examLine = booking
    ? booking.daysLeft >= 0 ? `Exam booked for <b>${esc(fmtDate(booking.date, { weekday: 'long', month: 'long', day: 'numeric' }))}</b> (${booking.daysLeft} days).` : 'Your booked exam date has passed.'
    : `Not booked yet. Work through the plan at your own pace, and book once your mock exams score 80% or higher.`;

  const body = `
  ${pageHead('Claude Certified Architect – Foundations', greeting,
    `${pos.complete ? 'Study plan complete' : `Day ${pos.day} of ${pos.totalDays}`}. ${examLine} ${exam.mock.items} ${scenarios.length ? 'scenario-based ' : ''}questions · ${exam.mock.minutes} minutes · pass at 720/1000.`)}

  <section class="grid g4">
    <div class="card stat"><div class="k">Current day</div><div class="v">${pos.complete ? '✓' : pos.day}<span class="muted" style="font-size:1.1rem"> / ${pos.totalDays}</span></div><div class="s">${pos.daysDone} day${pos.daysDone === 1 ? '' : 's'} completed</div></div>
    <div class="card stat"><div class="k">Study plan</div><div class="v">${pct(planPct)}</div><div class="s">${done.size} of ${planItems(exam).length} tasks done</div><div class="bar" style="margin-top:10px"><span style="width:${planPct * 100}%"></span></div></div>
    <div class="card stat"><div class="k">Question bank</div><div class="v">${st.seenUnique}<span class="muted" style="font-size:1.1rem"> / ${st.bank}</span></div><div class="s">unique questions attempted</div></div>
    <div class="card stat"><div class="k">Mock exams</div><div class="v">${lastMock ? pct((lastMock.correct ?? 0) / lastMock.total) : '—'}</div><div class="s">${lastMock ? `latest · best ${pct(bestMock)} · ${mocks.length} taken` : 'no full mock yet'}</div></div>
  </section>
  ${!booking && ready ? `<div class="callout olive" style="margin-top:18px">Your best mock is ${pct(bestMock)}, so you're ready to book. <a href="https://www.pearsonvue.com/us/en/anthropic.html" target="_blank" rel="noopener">Schedule via Pearson VUE ↗</a>, then add the date in <a href="${B}/settings">Settings</a>.</div>` : ''}

  <section class="grid g2" style="margin-top:18px">
    <div class="card">
      <div class="spread"><h3>${icons.plan} ${current ? `Day ${current.day} · ${esc(current.title)}` : 'Plan complete'}</h3><a href="${B}/plan${current ? `#day-${current.day}` : ''}" class="small">Full plan →</a></div>
      ${current
        ? `<p class="small muted">${esc(current.focus)} · about ${dayMinutes(current)} min</p>${current.items.map((i) => planItem(exam, i, done)).join('')}`
        : `<p class="muted">All ${pos.totalDays} days are done. Keep sitting full mocks and weak-areas reviews until exam day.</p>`}
    </div>
    <div class="card">
      <h3>${icons.practice} Practice now</h3>
      ${recommendation ? `<div class="callout" style="margin:8px 0 14px">${recommendation}</div>` : ''}
      <div class="stack">
        <div class="row"><a class="btn primary" href="${B}/practice/start?mode=full">Start full mock (${exam.mock.items} · ${exam.mock.minutes} min)</a></div>
        <div class="row">
          <a class="btn" href="${B}/practice/start?mode=quick&count=15&feedback=1">Quick 15 with feedback</a>
          ${weakest || untouched.length ? `<a class="btn" href="${B}/practice/start?mode=domain&domain=${(untouched[0] ?? weakest)!.domain}&count=20&feedback=1">Drill ${esc(domainById((untouched[0] ?? weakest)!.domain)!.short)}</a>` : ''}
          ${st.attempts.some((a) => a.submitted_at || a.feedback) ? `<a class="btn" href="${B}/practice/start?mode=weak&count=20&feedback=1">Weak areas</a>` : ''}
        </div>
      </div>
    </div>
  </section>

  <section class="card" style="margin-top:18px">
    <div class="spread"><h3>${icons.domains} Readiness by domain</h3><span class="small muted">Recent accuracy (last 30 answers per domain) · marker = 80% target</span></div>
    ${st.byDomain.map((d) => {
      const dm = domainById(d.domain)!;
      return meter(
        `<a href="${B}/domains/${dm.slug}" style="color:inherit"><span class="dot" style="background:${DOMAIN_COLORS[d.domain]}"></span> <b>D${d.domain}</b> ${esc(dm.short)}</a>`,
        d.recentPct,
        `${dm.weight}% of exam · ~${dm.items} items · ${d.answered ? `${d.recentN} recent answers` : 'not practised yet'}`,
        DOMAIN_COLORS[d.domain],
      );
    }).join('')}
    ${st.weighted !== null ? `<p class="small muted" style="margin-top:12px">Blueprint-weighted accuracy: <b>${pct(st.weighted)}</b> → rough scaled estimate <b>${estimateScaled(st.weighted)}</b> (pass = 720). Treat this as a guide only, because Anthropic doesn't publish its scaling.</p>` : ''}
  </section>

  <section class="card" style="margin-top:18px">
    <div class="spread"><h3>${icons.history} Recent sessions</h3><a href="${B}/history" class="small">All results →</a></div>
    ${st.attempts.length ? `<div class="table-wrap"><table><thead><tr><th>Session</th><th>When</th><th>Score</th><th></th></tr></thead><tbody>
      ${st.attempts.slice(0, 5).map((a) => `<tr><td>${esc(a.label)}</td><td class="muted">${esc(fmtDateTime(a.started_at))}</td>
        <td>${a.submitted_at ? `<b>${a.correct}/${a.total}</b> · ${pct((a.correct ?? 0) / a.total)}` : '<span class="badge amber">in progress</span>'}</td>
        <td style="text-align:right"><a href="${B}/exam/${a.id}${a.submitted_at ? '/review' : ''}">${a.submitted_at ? 'Review' : 'Resume'} →</a></td></tr>`).join('')}
    </tbody></table></div>` : `<p class="empty">No practice yet. Start with the Day 1 diagnostic.</p>`}
  </section>`;
  return layout({ exam, title: 'Dashboard', active: '/', body });
}

// ---------------- plan ----------------

export function planPage(exam: ExamContent) {
  const B = exam.base;
  const { domains, scenarios, plan } = exam;
  const domainById = (id: number) => domainOf(exam, id);

  const pos = planPosition(exam);
  const done = pos.done;
  const totalMin = planItems(exam).reduce((m, i) => m + i.minutes, 0);
  const body = `
  ${pageHead('Self-paced study plan', `${pos.totalDays} study days to exam-ready`,
    `Built from the official exam guide. Domains are sequenced by weight, every ${objectiveTerm(exam)} gets study, hands-on and drill time, and the last stretch is three full timed mocks with remediation in between. A "day" is one study session of about ${Math.round(totalMin / pos.totalDays / 10) * 10} minutes (${Math.round(totalMin / 60)} hours in total), not a calendar day, so go at your own pace. Your current day is the first one with unfinished tasks.`)}
  ${plan.map((w) => {
    const items = w.days.flatMap((d) => d.items);
    const wDone = items.filter((i) => done.has(i.id)).length;
    return `<section class="week card">
      <div class="spread"><div><div class="small muted">PHASE ${w.week} · DAYS ${w.days[0].day}–${w.days[w.days.length - 1].day}</div><h2 style="margin:2px 0 4px">${esc(w.title)}</h2></div>
      <div style="min-width:180px"><div class="small muted" style="text-align:right">${wDone}/${items.length} done</div><div class="bar"><span style="width:${(wDone / items.length) * 100}%"></span></div></div></div>
      <p class="muted">${esc(w.goal)}</p>
      ${w.days.map((d) => {
        const dayDone = d.items.every((i) => done.has(i.id));
        const isCurrent = !pos.complete && d.day === pos.day;
        const status = dayDone ? '<span class="badge olive">Completed</span>' : isCurrent ? '<span class="badge clay">Up next</span>' : '';
        return `<div class="day ${isCurrent ? 'today' : ''}" id="day-${d.day}">
          <div class="day-date">Day<b>${d.day}</b>~${dayMinutes(d)} min</div>
          <div><div class="spread"><h3 style="margin:0">${esc(d.title)}</h3><div class="row">${d.domains.map((id) => domainBadge(exam, id)).join('')}${status}</div></div>
            <p class="small muted" style="margin:2px 0 6px">${esc(d.focus)}</p>
            ${d.items.map((i) => planItem(exam, i, done)).join('')}
            ${dayDone ? '' : `<button class="btn sm ghost" data-complete-day="${d.items.filter((i) => !done.has(i.id)).map((i) => i.id).join(',')}" style="margin-top:6px">Mark day ${d.day} complete</button>`}</div>
        </div>`;
      }).join('')}
    </section>`;
  }).join('')}
  <div class="card sunk"><h3>On exam day</h3>
  <p class="muted" style="margin:0">Bring a valid government photo ID whose name matches your registration exactly. Clear your desk, put away your phone and watch, and stay in webcam view if testing online. Budget about 2 minutes per question, flag anything slow and move on, then come back to flagged items at the end.</p></div>`;
  return layout({ exam, title: 'Study plan', active: '/plan', body });
}

// ---------------- domains ----------------

export function domainsPage(exam: ExamContent) {
  const B = exam.base;
  const { domains, scenarios, plan } = exam;
  const domainById = (id: number) => domainOf(exam, id);

  const st = stats(exam);
  const body = `
  ${pageHead('Domain guide', `${domains.length} domains, ${domains.reduce((n, d) => n + d.tasks.length, 0)} ${objectiveTerm(exam)}s`,
    objectiveTerm(exam) === 'skill'
      ? 'Each skill shows its official weight and description from the exam guide, then study notes: what to know and be able to do, an <b>exam lens</b> (how correct answers tend to reason) and <b>traps</b> (how wrong answers are built).'
      : exam.studyNotes
      ? 'Each task statement is quoted from the exam guide, followed by diagrams and study notes: an <b>exam lens</b> (how correct answers tend to reason), <b>traps</b> (how wrong answers are built) and what to know and be able to do.'
      : 'Each task statement lists what the guide says you must know and be able to do, plus an <b>exam lens</b> (how correct answers tend to reason) and <b>traps</b> (how wrong answers are built).')}
  <div class="grid g2">
    ${domains.map((d) => {
      const s = st.byDomain.find((x) => x.domain === d.id);
      return `<a class="card card-link" href="${B}/domains/${d.slug}">
        <div class="row" style="align-items:flex-start">${ring(d.weight, `${d.weight}%`, DOMAIN_COLORS[d.id])}
        <div style="flex:1"><div class="small muted">DOMAIN ${d.id}</div><h3 style="margin:2px 0 6px">${esc(d.name)}</h3>
        <p class="small muted" style="margin:0 0 10px">${esc(d.summary)}</p>
        <div class="row"><span class="badge">~${d.items} items</span><span class="badge">${d.tasks.length} ${objectiveTerm(exam)}${d.tasks.length === 1 ? '' : 's'}</span><span class="badge">${s?.bank ?? 0} practice Qs</span>${s?.answered ? `<span class="badge clay">recent ${pct(s.recentPct)}</span>` : ''}</div></div></div>
      </a>`;
    }).join('')}
  </div>`;
  return layout({ exam, title: 'Domain guide', active: '/domains', body });
}

const knowDo = (exam: ExamContent, t: TaskStatement) => `<div class="task-cols">
  <div><h4>${exam.studyNotes ? 'Know' : 'Knowledge of'}</h4><ul class="small">${t.knowledge.map((k) => `<li>${rich(k)}</li>`).join('')}</ul></div>
  <div><h4>${exam.studyNotes ? 'Be able to' : 'Skills in'}</h4><ul class="small">${t.skills.map((k) => `<li>${rich(k)}</li>`).join('')}</ul></div>
</div>`;

const lensTraps = (t: TaskStatement) => t.examLens.length || t.traps.length ? `<div class="task-cols">
  <div class="lens"><h4>Exam lens</h4><ul class="small" style="margin:0">${t.examLens.map((k) => `<li>${rich(k)}</li>`).join('')}</ul></div>
  <div class="traps"><h4>Traps</h4><ul class="small" style="margin:0">${t.traps.map((k) => `<li>${rich(k)}</li>`).join('')}</ul></div>
</div>` : '';

export function domainPage(exam: ExamContent, d: Domain) {
  const B = exam.base;
  const { domains, scenarios, plan } = exam;
  const domainById = (id: number) => domainOf(exam, id);

  const st = stats(exam);
  const taskStat = (id: string) => st.byTask.find((t) => t.task === id);
  const body = `
  <p class="small"><a href="${B}/domains">← All domains</a></p>
  ${pageHead(`Domain ${d.id} · ${d.weight}% · ~${d.items} items`, d.name, esc(d.summary),
    `<a class="btn primary" href="${B}/practice/start?mode=domain&domain=${d.id}&count=20&feedback=1">Drill this domain</a>`)}
  ${d.links.length ? `<div class="card sunk" style="margin-bottom:18px"><div class="small muted" style="margin-bottom:6px">OFFICIAL READING</div>
    <div class="row">${d.links.map((l) => `<a class="badge" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('')}</div></div>` : ''}
  <div class="card">
  ${d.tasks.map((t) => {
    const ts = taskStat(t.id);
    return `<article class="task" id="t${t.id}">
      <div class="spread"><h3 style="margin:0"><span class="task-id">${t.id}</span> ${esc(t.title)}${t.weight !== undefined ? ` <span class="badge">${t.weight}% of exam</span>` : ''}</h3>
        <div class="row">${ts ? `<span class="small muted">${ts.answered ? `${pct(ts.correct / ts.answered)} of ${ts.answered} answers` : 'not practised'}</span>
        <a class="btn sm" href="${B}/practice/start?mode=task&task=${t.id}&feedback=1">Drill ${ts.bank} Qs</a>` : ''}</div></div>
      ${t.description ? `<div class="callout sky" style="margin-top:12px"><div class="small muted" style="margin-bottom:2px">OFFICIAL OBJECTIVE</div>${esc(t.description)}</div>` : ''}
      ${t.diagrams?.length ? `<div class="diagrams">${t.diagrams.map(diagramSvg).join('')}</div>` : ''}
      ${t.diagrams?.length ? lensTraps(t) : ''}
      ${t.knowledge.length || t.skills.length ? (t.diagrams?.length
        ? `<details class="notes-more"><summary>Full study notes · ${t.knowledge.length} to know, ${t.skills.length} to do</summary>${knowDo(exam, t)}</details>`
        : knowDo(exam, t)) : `<p class="small muted" style="margin-top:10px">Study notes for this ${objectiveTerm(exam)} are being written.</p>`}
      ${t.diagrams?.length ? '' : lensTraps(t)}
      ${t.links?.length ? `<div class="row" style="margin-top:12px">${t.links.map((l) => `<a class="badge" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('')}</div>` : ''}
    </article>`;
  }).join('')}
  </div>`;
  return layout({ exam, title: d.name, active: '/domains', body });
}

// ---------------- scenarios ----------------

export function scenariosPage(exam: ExamContent) {
  const B = exam.base;
  const { domains, scenarios, plan } = exam;
  const domainById = (id: number) => domainOf(exam, id);

  const st = stats(exam);
  const body = `
  ${pageHead('Exam scenarios', 'The six production scenarios',
    'Every sitting presents <b>4 of these 6</b>, chosen at random, and groups questions under each one. You can’t skip any, so be ready for all six.')}
  <div class="grid g2">
    ${scenarios.map((s) => {
      const ss = st.byScenario.find((x) => x.scenario === s.id);
      return `<div class="card mode-card">
        <div class="spread"><span class="small muted">SCENARIO ${s.id}</span>${ss?.answered ? `<span class="badge clay">${pct(ss.correct / ss.answered)} accuracy</span>` : ''}</div>
        <h3 style="margin:0">${esc(s.name)}</h3>
        <p class="small" style="margin:0">${esc(s.context)}</p>
        <div class="row">${s.domains.map((id) => domainBadge(exam, id)).join('')}</div>
        <div class="lens"><h4>Watch for</h4><ul class="small" style="margin:0">${s.watchFor.map((w) => `<li>${rich(w)}</li>`).join('')}</ul></div>
        <div class="row"><a class="btn primary sm" href="${B}/practice/start?mode=scenario&scenario=${s.id}&count=15">Exam-style drill (15)</a>
        <a class="btn sm" href="${B}/practice/start?mode=scenario&scenario=${s.id}&count=15&feedback=1">With feedback</a></div>
      </div>`;
    }).join('')}
  </div>`;
  return layout({ exam, title: 'Scenarios', active: '/scenarios', body });
}

// ---------------- exam-specific pages ----------------

export const guidePage = (exam: ExamContent) =>
  layout({ exam, title: 'Exam focus', active: '/guide', body: examPages[exam.slug].guideBody(exam) });

export const cheatsheetPage = (exam: ExamContent) =>
  layout({ exam, title: 'Cheat sheet', active: '/cheatsheet', body: examPages[exam.slug].cheatsheetBody(exam) });

// ---------------- settings ----------------

export function settingsPage(exam: ExamContent, saved = false) {
  const B = exam.base;
  const { domains, scenarios, plan } = exam;
  const domainById = (id: number) => domainOf(exam, id);

  const s = getSettings();
  const examDate = getExamDate(exam.slug);
  const body = `
  ${pageHead(`Settings · ${exam.code}`, 'Profile & exam booking')}
  ${saved ? '<div class="callout olive" style="margin-bottom:16px">Saved.</div>' : ''}
  <form class="card" method="post" action="${B}/settings" style="max-width:520px">
    <label class="field"><span>Your name (optional, shared with your <a href="/#profile">profile</a>)</span><input type="text" name="name" value="${esc(s.name)}" maxlength="60"></label>
    <label class="field"><span>${esc(exam.code)} exam date (optional)</span><input type="date" name="examDate" value="${esc(examDate)}">
      <span class="small muted">Leave this blank until you've booked. The study plan is self-paced; once a date is set, a countdown appears.</span></label>
    <div class="row"><button class="btn primary" type="submit">Save</button>
    ${examDate ? '<button class="btn ghost" type="submit" name="clearExam" value="1">Clear exam date</button>' : ''}</div>
  </form>
  <div class="card sunk" style="max-width:520px;margin-top:18px"><h3>Your data</h3>
    <p class="small muted" style="margin:0">Progress lives in a local SQLite file at <code>data/cca-prep.db</code>. Delete that file to start over. This exam's questions live in <code>src/exams/${exam.slug}/questions/*.json</code> and are re-synced on every server start.</p></div>`;
  return layout({ exam, title: 'Settings', active: '/settings', body });
}

