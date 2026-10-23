export interface Link {
  label: string;
  url: string;
}

export interface TaskStatement {
  id: string;
  title: string;
  /** Official skill weight (% of the whole exam), when the guide publishes one. */
  weight?: number;
  /** Official one-paragraph objective description, when the guide gives prose instead of bullets. */
  description?: string;
  /** "Knowledge of" bullets (official for CCAR-F; study notes for exams whose guide is prose-only). */
  knowledge: string[];
  /** "Skills in" bullets. */
  skills: string[];
  /** Decision rules distilled for answering scenario questions. */
  examLens: string[];
  /** Distractor patterns that show up as wrong answers. */
  traps: string[];
  /** Further reading for this objective. */
  links?: Link[];
  /** Study diagrams, rendered as inline SVG above the notes. */
  diagrams?: Diagram[];
}

/** Box colour in a diagram; maps to a theme token pair in styles.css (`.dg-<tone>`). */
export type DiagramTone = 'plain' | 'accent' | 'good' | 'sky' | 'warn' | 'amber';

/**
 * A study diagram. Text may use `backticks` for code; no HTML.
 * - flow: boxes top to bottom, optional side note per step, optional loop back to the first step.
 * - decision: one question fanning out to "when → then" rows.
 * - compare: side-by-side columns of bullets.
 * - layers: stacked bars, optionally with an axis arrow (e.g. precedence).
 */
export type Diagram =
  | { kind: 'flow'; title: string; steps: { label: string; note?: string; tone?: DiagramTone }[]; loop?: string }
  | { kind: 'decision'; title: string; question: string; branches: { when: string; then: string; tone?: DiagramTone }[] }
  | { kind: 'compare'; title: string; columns: { head: string; items: string[]; tone?: DiagramTone }[] }
  | { kind: 'layers'; title: string; layers: { label: string; note?: string; tone?: DiagramTone }[]; axis?: { label: string; dir: 'up' | 'down' } };

export interface Domain {
  id: number;
  slug: string;
  name: string;
  short: string;
  weight: number;
  /** Approximate scored items on one exam form. */
  items: number;
  summary: string;
  tasks: TaskStatement[];
  links: Link[];
}

export interface Scenario {
  id: number;
  slug: string;
  name: string;
  context: string;
  domains: number[];
  watchFor: string[];
}

export interface PlanItem {
  id: string;
  text: string;
  kind: 'read' | 'build' | 'practice' | 'review' | 'mock' | 'admin';
  /** Optional in-app link (relative to the exam's base path, e.g. a drill) or an external URL. */
  href?: string;
  minutes: number;
}

export interface PlanDay {
  day: number;
  title: string;
  focus: string;
  domains: number[];
  items: PlanItem[];
}

export interface PlanWeek {
  week: number;
  title: string;
  goal: string;
  days: PlanDay[];
}

export interface Question {
  id: string;
  /** Scenario id, or 0 for exams without scenarios. */
  scenario: number;
  domain: number;
  task: string;
  type: 'single' | 'multi';
  select: number;
  stem: string;
  options: { key: string; text: string }[];
  answer: string[];
  explanation: string;
  distractors: Record<string, string>;
  difficulty: 1 | 2 | 3;
  tags: string[];
}

/** Everything that defines one exam's study site. Content only; no view code. */
export interface ExamContent {
  /** Matches the cert slug in src/certs.ts and the `cert` column in SQLite. */
  slug: string;
  base: string;
  /** Short brand, e.g. "CCA-F". */
  brand: string;
  code: string;
  name: string;
  domains: Domain[];
  /** Empty when the exam isn't scenario-based. */
  scenarios: Scenario[];
  plan: PlanWeek[];
  questionsDir: string;
  /** Path of the extracted official guide, relative to the repo root. */
  guideFile: string;
  /** True when objective bullets are study notes (notes/*.json) rather than official guide text. */
  studyNotes?: boolean;
  mock: {
    items: number;
    minutes: number;
    /** Items per domain on a full mock; must sum to `items`. */
    domainTargets: Record<number, number>;
    /** Scenario-based exams: how many scenarios one sitting draws. */
    scenariosPerSitting?: number;
  };
  /** Number of official sample questions in the bank (tag `official-sample`). */
  officialSamples: number;
}
