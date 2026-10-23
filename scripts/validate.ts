// Validates every exam's question bank, study notes and diagrams.
// Usage: npm run validate [-- <file.json> ...]   (defaults to all question and notes files)
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { exams } from '../src/exams/index.js';
import type { Diagram, ExamContent } from '../src/exams/types.js';
import { diagrams as devDiagrams } from '../src/exams/developer-foundations/diagrams.js';

const only = new Set(process.argv.slice(2).map((f) => resolve(f)));
const want = (f: string) => !only.size || only.has(resolve(f));
const DOC_HOSTS = /^https:\/\/(support\.claude\.com|privacy\.claude\.com|claude\.com|www\.claude\.com|platform\.claude\.com|code\.claude\.com|docs\.claude\.com|modelcontextprotocol\.io|www\.anthropic\.com|docs\.anthropic\.com|github\.com\/anthropics|anthropic\.skilljar\.com)\//;

let errors = 0;
const err = (file: string, id: string, msg: string) => { errors++; console.error(`✗ ${file.split('/').pop()} [${id}] ${msg}`); };
const listJson = (dir: string) => { try { return readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => join(dir, f)); } catch { return []; } };

function validateQuestions(exam: ExamContent, seen: Set<string>) {
  const tasks = new Map(exam.domains.flatMap((d) => d.tasks.map((t) => [t.id, d.id] as const)));
  const scenarioIds = new Set(exam.scenarios.map((s) => s.id));
  let total = 0;
  for (const file of listJson(exam.questionsDir).filter(want)) {
    let data: any[];
    try { data = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { err(file, '-', `invalid JSON: ${(e as Error).message}`); continue; }
    if (!Array.isArray(data)) { err(file, '-', 'top level must be an array'); continue; }
    const letters: Record<string, number> = {};
    let singles = 0, longest = 0;
    for (const q of data) {
      total++;
      const id = q.id ?? '?';
      if (typeof q.id !== 'string' || !q.id) err(file, id, 'missing id');
      if (seen.has(q.id)) err(file, id, 'duplicate id (ids must be unique across all exams)');
      seen.add(q.id);
      if (scenarioIds.size ? !scenarioIds.has(q.scenario) : q.scenario !== 0) err(file, id, scenarioIds.size ? `scenario must be one of ${[...scenarioIds]}` : 'scenario must be 0 (exam has no scenarios)');
      if (tasks.get(q.task) !== q.domain) err(file, id, `task ${q.task} does not belong to domain ${q.domain}`);
      if (!['single', 'multi'].includes(q.type)) err(file, id, 'type must be single|multi');
      if (typeof q.stem !== 'string' || q.stem.length < 40) err(file, id, 'stem too short');
      if (!Array.isArray(q.options)) { err(file, id, 'options missing'); continue; }
      const keys: string[] = q.options.map((o: any) => o.key);
      if (keys.join('') !== 'ABCDEF'.slice(0, keys.length)) err(file, id, 'option keys must be A,B,C,... in order');
      if (q.type === 'single' && keys.length !== 4) err(file, id, 'single must have 4 options');
      if (q.type === 'multi' && (keys.length < 5 || keys.length > 6)) err(file, id, 'multi must have 5-6 options');
      for (const o of q.options) if (typeof o.text !== 'string' || o.text.length < 3) err(file, id, `option ${o.key} text missing`);
      if (!Array.isArray(q.answer) || !q.answer.length) err(file, id, 'answer must be a non-empty array');
      else {
        if (q.answer.some((a: string) => !keys.includes(a))) err(file, id, 'answer references unknown key');
        if (q.type === 'single' && q.answer.length !== 1) err(file, id, 'single must have exactly 1 answer');
        if (q.type === 'multi' && (q.answer.length < 2 || q.answer.length !== q.select)) err(file, id, 'multi: answer length must equal select (>=2)');
        if (q.type === 'single') {
          singles++;
          letters[q.answer[0]] = (letters[q.answer[0]] ?? 0) + 1;
          const L = q.options.map((o: any) => o.text.length);
          const a = keys.indexOf(q.answer[0]);
          if (L[a] === Math.max(...L) && L.filter((v: number) => v === L[a]).length === 1) longest++;
        }
      }
      if (typeof q.explanation !== 'string' || q.explanation.length < 60) err(file, id, 'explanation too short');
      if (!q.distractors || typeof q.distractors !== 'object') err(file, id, 'distractors object missing');
      else for (const k of keys) if (!q.answer?.includes(k) && !q.distractors[k]) err(file, id, `no distractor rationale for ${k}`);
      if (![1, 2, 3].includes(q.difficulty)) err(file, id, 'difficulty must be 1-3');
      if (!Array.isArray(q.tags)) err(file, id, 'tags must be an array');
      const text = [q.stem, q.explanation, ...q.options.map((o: any) => o.text), ...Object.values(q.distractors ?? {})].join(' ');
      if (/\b[Oo]ptions?\s+[A-F]\b|\([A-F]\)/.test(text)) err(file, id, 'refers to an option by letter (options are shuffled at runtime)');
    }
    const official = data.every((q) => q.tags?.includes('official-sample'));
    console.log(`${exam.slug}/${file.split('/').pop()}: ${data.length} questions · letters ${JSON.stringify(letters)}${official ? '' : ` · correct-is-longest ${longest}/${singles}`}`);
  }
  return total;
}

function validateNotes(exam: ExamContent) {
  const dir = join(exam.questionsDir, '..', 'notes');
  const tasks = new Set(exam.domains.flatMap((d) => d.tasks.map((t) => t.id)));
  for (const file of listJson(dir).filter(want)) {
    let data: any[];
    try { data = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { err(file, '-', `invalid JSON: ${(e as Error).message}`); continue; }
    for (const n of data) {
      const id = n.task ?? '?';
      if (!tasks.has(n.task)) err(file, id, 'unknown task id');
      for (const [k, min] of [['knowledge', 3], ['skills', 3], ['examLens', 2], ['traps', 2], ['cheat', 2], ['links', 1]] as const)
        if (!Array.isArray(n[k]) || n[k].length < min) err(file, id, `${k} needs at least ${min} entries`);
      for (const l of n.links ?? []) if (!l?.label || !DOC_HOSTS.test(l?.url ?? '')) err(file, id, `link must be an official Anthropic/MCP doc URL: ${l?.url}`);
      for (const c of n.cheat ?? []) if (!Array.isArray(c) || c.length !== 2) err(file, id, 'cheat rows must be [situation, answer]');
    }
    console.log(`${exam.slug}/notes/${file.split('/').pop()}: ${data.length} skills`);
  }
}

const TONES = new Set(['plain', 'accent', 'good', 'sky', 'warn', 'amber']);
const str = (v: unknown) => typeof v === 'string' && v.trim().length > 0;

/** Structural check for one diagram (notes JSON isn't type-checked). Returns problems, empty when valid. */
function diagramProblems(d: any): string[] {
  const p: string[] = [];
  if (!str(d?.title)) p.push('missing title');
  const texts: string[] = [d?.title];
  const tone = (t: unknown) => { if (t !== undefined && !TONES.has(t as string)) p.push(`unknown tone "${t}"`); };
  switch (d?.kind) {
    case 'flow':
      if (!Array.isArray(d.steps) || d.steps.length < 2) p.push('flow needs at least 2 steps');
      for (const s of d.steps ?? []) { if (!str(s?.label)) p.push('flow step without label'); texts.push(s?.label, s?.note); tone(s?.tone); }
      texts.push(d.loop);
      break;
    case 'decision':
      if (!str(d.question)) p.push('decision needs a question');
      if (!Array.isArray(d.branches) || d.branches.length < 2) p.push('decision needs at least 2 branches');
      for (const b of d.branches ?? []) { if (!str(b?.when) || !str(b?.then)) p.push('branch needs when and then'); texts.push(b?.when, b?.then); tone(b?.tone); }
      texts.push(d.question);
      break;
    case 'compare':
      if (!Array.isArray(d.columns) || d.columns.length < 2 || d.columns.length > 4) p.push('compare needs 2–4 columns');
      for (const c of d.columns ?? []) {
        if (!str(c?.head) || !Array.isArray(c?.items) || !c.items.length) p.push('column needs head and items');
        texts.push(c?.head, ...(c?.items ?? [])); tone(c?.tone);
      }
      break;
    case 'layers':
      if (!Array.isArray(d.layers) || d.layers.length < 2) p.push('layers needs at least 2 layers');
      for (const l of d.layers ?? []) { if (!str(l?.label)) p.push('layer without label'); texts.push(l?.label, l?.note); tone(l?.tone); }
      if (d.axis && (!str(d.axis.label) || !['up', 'down'].includes(d.axis.dir))) p.push('axis needs label and dir up/down');
      break;
    default:
      p.push(`unknown diagram kind "${d?.kind}"`);
  }
  for (const t of texts) if (typeof t === 'string' && /[<>]/.test(t.replace(/`[^`]*`/g, ''))) p.push(`HTML outside backticks in "${t}"`);
  return p;
}

/** Every objective's diagrams (from notes JSON or a typed diagrams.ts) must be well-formed. */
function validateDiagrams(exam: ExamContent, extra: Record<string, Diagram[]> = {}) {
  const tasks = exam.domains.flatMap((d) => d.tasks);
  const ids = new Set(tasks.map((t) => t.id));
  for (const id of Object.keys(extra)) if (!ids.has(id)) err('diagrams.ts', id, 'unknown task id');
  let n = 0;
  for (const t of tasks) for (const d of t.diagrams ?? []) { n++; for (const p of diagramProblems(d)) err(`${exam.slug} diagrams`, t.id, p); }
  if (!n) return;
  const missing = tasks.filter((t) => !t.diagrams?.length).map((t) => t.id);
  console.log(`${exam.slug} diagrams: ${n}${missing.length ? ` · none yet for ${missing.join(', ')}` : ' · every objective covered'}`);
}

const seen = new Set<string>();
let total = 0;
for (const exam of exams) {
  total += validateQuestions(exam, seen);
  validateNotes(exam);
  validateDiagrams(exam, exam.slug === 'developer-foundations' ? devDiagrams : {});
}
console.log(errors ? `\n${errors} error(s)` : `\n✓ ${total} questions valid`);
process.exit(errors ? 1 : 0);
