// The Claude certification path shown on the home page. Facts come from each exam's official guide
// (docs/guides/*.txt) and the Partner Academy certifications page.

export interface Cert {
  slug: string;
  name: string;
  role: 'Associate' | 'Developer' | 'Architect';
  level: 'Foundations' | 'Professional';
  code: string;
  /** Path of the study site for this exam, or null while it's not built yet. */
  base: string | null;
  summary: string;
  audience: string;
  items: number;
  minutes: number;
  fee: number;
  domains: { name: string; weight: number }[];
  guideUrl: string;
  registerUrl: string;
}

/** Mount path of the first study site; un-prefixed legacy URLs redirect here. */
export const AF_BASE = '/architect-foundations';

const S3 = 'https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F';
const SJ = 'https://anthropic-partners.skilljar.com/';

export const certs: Cert[] = [
  {
    slug: 'associate-foundations',
    name: 'Claude Certified Associate – Foundations',
    role: 'Associate',
    level: 'Foundations',
    code: 'CCAO-F',
    base: '/associate-foundations',
    summary:
      'Validates that you can apply Claude to business and productivity tasks with minimal guidance: using built-in features, spotting process improvements, balancing quality, efficiency and cost, and knowing when to escalate technical work.',
    audience: 'Operations, marketing, project management, education and communications professionals. No coding or API experience needed.',
    items: 60,
    minutes: 120,
    fee: 99,
    domains: [
      { name: 'Output Evaluation and Validation', weight: 21 },
      { name: 'Workflow Integration and Solution Design', weight: 16 },
      { name: 'Governance, Risk, and Responsible Use', weight: 15 },
      { name: 'Prompting and Task Execution', weight: 14 },
      { name: 'Product and Model Selection', weight: 12 },
      { name: 'Configuration and Knowledge Management', weight: 12 },
      { name: 'Troubleshooting and Optimization', weight: 10 },
    ],
    guideUrl: `${S3}1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf`,
    registerUrl: `${SJ}claude-certified-associate-foundations-certification`,
  },
  {
    slug: 'developer-foundations',
    name: 'Claude Certified Developer – Foundations',
    role: 'Developer',
    level: 'Foundations',
    code: 'CCDV-F',
    base: '/developer-foundations',
    summary:
      'Validates that you can build, integrate and ship production-grade applications, agents and workflows on the Claude platform: API integration, agent and tool construction, prompt and context engineering, evals, security and model selection.',
    audience: 'AI/ML engineers, tech leads and senior software engineers with 1–5 years in software and 6+ months hands-on with Claude.',
    items: 53,
    minutes: 120,
    fee: 125,
    domains: [
      { name: 'Applications and Integration', weight: 33.1 },
      { name: 'Model Selection and Optimization', weight: 16.8 },
      { name: 'Agents and Workflows', weight: 14.7 },
      { name: 'Prompt and Context Engineering', weight: 11 },
      { name: 'Tools and MCPs', weight: 10.6 },
      { name: 'Security and Safety', weight: 8.1 },
      { name: 'Claude Code', weight: 3.1 },
      { name: 'Eval, Testing, and Debugging', weight: 2.6 },
    ],
    guideUrl: `${S3}1783542875%2FClaude+Certified+Developer+%E2%80%93+Foundations+Exam+Guide.pdf`,
    registerUrl: `${SJ}claude-certified-developer-foundations-certification`,
  },
  {
    slug: 'architect-foundations',
    name: 'Claude Certified Architect – Foundations',
    role: 'Architect',
    level: 'Foundations',
    code: 'CCAR-F',
    base: AF_BASE,
    summary:
      'Validates informed tradeoff decisions when implementing real-world solutions with Claude Code, the Claude Agent SDK, the Claude API and MCP, tested through production scenarios.',
    audience: 'Solution architects with 6+ months building production applications with the Claude API, Agent SDK, Claude Code and MCP.',
    items: 60,
    minutes: 120,
    fee: 125,
    domains: [
      { name: 'Agentic Architecture & Orchestration', weight: 27 },
      { name: 'Claude Code Configuration & Workflows', weight: 20 },
      { name: 'Prompt Engineering & Structured Output', weight: 20 },
      { name: 'Tool Design & MCP Integration', weight: 18 },
      { name: 'Context Management & Reliability', weight: 15 },
    ],
    guideUrl: `${S3}1783542750%2FClaude+Certified+Architect+%E2%80%93+Foundations+Exam+Guide.pdf`,
    registerUrl: `${SJ}claude-certified-architect-foundations-certification`,
  },
  {
    slug: 'architect-professional',
    name: 'Claude Certified Architect – Professional',
    role: 'Architect',
    level: 'Professional',
    code: 'CCAR-P',
    base: null,
    summary:
      'Validates that you can design, build and deliver production-grade AI solutions end to end: model and architecture selection, enterprise integration, evaluation, security, compliance and governance, and communicating decisions to stakeholders.',
    audience: 'Practitioners in an architect role who own the full lifecycle of Claude-powered systems.',
    items: 63,
    minutes: 120,
    fee: 175,
    domains: [
      { name: 'Integration', weight: 19 },
      { name: 'Solution Design & Architecture', weight: 17 },
      { name: 'Evaluation, Testing & Optimization', weight: 16 },
      { name: 'Governance, Safety & Risk Management', weight: 14 },
      { name: 'Stakeholder Communication & Lifecycle Management', weight: 14 },
      { name: 'Claude Models, Prompting & Context Engineering', weight: 13 },
      { name: 'Developer Productivity & Operational Enablement', weight: 7 },
    ],
    guideUrl: `${S3}1783542810%2FClaude+Certified+Architect+%E2%80%93+Professional+Exam+Guide.pdf`,
    registerUrl: `${SJ}claude-certified-architect-professional-certification`,
  },
];

export const shortName = (c: Cert) => `${c.role} – ${c.level}`;
export const certIndex = (slug: string) => certs.findIndex((c) => c.slug === slug);

/** Profile "current level": the highest certification already held on the path. */
export const LEVELS = [
  { value: 'none', label: 'Not certified yet' },
  ...certs.map((c) => ({ value: c.slug, label: `${shortName(c)} certified` })),
];
