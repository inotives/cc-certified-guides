import type { PlanWeek } from '../types.js';

const drill = (q: string) => `/practice/start?${q}`;
const domain = (id: number) => drill(`mode=domain&domain=${id}&count=15&feedback=1`);
const vue = 'https://www.pearsonvue.com/us/en/anthropic.html';

// Self-paced 21-day plan for CCAO-F. A "day" is one study session, not a calendar date. Time follows the
// blueprint weights: Output Evaluation (21%) gets the most, then Workflow & Design (16%), Governance (15%),
// Prompting (14%), Product & Model (12%), Configuration (12%) and Troubleshooting (10%).
// The exam rewards hands-on habit, so most days include a short exercise in claude.ai.
// Item ids are persisted in plan_progress, so keep them stable. Hrefs are relative to the exam's base path.
export const plan: PlanWeek[] = [
  {
    week: 1,
    title: 'Prompting and checking Claude’s work',
    goal: 'Build the two habits the exam leans on most: asking clearly (Prompting, 14%) and never trusting output unchecked (Output Evaluation, 21%).',
    days: [
      {
        day: 1, title: 'Orientation & diagnostic', focus: 'Blueprint, 30 task statements, baseline score', domains: [],
        items: [
          { id: 'as-d01-guide', text: 'Read the Exam focus page: format, the 7 domains and their weights, and how to think on this exam', kind: 'read', href: '/guide', minutes: 25 },
          { id: 'as-d01-samples', text: 'Answer the 3 official sample questions and read why each answer is right', kind: 'practice', href: drill('mode=official&feedback=1'), minutes: 10 },
          { id: 'as-d01-diag', text: 'Diagnostic: 20 mixed questions with instant feedback; don’t study first', kind: 'practice', href: drill('mode=quick&count=20&feedback=1'), minutes: 35 },
          { id: 'as-d01-notes', text: 'Note your two weakest domains on the Dashboard readiness panel', kind: 'review', href: '/', minutes: 5 },
          { id: 'as-d01-admin', text: 'Skim how booking works (Partner Academy → Pearson VUE). Don’t book yet; aim to book once a full mock scores ≥ 80%', kind: 'admin', href: vue, minutes: 10 },
        ],
      },
      {
        day: 2, title: 'Writing effective prompts', focus: '1.1 effective prompts, 1.2 task decomposition', domains: [1],
        items: [
          { id: 'as-d02-study', text: 'Study 1.1 and 1.2 in the Domain guide: diagrams first, then exam lens and traps', kind: 'read', href: '/domains/prompting-task-execution', minutes: 30 },
          { id: 'as-d02-build', text: 'Hands-on: take a real work request, rewrite it with goal, audience, context, format and an example, and compare the two outputs', kind: 'build', minutes: 30 },
          { id: 'as-d02-drill', text: 'Drill 1.1 and 1.2', kind: 'practice', href: drill('mode=task&task=1.1,1.2&feedback=1'), minutes: 20 },
        ],
      },
      {
        day: 3, title: 'Iterating and adapting prompts', focus: '1.3 iteration, 1.4 strategy by task type', domains: [1],
        items: [
          { id: 'as-d03-study', text: 'Study 1.3 and 1.4: how analysis, research, drafting and brainstorming prompts differ', kind: 'read', href: '/domains/prompting-task-execution#t1.3', minutes: 25 },
          { id: 'as-d03-build', text: 'Hands-on: improve one prompt over three rounds, changing one thing at a time; note what each change did', kind: 'build', minutes: 30 },
          { id: 'as-d03-drill', text: 'Domain 1 drill (15)', kind: 'practice', href: domain(1), minutes: 25 },
        ],
      },
      {
        day: 4, title: 'Accuracy and hallucinations', focus: '2.1 accuracy & completeness, 2.2 hallucinations, inconsistency, bias', domains: [2],
        items: [
          { id: 'as-d04-study', text: 'Study 2.1 and 2.2: what hallucinations look like and why confident wording proves nothing', kind: 'read', href: '/domains/output-evaluation', minutes: 30 },
          { id: 'as-d04-build', text: 'Hands-on: ask Claude for a summary with specific figures or citations, then check three of them against the source', kind: 'build', minutes: 25 },
          { id: 'as-d04-drill', text: 'Drill 2.1 and 2.2', kind: 'practice', href: drill('mode=task&task=2.1,2.2&feedback=1'), minutes: 20 },
        ],
      },
      {
        day: 5, title: 'Fact-checking and human review', focus: '2.3 validation techniques, 2.4 when a human must review', domains: [2],
        items: [
          { id: 'as-d05-study', text: 'Study 2.3 and 2.4: verification methods and the stakes that trigger human review', kind: 'read', href: '/domains/output-evaluation#t2.3', minutes: 30 },
          { id: 'as-d05-drill', text: 'Drill 2.3 and 2.4', kind: 'practice', href: drill('mode=task&task=2.3,2.4&feedback=1'), minutes: 25 },
          { id: 'as-d05-cheat', text: 'Cheat sheet: Domain 2 rules', kind: 'review', href: '/cheatsheet', minutes: 10 },
        ],
      },
      {
        day: 6, title: 'Audience and output format', focus: '2.5 adapting for the audience, 2.6 artifacts vs inline vs structured data', domains: [2],
        items: [
          { id: 'as-d06-study', text: 'Study 2.5 and 2.6: rewriting for different readers and picking the right output format', kind: 'read', href: '/domains/output-evaluation#t2.5', minutes: 25 },
          { id: 'as-d06-build', text: 'Hands-on: turn one piece of content into an executive summary, a table and a document artifact', kind: 'build', minutes: 25 },
          { id: 'as-d06-drill', text: 'Domain 2 drill (15)', kind: 'practice', href: domain(2), minutes: 25 },
        ],
      },
      {
        day: 7, title: 'Week 1 review', focus: 'Domains 1–2 consolidation', domains: [1, 2],
        items: [
          { id: 'as-d07-mixed', text: 'Mixed timed set: 25 questions, 2 minutes each', kind: 'practice', href: drill('mode=quick&count=25&timed=1'), minutes: 50 },
          { id: 'as-d07-review', text: 'Review every miss; re-read the matching task’s exam lens and traps', kind: 'review', href: '/history', minutes: 30 },
        ],
      },
    ],
  },
  {
    week: 2,
    title: 'Products, configuration and workflows',
    goal: 'Choose the right feature and model (12%), configure Projects and knowledge (12%), and design workflows around Claude (16%).',
    days: [
      {
        day: 8, title: 'Features and models', focus: '3.1 product features, 3.2 Haiku vs Sonnet vs Opus, 3.3 cost/speed/quality', domains: [3],
        items: [
          { id: 'as-d08-study', text: 'Study 3.1 to 3.3: when to use chat, a Project, research or an artifact, and which model fits', kind: 'read', href: '/domains/product-model-selection', minutes: 30 },
          { id: 'as-d08-build', text: 'Hands-on: run the same task with two different models and compare speed and quality', kind: 'build', minutes: 20 },
          { id: 'as-d08-drill', text: 'Drill 3.1 to 3.3', kind: 'practice', href: drill('mode=task&task=3.1,3.2,3.3&feedback=1'), minutes: 20 },
        ],
      },
      {
        day: 9, title: 'Context and memory', focus: '3.4 when to restart, summarise or persist', domains: [3],
        items: [
          { id: 'as-d09-study', text: 'Study 3.4: long chats, starting fresh with a summary, and what belongs in a Project or memory', kind: 'read', href: '/domains/product-model-selection#t3.4', minutes: 25 },
          { id: 'as-d09-drill', text: 'Domain 3 drill (15)', kind: 'practice', href: domain(3), minutes: 25 },
        ],
      },
      {
        day: 10, title: 'Projects and instructions', focus: '5.1 configuring Projects, 5.3 system-level instructions', domains: [5],
        items: [
          { id: 'as-d10-study', text: 'Study 5.1 and 5.3: project instructions, knowledge, and what makes standing instructions work', kind: 'read', href: '/domains/configuration-knowledge', minutes: 30 },
          { id: 'as-d10-build', text: 'Hands-on: set up a Project for a recurring task with instructions and two knowledge files, then test it with three requests', kind: 'build', minutes: 35 },
        ],
      },
      {
        day: 11, title: 'Knowledge, connectors and upkeep', focus: '5.2 uploads and connectors, 5.4 maintaining configurations', domains: [5],
        items: [
          { id: 'as-d11-study', text: 'Study 5.2 and 5.4: uploaded files vs connected sources, and keeping knowledge current', kind: 'read', href: '/domains/configuration-knowledge#t5.2', minutes: 25 },
          { id: 'as-d11-drill', text: 'Domain 5 drill (15)', kind: 'practice', href: domain(5), minutes: 25 },
        ],
      },
      {
        day: 12, title: 'Requirements, research and design', focus: '4.1 requirements, 4.2 research & planning, 4.3 solution design', domains: [4],
        items: [
          { id: 'as-d12-study', text: 'Study 4.1 to 4.3: using Claude to analyse needs, plan, and iterate on a solution', kind: 'read', href: '/domains/workflow-solution-design', minutes: 30 },
          { id: 'as-d12-build', text: 'Hands-on: pick one weekly task at work and map it step by step; mark which steps Claude could draft and where a human checks', kind: 'build', minutes: 30 },
        ],
      },
      {
        day: 13, title: 'Integrating and communicating', focus: '4.4 fitting Claude into workflows, 4.5 value and limits for stakeholders', domains: [4],
        items: [
          { id: 'as-d13-study', text: 'Study 4.4 and 4.5: augment vs redesign, and how to set honest expectations', kind: 'read', href: '/domains/workflow-solution-design#t4.4', minutes: 25 },
          { id: 'as-d13-drill', text: 'Domain 4 drill (15)', kind: 'practice', href: domain(4), minutes: 25 },
        ],
      },
      {
        day: 14, title: 'Full mock #1', focus: 'Exam conditions: 60 items, 120 minutes', domains: [],
        items: [
          { id: 'as-d14-mock', text: 'Full mock #1 under exam conditions (no notes, single sitting)', kind: 'mock', href: drill('mode=full'), minutes: 120 },
          { id: 'as-d14-review', text: 'Review every question, including correct ones you guessed', kind: 'review', href: '/history', minutes: 40 },
        ],
      },
    ],
  },
  {
    week: 3,
    title: 'Responsible use, troubleshooting and readiness',
    goal: 'Cover Governance (15%) and Troubleshooting (10%), close weak areas, and confirm readiness with a second mock.',
    days: [
      {
        day: 15, title: 'Appropriate use and sensitive data', focus: '6.1 use cases, 6.2 data sensitivity and privacy', domains: [6],
        items: [
          { id: 'as-d15-study', text: 'Study 6.1 and 6.2: which uses need a human in the loop, and how to handle personal or regulated data', kind: 'read', href: '/domains/governance-responsible-use', minutes: 30 },
          { id: 'as-d15-drill', text: 'Drill 6.1 and 6.2', kind: 'practice', href: drill('mode=task&task=6.1,6.2&feedback=1'), minutes: 25 },
        ],
      },
      {
        day: 16, title: 'Policy and ethics', focus: '6.3 organisational policy, 6.4 ethical implications', domains: [6],
        items: [
          { id: 'as-d16-study', text: 'Study 6.3 and 6.4: following your organisation’s AI rules, disclosure, bias and fairness', kind: 'read', href: '/domains/governance-responsible-use#t6.3', minutes: 25 },
          { id: 'as-d16-drill', text: 'Domain 6 drill (15)', kind: 'practice', href: domain(6), minutes: 25 },
        ],
      },
      {
        day: 17, title: 'Troubleshooting and optimisation', focus: '7.1 diagnosing poor output, 7.2 adjusting, 7.3 optimising', domains: [7],
        items: [
          { id: 'as-d17-study', text: 'Study 7.1 to 7.3: find the cause before changing the prompt, then make the workflow lighter', kind: 'read', href: '/domains/troubleshooting-optimization', minutes: 25 },
          { id: 'as-d17-drill', text: 'Domain 7 drill (15)', kind: 'practice', href: domain(7), minutes: 25 },
        ],
      },
      {
        day: 18, title: 'Weak areas', focus: 'Questions you missed or haven’t mastered', domains: [],
        items: [
          { id: 'as-d18-weak', text: 'Weak-areas drill (25)', kind: 'practice', href: drill('mode=weak&count=25&feedback=1'), minutes: 40 },
          { id: 'as-d18-reread', text: 'Re-read the task statements in your weakest domain (the Dashboard shows it)', kind: 'read', href: '/domains', minutes: 30 },
        ],
      },
      {
        day: 19, title: 'Full mock #2', focus: 'Exam conditions, mostly unseen questions', domains: [],
        items: [
          { id: 'as-d19-mock', text: 'Full mock #2 (prefers questions you haven’t seen)', kind: 'mock', href: drill('mode=full'), minutes: 120 },
          { id: 'as-d19-review', text: 'Review misses and name the pattern (trusted unchecked output? wrong feature? skipped the policy?)', kind: 'review', href: '/history', minutes: 35 },
        ],
      },
      {
        day: 20, title: 'Sweep and cheat sheet', focus: 'Unseen questions and the decision rules', domains: [],
        items: [
          { id: 'as-d20-unseen', text: 'Unseen-questions sweep (30)', kind: 'practice', href: drill('mode=unseen&count=30&feedback=1'), minutes: 45 },
          { id: 'as-d20-cheat', text: 'Read the whole cheat sheet once, top to bottom', kind: 'review', href: '/cheatsheet', minutes: 25 },
        ],
      },
      {
        day: 21, title: 'Ready to book', focus: 'Final check and booking', domains: [],
        items: [
          { id: 'as-d21-bookmarks', text: 'Redo your bookmarked questions', kind: 'practice', href: drill('mode=bookmarked&feedback=1'), minutes: 25 },
          { id: 'as-d21-book', text: 'If both mocks scored ≥ 80%, book the exam (Partner Academy → Pearson VUE) and set the date in Settings', kind: 'admin', href: vue, minutes: 15 },
        ],
      },
    ],
  },
];
