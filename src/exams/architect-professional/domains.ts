import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadNotes, withNotes, type ObjectiveDef } from '../notes.js';
import type { Domain } from '../types.js';

// Domains, weights and task statements follow the official CCAR-P Exam Guide v1.0 (July 2026), section 6.
// The guide lists one bullet per task statement (used verbatim as the title) and no per-task weights. The study
// bullets (knowledge, skills, examLens, traps, links, cheat rows, diagrams) live in notes/*.json, merged in by id.
// `items` is each domain's approximate share of the 63 scored items.

export const notes = loadNotes(join(dirname(fileURLToPath(import.meta.url)), 'notes'));

const task = (id: string, title: string) => withNotes(notes, { id, title } satisfies ObjectiveDef);

const L = {
  agents: { label: 'Building effective agents', url: 'https://www.anthropic.com/research/building-effective-agents' },
  multiAgent: { label: 'How we built our multi-agent research system', url: 'https://www.anthropic.com/research/multi-agent-research-system' },
  agentSdk: { label: 'Agent SDK overview', url: 'https://code.claude.com/docs/en/agent-sdk/overview' },
  models: { label: 'Models overview', url: 'https://platform.claude.com/docs/en/models/overview' },
  choosing: { label: 'Choosing a model', url: 'https://platform.claude.com/docs/en/about-claude/models/choosing-a-model' },
  prompting: { label: 'Prompting best practices', url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices' },
  caching: { label: 'Prompt caching', url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-caching' },
  skills: { label: 'Agent Skills overview', url: 'https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview' },
  context: { label: 'Effective context engineering for AI agents', url: 'https://www.anthropic.com/research/effective-context-engineering-for-ai-agents' },
  tools: { label: 'Writing tools for agents', url: 'https://www.anthropic.com/research/writing-tools-for-agents' },
  mcp: { label: 'Model Context Protocol: introduction', url: 'https://modelcontextprotocol.io/docs/getting-started/intro' },
  mcpAuth: { label: 'MCP authorization specification', url: 'https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization' },
  retrieval: { label: 'Contextual retrieval', url: 'https://www.anthropic.com/research/contextual-retrieval' },
  success: { label: 'Define success criteria and build evaluations', url: 'https://platform.claude.com/docs/en/test-and-evaluate/develop-tests' },
  hallucinations: { label: 'Reduce hallucinations', url: 'https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations' },
  jailbreaks: { label: 'Mitigate jailbreaks and prompt injections', url: 'https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks' },
  aup: { label: 'Usage Policy', url: 'https://www.anthropic.com/legal/aup' },
  dpa: { label: 'Data Processing Addendum', url: 'https://privacy.claude.com/en/articles/7996862-how-do-i-view-and-sign-your-data-processing-addendum-dpa' },
  ccBest: { label: 'Claude Code best practices', url: 'https://code.claude.com/docs/en/best-practices' },
  ccSettings: { label: 'Claude Code settings', url: 'https://code.claude.com/docs/en/settings' },
  ccIam: { label: 'Claude Code identity and access management', url: 'https://code.claude.com/docs/en/iam' },
};

export const domains: Domain[] = [
  {
    id: 1, slug: 'solution-design-architecture', name: 'Solution Design & Architecture', short: 'Design', weight: 17, items: 11,
    summary: 'Turning a business problem into a Claude solution: end-to-end architecture with feedback loops, choosing a workflow, agentic or augmented-LLM pattern, multi-agent orchestration, decomposition, and tying the design to measurable business value.',
    links: [L.agents, L.multiAgent, L.agentSdk],
    tasks: [
      task('1.1', 'Translate business problems into Claude-based AI solutions'),
      task('1.2', 'Design end-to-end architectures (input → processing → output → feedback loops)'),
      task('1.3', 'Select appropriate architectural patterns (workflow, agentic, augmented LLM)'),
      task('1.4', 'Design multi-agent systems and orchestration strategies'),
      task('1.5', 'Apply decomposition techniques for complex problem solving'),
      task('1.6', 'Align solutions to business value pillars (efficiency, transformation, productivity, cost, performance SLAs)'),
    ],
  },
  {
    id: 2, slug: 'models-prompting-context', name: 'Claude Models, Prompting & Context Engineering', short: 'Models & context', weight: 13, items: 8,
    summary: 'Choosing a Claude model on capability, latency and cost; system prompts, templates and guardrails; zero-shot, few-shot and chain-of-thought; managing the context window and token budget; and reusing prompts through caching, modular prompts and Skills.',
    links: [L.choosing, L.prompting, L.caching, L.skills, L.context],
    tasks: [
      task('2.1', 'Select appropriate Claude models based on trade-offs'),
      task('2.2', 'Design system prompts, templates, and guardrails'),
      task('2.3', 'Apply prompt engineering techniques (zero-shot, few-shot, chain-of-thought)'),
      task('2.4', 'Optimize context windows and manage token usage'),
      task('2.5', 'Implement prompt reuse strategies (caching, modular prompts, Skills)'),
    ],
  },
  {
    id: 3, slug: 'integration', name: 'Integration', short: 'Integration', weight: 19, items: 12,
    summary: 'The largest domain. Keeping tool and agent configuration lean, finding authentication and authorization gaps, accuracy-latency trade-offs, observability at scale, RAG chunking, indexing and retrieval, choosing MCP, API/CLI or agent-to-agent, and progressive discovery versus monolithic context.',
    links: [L.tools, L.mcp, L.mcpAuth, L.retrieval, L.context],
    tasks: [
      task('3.1', 'Evaluate tool/agent configuration for capability bloat'),
      task('3.2', 'Analyze authentication and authorization requirements to identify security gaps'),
      task('3.3', 'Evaluate accuracy-latency trade-offs and justify configuration decisions'),
      task('3.4', 'Analyze observability challenges and select monitoring strategies at scale'),
      task('3.5', 'Design a RAG pipeline with appropriate chunking and indexing strategies'),
      task('3.6', 'Apply retrieval strategies matched to data shape and query pattern'),
      task('3.7', 'Evaluate connection protocols and select the appropriate integration mechanism (MCP, API/CLI, agent-to-agent)'),
      task('3.8', 'Evaluate progressive discovery vs. monolithic context strategy'),
    ],
  },
  {
    id: 4, slug: 'evaluation-testing-optimization', name: 'Evaluation, Testing & Optimization', short: 'Evaluation', weight: 16, items: 10,
    summary: 'Defining metrics across accuracy, latency, cost, safety and security; building eval datasets with mixed methods; A/B testing and iteration; diagnosing prompt failures, hallucinations and model mismatch; cost-performance tuning; and monitoring in production.',
    links: [L.success, L.hallucinations],
    tasks: [
      task('4.1', 'Define evaluation metrics (accuracy, latency, cost, safety, security)'),
      task('4.2', 'Design evaluation datasets and test frameworks using mixed methodologies'),
      task('4.3', 'Conduct A/B testing and iterative improvements'),
      task('4.4', 'Diagnose system issues (prompt failure, hallucinations, model mismatch)'),
      task('4.5', 'Optimize token usage, latency, and cost-performance trade-offs'),
      task('4.6', 'Monitor system performance using logging and observability tools'),
    ],
  },
  {
    id: 5, slug: 'governance-safety-risk', name: 'Governance, Safety & Risk Management', short: 'Governance', weight: 14, items: 9,
    summary: 'Guardrails and safety controls, LLM failure modes and limits, human-in-the-loop validation, regulatory compliance (GDPR, HIPAA, FedRAMP as examples), and ethical considerations: bias, fairness and transparency.',
    links: [L.jailbreaks, L.hallucinations, L.aup, L.dpa],
    tasks: [
      task('5.1', 'Implement guardrails and safety controls'),
      task('5.2', 'Identify risks, limitations, and failure modes of LLM systems'),
      task('5.3', 'Apply human-in-the-loop validation strategies'),
      task('5.4', 'Ensure compliance with regulations (e.g., GDPR, HIPAA, FedRAMP)'),
      task('5.5', 'Address ethical AI considerations (bias, fairness, transparency)'),
    ],
  },
  {
    id: 6, slug: 'stakeholder-lifecycle', name: 'Stakeholder Communication & Lifecycle Management', short: 'Stakeholders', weight: 14, items: 9,
    summary: 'Structured discovery and requirements, explaining architectural decisions and trade-offs to technical and executive audiences, feedback loops and SLA expectations, architecture documentation and handoff, and supporting the lifecycle from discovery to iteration.',
    links: [L.success, L.agents],
    tasks: [
      task('6.1', 'Conduct structured discovery and requirement gathering'),
      task('6.2', 'Communicate architectural decisions and trade-offs'),
      task('6.3', 'Manage stakeholder feedback loops and expectation alignment (including SLAs)'),
      task('6.4', 'Document architectures and provide implementation guidance'),
      task('6.5', 'Support lifecycle phases (discovery, design, handoff, monitoring, iteration)'),
    ],
  },
  {
    id: 7, slug: 'developer-productivity', name: 'Developer Productivity & Operational Enablement', short: 'Dev enablement', weight: 7, items: 4,
    summary: 'Rolling out Claude tools such as Claude Code to teams with shared configuration and permissions, improving developer workflows with AI-assisted tooling, and supporting debugging and operational issue resolution.',
    links: [L.ccBest, L.ccSettings, L.ccIam],
    tasks: [
      task('7.1', 'Configure Claude tools and environments for teams (e.g., Claude Code)'),
      task('7.2', 'Improve developer workflows using AI-assisted tooling'),
      task('7.3', 'Support debugging and operational issue resolution'),
    ],
  },
];
