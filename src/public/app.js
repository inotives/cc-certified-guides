// Site-wide interactions: theme, mobile nav, plan checkboxes, bookmarks, history actions, review filters.
(() => {
  const root = document.documentElement;
  const BASE = document.body.dataset.base || '';

  document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
    const dark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch {}
  });

  document.querySelector('[data-nav-toggle]')?.addEventListener('click', () => document.body.classList.toggle('nav-open'));

  document.addEventListener('change', async (e) => {
    const box = e.target.closest?.('[data-plan-item]');
    if (!box) return;
    box.closest('.check')?.classList.toggle('done', box.checked);
    const res = await fetch(`${BASE}/api/plan/${box.dataset.planItem}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ done: box.checked }),
    });
    if (!res.ok) { box.checked = !box.checked; box.closest('.check')?.classList.toggle('done', box.checked); }
  });

  document.addEventListener('click', async (e) => {
    const bm = e.target.closest?.('[data-bookmark]');
    if (bm) {
      e.preventDefault();
      e.stopPropagation();
      const res = await fetch(`${BASE}/api/bookmarks/${bm.dataset.bookmark}`, { method: 'POST' });
      const { bookmarked } = await res.json();
      bm.classList.toggle('on', bookmarked);
      const label = bm.querySelector('span');
      if (label) label.textContent = bookmarked ? 'Saved' : 'Save';
      return;
    }

    const day = e.target.closest?.('[data-complete-day]');
    if (day) {
      day.disabled = true;
      await Promise.all(day.dataset.completeDay.split(',').filter(Boolean).map((id) =>
        fetch(`${BASE}/api/plan/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ done: true }) })));
      location.reload();
      return;
    }

    const del = e.target.closest?.('[data-delete-attempt]');
    if (del) {
      if (del.dataset.armed !== '1') {
        del.dataset.armed = '1';
        del.textContent = 'Delete?';
        del.classList.remove('ghost');
        setTimeout(() => { del.dataset.armed = ''; del.textContent = '✕'; del.classList.add('ghost'); }, 3000);
        return;
      }
      await fetch(`${BASE}/api/attempts/${del.dataset.deleteAttempt}`, { method: 'DELETE' });
      location.reload();
      return;
    }

    const f = e.target.closest?.('[data-review-filter] [data-f]');
    if (f) {
      e.preventDefault();
      f.parentElement.querySelectorAll('a').forEach((a) => a.classList.toggle('active', a === f));
      document.querySelectorAll('.review-item').forEach((it) => {
        const show = f.dataset.f === 'all' || (f.dataset.f === 'wrong' && it.dataset.correct === '0') || (f.dataset.f === 'flagged' && it.dataset.flagged === '1');
        it.style.display = show ? '' : 'none';
      });
    }
  });
})();
