import { LEVELS, certIndex, certs, shortName, type Cert } from '../certs.js';
import { getSettings } from '../db.js';
import { examBySlug } from '../exams/index.js';
import { planItems, planPosition, stats } from '../practice.js';
import { documentHead, esc, logo, pct } from './layout.js';

const ROLE_COLOR: Record<Cert['role'], string> = { Associate: 'var(--sky)', Developer: 'var(--olive)', Architect: 'var(--clay)' };

/** Live progress for exams that have a study site. */
function progressStats(c: Cert) {
  const exam = examBySlug(c.slug);
  if (!exam) return null;
  const pos = planPosition(exam);
  const st = stats(exam);
  const mocks = st.attempts.filter((a) => a.mode === 'full' && a.submitted_at);
  const best = mocks.reduce<number | null>((m, a) => Math.max(m ?? 0, (a.correct ?? 0) / a.total), null);
  const total = planItems(exam).length;
  return { pos, seen: st.seenUnique, bank: st.bank, best, planPct: total ? pos.done.size / total : 0 };
}

function progressFor(c: Cert) {
  const p = progressStats(c);
  if (!p) return '';
  return `<div class="cert-progress">
    <div><span class="k">Plan</span><b>${p.pos.complete ? 'Complete' : `Day ${p.pos.day} / ${p.pos.totalDays}`}</b></div>
    <div><span class="k">Questions</span><b>${p.seen} / ${p.bank}</b></div>
    <div><span class="k">Top mock</span><b>${p.best === null ? '—' : pct(p.best)}</b></div>
    <div class="bar" style="grid-column:1/-1"><span style="width:${p.planPct * 100}%"></span></div>
  </div>`;
}

interface Marks { earned: boolean; target: boolean }

function card(c: Cert, step: number, m: Marks) {
  const available = c.base !== null;
  const color = ROLE_COLOR[c.role];
  const shown = c.domains.slice(0, 4);
  const status = m.earned
    ? '<span class="badge olive">✓ Earned</span>'
    : available ? '<span class="badge olive">Study site ready</span>' : '<span class="badge">Coming soon</span>';
  return `<article class="cert-card ${available ? 'available' : 'soon'} ${m.earned ? 'earned' : ''} ${m.target ? 'target' : ''}" style="--role:${color}">
    ${m.target ? '<div class="target-flag">Your target</div>' : ''}
    <div class="cert-top">
      <span class="cert-step">${m.earned ? '✓' : step}</span>
      ${status}
    </div>
    <div class="row" style="gap:6px">
      <span class="badge" style="color:${color}">${c.role}</span>
      <span class="badge ${c.level === 'Professional' ? 'clay' : ''}">${c.level}</span>
    </div>
    <h2>${esc(c.name.replace('Claude Certified ', ''))}</h2>
    <div class="small muted cert-code">Claude Certified · ${c.code}</div>
    <p class="cert-summary">${esc(c.summary)}</p>
    <dl class="cert-facts">
      <div><dt>Items</dt><dd>${c.items}</dd></div>
      <div><dt>Minutes</dt><dd>${c.minutes}</dd></div>
      <div><dt>Pass</dt><dd title="Scaled score out of 1000">720</dd></div>
      <div><dt>Fee</dt><dd>$${c.fee}</dd></div>
    </dl>
    <div class="cert-domains">
      <div class="k">Top domains · ${c.domains.length} total</div>
      ${shown.map((d) => `<div class="cert-domain"><span>${esc(d.name)}</span><span class="bar"><span style="width:${(d.weight / shown[0].weight) * 100}%;background:${color}"></span></span><b>${d.weight}%</b></div>`).join('')}
    </div>
    <p class="small muted cert-audience"><b>For:</b> ${esc(c.audience)}</p>
    ${progressFor(c)}
    <div class="cert-actions">
      ${available
        ? `<a class="btn ${m.earned ? '' : 'primary'}" href="${c.base}/">${m.earned ? 'Review study site' : 'Enter study site →'}</a>`
        : '<button class="btn" disabled>Coming soon</button>'}
      <a class="btn ghost sm" href="${c.guideUrl}" target="_blank" rel="noopener">Exam guide ↗</a>
    </div>
  </article>`;
}

function profilePanel() {
  const s = getSettings();
  const configured = !!(s.currentLevel || s.targetCert);
  const earnedIdx = s.currentLevel && s.currentLevel !== 'none' ? certIndex(s.currentLevel) : -1;
  const target = certs.find((c) => c.slug === s.targetCert);
  const targetIdx = target ? certIndex(target.slug) : -1;
  const level = LEVELS.find((l) => l.value === s.currentLevel);
  const initials = (s.name.trim() || 'You').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  let status = '';
  if (target && targetIdx <= earnedIdx) {
    status = `<p class="profile-note">You already hold <b>${esc(shortName(target))}</b>. Pick a new target to keep going.</p>`;
  } else if (target) {
    const between = certs.slice(earnedIdx + 1, targetIdx);
    const p = progressStats(target);
    const next = target.base
      ? `<a class="btn primary" href="${target.base}/">${p && p.pos.done.size ? 'Continue studying' : 'Start studying'} →</a>`
      : `<a class="btn" href="${target.guideUrl}" target="_blank" rel="noopener">Read the exam guide ↗</a>`;
    status = `
      <p class="profile-note">Step ${targetIdx + 1} of ${certs.length} on the path. ${between.length
        ? `${between.map((c) => esc(shortName(c))).join(' and ')} come${between.length === 1 ? 's' : ''} before it, but there are no prerequisites, so you can sit your target directly.`
        : 'It’s the next step from your current level.'}
        ${target.base ? '' : ' Its study site is coming soon.'}</p>
      ${p ? `<div class="profile-stats">
        <div><span class="k">Plan</span><b>${p.pos.complete ? 'Complete' : `Day ${p.pos.day} of ${p.pos.totalDays}`}</b></div>
        <div><span class="k">Plan tasks</span><b>${pct(p.planPct)}</b></div>
        <div><span class="k">Questions tried</span><b>${p.seen} / ${p.bank}</b></div>
        <div><span class="k">Top mock</span><b>${p.best === null ? '—' : pct(p.best)}</b></div>
      </div>` : ''}
      <div class="row">${next}</div>`;
  } else if (configured) {
    status = '<p class="profile-note">Choose a target certification to get a study recommendation.</p>';
  }

  const options = (items: { value: string; label: string }[], cur: string, placeholder: string) =>
    `<option value="" ${cur ? '' : 'selected'} disabled>${placeholder}</option>` +
    items.map((o) => `<option value="${o.value}" ${o.value === cur ? 'selected' : ''}>${esc(o.label)}</option>`).join('');

  const form = `<form class="profile-form" method="post" action="/profile">
      <label class="field"><span>Name</span><input type="text" name="name" value="${esc(s.name)}" maxlength="60" placeholder="Optional"></label>
      <label class="field"><span>Current level</span><select name="currentLevel" required>${options(LEVELS, s.currentLevel, 'Choose your current level')}</select>
        <span class="small muted">The highest Claude certification you already hold.</span></label>
      <label class="field"><span>Target certification</span><select name="targetCert" required>${options(certs.map((c) => ({ value: c.slug, label: `${shortName(c)} (${c.code})` })), s.targetCert, 'Choose your target')}</select></label>
      <button class="btn primary" type="submit">Save profile</button>
    </form>`;

  return `<section class="card profile" id="profile">
    <div class="profile-main">
      <div class="avatar" aria-hidden="true">${esc(initials)}</div>
      <div style="flex:1;min-width:0">
        <div class="small muted">YOUR PROFILE</div>
        <h2 style="margin:2px 0 8px">${configured ? esc(s.name || 'Your certification goal') : 'Set your level and target'}</h2>
        ${configured ? `<div class="profile-chips">
          <span class="chip"><span class="k">Current level</span>${esc(level?.label ?? 'Not set')}</span>
          <span class="arrow" aria-hidden="true">→</span>
          <span class="chip target"><span class="k">Target</span>${target ? `${esc(shortName(target))} · ${target.code}` : 'Not set'}</span>
        </div>${status}` : '<p class="profile-note">Tell us where you are and which certification you are aiming for. The path below will mark what you have earned and highlight your target.</p>'}
      </div>
    </div>
    <details class="profile-edit" ${configured ? '' : 'open'}>
      <summary>${configured ? 'Edit profile' : 'Set up profile'}</summary>
      ${form}
    </details>
  </section>`;
}

export function homePage() {
  const s = getSettings();
  const earnedIdx = s.currentLevel && s.currentLevel !== 'none' ? certIndex(s.currentLevel) : -1;
  const marks = (i: number): Marks => ({ earned: i <= earnedIdx, target: certs[i].slug === s.targetCert });
  return `${documentHead('Claude Certification Prep')}
<body>
<div class="home">
  <header class="home-bar">
    <a class="brand" href="/" style="padding:0">${logo(28)}<div><b>Claude Certification Prep</b><small>Local study hub</small></div></a>
    <button class="theme-toggle" data-theme-toggle>Toggle theme</button>
  </header>

  <section class="home-hero">
    <div class="eyebrow">Anthropic Claude Certification Program</div>
    <h1>Your path through the Claude certifications</h1>
    <p class="lead">Each certification matches a role. Start at Foundations, then advance to Professional. Pick an exam to open its study plan, domain guide and simulated practice exams.</p>
  </section>

  ${profilePanel()}

  <ol class="cert-path" aria-label="Certification path">
    ${certs.map((c, i) => {
      const m = marks(i);
      return `<li class="${c.base ? 'on' : ''} ${m.earned ? 'earned' : ''} ${m.target ? 'target' : ''}"><span>${m.earned ? '✓' : i + 1}</span>${esc(shortName(c))}${m.target ? ' <em>target</em>' : ''}</li>`;
    }).join('')}
  </ol>

  <section class="cert-grid">
    ${certs.map((c, i) => card(c, i + 1, marks(i))).join('')}
  </section>

  <footer class="home-foot small muted">
    Exam facts come from Anthropic's official exam guides (copies in <code>docs/guides/</code>). Register through the
    <a href="https://anthropic-partners.skilljar.com/page/partner-certifications" target="_blank" rel="noopener">Anthropic Partner Academy ↗</a>; exams are delivered by Pearson VUE.
  </footer>
</div>
<script src="/static/app.js"></script>
</body>
</html>`;
}
