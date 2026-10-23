import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Diagram, Link, TaskStatement } from './types.js';

// Study notes for exams whose guide gives only a title or one paragraph per objective (CCDV-F, CCAO-F).
// Each exam keeps one or more notes/*.json files; entries are merged into its objectives by id.

export interface StudyNotes {
  task: string;
  knowledge: string[];
  skills: string[];
  examLens: string[];
  traps: string[];
  links: Link[];
  /** Cheat-sheet rows: [situation, answer]. */
  cheat: [string, string][];
  /** Optional study diagrams (same shape as `TaskStatement.diagrams`). */
  diagrams?: Diagram[];
}

export const loadNotes = (dir: string): Map<string, StudyNotes> => new Map(
  readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as StudyNotes[])
    .map((n) => [n.task, n]),
);

export type ObjectiveDef = Pick<TaskStatement, 'id' | 'title' | 'weight' | 'description'>;

/** An objective with its study notes merged in; `diagrams` adds to any the notes file carries. */
export const withNotes = (notes: Map<string, StudyNotes>, s: ObjectiveDef, diagrams: Diagram[] = []): TaskStatement => {
  const n = notes.get(s.id);
  const all = [...(n?.diagrams ?? []), ...diagrams];
  return {
    ...s, knowledge: n?.knowledge ?? [], skills: n?.skills ?? [], examLens: n?.examLens ?? [], traps: n?.traps ?? [],
    links: n?.links ?? [], diagrams: all.length ? all : undefined,
  };
};
