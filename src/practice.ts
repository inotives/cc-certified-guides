import { db, now, parseQuestion, type QuestionRow } from './db.js';
import type { ExamContent } from './exams/types.js';

// Everything here is scoped to one exam: questions, attempts and plan progress carry its `cert` slug.

export type Mode = 'full' | 'quick' | 'domain' | 'task' | 'scenario' | 'weak' | 'unseen' | 'bookmarked' | 'official';

export interface StartOptions {
  mode: Mode;
  count?: number;
  domain?: number;
  tasks?: string[];
  scenarios?: number[];
  feedback?: boolean;
  timed?: boolean;
}

interface Candidate {
  id: string;
  scenario: number;
  domain: number;
  seen: number;
  wrong: number;
  lastCorrect: number | null;
  rand: number;
}

const shuffle = <T>(a: T[]): T[] => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function candidates(exam: ExamContent, where = '1=1', ...params: (string | number)[]): Candidate[] {
  const rows = db
    .prepare(
      `SELECT q.id, q.scenario, q.domain,
         COUNT(i.question_id) AS seen,
         COALESCE(SUM(CASE WHEN i.is_correct = 0 THEN 1 ELSE 0 END), 0) AS wrong,
         (SELECT i2.is_correct FROM attempt_items i2 WHERE i2.question_id = q.id AND i2.is_correct IS NOT NULL
            ORDER BY i2.answered_at DESC LIMIT 1) AS lastCorrect
       FROM questions q
       LEFT JOIN attempt_items i ON i.question_id = q.id AND i.is_correct IS NOT NULL
       WHERE q.active = 1 AND q.cert = ? AND ${where}
       GROUP BY q.id`,
    )
    .all(exam.slug, ...params) as unknown as Omit<Candidate, 'rand'>[];
  return rows.map((r) => ({ ...r, rand: Math.random() }));
}

// Least-seen first, random within the same exposure level.
const byFreshness = (a: Candidate, b: Candidate) => a.seen - b.seen || a.rand - b.rand;

/** Take the freshest question from whichever domain is furthest below its blueprint target. */
function takeByDeficit(avail: Candidate[], deficit: Record<number, number>) {
  avail.sort((a, b) => (deficit[b.domain] ?? 0) - (deficit[a.domain] ?? 0) || byFreshness(a, b));
  const pick = avail[0];
  deficit[pick.domain] = (deficit[pick.domain] ?? 0) - 1;
  return pick;
}

function pickFull(exam: ExamContent): { ids: string[]; scenarios: number[] } {
  const { items, domainTargets, scenariosPerSitting } = exam.mock;
  const deficit = { ...domainTargets };
  const used = new Set<string>();

  if (!exam.scenarios.length || !scenariosPerSitting) {
    const pool = candidates(exam);
    const chosen: Candidate[] = [];
    while (chosen.length < items) {
      const avail = pool.filter((c) => !used.has(c.id));
      if (!avail.length) break;
      const pick = takeByDeficit(avail, deficit);
      used.add(pick.id);
      chosen.push(pick);
    }
    return { ids: shuffle(chosen).map((c) => c.id), scenarios: [] };
  }

  const scenarioIds = shuffle(exam.scenarios.map((s) => s.id)).slice(0, scenariosPerSitting).sort((a, b) => a - b);
  const pool = candidates(exam, `q.scenario IN (${scenarioIds.join(',')})`).sort(byFreshness);
  const perScenario = Math.floor(items / scenariosPerSitting);
  const chosen = new Map<number, Candidate[]>(scenarioIds.map((s) => [s, []]));
  // Round-robin across scenarios so each gets an equal share while domains track the blueprint.
  for (let round = 0; round < perScenario; round++) {
    for (const s of scenarioIds) {
      const avail = pool.filter((c) => c.scenario === s && !used.has(c.id));
      if (!avail.length) continue;
      const pick = takeByDeficit(avail, deficit);
      used.add(pick.id);
      chosen.get(s)!.push(pick);
    }
  }
  // Questions are grouped by scenario as on the real exam; shuffled within each scenario.
  return { ids: scenarioIds.flatMap((s) => shuffle(chosen.get(s)!).map((c) => c.id)), scenarios: scenarioIds };
}

function label(exam: ExamContent, o: StartOptions): string {
  switch (o.mode) {
    case 'full': return 'Full mock exam';
    case 'quick': return 'Quick mixed practice';
    case 'domain': return `Domain ${o.domain} drill · ${exam.domains.find((d) => d.id === o.domain)?.short ?? ''}`;
    case 'task': return `${exam.scenarios.length ? 'Task' : 'Skill'} drill · ${o.tasks?.join(', ')}`;
    case 'scenario': return `${exam.caseStudies ? 'Case study' : 'Scenario'} drill · ${o.scenarios?.map((s) => exam.scenarios.find((x) => x.id === s)?.name).join(' + ')}`;
    case 'weak': return 'Weak areas review';
    case 'unseen': return 'Unseen questions';
    case 'bookmarked': return 'Bookmarked questions';
    case 'official': return 'Official sample questions';
  }
}

export function startAttempt(exam: ExamContent, o: StartOptions): number {
  let ids: string[] = [];
  let scenarios: number[] = [];
  const count = Math.max(1, Math.min(o.count ?? 20, 120));

  switch (o.mode) {
    case 'full':
      ({ ids, scenarios } = pickFull(exam));
      break;
    case 'quick':
      ids = candidates(exam).sort(byFreshness).slice(0, count).map((c) => c.id);
      break;
    case 'domain':
      ids = candidates(exam, 'q.domain = ?', o.domain ?? 1).sort(byFreshness).slice(0, count).map((c) => c.id);
      break;
    case 'task': {
      const tasks = o.tasks?.length ? o.tasks : [exam.domains[0].tasks[0].id];
      ids = candidates(exam, `q.task IN (${tasks.map(() => '?').join(',')})`, ...tasks).sort(byFreshness).slice(0, o.count ?? 30).map((c) => c.id);
      break;
    }
    case 'scenario': {
      if (!exam.scenarios.length) break;
      scenarios = o.scenarios?.length ? o.scenarios : [exam.scenarios[0].id];
      ids = candidates(exam, `q.scenario IN (${scenarios.map(() => '?').join(',')})`, ...scenarios).sort(byFreshness).slice(0, count).map((c) => c.id);
      break;
    }
    case 'weak':
      // Most recently wrong first, then by historical miss rate.
      ids = candidates(exam)
        .filter((c) => c.seen > 0 && (c.lastCorrect === 0 || c.wrong / c.seen > 0.34))
        .sort((a, b) => (a.lastCorrect ?? 1) - (b.lastCorrect ?? 1) || b.wrong / b.seen - a.wrong / a.seen || a.rand - b.rand)
        .slice(0, count)
        .map((c) => c.id);
      break;
    case 'unseen':
      ids = candidates(exam).filter((c) => c.seen === 0).sort(byFreshness).slice(0, count).map((c) => c.id);
      break;
    case 'bookmarked':
      ids = candidates(exam, 'q.id IN (SELECT question_id FROM bookmarks)').sort(byFreshness).map((c) => c.id);
      break;
    case 'official':
      ids = candidates(exam, 'q.official = 1').sort((a, b) => a.id.localeCompare(b.id)).map((c) => c.id);
      break;
  }
  if (o.mode !== 'full' && o.mode !== 'official') shuffle(ids);
  if (!ids.length) return 0;

  const full = o.mode === 'full';
  const timeLimit = full ? exam.mock.minutes * 60 : o.timed ? ids.length * 120 : null;
  const feedback = full ? 0 : o.feedback ? 1 : 0;

  db.exec('BEGIN');
  try {
    const res = db
      .prepare('INSERT INTO attempts (cert, mode, label, feedback, time_limit_sec, scenarios, started_at, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(exam.slug, o.mode, label(exam, o), feedback, timeLimit, JSON.stringify(scenarios), now(), ids.length);
    const attemptId = Number(res.lastInsertRowid);
    const optStmt = db.prepare('SELECT options FROM questions WHERE id = ?');
    const ins = db.prepare('INSERT INTO attempt_items (attempt_id, position, question_id, option_order) VALUES (?, ?, ?, ?)');
    ids.forEach((qid, i) => {
      const opts = JSON.parse((optStmt.get(qid) as { options: string }).options) as { key: string }[];
      ins.run(attemptId, i + 1, qid, JSON.stringify(shuffle(opts.map((x) => x.key))));
    });
    db.exec('COMMIT');
    return attemptId;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

export interface AttemptRow {
  id: number;
  cert: string;
  mode: Mode;
  label: string;
  feedback: number;
  time_limit_sec: number | null;
  scenarios: string;
  started_at: string;
  submitted_at: string | null;
  correct: number | null;
  total: number;
}

interface ItemRow {
  position: number;
  question_id: string;
  option_order: string;
  selected: string;
  flagged: number;
  is_correct: number | null;
}

/** An attempt, only if it belongs to this exam. */
export const getAttempt = (exam: ExamContent, id: number) =>
  db.prepare('SELECT * FROM attempts WHERE id = ? AND cert = ?').get(id, exam.slug) as AttemptRow | undefined;

const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));

/**
 * Client view of an attempt. Options are relabelled A, B, C… in their shuffled order; `selected` and
 * answers are expressed in display letters. Answers/explanations are only included once revealed.
 */
export function attemptView(exam: ExamContent, id: number) {
  const a = getAttempt(exam, id);
  if (!a) return undefined;
  const items = db.prepare('SELECT * FROM attempt_items WHERE attempt_id = ? ORDER BY position').all(id) as unknown as ItemRow[];
  const qStmt = db.prepare('SELECT * FROM questions WHERE id = ?');
  const bookmarked = new Set((db.prepare('SELECT question_id FROM bookmarks').all() as { question_id: string }[]).map((r) => r.question_id));
  const submitted = !!a.submitted_at;

  return {
    id: a.id,
    mode: a.mode,
    label: a.label,
    feedback: a.feedback === 1,
    timeLimitSec: a.time_limit_sec,
    startedAt: a.started_at,
    submittedAt: a.submitted_at,
    scenarios: JSON.parse(a.scenarios) as number[],
    correct: a.correct,
    total: a.total,
    items: items.map((it) => {
      const q = parseQuestion(qStmt.get(it.question_id) as unknown as QuestionRow);
      const order = JSON.parse(it.option_order) as string[];
      const toDisplay = (orig: string) => String.fromCharCode(65 + order.indexOf(orig));
      const reveal = submitted || (a.feedback === 1 && it.is_correct !== null);
      return {
        position: it.position,
        questionId: q.id,
        scenario: q.scenario,
        domain: q.domain,
        task: q.task,
        type: q.type,
        select: q.select,
        stem: q.stem,
        official: q.official,
        bookmarked: bookmarked.has(q.id),
        options: order.map((orig, i) => ({
          key: String.fromCharCode(65 + i),
          text: q.options.find((o) => o.key === orig)!.text,
          ...(reveal ? { correct: q.answer.includes(orig), rationale: q.distractors[orig] ?? null } : {}),
        })),
        selected: (JSON.parse(it.selected) as string[]).map(toDisplay).sort(),
        flagged: it.flagged === 1,
        isCorrect: reveal ? it.is_correct === 1 : null,
        ...(reveal ? { answer: q.answer.map(toDisplay).sort(), explanation: q.explanation, difficulty: q.difficulty } : {}),
      };
    }),
  };
}

function itemFor(attemptId: number, position: number) {
  return db.prepare('SELECT * FROM attempt_items WHERE attempt_id = ? AND position = ?').get(attemptId, position) as unknown as ItemRow | undefined;
}

/** Save an answer (display letters). In feedback mode the item is graded immediately and locked. */
export function saveAnswer(exam: ExamContent, attemptId: number, position: number, displaySelected: string[] | undefined, flagged: boolean | undefined) {
  const a = getAttempt(exam, attemptId);
  const it = itemFor(attemptId, position);
  if (!a || !it || a.submitted_at) return { ok: false as const, error: 'Attempt is closed or item not found' };
  if (a.feedback === 1 && it.is_correct !== null && displaySelected) return { ok: false as const, error: 'Already answered' };

  if (flagged !== undefined) db.prepare('UPDATE attempt_items SET flagged = ? WHERE attempt_id = ? AND position = ?').run(flagged ? 1 : 0, attemptId, position);
  if (displaySelected) {
    const order = JSON.parse(it.option_order) as string[];
    const orig = displaySelected.map((k) => order[k.charCodeAt(0) - 65]).filter(Boolean);
    let isCorrect: number | null = null;
    if (a.feedback === 1) {
      const ans = JSON.parse((db.prepare('SELECT answer FROM questions WHERE id = ?').get(it.question_id) as { answer: string }).answer) as string[];
      isCorrect = sameSet(orig, ans) ? 1 : 0;
    }
    db.prepare('UPDATE attempt_items SET selected = ?, answered_at = ?, is_correct = ? WHERE attempt_id = ? AND position = ?')
      .run(JSON.stringify(orig), now(), isCorrect, attemptId, position);
  }
  return { ok: true as const };
}

export function submitAttempt(exam: ExamContent, attemptId: number) {
  const a = getAttempt(exam, attemptId);
  if (!a) return false;
  if (a.submitted_at) return true;
  const items = db.prepare('SELECT * FROM attempt_items WHERE attempt_id = ?').all(attemptId) as unknown as ItemRow[];
  const ansStmt = db.prepare('SELECT answer FROM questions WHERE id = ?');
  const upd = db.prepare('UPDATE attempt_items SET is_correct = ?, answered_at = COALESCE(answered_at, ?) WHERE attempt_id = ? AND position = ?');
  let correct = 0;
  const ts = now();
  db.exec('BEGIN');
  for (const it of items) {
    const ans = JSON.parse((ansStmt.get(it.question_id) as { answer: string }).answer) as string[];
    const ok = sameSet(JSON.parse(it.selected), ans) ? 1 : 0;
    correct += ok;
    upd.run(ok, ts, attemptId, it.position);
  }
  db.prepare('UPDATE attempts SET submitted_at = ?, correct = ? WHERE id = ?').run(ts, correct, attemptId);
  db.exec('COMMIT');
  return true;
}

export function deleteAttempt(exam: ExamContent, attemptId: number) {
  db.prepare('DELETE FROM attempts WHERE id = ? AND cert = ?').run(attemptId, exam.slug);
}

/** Toggle a bookmark on one of this exam's questions; returns the new state, or null for a foreign id. */
export function toggleBookmark(exam: ExamContent, questionId: string): boolean | null {
  if (!db.prepare('SELECT 1 FROM questions WHERE id = ? AND cert = ?').get(questionId, exam.slug)) return null;
  const exists = db.prepare('SELECT 1 FROM bookmarks WHERE question_id = ?').get(questionId);
  if (exists) db.prepare('DELETE FROM bookmarks WHERE question_id = ?').run(questionId);
  else db.prepare('INSERT INTO bookmarks (question_id, created_at) VALUES (?, ?)').run(questionId, now());
  return !exists;
}

/** Rough linear mapping of percent-correct to the 100–1000 scale. Anthropic's real scaling is not published. */
export const estimateScaled = (pct: number) => Math.round(100 + 900 * pct);

export function stats(exam: ExamContent) {
  const c = exam.slug;
  const domainRows = db
    .prepare(
      `SELECT q.domain AS domain,
         (SELECT COUNT(*) FROM questions q2 WHERE q2.active = 1 AND q2.cert = q.cert AND q2.domain = q.domain) AS bank,
         COUNT(DISTINCT i.question_id) AS seenUnique,
         COUNT(i.question_id) AS answered,
         COALESCE(SUM(i.is_correct), 0) AS correct
       FROM questions q LEFT JOIN attempt_items i ON i.question_id = q.id AND i.is_correct IS NOT NULL
       WHERE q.active = 1 AND q.cert = ? GROUP BY q.domain ORDER BY q.domain`,
    )
    .all(c) as { domain: number; bank: number; seenUnique: number; answered: number; correct: number }[];

  // Recent accuracy: last 30 graded answers per domain.
  const recentStmt = db.prepare(
    `SELECT i.is_correct FROM attempt_items i JOIN questions q ON q.id = i.question_id
     WHERE q.cert = ? AND q.domain = ? AND i.is_correct IS NOT NULL ORDER BY i.answered_at DESC LIMIT 30`,
  );
  const byDomain = domainRows.map((r) => {
    const recent = recentStmt.all(c, r.domain) as { is_correct: number }[];
    const recentPct = recent.length ? recent.reduce((s, x) => s + x.is_correct, 0) / recent.length : null;
    return { ...r, accuracy: r.answered ? r.correct / r.answered : null, recentPct, recentN: recent.length };
  });

  const scenarioRows = db
    .prepare(
      `SELECT q.scenario AS scenario, COUNT(i.question_id) AS answered, COALESCE(SUM(i.is_correct), 0) AS correct
       FROM questions q LEFT JOIN attempt_items i ON i.question_id = q.id AND i.is_correct IS NOT NULL
       WHERE q.active = 1 AND q.cert = ? AND q.scenario > 0 GROUP BY q.scenario ORDER BY q.scenario`,
    )
    .all(c) as { scenario: number; answered: number; correct: number }[];

  const taskRows = db
    .prepare(
      `SELECT q.task AS task, COUNT(i.question_id) AS answered, COALESCE(SUM(i.is_correct), 0) AS correct,
         (SELECT COUNT(*) FROM questions q2 WHERE q2.active = 1 AND q2.cert = q.cert AND q2.task = q.task) AS bank
       FROM questions q LEFT JOIN attempt_items i ON i.question_id = q.id AND i.is_correct IS NOT NULL
       WHERE q.active = 1 AND q.cert = ? GROUP BY q.task`,
    )
    .all(c) as { task: string; answered: number; correct: number; bank: number }[];

  const attempts = db.prepare('SELECT * FROM attempts WHERE cert = ? ORDER BY started_at DESC').all(c) as unknown as AttemptRow[];
  const totals = db.prepare('SELECT COUNT(*) AS bank FROM questions WHERE active = 1 AND cert = ?').get(c) as { bank: number };
  const seen = db.prepare(
    `SELECT COUNT(DISTINCT i.question_id) AS n FROM attempt_items i JOIN questions q ON q.id = i.question_id
     WHERE q.cert = ? AND i.is_correct IS NOT NULL`,
  ).get(c) as { n: number };
  const bookmarks = db.prepare('SELECT COUNT(*) AS n FROM bookmarks b JOIN questions q ON q.id = b.question_id WHERE q.cert = ?').get(c) as { n: number };

  // Weighted readiness: blueprint-weighted recent accuracy (only once every domain has some data).
  const weighted = byDomain.length && byDomain.every((d) => d.recentPct !== null)
    ? byDomain.reduce((s, d) => s + (d.recentPct ?? 0) * (exam.domains.find((x) => x.id === d.domain)!.weight / 100), 0)
    : null;

  return { byDomain, byScenario: scenarioRows, byTask: taskRows, attempts, bank: totals.bank, seenUnique: seen.n, bookmarks: bookmarks.n, weighted };
}

export const planItems = (exam: ExamContent) => exam.plan.flatMap((w) => w.days.flatMap((d) => d.items));

export function planDone(exam: ExamContent): Set<string> {
  return new Set((db.prepare('SELECT item_id FROM plan_progress WHERE cert = ?').all(exam.slug) as { item_id: string }[]).map((r) => r.item_id));
}

/** Self-paced position: the current day is the first day with an unchecked item. */
export function planPosition(exam: ExamContent, done = planDone(exam)) {
  const days = exam.plan.flatMap((w) => w.days);
  const daysDone = days.filter((d) => d.items.every((i) => done.has(i.id))).length;
  const next = days.find((d) => d.items.some((i) => !done.has(i.id)));
  return { day: next?.day ?? days.length, totalDays: days.length, daysDone, complete: !next, done };
}

export function setPlanItem(exam: ExamContent, itemId: string, done: boolean) {
  if (done) db.prepare('INSERT OR REPLACE INTO plan_progress (item_id, cert, done_at) VALUES (?, ?, ?)').run(itemId, exam.slug, now());
  else db.prepare('DELETE FROM plan_progress WHERE item_id = ? AND cert = ?').run(itemId, exam.slug);
}
