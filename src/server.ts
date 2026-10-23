import express from 'express';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dbPath, saveSettings, seedQuestions, setExamDate } from './db.js';
import { AF_BASE, LEVELS, certs } from './certs.js';
import { exams } from './exams/index.js';
import type { ExamContent } from './exams/types.js';
import {
  attemptView, deleteAttempt, getAttempt, planItems, saveAnswer, setPlanItem, startAttempt, submitAttempt, toggleBookmark, type Mode,
} from './practice.js';
import { homePage } from './views/home.js';
import {
  cheatsheetPage, dashboardPage, domainPage, domainsPage, guidePage, planPage, scenariosPage, settingsPage,
} from './views/pages.js';
import { bankPage, examPage, historyPage, practicePage, reviewPage } from './views/practice.js';

const here = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 4173);
const MODES: Mode[] = ['full', 'quick', 'domain', 'task', 'scenario', 'weak', 'unseen', 'bookmarked', 'official'];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const seeded = exams.map((e) => ({ exam: e, n: seedQuestions(e) }));
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/static', express.static(join(here, 'public'), { maxAge: 0 }));

const intList = (v: unknown) => String(v ?? '').split(',').map(Number).filter((n) => Number.isInteger(n) && n > 0);

// ---------- certification hub ----------
app.get('/', (_req, res) => res.send(homePage()));
app.post('/profile', (req, res) => {
  const { name, currentLevel, targetCert } = req.body as Record<string, string>;
  saveSettings({
    name: String(name ?? '').trim().slice(0, 60),
    currentLevel: LEVELS.some((l) => l.value === currentLevel) ? currentLevel : '',
    targetCert: certs.some((c) => c.slug === targetCert) ? targetCert : '',
  });
  res.redirect('/#profile');
});

// Paths from before the site moved under /architect-foundations keep working.
const LEGACY = /^\/(plan|guide|domains|scenarios|cheatsheet|practice|history|bank|settings|exam|api)(\/|$)/;
app.use((req, res, next) => (LEGACY.test(req.path) && req.method === 'GET' ? res.redirect(301, AF_BASE + req.originalUrl) : next()));

// ---------- one study site per exam ----------
function examRouter(exam: ExamContent) {
  const B = exam.base;
  const r = express.Router();

  r.get('/', (_req, res) => res.send(dashboardPage(exam)));
  r.get('/plan', (_req, res) => res.send(planPage(exam)));
  r.get('/guide', (_req, res) => res.send(guidePage(exam)));
  r.get('/domains', (_req, res) => res.send(domainsPage(exam)));
  r.get('/domains/:slug', (req, res) => {
    const d = exam.domains.find((x) => x.slug === req.params.slug);
    if (!d) return res.redirect(`${B}/domains`);
    res.send(domainPage(exam, d));
  });
  r.get('/scenarios', (_req, res) => (exam.scenarios.length ? res.send(scenariosPage(exam)) : res.redirect(`${B}/`)));
  r.get('/cheatsheet', (_req, res) => res.send(cheatsheetPage(exam)));
  r.get('/practice', (_req, res) => res.send(practicePage(exam)));
  r.get('/history', (_req, res) => res.send(historyPage(exam)));
  r.get('/settings', (req, res) => res.send(settingsPage(exam, req.query.saved === '1')));
  r.post('/settings', (req, res) => {
    const { examDate, name, clearExam } = req.body as Record<string, string>;
    setExamDate(exam.slug, clearExam ? '' : ISO_DATE.test(examDate ?? '') ? examDate : '');
    saveSettings({ name: String(name ?? '').slice(0, 60) });
    res.redirect(`${B}/settings?saved=1`);
  });
  r.get('/bank', (req, res) => {
    const q = req.query as Record<string, string | undefined>;
    res.send(bankPage(exam, {
      domain: Number(q.domain) || undefined,
      scenario: Number(q.scenario) || undefined,
      task: q.task || undefined,
      status: q.status || undefined,
      search: q.search?.trim() || undefined,
    }));
  });

  r.get('/practice/start', (req, res) => {
    const q = req.query as Record<string, string | undefined>;
    const mode = (MODES.includes(q.mode as Mode) ? q.mode : 'quick') as Mode;
    const id = startAttempt(exam, {
      mode,
      count: Number(q.count) || undefined,
      domain: Number(q.domain) || undefined,
      tasks: q.task ? q.task.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
      scenarios: q.scenario ? intList(q.scenario) : undefined,
      feedback: q.feedback === '1' || q.feedback === 'on',
      timed: q.timed === '1',
    });
    if (!id) {
      const why: Partial<Record<Mode, string>> = {
        weak: 'No weak areas yet. Answer some questions first; otherwise everything you have answered is already solid.',
        unseen: 'You have answered every question in the bank. Try a weak-areas review or a full mock.',
        bookmarked: 'You have no bookmarked questions yet.',
      };
      return res.send(practicePage(exam, why[mode] ?? 'No questions matched that selection.'));
    }
    res.redirect(`${B}/exam/${id}`);
  });

  r.get('/exam/:id', (req, res) => {
    const a = getAttempt(exam, Number(req.params.id));
    if (!a) return res.redirect(`${B}/practice`);
    if (a.submitted_at) return res.redirect(`${B}/exam/${a.id}/review`);
    res.send(examPage(exam, a.id, a.label));
  });
  r.get('/exam/:id/review', (req, res) => {
    const a = getAttempt(exam, Number(req.params.id));
    if (!a) return res.redirect(`${B}/history`);
    if (!a.submitted_at) return res.redirect(`${B}/exam/${a.id}`);
    res.send(reviewPage(exam, a.id));
  });

  // ---------- JSON API ----------
  r.get('/api/attempts/:id', (req, res) => {
    const v = attemptView(exam, Number(req.params.id));
    if (!v) return res.status(404).json({ error: 'Not found' });
    res.json({ ...v, serverNow: new Date().toISOString() });
  });
  r.put('/api/attempts/:id/items/:pos', (req, res) => {
    const { selected, flagged } = req.body as { selected?: unknown; flagged?: unknown };
    const sel = Array.isArray(selected) ? selected.filter((s): s is string => typeof s === 'string' && /^[A-F]$/.test(s)) : undefined;
    const result = saveAnswer(exam, Number(req.params.id), Number(req.params.pos), sel, typeof flagged === 'boolean' ? flagged : undefined);
    if (!result.ok) return res.status(409).json(result);
    const v = attemptView(exam, Number(req.params.id))!;
    res.json({ ok: true, item: v.items.find((i) => i.position === Number(req.params.pos)) });
  });
  r.post('/api/attempts/:id/submit', (req, res) => {
    if (!submitAttempt(exam, Number(req.params.id))) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true, review: `${B}/exam/${req.params.id}/review` });
  });
  r.delete('/api/attempts/:id', (req, res) => {
    deleteAttempt(exam, Number(req.params.id));
    res.json({ ok: true });
  });
  r.post('/api/bookmarks/:qid', (req, res) => {
    const bookmarked = toggleBookmark(exam, req.params.qid);
    if (bookmarked === null) return res.status(404).json({ error: 'Unknown question' });
    res.json({ bookmarked });
  });
  r.post('/api/plan/:itemId', (req, res) => {
    if (!planItems(exam).some((i) => i.id === req.params.itemId)) return res.status(404).json({ error: 'Unknown plan item' });
    setPlanItem(exam, req.params.itemId, Boolean((req.body as { done?: boolean }).done));
    res.json({ ok: true });
  });
  return r;
}

for (const exam of exams) app.use(exam.base, examRouter(exam));

app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  Claude certification prep running → http://localhost:${PORT}`);
  for (const { exam, n } of seeded) console.log(`  ${exam.code}: ${n} questions at ${exam.base}`);
  console.log(`  Database: ${dbPath}\n`);
});
