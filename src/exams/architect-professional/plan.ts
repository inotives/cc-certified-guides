import type { PlanWeek } from '../types.js';

const drill = (q: string) => `/practice/start?${q}`;
const domain = (id: number) => drill(`mode=domain&domain=${id}&count=15&feedback=1`);
const tasks = (ids: string) => drill(`mode=task&task=${ids}&feedback=1`);
const caseStudy = (id: number) => drill(`mode=scenario&scenario=${id}&count=15&feedback=1`);
const vue = 'https://www.pearsonvue.com/us/en/anthropic.html';

// Self-paced 21-day plan for CCAR-P. A "day" is one study session, not a calendar date. Time follows the
// blueprint weights: Integration (19%), Design (17%), Evaluation (16%), Governance and Stakeholders (14% each),
// Models & context (13%), Developer enablement (7%). The guide asks candidates to build and operate an end-to-end
// solution with RAG, evaluation and observability, so the hands-on items add up to one small reference build.
// Item ids are persisted in plan_progress, so keep them stable. Hrefs are relative to the exam's base path.
export const plan: PlanWeek[] = [
  {
    week: 1,
    title: 'Design and models',
    goal: 'Frame problems the way the exam does: from business outcome to architecture pattern (Design, 17%), then the model, prompt and context choices inside it (13%).',
    days: [
      {
        day: 1, title: 'Orientation & diagnostic', focus: 'Blueprint, 38 task statements, baseline score', domains: [],
        items: [
          { id: 'ap-d01-guide', text: 'Read the Exam focus page: format, the 7 domains and their weights, and how to think on this exam', kind: 'read', href: '/guide', minutes: 25 },
          { id: 'ap-d01-samples', text: 'Answer the 3 official sample questions and read why each answer is right', kind: 'practice', href: drill('mode=official&feedback=1'), minutes: 10 },
          { id: 'ap-d01-diag', text: 'Diagnostic: 25 mixed questions with instant feedback; don’t study first', kind: 'practice', href: drill('mode=quick&count=25&feedback=1'), minutes: 45 },
          { id: 'ap-d01-cases', text: 'Skim the six case studies (unofficial) so the settings are familiar when they appear in drills', kind: 'read', href: '/scenarios', minutes: 10 },
          { id: 'ap-d01-admin', text: 'Skim how booking works (Partner Academy → Pearson VUE). Don’t book yet; aim to book once a full mock scores ≥ 80%', kind: 'admin', href: vue, minutes: 5 },
        ],
      },
      {
        day: 2, title: 'From business problem to architecture', focus: '1.1 problem translation, 1.2 end-to-end architecture', domains: [1],
        items: [
          { id: 'ap-d02-study', text: 'Study 1.1 and 1.2: diagrams first, then exam lens and traps', kind: 'read', href: '/domains/solution-design-architecture', minutes: 35 },
          { id: 'ap-d02-build', text: 'Reference build, step 1: pick a real business problem, write the outcome metric, and sketch input → processing → output → feedback loop', kind: 'build', minutes: 40 },
          { id: 'ap-d02-drill', text: 'Drill 1.1 and 1.2', kind: 'practice', href: tasks('1.1,1.2'), minutes: 20 },
        ],
      },
      {
        day: 3, title: 'Patterns and decomposition', focus: '1.3 workflow vs agentic vs augmented LLM, 1.5 decomposition', domains: [1],
        items: [
          { id: 'ap-d03-study', text: 'Study 1.3 and 1.5: when a fixed workflow beats an agent, and how to split a complex task', kind: 'read', href: '/domains/solution-design-architecture#t1.3', minutes: 30 },
          { id: 'ap-d03-read', text: 'Read “Building effective agents” (Anthropic engineering) with the pattern diagrams side by side', kind: 'read', href: 'https://www.anthropic.com/research/building-effective-agents', minutes: 30 },
          { id: 'ap-d03-drill', text: 'Drill 1.3 and 1.5', kind: 'practice', href: tasks('1.3,1.5'), minutes: 20 },
        ],
      },
      {
        day: 4, title: 'Multi-agent systems and business value', focus: '1.4 multi-agent orchestration, 1.6 value pillars', domains: [1],
        items: [
          { id: 'ap-d04-study', text: 'Study 1.4 and 1.6: orchestrator–worker trade-offs and tying designs to efficiency, cost and SLAs', kind: 'read', href: '/domains/solution-design-architecture#t1.4', minutes: 30 },
          { id: 'ap-d04-read', text: 'Read “How we built our multi-agent research system” and list three costs of going multi-agent', kind: 'read', href: 'https://www.anthropic.com/research/multi-agent-research-system', minutes: 25 },
          { id: 'ap-d04-drill', text: 'Domain 1 drill (15)', kind: 'practice', href: domain(1), minutes: 25 },
        ],
      },
      {
        day: 5, title: 'Models, system prompts and guardrails', focus: '2.1 model selection, 2.2 system prompts and templates', domains: [2],
        items: [
          { id: 'ap-d05-study', text: 'Study 2.1 and 2.2: capability, latency and cost trade-offs; prompt structure and guardrails', kind: 'read', href: '/domains/models-prompting-context', minutes: 30 },
          { id: 'ap-d05-build', text: 'Reference build, step 2: write a templated system prompt with role, rules, output format and refusal behaviour; try it on two model tiers', kind: 'build', minutes: 35 },
          { id: 'ap-d05-drill', text: 'Drill 2.1 and 2.2', kind: 'practice', href: tasks('2.1,2.2'), minutes: 20 },
        ],
      },
      {
        day: 6, title: 'Techniques, context and reuse', focus: '2.3 prompting techniques, 2.4 context windows, 2.5 caching and Skills', domains: [2],
        items: [
          { id: 'ap-d06-study', text: 'Study 2.3, 2.4 and 2.5: few-shot and chain-of-thought, token budgets, caching, modular prompts and Skills', kind: 'read', href: '/domains/models-prompting-context#t2.3', minutes: 35 },
          { id: 'ap-d06-build', text: 'Reference build, step 3: reorder your prompt so static content comes first and enable prompt caching; compare cost and latency', kind: 'build', minutes: 25 },
          { id: 'ap-d06-drill', text: 'Domain 2 drill (15)', kind: 'practice', href: domain(2), minutes: 25 },
        ],
      },
      {
        day: 7, title: 'Week 1 review', focus: 'Design and models, mixed', domains: [1, 2],
        items: [
          { id: 'ap-d07-mixed', text: 'Mixed set (30) with feedback; write down every miss and the rule it broke', kind: 'practice', href: drill('mode=quick&count=30&feedback=1'), minutes: 50 },
          { id: 'ap-d07-case', text: 'Case study drill: Retail Merchandising Insights', kind: 'practice', href: caseStudy(5), minutes: 25 },
          { id: 'ap-d07-cheat', text: 'Cheat sheet: Domains 1 and 2', kind: 'review', href: '/cheatsheet', minutes: 15 },
        ],
      },
    ],
  },
  {
    week: 2,
    title: 'Integration and evaluation',
    goal: 'The two biggest technical domains: connecting Claude safely to enterprise systems and data (Integration, 19%), and proving it works (Evaluation, 16%).',
    days: [
      {
        day: 8, title: 'Capability bloat and access control', focus: '3.1 tool/agent configuration, 3.2 authentication and authorization', domains: [3],
        items: [
          { id: 'ap-d08-study', text: 'Study 3.1 and 3.2: least privilege for tools, delegated user identity, and where authorization must be enforced', kind: 'read', href: '/domains/integration', minutes: 35 },
          { id: 'ap-d08-read', text: 'Read the MCP authorization specification overview and note who issues and validates tokens', kind: 'read', href: 'https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization', minutes: 20 },
          { id: 'ap-d08-drill', text: 'Drill 3.1 and 3.2', kind: 'practice', href: tasks('3.1,3.2'), minutes: 25 },
        ],
      },
      {
        day: 9, title: 'Trade-offs and observability', focus: '3.3 accuracy vs latency, 3.4 monitoring at scale', domains: [3],
        items: [
          { id: 'ap-d09-study', text: 'Study 3.3 and 3.4: justify a configuration with numbers, and trace multi-step agent runs', kind: 'read', href: '/domains/integration#t3.3', minutes: 30 },
          { id: 'ap-d09-build', text: 'Reference build, step 4: log every request with model, tokens, latency, tool calls and a trace id', kind: 'build', minutes: 35 },
          { id: 'ap-d09-drill', text: 'Drill 3.3 and 3.4', kind: 'practice', href: tasks('3.3,3.4'), minutes: 20 },
        ],
      },
      {
        day: 10, title: 'RAG pipelines', focus: '3.5 chunking and indexing, 3.6 retrieval strategies', domains: [3],
        items: [
          { id: 'ap-d10-study', text: 'Study 3.5 and 3.6: chunking by document shape, hybrid search, metadata filters and reranking', kind: 'read', href: '/domains/integration#t3.5', minutes: 35 },
          { id: 'ap-d10-read', text: 'Read “Contextual retrieval” and note which failure each technique fixes', kind: 'read', href: 'https://www.anthropic.com/research/contextual-retrieval', minutes: 20 },
          { id: 'ap-d10-build', text: 'Reference build, step 5: add retrieval over a small document set with citations', kind: 'build', minutes: 40 },
          { id: 'ap-d10-drill', text: 'Drill 3.5 and 3.6', kind: 'practice', href: tasks('3.5,3.6'), minutes: 20 },
        ],
      },
      {
        day: 11, title: 'Protocols and context strategy', focus: '3.7 MCP vs API/CLI vs agent-to-agent, 3.8 progressive discovery', domains: [3],
        items: [
          { id: 'ap-d11-study', text: 'Study 3.7 and 3.8: choosing the integration mechanism, and loading context on demand instead of up front', kind: 'read', href: '/domains/integration#t3.7', minutes: 30 },
          { id: 'ap-d11-drill', text: 'Domain 3 drill (15)', kind: 'practice', href: domain(3), minutes: 25 },
          { id: 'ap-d11-case', text: 'Case study drill: Enterprise Knowledge Search', kind: 'practice', href: caseStudy(3), minutes: 25 },
        ],
      },
      {
        day: 12, title: 'Metrics and eval datasets', focus: '4.1 evaluation metrics, 4.2 datasets and test frameworks', domains: [4],
        items: [
          { id: 'ap-d12-study', text: 'Study 4.1 and 4.2: metrics across accuracy, latency, cost, safety and security; mixing code, model and human grading', kind: 'read', href: '/domains/evaluation-testing-optimization', minutes: 35 },
          { id: 'ap-d12-build', text: 'Reference build, step 6: write 20 eval cases (typical, edge and adversarial) and score your build against them', kind: 'build', minutes: 40 },
          { id: 'ap-d12-drill', text: 'Drill 4.1 and 4.2', kind: 'practice', href: tasks('4.1,4.2'), minutes: 20 },
        ],
      },
      {
        day: 13, title: 'Experiments and diagnosis', focus: '4.3 A/B testing, 4.4 diagnosing failures', domains: [4],
        items: [
          { id: 'ap-d13-study', text: 'Study 4.3 and 4.4: controlled comparisons, and telling prompt failure from retrieval failure from model mismatch', kind: 'read', href: '/domains/evaluation-testing-optimization#t4.3', minutes: 30 },
          { id: 'ap-d13-drill', text: 'Drill 4.3 and 4.4', kind: 'practice', href: tasks('4.3,4.4'), minutes: 25 },
          { id: 'ap-d13-case', text: 'Case study drill: Clinical Documentation Assistant', kind: 'practice', href: caseStudy(1), minutes: 25 },
        ],
      },
      {
        day: 14, title: 'Cost-performance and first mock', focus: '4.5 optimisation, 4.6 monitoring; full mock 1', domains: [4],
        items: [
          { id: 'ap-d14-study', text: 'Study 4.5 and 4.6: where tokens, latency and money go, and what to alert on', kind: 'read', href: '/domains/evaluation-testing-optimization#t4.5', minutes: 25 },
          { id: 'ap-d14-mock', text: 'Full mock exam 1: 63 questions in 120 minutes, no feedback', kind: 'mock', href: drill('mode=full'), minutes: 120 },
          { id: 'ap-d14-review', text: 'Review every miss in Results & history; note the domain and the rule', kind: 'review', href: '/history', minutes: 30 },
        ],
      },
    ],
  },
  {
    week: 3,
    title: 'Governance, stakeholders, enablement and mocks',
    goal: 'Close the judgement domains (Governance and Stakeholders, 14% each; Developer enablement, 7%), then sit two mocks and fix weak areas.',
    days: [
      {
        day: 15, title: 'Guardrails and failure modes', focus: '5.1 safety controls, 5.2 LLM risks and limits', domains: [5],
        items: [
          { id: 'ap-d15-study', text: 'Study 5.1 and 5.2: layered guardrails, prompt injection, hallucination and over-reliance', kind: 'read', href: '/domains/governance-safety-risk', minutes: 35 },
          { id: 'ap-d15-read', text: 'Read “Mitigate jailbreaks and prompt injections” and map each mitigation to a layer', kind: 'read', href: 'https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks', minutes: 20 },
          { id: 'ap-d15-drill', text: 'Drill 5.1 and 5.2', kind: 'practice', href: tasks('5.1,5.2'), minutes: 25 },
        ],
      },
      {
        day: 16, title: 'Human review, compliance and ethics', focus: '5.3 human-in-the-loop, 5.4 regulation, 5.5 bias and transparency', domains: [5],
        items: [
          { id: 'ap-d16-study', text: 'Study 5.3, 5.4 and 5.5: where humans must decide, what GDPR, HIPAA and FedRAMP imply for design, and fairness checks', kind: 'read', href: '/domains/governance-safety-risk#t5.3', minutes: 35 },
          { id: 'ap-d16-drill', text: 'Domain 5 drill (15)', kind: 'practice', href: domain(5), minutes: 25 },
          { id: 'ap-d16-case', text: 'Case study drill: Public-Sector Benefits Casework', kind: 'practice', href: caseStudy(4), minutes: 25 },
        ],
      },
      {
        day: 17, title: 'Discovery and communication', focus: '6.1 discovery, 6.2 communicating trade-offs, 6.3 feedback loops and SLAs', domains: [6],
        items: [
          { id: 'ap-d17-study', text: 'Study 6.1, 6.2 and 6.3: who to involve, how to frame trade-offs for executives, and setting realistic SLAs', kind: 'read', href: '/domains/stakeholder-lifecycle', minutes: 35 },
          { id: 'ap-d17-build', text: 'Reference build, step 7: write a one-page decision record for your build: options, trade-offs, decision, risks', kind: 'build', minutes: 30 },
          { id: 'ap-d17-drill', text: 'Drill 6.1 to 6.3', kind: 'practice', href: tasks('6.1,6.2,6.3'), minutes: 20 },
        ],
      },
      {
        day: 18, title: 'Lifecycle and developer enablement', focus: '6.4 documentation, 6.5 lifecycle, 7.1–7.3 team tooling', domains: [6, 7],
        items: [
          { id: 'ap-d18-study6', text: 'Study 6.4 and 6.5: architecture docs, handoff and iteration after launch', kind: 'read', href: '/domains/stakeholder-lifecycle#t6.4', minutes: 20 },
          { id: 'ap-d18-study7', text: 'Study Domain 7: team Claude Code setup, AI-assisted workflows and operational debugging', kind: 'read', href: '/domains/developer-productivity', minutes: 25 },
          { id: 'ap-d18-drill', text: 'Domain 6 and 7 drills', kind: 'practice', href: drill('mode=task&task=6.4,6.5,7.1,7.2,7.3&feedback=1'), minutes: 25 },
          { id: 'ap-d18-case', text: 'Case study drill: Engineering Platform Rollout', kind: 'practice', href: caseStudy(6), minutes: 20 },
        ],
      },
      {
        day: 19, title: 'Weak areas', focus: 'Targeted repair', domains: [],
        items: [
          { id: 'ap-d19-weak', text: 'Weak-areas review (25) with feedback', kind: 'practice', href: drill('mode=weak&count=25&feedback=1'), minutes: 40 },
          { id: 'ap-d19-case', text: 'Case study drill: Retail Banking Support Agent', kind: 'practice', href: caseStudy(2), minutes: 25 },
          { id: 'ap-d19-reread', text: 'Re-read exam lens and traps for your two weakest domains', kind: 'review', href: '/domains', minutes: 25 },
        ],
      },
      {
        day: 20, title: 'Full mock 2', focus: 'Exam conditions', domains: [],
        items: [
          { id: 'ap-d20-mock', text: 'Full mock exam 2: 63 questions in 120 minutes, no feedback', kind: 'mock', href: drill('mode=full'), minutes: 120 },
          { id: 'ap-d20-review', text: 'Review every miss and bookmark the ones you would still get wrong', kind: 'review', href: '/history', minutes: 30 },
        ],
      },
      {
        day: 21, title: 'Final review & booking', focus: 'Cheat sheet, bookmarks, logistics', domains: [],
        items: [
          { id: 'ap-d21-cheat', text: 'Cheat sheet: all domains, top to bottom', kind: 'review', href: '/cheatsheet', minutes: 30 },
          { id: 'ap-d21-bookmarks', text: 'Redo bookmarked questions', kind: 'practice', href: drill('mode=bookmarked&feedback=1'), minutes: 25 },
          { id: 'ap-d21-unseen', text: 'Unseen questions (20) to check you’re not memorising answers', kind: 'practice', href: drill('mode=unseen&count=20&feedback=1'), minutes: 30 },
          { id: 'ap-d21-book', text: 'If both mocks scored ≥ 80%, book the exam; otherwise repeat days 19–20', kind: 'admin', href: vue, minutes: 10 },
        ],
      },
    ],
  },
];
