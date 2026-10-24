import type { Scenario } from '../types.js';

// Study case studies for CCAR-P. These are NOT from the exam guide: the CCAR-P exam uses standalone items with
// no scenarios. They are this site's own enterprise settings, used to group practice questions so you rehearse
// architect judgement across domains in one context. The full mock ignores them (no scenariosPerSitting).
// `domains` lists which blueprint domains each case study's questions draw on.
export const scenarios: Scenario[] = [
  {
    id: 1,
    slug: 'clinical-documentation',
    name: 'Clinical Documentation Assistant',
    context:
      'A hospital network wants Claude to draft visit summaries and answer clinicians’ questions from internal care guidelines. Data includes protected health information, clinicians must sign off every note, and the CMIO wants evidence the drafts are safe before rollout to 40 clinics.',
    domains: [1, 3, 4, 5, 6],
    watchFor: [
      'PHI handling is a design constraint from day one: contractual coverage, minimum necessary data, access controls and audit logs.',
      'Clinician sign-off is a required human-in-the-loop gate, not an optional review step.',
      'Answers about guidelines need grounding and citations from retrieval, with abstention when sources are missing.',
      'Eval sets must include high-risk cases (dosage, contraindications) scored by domain experts, not only automated graders.',
      'Success is measured in clinician time saved and error rates agreed with clinical stakeholders up front.',
    ],
  },
  {
    id: 2,
    slug: 'banking-support-agent',
    name: 'Retail Banking Support Agent',
    context:
      'A bank is replacing a scripted chatbot with a Claude agent that can look up accounts, explain fees, dispute card charges and escalate to staff. Customers are in the EU and US, and the risk team is worried about prompt injection and the agent moving money.',
    domains: [1, 2, 3, 5],
    watchFor: [
      'Least privilege: give the agent only the tools the role needs; money movement needs hard authorization checks in code.',
      'The agent acts on behalf of an authenticated customer; it must never use broader service credentials than that user has.',
      'Untrusted content (emails, chat text, documents) can carry injected instructions; separate it from instructions and constrain tool use.',
      'Pick a workflow for well-defined paths (fee explanation) and keep open-ended agency for the cases that need it.',
      'GDPR rights (access, erasure, purpose limits) affect logging, retention and what goes into prompts.',
    ],
  },
  {
    id: 3,
    slug: 'enterprise-knowledge-search',
    name: 'Enterprise Knowledge Search',
    context:
      'A global manufacturer wants employees to ask questions across 2 million documents: policies, engineering specs in tables, support tickets and wiki pages, in six languages. Answers must respect each user’s document permissions and cite sources.',
    domains: [2, 3, 4, 6],
    watchFor: [
      'Chunking follows document structure: sections for prose, rows or whole tables for specs, threads for tickets.',
      'Match retrieval to the query: hybrid lexical plus semantic for part numbers and jargon, metadata filters for scope, reranking for precision.',
      'Enforce document permissions at retrieval time, before content reaches the model.',
      'Measure retrieval (recall of the right chunks) separately from answer quality, so you know which stage fails.',
      'Index freshness and re-indexing are operational concerns; stale chunks produce confident wrong answers.',
    ],
  },
  {
    id: 4,
    slug: 'public-sector-casework',
    name: 'Public-Sector Benefits Casework',
    context:
      'A government agency wants to triage and pre-process benefit applications: extract data from forms, flag missing evidence and suggest next steps for caseworkers. Deployment must meet the agency’s cloud authorization rules, and decisions affect citizens’ eligibility.',
    domains: [1, 4, 5, 6],
    watchFor: [
      'Claude assists the caseworker; eligibility decisions stay with accountable humans.',
      'Check bias and fairness across applicant groups, and be able to explain why a case was flagged.',
      'Government authorization requirements (FedRAMP in the US) constrain which deployment options are allowed.',
      'High-volume extraction that is not time-sensitive suits batch processing; urgent cases need a separate path.',
      'Discovery must include caseworkers, policy owners, legal and security, not only IT.',
    ],
  },
  {
    id: 5,
    slug: 'retail-insights-agents',
    name: 'Retail Merchandising Insights',
    context:
      'A retailer wants a multi-agent system that researches competitor pricing, analyses sales data and drafts weekly merchandising recommendations for category managers. Executives expect a 20% cut in analyst hours and reports by 7 a.m. every Monday.',
    domains: [1, 2, 3, 4, 6],
    watchFor: [
      'Use multiple agents only where the work splits into independent parts; coordination costs tokens, latency and reliability.',
      'Orchestrator–worker: the lead agent decomposes the work, workers return condensed results, and the lead synthesises them.',
      'Mix models by role: a capable model to plan and synthesise, faster, cheaper ones for high-volume subtasks.',
      'Tie the design to the stated value (analyst hours, report deadline) and report against it.',
      'Set expectations: recommendations are inputs to category managers, with known limits on data freshness.',
    ],
  },
  {
    id: 6,
    slug: 'engineering-platform-rollout',
    name: 'Engineering Platform Rollout',
    context:
      'A software company is rolling out Claude Code and internal MCP servers to 400 engineers across 30 repositories. Security wants control over permissions and data, platform engineering wants consistent setup, and leadership wants proof it improves delivery.',
    domains: [2, 3, 5, 6, 7],
    watchFor: [
      'Shared, version-controlled project settings and instructions give consistency; managed settings enforce what teams may not change.',
      'Restrict permissions and tools to what a workflow needs; review MCP servers before approving them.',
      'Measure adoption and delivery outcomes with telemetry, not anecdotes.',
      'Package repeatable team workflows as commands, Skills or hooks rather than long ad hoc prompts.',
      'Operational issues (rate errors, flaky tool calls, bad context) are diagnosed from logs and traces before blaming the model.',
    ],
  },
];
