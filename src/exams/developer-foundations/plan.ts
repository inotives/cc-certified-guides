import type { PlanWeek } from '../types.js';

const drill = (q: string) => `/practice/start?${q}`;
const D = {
  messages: 'https://platform.claude.com/docs/en/api/messages',
  toolUse: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview',
  streaming: 'https://platform.claude.com/docs/en/build-with-claude/streaming',
  caching: 'https://platform.claude.com/docs/en/build-with-claude/prompt-caching',
  batch: 'https://platform.claude.com/docs/en/build-with-claude/batch-processing',
  models: 'https://platform.claude.com/docs/en/about-claude/models/overview',
  prompting: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview',
  context: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
  agents: 'https://www.anthropic.com/engineering/building-effective-agents',
  sdk: 'https://platform.claude.com/docs/en/agent-sdk/overview',
  cc: 'https://code.claude.com/docs/en/overview',
  hooks: 'https://code.claude.com/docs/en/hooks',
  mcp: 'https://modelcontextprotocol.io/docs/getting-started/intro',
  tools: 'https://www.anthropic.com/engineering/writing-tools-for-agents',
  vue: 'https://www.pearsonvue.com/us/en/anthropic.html',
};

// Self-paced 21-day plan for CCDV-F. A "day" is one study session, not a calendar date. Time follows the
// blueprint weights: Applications & Integration (33%) first, then Models (17%), Agents (15%), Prompts (11%),
// Tools & MCP (11%), Security (8%), and the small Claude Code / Debugging domains alongside related work.
// Item ids are persisted in plan_progress, so keep them stable. Hrefs are relative to the exam's base path.
export const plan: PlanWeek[] = [
  {
    week: 1,
    title: 'The API and application core',
    goal: 'Master the heaviest domain, Applications and Integration (33%): API mechanics, engineering fundamentals, application design, requirements, life cycle and configuration.',
    days: [
      {
        day: 1, title: 'Orientation & diagnostic', focus: 'Blueprint, 25 skills, baseline score', domains: [],
        items: [
          { id: 'dv-d01-guide', text: 'Read the official exam guide, especially section 6 (8 domains, 25 weighted skills) and the 3 sample questions', kind: 'read', href: '/guide', minutes: 40 },
          { id: 'dv-d01-diag', text: 'Diagnostic: 20 mixed questions, untimed with instant feedback; don’t study first', kind: 'practice', href: drill('mode=quick&count=20&feedback=1'), minutes: 35 },
          { id: 'dv-d01-notes', text: 'Note your two weakest domains on the Dashboard readiness panel', kind: 'review', href: '/', minutes: 10 },
          { id: 'dv-d01-admin', text: 'Skim how booking works (Partner Academy → Pearson VUE). Don’t book yet; aim to book once a full mock scores ≥ 80%', kind: 'admin', href: D.vue, minutes: 10 },
        ],
      },
      {
        day: 2, title: 'Claude API mechanics I', focus: 'Skill 2.3: messages, roles, stop_reason, streaming', domains: [2],
        items: [
          { id: 'dv-d02-read', text: 'Read the Messages API reference and the streaming guide', kind: 'read', href: D.messages, minutes: 40 },
          { id: 'dv-d02-build', text: 'Build: a small app that calls the Messages API with a system prompt, then the same request streamed', kind: 'build', href: D.streaming, minutes: 45 },
          { id: 'dv-d02-study', text: 'Study skill 2.3 in the Domain guide (know, be able to, exam lens, traps)', kind: 'read', href: '/domains/applications-integration#t2.3', minutes: 20 },
        ],
      },
      {
        day: 3, title: 'Claude API mechanics II', focus: 'Skill 2.3: tools, vision, thinking, caching, batch, vendors', domains: [2],
        items: [
          { id: 'dv-d03-read', text: 'Read the tool use, prompt caching and Message Batches docs', kind: 'read', href: D.toolUse, minutes: 40 },
          { id: 'dv-d03-build', text: 'Build: add one tool to your app and a cached system prompt; inspect the `usage` fields', kind: 'build', href: D.caching, minutes: 40 },
          { id: 'dv-d03-drill', text: 'Drill skill 2.3', kind: 'practice', href: drill('mode=task&task=2.3&feedback=1'), minutes: 25 },
        ],
      },
      {
        day: 4, title: 'Software engineering foundations', focus: 'Skill 2.4: REST, JSON, async, VCS, review, refactoring', domains: [2],
        items: [
          { id: 'dv-d04-study', text: 'Study skill 2.4: idempotency, retries with backoff, timeouts, async concurrency, code review, refactoring', kind: 'read', href: '/domains/applications-integration#t2.4', minutes: 35 },
          { id: 'dv-d04-build', text: 'Build: wrap your API calls with retry/backoff on retryable errors and a request timeout', kind: 'build', minutes: 35 },
          { id: 'dv-d04-drill', text: 'Drill skill 2.4', kind: 'practice', href: drill('mode=task&task=2.4&feedback=1'), minutes: 30 },
        ],
      },
      {
        day: 5, title: 'Claude application design', focus: 'Skill 2.5: interfaces, content boundaries, schemas, sessions, plugins', domains: [2],
        items: [
          { id: 'dv-d05-study', text: 'Study skill 2.5, the single heaviest skill (8.6%)', kind: 'read', href: '/domains/applications-integration#t2.5', minutes: 35 },
          { id: 'dv-d05-read', text: 'Read the prompt engineering overview with an eye on separating instructions from data', kind: 'read', href: D.prompting, minutes: 25 },
          { id: 'dv-d05-drill', text: 'Drill skill 2.5', kind: 'practice', href: drill('mode=task&task=2.5&feedback=1'), minutes: 30 },
        ],
      },
      {
        day: 6, title: 'Requirements, life cycle, configuration', focus: 'Skills 2.1, 2.2, 2.6', domains: [2],
        items: [
          { id: 'dv-d06-study', text: 'Study skills 2.1, 2.2 and 2.6 (model version pinning, prompt versioning, CLAUDE.md and settings.json)', kind: 'read', href: '/domains/applications-integration', minutes: 40 },
          { id: 'dv-d06-drill', text: 'Drill skills 2.1, 2.2 and 2.6', kind: 'practice', href: drill('mode=task&task=2.1,2.2,2.6&feedback=1'), minutes: 30 },
          { id: 'dv-d06-domain', text: 'Domain 2 drill: 25 questions', kind: 'practice', href: drill('mode=domain&domain=2&count=25&feedback=1'), minutes: 40 },
        ],
      },
      {
        day: 7, title: 'Phase 1 checkpoint', focus: 'Timed Domain 2 set, review, cheat sheet', domains: [2],
        items: [
          { id: 'dv-d07-timed', text: 'Timed Domain 2 set (18 questions at exam pace, no feedback)', kind: 'practice', href: drill('mode=domain&domain=2&count=18&timed=1'), minutes: 40 },
          { id: 'dv-d07-review', text: 'Review every miss; re-read the matching skill’s exam lens and traps', kind: 'review', href: '/history', minutes: 30 },
          { id: 'dv-d07-cheat', text: 'Cheat sheet: Domain 2 rules', kind: 'review', href: '/cheatsheet', minutes: 15 },
        ],
      },
    ],
  },
  {
    week: 2,
    title: 'Models, prompts, agents & tools',
    goal: 'Cover Model Selection and Optimization (17%), Prompt and Context Engineering (11%), Agents and Workflows (15%), Tools and MCPs (11%), plus Claude Code and Debugging.',
    days: [
      {
        day: 8, title: 'LLM fundamentals & model choice', focus: 'Skills 5.1, 5.3', domains: [5],
        items: [
          { id: 'dv-d08-read', text: 'Read the models overview: Opus vs Sonnet vs Haiku, thinking and effort options', kind: 'read', href: D.models, minutes: 35 },
          { id: 'dv-d08-study', text: 'Study skills 5.1 and 5.3 (tokens, sampling, non-determinism, zero/few-shot, upgrade risks)', kind: 'read', href: '/domains/model-selection-optimization', minutes: 30 },
          { id: 'dv-d08-drill', text: 'Drill skills 5.1 and 5.3', kind: 'practice', href: drill('mode=task&task=5.1,5.3&feedback=1'), minutes: 25 },
        ],
      },
      {
        day: 9, title: 'SDKs, cost & tokens', focus: 'Skills 5.2, 5.4', domains: [5],
        items: [
          { id: 'dv-d09-study', text: 'Study skills 5.2 and 5.4 (SDKs over REST, websockets vs SSE, usage tracking, prompt caching)', kind: 'read', href: '/domains/model-selection-optimization#t5.2', minutes: 35 },
          { id: 'dv-d09-build', text: 'Build: log input, output and cache tokens per request and estimate cost per conversation', kind: 'build', href: D.caching, minutes: 35 },
          { id: 'dv-d09-drill', text: 'Domain 5 drill: 20 questions', kind: 'practice', href: drill('mode=domain&domain=5&count=20&feedback=1'), minutes: 35 },
        ],
      },
      {
        day: 10, title: 'Prompt engineering & output handling', focus: 'Skills 6.2, 6.3', domains: [6],
        items: [
          { id: 'dv-d10-read', text: 'Read the prompt engineering guide (clarity, examples, system vs user placement)', kind: 'read', href: D.prompting, minutes: 35 },
          { id: 'dv-d10-build', text: 'Build: structured output with a schema plus validation and defensive parsing', kind: 'build', minutes: 35 },
          { id: 'dv-d10-drill', text: 'Drill skills 6.2 and 6.3', kind: 'practice', href: drill('mode=task&task=6.2,6.3&feedback=1'), minutes: 25 },
        ],
      },
      {
        day: 11, title: 'Context engineering & debugging', focus: 'Skills 6.1, 4.1', domains: [6, 4],
        items: [
          { id: 'dv-d11-read', text: 'Read “Effective context engineering for AI agents”', kind: 'read', href: D.context, minutes: 30 },
          { id: 'dv-d11-study', text: 'Study skills 6.1 and 4.1 (pruning, compaction, isolation; error types, traces, integration vs model faults)', kind: 'read', href: '/domains/prompt-context-engineering#t6.1', minutes: 30 },
          { id: 'dv-d11-drill', text: 'Drill skills 6.1 and 4.1', kind: 'practice', href: drill('mode=task&task=6.1,4.1&feedback=1'), minutes: 30 },
        ],
      },
      {
        day: 12, title: 'Agent architecture & patterns', focus: 'Skills 1.1, 1.3', domains: [1],
        items: [
          { id: 'dv-d12-read', text: 'Read “Building effective agents” (workflows vs agents, common patterns)', kind: 'read', href: D.agents, minutes: 35 },
          { id: 'dv-d12-study', text: 'Study skills 1.1 and 1.3 (supervisor hierarchies, subagents, memory, frameworks)', kind: 'read', href: '/domains/agents-workflows', minutes: 30 },
          { id: 'dv-d12-drill', text: 'Drill skills 1.1 and 1.3', kind: 'practice', href: drill('mode=task&task=1.1,1.3&feedback=1'), minutes: 25 },
        ],
      },
      {
        day: 13, title: 'Building agents & Claude Code', focus: 'Skills 1.2, 3.1', domains: [1, 3],
        items: [
          { id: 'dv-d13-build', text: 'Build: a small agent with the Claude Agent SDK, with one hook that blocks a risky action', kind: 'build', href: D.sdk, minutes: 45 },
          { id: 'dv-d13-cc', text: 'Claude Code tour: CLAUDE.md hierarchy, `/init`, settings.json, slash commands, headless `-p` mode', kind: 'read', href: D.cc, minutes: 30 },
          { id: 'dv-d13-drill', text: 'Domain 1 drill (20) and skill 3.1', kind: 'practice', href: drill('mode=task&task=1.2,3.1&feedback=1'), minutes: 30 },
        ],
      },
      {
        day: 14, title: 'Tools & MCP', focus: 'Skills 8.1, 8.2, 8.3', domains: [8],
        items: [
          { id: 'dv-d14-read', text: 'Read “Writing effective tools for agents” and the MCP introduction', kind: 'read', href: D.tools, minutes: 35 },
          { id: 'dv-d14-build', text: 'Build: a tiny MCP server exposing one tool and one resource; connect it to Claude Code', kind: 'build', href: D.mcp, minutes: 45 },
          { id: 'dv-d14-drill', text: 'Domain 8 drill: 20 questions', kind: 'practice', href: drill('mode=domain&domain=8&count=20&feedback=1'), minutes: 35 },
        ],
      },
    ],
  },
  {
    week: 3,
    title: 'Security, full mocks & remediation',
    goal: 'Close Security and Safety (8%), then sit three timed 53-question mocks with remediation in between. Aim for ≥ 80% on mocks.',
    days: [
      {
        day: 15, title: 'Security & safety', focus: 'Skills 7.1–7.4', domains: [7],
        items: [
          { id: 'dv-d15-study', text: 'Study skills 7.1–7.4: prompt injection, untrusted input, guardrail layering, hooks, secrets and keys', kind: 'read', href: '/domains/security-safety', minutes: 40 },
          { id: 'dv-d15-read', text: 'Read the Claude Code hooks reference (blocking destructive actions)', kind: 'read', href: D.hooks, minutes: 20 },
          { id: 'dv-d15-drill', text: 'Domain 7 drill', kind: 'practice', href: drill('mode=domain&domain=7&count=20&feedback=1'), minutes: 30 },
        ],
      },
      {
        day: 16, title: 'Full mock exam #1', focus: '53 questions · 120 minutes', domains: [1, 2, 3, 4, 5, 6, 7, 8],
        items: [
          { id: 'dv-d16-mock', text: 'Full mock #1 under exam conditions (no notes, single sitting)', kind: 'mock', href: drill('mode=full'), minutes: 120 },
          { id: 'dv-d16-review', text: 'Review every question, including correct ones you guessed', kind: 'review', href: '/history', minutes: 45 },
        ],
      },
      {
        day: 17, title: 'Remediation I', focus: 'Your two weakest domains', domains: [],
        items: [
          { id: 'dv-d17-weak', text: 'Weak-areas drill (questions you missed or haven’t mastered)', kind: 'practice', href: drill('mode=weak&count=25&feedback=1'), minutes: 40 },
          { id: 'dv-d17-reread', text: 'Re-read the skills in your weakest domain (the Dashboard shows it)', kind: 'read', href: '/domains', minutes: 40 },
        ],
      },
      {
        day: 18, title: 'Full mock exam #2', focus: '53 questions · 120 minutes', domains: [1, 2, 3, 4, 5, 6, 7, 8],
        items: [
          { id: 'dv-d18-mock', text: 'Full mock #2 (prefers questions you haven’t seen)', kind: 'mock', href: drill('mode=full'), minutes: 120 },
          { id: 'dv-d18-review', text: 'Review misses and tag the pattern (wrong constraint? insecure shortcut? wrong extension point?)', kind: 'review', href: '/history', minutes: 40 },
        ],
      },
      {
        day: 19, title: 'Remediation II', focus: 'Unseen questions + memorisation', domains: [],
        items: [
          { id: 'dv-d19-unseen', text: 'Unseen-questions sweep (30)', kind: 'practice', href: drill('mode=unseen&count=30&feedback=1'), minutes: 45 },
          { id: 'dv-d19-cheat', text: 'Memorise the cheat sheet, weighting your time toward Domains 2 and 5', kind: 'review', href: '/cheatsheet', minutes: 30 },
          { id: 'dv-d19-bm', text: 'Redo your bookmarked questions', kind: 'practice', href: drill('mode=bookmarked&feedback=1'), minutes: 20 },
        ],
      },
      {
        day: 20, title: 'Full mock exam #3', focus: 'Final calibration, target ≥ 80%', domains: [1, 2, 3, 4, 5, 6, 7, 8],
        items: [
          { id: 'dv-d20-mock', text: 'Full mock #3', kind: 'mock', href: drill('mode=full'), minutes: 120 },
          { id: 'dv-d20-review', text: 'Light review of misses only', kind: 'review', href: '/history', minutes: 25 },
          { id: 'dv-d20-admin', text: 'If you’re at ≥ 80%, book the exam and add the date in Settings. Logistics: government photo ID (name matches registration), quiet room, clear desk, online-proctor system test', kind: 'admin', href: D.vue, minutes: 20 },
        ],
      },
      {
        day: 21, title: 'Final review', focus: 'Keep it light', domains: [],
        items: [
          { id: 'dv-d21-official', text: 'Redo the 3 official sample questions and read the rationale', kind: 'practice', href: drill('mode=official&feedback=1'), minutes: 10 },
          { id: 'dv-d21-cheat', text: 'One calm pass through the cheat sheet', kind: 'review', href: '/cheatsheet', minutes: 20 },
          { id: 'dv-d21-rest', text: 'Do this day again the day before your booked exam. Stop studying by early evening and sleep well', kind: 'admin', minutes: 0 },
        ],
      },
    ],
  },
];

export const allPlanItems = plan.flatMap((w) => w.days.flatMap((d) => d.items));
