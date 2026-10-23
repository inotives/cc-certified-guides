import type { PlanWeek } from '../types.js';
import { LINKS as L } from './domains.js';

const drill = (q: string) => `/practice/start?${q}`;
const guide = '/guide';

// Self-paced 21-day plan. A "day" is one study session (~1.5–2.5 h), not a calendar date; the
// current day is the first day with unchecked items. Hrefs are relative to the exam's base path.
export const plan: PlanWeek[] = [
  {
    week: 1,
    title: 'Foundations & the heaviest domain',
    goal: 'Know the blueprint cold, build intuition for agentic loops and orchestration (27%), and nail tool design & MCP (18%).',
    days: [
      {
        day: 1,
        title: 'Orientation & diagnostic',
        focus: 'Blueprint, scenarios, baseline score',
        domains: [],
        items: [
          { id: 'd01-guide', text: 'Read the official exam guide end to end (format, 6 scenarios, 30 task statements, out-of-scope list)', kind: 'read', href: guide, minutes: 45 },
          { id: 'd01-diag', text: 'Diagnostic: 20 mixed questions, untimed with instant feedback — don’t study first', kind: 'practice', href: drill('mode=quick&count=20&feedback=1'), minutes: 35 },
          { id: 'd01-notes', text: 'Note your two weakest domains on the Dashboard readiness panel', kind: 'review', href: '/', minutes: 10 },
          { id: 'd01-admin', text: 'Skim how booking works (Partner Academy → Pearson VUE). Don’t book yet; aim to book once a full mock scores ≥ 80%', kind: 'admin', href: 'https://www.pearsonvue.com/us/en/anthropic.html', minutes: 10 },
        ],
      },
      {
        day: 2,
        title: 'The agentic loop & hooks',
        focus: 'Task statements 1.1, 1.5',
        domains: [1],
        items: [
          { id: 'd02-read', text: 'Study 1.1 and 1.5 in the Domain guide; read Agent SDK overview + hooks docs', kind: 'read', href: '/domains/agentic-architecture', minutes: 40 },
          { id: 'd02-build', text: 'Build: a minimal loop that continues on stop_reason "tool_use", appends tool_result, ends on "end_turn" (Exercise 1, step 2)', kind: 'build', href: L.sdkHooks.url, minutes: 45 },
          { id: 'd02-drill', text: 'Drill tasks 1.1 + 1.5', kind: 'practice', href: drill('mode=task&task=1.1,1.5&feedback=1'), minutes: 20 },
        ],
      },
      {
        day: 3,
        title: 'Multi-agent orchestration',
        focus: 'Task statements 1.2, 1.3',
        domains: [1],
        items: [
          { id: 'd03-read', text: 'Read “How we built our multi-agent research system” + Agent SDK subagents docs', kind: 'read', href: L.research.url, minutes: 40 },
          { id: 'd03-study', text: 'Study 1.2 / 1.3: hub-and-spoke, Task tool, allowedTools, explicit context passing, parallel Task calls', kind: 'read', href: '/domains/agentic-architecture', minutes: 25 },
          { id: 'd03-build', text: 'Build: coordinator + 2 subagents; pass findings explicitly in prompts (Exercise 4, steps 1–2)', kind: 'build', minutes: 40 },
          { id: 'd03-drill', text: 'Drill tasks 1.2 + 1.3', kind: 'practice', href: drill('mode=task&task=1.2,1.3&feedback=1'), minutes: 20 },
        ],
      },
      {
        day: 4,
        title: 'Enforcement, decomposition, sessions',
        focus: 'Task statements 1.4, 1.6, 1.7',
        domains: [1],
        items: [
          { id: 'd04-study', text: 'Study 1.4 (programmatic gates vs prompts, handoffs), 1.6 (chaining vs adaptive), 1.7 (--resume, fork_session)', kind: 'read', href: '/domains/agentic-architecture', minutes: 40 },
          { id: 'd04-build', text: 'Build: a hook that blocks process_refund > $500 and redirects to escalation (Exercise 1, step 4)', kind: 'build', minutes: 35 },
          { id: 'd04-drill', text: 'Domain 1 drill — 25 questions', kind: 'practice', href: drill('mode=domain&domain=1&count=25&feedback=1'), minutes: 40 },
        ],
      },
      {
        day: 5,
        title: 'Tool design & structured errors',
        focus: 'Task statements 2.1, 2.2, 2.3',
        domains: [2],
        items: [
          { id: 'd05-read', text: 'Read “Writing effective tools for agents” + tool_choice docs', kind: 'read', href: L.tools.url, minutes: 35 },
          { id: 'd05-study', text: 'Study 2.1–2.3: descriptions, isError + errorCategory/isRetryable, tool scoping, auto/any/forced', kind: 'read', href: '/domains/tool-design-mcp', minutes: 30 },
          { id: 'd05-build', text: 'Build: two similar tools with sharp descriptions + structured error payloads (Exercise 1, steps 1 & 3)', kind: 'build', minutes: 35 },
          { id: 'd05-drill', text: 'Drill tasks 2.1–2.3', kind: 'practice', href: drill('mode=task&task=2.1,2.2,2.3&feedback=1'), minutes: 20 },
        ],
      },
      {
        day: 6,
        title: 'MCP integration & built-in tools',
        focus: 'Task statements 2.4, 2.5',
        domains: [2],
        items: [
          { id: 'd06-read', text: 'Read Claude Code MCP docs (scopes, .mcp.json, env expansion) + MCP resources spec', kind: 'read', href: L.ccMcp.url, minutes: 35 },
          { id: 'd06-build', text: 'Configure: team server in .mcp.json with ${TOKEN}; personal server in ~/.claude.json; confirm both load (Exercise 2, step 4)', kind: 'build', minutes: 30 },
          { id: 'd06-drill', text: 'Domain 2 drill — 20 questions', kind: 'practice', href: drill('mode=domain&domain=2&count=20&feedback=1'), minutes: 35 },
        ],
      },
      {
        day: 7,
        title: 'Phase 1 checkpoint',
        focus: 'Scenarios 1 & 3, consolidate',
        domains: [1, 2],
        items: [
          { id: 'd07-s1', text: 'Scenario drill: Customer Support Resolution Agent (15)', kind: 'practice', href: drill('mode=scenario&scenario=1&count=15'), minutes: 30 },
          { id: 'd07-s3', text: 'Scenario drill: Multi-Agent Research System (15)', kind: 'practice', href: drill('mode=scenario&scenario=3&count=15'), minutes: 30 },
          { id: 'd07-review', text: 'Review every miss; re-read the matching task statement’s Exam lens & Traps', kind: 'review', href: '/history', minutes: 30 },
          { id: 'd07-cheat', text: 'First pass of the Cheat sheet (decision rules for D1/D2)', kind: 'review', href: '/cheatsheet', minutes: 15 },
        ],
      },
    ],
  },
  {
    week: 2,
    title: 'Claude Code, prompts & structured output',
    goal: 'Master Claude Code configuration (20%) and prompt engineering / structured output (20%); start context & reliability (15%).',
    days: [
      {
        day: 8,
        title: 'CLAUDE.md hierarchy & path rules',
        focus: 'Task statements 3.1, 3.3',
        domains: [3],
        items: [
          { id: 'd08-read', text: 'Read Claude Code memory docs: user/project/directory CLAUDE.md, @import, .claude/rules/ with paths', kind: 'read', href: L.ccMemory.url, minutes: 30 },
          { id: 'd08-build', text: 'Configure a real repo: project CLAUDE.md, rules with paths: ["**/*.test.*"], verify with /memory (Exercise 2, steps 1–2)', kind: 'build', minutes: 40 },
          { id: 'd08-drill', text: 'Drill tasks 3.1 + 3.3', kind: 'practice', href: drill('mode=task&task=3.1,3.3&feedback=1'), minutes: 20 },
        ],
      },
      {
        day: 9,
        title: 'Commands, skills & plan mode',
        focus: 'Task statements 3.2, 3.4',
        domains: [3],
        items: [
          { id: 'd09-read', text: 'Read slash commands + skills docs (context: fork, allowed-tools, argument-hint) and subagents (Explore)', kind: 'read', href: L.ccSkills.url, minutes: 35 },
          { id: 'd09-build', text: 'Build: a project skill with context: fork + allowed-tools; a /review command in .claude/commands/ (Exercise 2, step 3)', kind: 'build', minutes: 35 },
          { id: 'd09-plan', text: 'Try plan mode vs direct on: one-file bug, multi-file migration, feature with 2 valid designs (Exercise 2, step 5)', kind: 'build', minutes: 25 },
          { id: 'd09-drill', text: 'Drill tasks 3.2 + 3.4', kind: 'practice', href: drill('mode=task&task=3.2,3.4&feedback=1'), minutes: 20 },
        ],
      },
      {
        day: 10,
        title: 'Iterative refinement & CI/CD',
        focus: 'Task statements 3.5, 3.6',
        domains: [3],
        items: [
          { id: 'd10-read', text: 'Read headless mode / CLI reference: -p, --output-format json, --json-schema', kind: 'read', href: L.ccHeadless.url, minutes: 25 },
          { id: 'd10-build', text: 'Build: a CI step running claude -p with --output-format json and a findings schema', kind: 'build', minutes: 35 },
          { id: 'd10-drill', text: 'Domain 3 drill — 25 questions', kind: 'practice', href: drill('mode=domain&domain=3&count=25&feedback=1'), minutes: 40 },
          { id: 'd10-s2', text: 'Scenario drill: Code Generation with Claude Code (12)', kind: 'practice', href: drill('mode=scenario&scenario=2&count=12'), minutes: 25 },
        ],
      },
      {
        day: 11,
        title: 'Explicit criteria & few-shot',
        focus: 'Task statements 4.1, 4.2',
        domains: [4],
        items: [
          { id: 'd11-read', text: 'Read prompt engineering overview + multishot prompting', kind: 'read', href: L.multishot.url, minutes: 30 },
          { id: 'd11-study', text: 'Study 4.1 / 4.2: categorical report/skip criteria, severity examples, 2–4 targeted examples with reasoning', kind: 'read', href: '/domains/prompt-engineering', minutes: 25 },
          { id: 'd11-build', text: 'Rewrite a noisy review prompt with explicit criteria + 3 few-shot examples; compare false positives', kind: 'build', minutes: 35 },
          { id: 'd11-drill', text: 'Drill tasks 4.1 + 4.2', kind: 'practice', href: drill('mode=task&task=4.1,4.2&feedback=1'), minutes: 20 },
        ],
      },
      {
        day: 12,
        title: 'Structured output & validation loops',
        focus: 'Task statements 4.3, 4.4',
        domains: [4],
        items: [
          { id: 'd12-read', text: 'Read tool use implementation (tool_choice) + structured outputs docs', kind: 'read', href: L.toolImpl.url, minutes: 30 },
          { id: 'd12-build', text: 'Build: extraction tool with nullable fields, enum "other"+detail, validation-retry loop (Exercise 3, steps 1–2)', kind: 'build', minutes: 50 },
          { id: 'd12-drill', text: 'Drill tasks 4.3 + 4.4', kind: 'practice', href: drill('mode=task&task=4.3,4.4&feedback=1'), minutes: 20 },
        ],
      },
      {
        day: 13,
        title: 'Batches & multi-pass review',
        focus: 'Task statements 4.5, 4.6',
        domains: [4],
        items: [
          { id: 'd13-read', text: 'Read Message Batches API docs: 50% cost, ≤24h, custom_id, no multi-turn tools', kind: 'read', href: L.batch.url, minutes: 25 },
          { id: 'd13-build', text: 'Design on paper: batch cadence for a 30h SLA; resubmit-by-custom_id flow (Exercise 3, step 4)', kind: 'build', minutes: 20 },
          { id: 'd13-drill', text: 'Domain 4 drill — 25 questions', kind: 'practice', href: drill('mode=domain&domain=4&count=25&feedback=1'), minutes: 40 },
          { id: 'd13-s56', text: 'Scenario drills: CI/CD (12) and Structured Data Extraction (12)', kind: 'practice', href: drill('mode=scenario&scenario=5,6&count=24'), minutes: 45 },
        ],
      },
      {
        day: 14,
        title: 'Context, escalation, error propagation',
        focus: 'Task statements 5.1, 5.2, 5.3',
        domains: [5],
        items: [
          { id: 'd14-read', text: 'Read “Effective context engineering for AI agents”', kind: 'read', href: L.ctxEng.url, minutes: 30 },
          { id: 'd14-study', text: 'Study 5.1–5.3: case-facts block, lost-in-the-middle, escalation triggers, structured error context', kind: 'read', href: '/domains/context-reliability', minutes: 30 },
          { id: 'd14-drill', text: 'Drill tasks 5.1–5.3', kind: 'practice', href: drill('mode=task&task=5.1,5.2,5.3&feedback=1'), minutes: 25 },
          { id: 'd14-cheat', text: 'Cheat sheet pass for D3/D4 (flags, paths, tool_choice, batch facts)', kind: 'review', href: '/cheatsheet', minutes: 15 },
        ],
      },
    ],
  },
  {
    week: 3,
    title: 'Reliability, full mocks & remediation',
    goal: 'Close Domain 5, then sit three timed full-length mocks with targeted remediation between them. Aim for ≥ 80% on mocks.',
    days: [
      {
        day: 15,
        title: 'Large codebases, human review, provenance',
        focus: 'Task statements 5.4, 5.5, 5.6',
        domains: [5],
        items: [
          { id: 'd15-study', text: 'Study 5.4–5.6: scratchpads, manifests, /compact, stratified sampling, calibrated confidence, claim–source mappings', kind: 'read', href: '/domains/context-reliability', minutes: 40 },
          { id: 'd15-build', text: 'Exercise 4 steps 3–5: structured findings with source + date, simulated timeout, conflicting statistics', kind: 'build', minutes: 40 },
          { id: 'd15-drill', text: 'Domain 5 drill — 20 questions', kind: 'practice', href: drill('mode=domain&domain=5&count=20&feedback=1'), minutes: 35 },
        ],
      },
      {
        day: 16,
        title: 'Full mock exam #1',
        focus: '60 questions · 120 minutes · 4 random scenarios',
        domains: [1, 2, 3, 4, 5],
        items: [
          { id: 'd16-mock', text: 'Full mock #1 under exam conditions (no notes, single sitting)', kind: 'mock', href: drill('mode=full'), minutes: 120 },
          { id: 'd16-review', text: 'Review every question — including correct ones you guessed', kind: 'review', href: '/history', minutes: 45 },
        ],
      },
      {
        day: 17,
        title: 'Remediation I',
        focus: 'Your two weakest domains',
        domains: [],
        items: [
          { id: 'd17-weak', text: 'Weak-areas drill (questions you missed or haven’t mastered)', kind: 'practice', href: drill('mode=weak&count=25&feedback=1'), minutes: 40 },
          { id: 'd17-reread', text: 'Re-read task statements for your weakest domain (Dashboard shows it)', kind: 'read', href: '/domains', minutes: 40 },
          { id: 'd17-s4', text: 'Scenario drill: Developer Productivity with Claude (15)', kind: 'practice', href: drill('mode=scenario&scenario=4&count=15'), minutes: 30 },
        ],
      },
      {
        day: 18,
        title: 'Full mock exam #2',
        focus: '60 questions · 120 minutes',
        domains: [1, 2, 3, 4, 5],
        items: [
          { id: 'd18-mock', text: 'Full mock #2 (prefers questions you haven’t seen)', kind: 'mock', href: drill('mode=full'), minutes: 120 },
          { id: 'd18-review', text: 'Review misses; tag patterns (scope? enforcement? first-step proportionality?)', kind: 'review', href: '/history', minutes: 40 },
        ],
      },
      {
        day: 19,
        title: 'Remediation II',
        focus: 'Unseen questions + memorisation',
        domains: [],
        items: [
          { id: 'd19-unseen', text: 'Unseen-questions sweep (30)', kind: 'practice', href: drill('mode=unseen&count=30&feedback=1'), minutes: 45 },
          { id: 'd19-cheat', text: 'Memorise the Cheat sheet: CLI flags, file paths, tool_choice, batch limits, error categories', kind: 'review', href: '/cheatsheet', minutes: 30 },
          { id: 'd19-bm', text: 'Redo your bookmarked questions', kind: 'practice', href: drill('mode=bookmarked&feedback=1'), minutes: 20 },
        ],
      },
      {
        day: 20,
        title: 'Full mock exam #3',
        focus: 'Final calibration — target ≥ 80%',
        domains: [1, 2, 3, 4, 5],
        items: [
          { id: 'd20-mock', text: 'Full mock #3', kind: 'mock', href: drill('mode=full'), minutes: 120 },
          { id: 'd20-review', text: 'Light review of misses only', kind: 'review', href: '/history', minutes: 25 },
          { id: 'd20-admin', text: 'If you’re at ≥ 80%, book the exam and add the date in Settings. Logistics: government photo ID (name matches registration), quiet room, clear desk, online-proctor system test', kind: 'admin', href: 'https://www.pearsonvue.com/us/en/anthropic.html', minutes: 20 },
        ],
      },
      {
        day: 21,
        title: 'Final review',
        focus: 'Keep it light',
        domains: [],
        items: [
          { id: 'd21-official', text: 'Redo the 12 official sample questions and read every explanation', kind: 'practice', href: drill('mode=official&feedback=1'), minutes: 25 },
          { id: 'd21-cheat', text: 'One calm pass through the Cheat sheet', kind: 'review', href: '/cheatsheet', minutes: 20 },
          { id: 'd21-rest', text: 'Do this day again the day before your booked exam. Stop studying by early evening and sleep well', kind: 'admin', minutes: 0 },
        ],
      },
    ],
  },
];

export const allPlanItems = plan.flatMap((w) => w.days.flatMap((d) => d.items));
