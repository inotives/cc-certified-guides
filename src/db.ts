import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ExamContent, Question } from './exams/types.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = process.env.CCA_DATA_DIR ?? join(root, 'data');
mkdirSync(dataDir, { recursive: true });

export const dbPath = join(dataDir, 'cca-prep.db');
export const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  scenario INTEGER NOT NULL,
  domain INTEGER NOT NULL,
  task TEXT NOT NULL,
  type TEXT NOT NULL,
  select_count INTEGER NOT NULL,
  stem TEXT NOT NULL,
  options TEXT NOT NULL,
  answer TEXT NOT NULL,
  explanation TEXT NOT NULL,
  distractors TEXT NOT NULL,
  difficulty INTEGER NOT NULL,
  tags TEXT NOT NULL,
  official INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS plan_progress (item_id TEXT PRIMARY KEY, done_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS bookmarks (question_id TEXT PRIMARY KEY REFERENCES questions(id), created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mode TEXT NOT NULL,
  label TEXT NOT NULL,
  feedback INTEGER NOT NULL DEFAULT 0,
  time_limit_sec INTEGER,
  scenarios TEXT NOT NULL DEFAULT '[]',
  started_at TEXT NOT NULL,
  submitted_at TEXT,
  correct INTEGER,
  total INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS attempt_items (
  attempt_id INTEGER NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  question_id TEXT NOT NULL REFERENCES questions(id),
  option_order TEXT NOT NULL,
  selected TEXT NOT NULL DEFAULT '[]',
  flagged INTEGER NOT NULL DEFAULT 0,
  is_correct INTEGER,
  answered_at TEXT,
  PRIMARY KEY (attempt_id, position)
);
CREATE INDEX IF NOT EXISTS idx_items_question ON attempt_items(question_id);
`);

// Multi-exam migration: every exam-owned table carries a `cert` slug. Rows that predate it belong to
// Architect – Foundations, the first exam this app supported.
const LEGACY_CERT = 'architect-foundations';
for (const table of ['questions', 'attempts', 'plan_progress']) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === 'cert')) db.exec(`ALTER TABLE ${table} ADD COLUMN cert TEXT NOT NULL DEFAULT '${LEGACY_CERT}'`);
}
db.exec(`CREATE INDEX IF NOT EXISTS idx_questions_cert ON questions(cert, active);
CREATE INDEX IF NOT EXISTS idx_attempts_cert ON attempts(cert);`);
// The single exam date became per-exam.
db.exec(`INSERT OR IGNORE INTO settings (key, value) SELECT 'examDate:${LEGACY_CERT}', value FROM settings WHERE key = 'examDate';
DELETE FROM settings WHERE key = 'examDate';`);

export const now = () => new Date().toISOString();

/**
 * Upsert one exam's question bank files; questions removed from the files are deactivated, not deleted
 * (history keeps them).
 */
export function seedQuestions(exam: ExamContent): number {
  let files: string[] = [];
  try { files = readdirSync(exam.questionsDir).filter((f) => f.endsWith('.json')); } catch { /* no bank yet */ }
  const all: Question[] = files.flatMap((f) => JSON.parse(readFileSync(join(exam.questionsDir, f), 'utf8')) as Question[]);

  const upsert = db.prepare(`
    INSERT INTO questions (id, cert, scenario, domain, task, type, select_count, stem, options, answer, explanation, distractors, difficulty, tags, official, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(id) DO UPDATE SET cert=excluded.cert, scenario=excluded.scenario, domain=excluded.domain, task=excluded.task, type=excluded.type,
      select_count=excluded.select_count, stem=excluded.stem, options=excluded.options, answer=excluded.answer,
      explanation=excluded.explanation, distractors=excluded.distractors, difficulty=excluded.difficulty,
      tags=excluded.tags, official=excluded.official, active=1`);

  db.exec('BEGIN');
  try {
    db.prepare('UPDATE questions SET active = 0 WHERE cert = ?').run(exam.slug);
    for (const q of all) {
      upsert.run(
        q.id, exam.slug, q.scenario, q.domain, q.task, q.type, q.select, q.stem,
        JSON.stringify(q.options), JSON.stringify(q.answer), q.explanation,
        JSON.stringify(q.distractors), q.difficulty, JSON.stringify(q.tags),
        q.tags.includes('official-sample') ? 1 : 0,
      );
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  return all.length;
}

export interface QuestionRow {
  id: string;
  scenario: number;
  domain: number;
  task: string;
  type: 'single' | 'multi';
  select_count: number;
  stem: string;
  options: string;
  answer: string;
  explanation: string;
  distractors: string;
  difficulty: number;
  tags: string;
  official: number;
}

export function parseQuestion(r: QuestionRow): Question & { official: boolean } {
  return {
    id: r.id,
    scenario: r.scenario,
    domain: r.domain,
    task: r.task,
    type: r.type,
    select: r.select_count,
    stem: r.stem,
    options: JSON.parse(r.options),
    answer: JSON.parse(r.answer),
    explanation: r.explanation,
    distractors: JSON.parse(r.distractors),
    difficulty: r.difficulty as 1 | 2 | 3,
    tags: JSON.parse(r.tags),
    official: r.official === 1,
  };
}

// ---- settings ----

/** Home-page profile, shared by every exam: currentLevel is a LEVELS value, targetCert a cert slug ('' = not set). */
export const DEFAULT_SETTINGS = { name: '', currentLevel: '', targetCert: '' };
export type Settings = typeof DEFAULT_SETTINGS;

export function getSettings(): Settings {
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const s = { ...DEFAULT_SETTINGS };
  for (const r of rows) if (r.key in s) (s as Record<string, string>)[r.key] = r.value;
  return s;
}

export function saveSettings(patch: Partial<Settings>) {
  const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  for (const [k, v] of Object.entries(patch)) if (k in DEFAULT_SETTINGS && typeof v === 'string') stmt.run(k, v);
}

/** Booked exam date per exam ('' = not booked). The study plans are self-paced, so this is optional. */
export function getExamDate(cert: string): string {
  const r = db.prepare('SELECT value FROM settings WHERE key = ?').get(`examDate:${cert}`) as { value: string } | undefined;
  return r?.value ?? '';
}

export function setExamDate(cert: string, date: string) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(`examDate:${cert}`, date);
}
