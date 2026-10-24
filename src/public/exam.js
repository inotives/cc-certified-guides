// Exam / drill runner. State lives on the server; this file renders one question at a time.
(() => {
  const root = document.getElementById('exam');
  if (!root) return;
  const id = root.dataset.attempt;
  const BASE = document.body.dataset.base || '';
  const CTX = window.__CTX__;
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const rich = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
  const api = (path, opts = {}) =>
    fetch(`${BASE}/api/attempts/${id}${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts }).then((r) => r.json());

  let A = null; // attempt view
  let cur = 0; // index into A.items
  let pending = []; // feedback mode: selection before "Check"
  let clockOffset = 0;
  let timerHandle = null;
  let confirming = false;

  const item = () => A.items[cur];
  const revealed = (it) => it.isCorrect !== null && it.isCorrect !== undefined;
  const answeredCount = () => A.items.filter((i) => i.selected.length).length;

  async function load() {
    A = await api('');
    if (A.submittedAt) { location.href = `${BASE}/exam/${id}/review`; return; }
    clockOffset = Date.parse(A.serverNow) - Date.now();
    const fromHash = Number(new URLSearchParams(location.hash.slice(1)).get('q'));
    const firstOpen = A.items.findIndex((i) => !i.selected.length);
    cur = fromHash >= 1 && fromHash <= A.items.length ? fromHash - 1 : Math.max(firstOpen, 0);
    if (A.timeLimitSec) startTimer();
    render();
  }

  function startTimer() {
    const deadline = Date.parse(A.startedAt) + A.timeLimitSec * 1000;
    const tick = () => {
      const left = Math.max(0, Math.round((deadline - (Date.now() + clockOffset)) / 1000));
      const h = Math.floor(left / 3600), m = Math.floor((left % 3600) / 60), s = left % 60;
      const el = $('#timer');
      el.textContent = `⏱ ${h ? h + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      el.classList.toggle('low', left <= 300);
      if (left === 0) { clearInterval(timerHandle); submit(true); }
    };
    tick();
    timerHandle = setInterval(tick, 1000);
  }

  function render() {
    const it = item();
    history.replaceState(null, '', `#q=${cur + 1}`);

    const sc = CTX.scenarios[it.scenario];
    const dm = CTX.domains[it.domain];
    const showMeta = A.feedback || A.mode !== 'full';
    const isRev = revealed(it);
    const sel = A.feedback && !isRev ? pending : it.selected;
    const prevScenario = cur > 0 ? A.items[cur - 1].scenario : null;

    $('#exam-progress').innerHTML = `Question <b>${cur + 1}</b> of ${A.items.length}${A.mode === 'full' && A.scenarios.length ? ` · Scenario ${A.scenarios.indexOf(it.scenario) + 1} of ${A.scenarios.length}` : ''}`;
    $('#answered-count').textContent = `${answeredCount()}/${A.items.length} answered`;

    const opts = it.options.map((o) => {
      const chosen = sel.includes(o.key);
      let cls = chosen ? 'selected' : '';
      if (isRev) cls = o.correct ? 'correct' : chosen ? 'wrong' : '';
      return `<button class="opt ${cls} ${it.type === 'multi' ? 'multi' : ''}" data-key="${o.key}" ${isRev ? 'disabled' : ''}>
        <span class="letter">${o.key}</span><span>${rich(o.text)}</span>
        ${isRev && o.rationale ? `<span class="rationale">${rich(o.rationale)}</span>` : ''}</button>`;
    }).join('');

    const verdict = isRev
      ? `<div class="explain" style="background:${it.isCorrect ? 'var(--olive-soft)' : 'var(--danger-soft)'}">
          <h4 style="color:${it.isCorrect ? 'var(--olive)' : 'var(--danger)'}">${it.isCorrect ? 'Correct' : 'Not quite'} · answer ${it.answer.join(' + ')}</h4>${rich(it.explanation)}
          <div class="small muted" style="margin-top:8px">${CTX.term} ${it.task} · ${esc(CTX.tasks[it.task] ?? '')}</div></div>`
      : '';

    const canCheck = A.feedback && !isRev && pending.length === it.select;
    const last = cur === A.items.length - 1;

    $('#qpane').innerHTML = `
      ${confirming ? confirmPanel() : ''}
      <div class="qcard">
        ${!sc ? ''
          : !prevScenario || prevScenario !== it.scenario || cur === 0 || A.mode !== 'full'
          ? `<div class="scenario-banner"><b>${CTX.scenarioWord}: ${esc(sc.name)}</b><div style="margin-top:4px">${esc(sc.context)}</div></div>`
          : `<div class="small muted" style="margin-bottom:6px">${CTX.scenarioWord}: ${esc(sc.name)}</div>`}
        <div class="spread">
          <div class="row">${showMeta ? `<span class="badge"><span class="dot" style="background:${dm.color}"></span>${esc(dm.short)}</span><span class="badge">${CTX.term} ${it.task}</span>` : ''}
            ${it.type === 'multi' ? `<span class="badge amber">Select ${it.select}</span>` : ''}${it.official ? '<span class="badge sky">Official sample</span>' : ''}</div>
          <div class="row">
            <button class="icon-btn ${it.flagged ? 'on' : ''}" id="btn-flag" title="Shift+F">${flagIcon}<span>${it.flagged ? 'Flagged' : 'Flag'}</span></button>
            <button class="icon-btn bm ${it.bookmarked ? 'on' : ''}" data-bookmark="${it.questionId}">${bmIcon}<span>${it.bookmarked ? 'Saved' : 'Save'}</span></button>
          </div>
        </div>
        <div class="stem">${rich(it.stem)}</div>
        <div id="opts">${opts}</div>
        ${verdict}
        <div class="qnav">
          <button class="btn" id="btn-prev" ${cur === 0 ? 'disabled' : ''}>← Previous</button>
          <div class="row">
            ${A.feedback && !isRev ? `<button class="btn primary" id="btn-check" ${canCheck ? '' : 'disabled'}>Check answer</button>` : ''}
            ${last ? `<button class="btn ${A.feedback && !isRev ? '' : 'primary'}" id="btn-finish">Finish & see results</button>` : `<button class="btn ${A.feedback && !isRev ? '' : 'primary'}" id="btn-next">Next →</button>`}
          </div>
        </div>
      </div>`;
    renderPalette();
  }

  const flagIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>';
  const bmIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';

  function confirmPanel() {
    const open = A.items.length - answeredCount();
    const flagged = A.items.filter((i) => i.flagged).length;
    return `<div class="card" style="margin-bottom:16px;border-color:var(--clay)">
      <h3>Submit this session?</h3>
      <p class="muted">${open ? `<b>${open}</b> unanswered question${open === 1 ? '' : 's'} will be marked wrong. ` : 'Every question is answered. '}${flagged ? `${flagged} flagged for review.` : ''}</p>
      <div class="row"><button class="btn primary" id="btn-confirm">Submit now</button><button class="btn" id="btn-cancel">Keep working</button></div></div>`;
  }

  function renderPalette() {
    $('#palette').innerHTML = A.items.map((it, i) => {
      const cls = [
        i === cur ? 'current' : '',
        it.flagged ? 'flagged' : '',
        revealed(it) ? (it.isCorrect ? 'ok' : 'bad') : it.selected.length ? 'answered' : '',
      ].join(' ');
      return `<button class="${cls}" data-go="${i}" title="Q${i + 1}">${i + 1}</button>`;
    }).join('');
  }

  async function choose(key) {
    const it = item();
    if (revealed(it) || !it.options.some((o) => o.key === key)) return;
    const base = A.feedback ? pending : it.selected;
    let next;
    if (it.type === 'single') next = [key];
    else if (base.includes(key)) next = base.filter((k) => k !== key);
    else if (base.length < it.select) next = [...base, key];
    else next = [...base.slice(1), key]; // replace the oldest pick when at the limit
    next.sort();
    if (A.feedback) { pending = next; render(); return; }
    it.selected = next;
    render();
    await api(`/items/${it.position}`, { method: 'PUT', body: JSON.stringify({ selected: next }) });
  }

  async function check() {
    const it = item();
    if (!A.feedback || revealed(it) || pending.length !== it.select) return;
    const r = await api(`/items/${it.position}`, { method: 'PUT', body: JSON.stringify({ selected: pending }) });
    if (r.ok) { A.items[cur] = r.item; pending = []; render(); }
  }

  async function toggleFlag() {
    const it = item();
    it.flagged = !it.flagged;
    render();
    await api(`/items/${it.position}`, { method: 'PUT', body: JSON.stringify({ flagged: it.flagged }) });
  }

  async function submit(force = false) {
    if (!force && !confirming) { confirming = true; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const r = await api('/submit', { method: 'POST' });
    if (r.ok) location.href = r.review;
  }

  const go = (i) => { if (i >= 0 && i < A.items.length) { cur = i; pending = []; confirming = false; render(); window.scrollTo({ top: 0 }); } };

  document.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t || !A) return;
    if (t.dataset.key) choose(t.dataset.key);
    else if (t.dataset.go) go(Number(t.dataset.go));
    else if (t.id === 'btn-prev') go(cur - 1);
    else if (t.id === 'btn-next') go(cur + 1);
    else if (t.id === 'btn-check') check();
    else if (t.id === 'btn-flag') toggleFlag();
    else if (t.id === 'btn-finish' || t.id === 'btn-submit') submit();
    else if (t.id === 'btn-confirm') submit(true);
    else if (t.id === 'btn-cancel') { confirming = false; render(); }
  });

  document.addEventListener('keydown', (e) => {
    if (!A || e.metaKey || e.ctrlKey || e.altKey || /INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName)) return;
    if (e.key === 'ArrowRight') go(cur + 1);
    else if (e.key === 'ArrowLeft') go(cur - 1);
    else if (e.key === 'Enter' && A.feedback) { revealed(item()) ? go(cur + 1) : check(); }
    else if (e.key === 'F' && e.shiftKey) toggleFlag();
    else if (/^[a-fA-F]$/.test(e.key) && !e.shiftKey) choose(e.key.toUpperCase());
    else return;
    e.preventDefault();
  });

  load();
})();
