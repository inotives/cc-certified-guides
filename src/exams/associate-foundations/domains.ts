import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadNotes, withNotes, type ObjectiveDef } from '../notes.js';
import type { Domain } from '../types.js';

// Domains, weights and task statements follow the official CCAO-F Exam Guide v1.0 (July 2026), section 6.
// The guide lists one line per task statement (used verbatim as the title) and no per-task weights. The study
// bullets (knowledge, skills, examLens, traps, links, diagrams) live in notes/*.json and are merged in by id.

export const notes = loadNotes(join(dirname(fileURLToPath(import.meta.url)), 'notes'));

const task = (id: string, title: string) => withNotes(notes, { id, title } satisfies ObjectiveDef);

const L = {
  prompting: { label: 'Prompting best practices', url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices' },
  unhelpful: { label: 'My prompt isn’t giving a helpful answer', url: 'https://support.claude.com/en/articles/7996857-my-prompt-isn-t-giving-me-a-helpful-answer' },
  incorrect: { label: 'Incorrect or misleading responses', url: 'https://support.claude.com/en/articles/8525154-claude-is-providing-incorrect-or-misleading-responses-what-s-going-on' },
  artifacts: { label: 'What are artifacts?', url: 'https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them' },
  models: { label: 'Change model, effort and thinking', url: 'https://support.claude.com/en/articles/8664678-change-the-model-effort-and-thinking-settings' },
  research: { label: 'Use research on Claude', url: 'https://support.claude.com/en/articles/11088861-use-research-on-claude' },
  limits: { label: 'Usage and length limits', url: 'https://support.claude.com/en/articles/11647753-how-do-usage-and-length-limits-work' },
  files: { label: 'Create and edit files', url: 'https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude' },
  connectors: { label: 'Use connectors', url: 'https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities' },
  projects: { label: 'What are projects?', url: 'https://support.claude.com/en/articles/9517075-what-are-projects' },
  rag: { label: 'RAG for projects', url: 'https://support.claude.com/en/articles/11473015-retrieval-augmented-generation-rag-for-projects' },
  skills: { label: 'What are skills?', url: 'https://support.claude.com/en/articles/12512176-what-are-skills' },
  aup: { label: 'Usage Policy', url: 'https://www.anthropic.com/legal/aup' },
  training: { label: 'Is my data used for training? (commercial)', url: 'https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training' },
  bestPractice: { label: 'Usage limit best practices', url: 'https://support.claude.com/en/articles/9797557-usage-limit-best-practices' },
};

export const domains: Domain[] = [
  {
    id: 1, slug: 'prompting-task-execution', name: 'Prompting and Task Execution', short: 'Prompting', weight: 14, items: 8,
    summary: 'Writing clear prompts for business work, breaking big requests into steps, improving a prompt by iterating on it, and changing your approach for analysis, research, drafting or brainstorming.',
    links: [L.prompting, L.unhelpful],
    tasks: [
      task('1.1', 'Create effective prompts for business and technical tasks'),
      task('1.2', 'Apply task decomposition techniques to structure complex requests'),
      task('1.3', 'Iterate prompts to improve output quality'),
      task('1.4', 'Adapt prompting strategies based on task type (analysis, research, drafting, brainstorming)'),
    ],
  },
  {
    id: 2, slug: 'output-evaluation', name: 'Output Evaluation and Validation', short: 'Output Evaluation', weight: 21, items: 13,
    summary: 'The heaviest domain. Checking Claude’s work for accuracy and completeness, spotting hallucinations and bias, fact-checking, knowing when a human must review, adapting output for its audience, and picking the right output format.',
    links: [L.incorrect, L.artifacts],
    tasks: [
      task('2.1', 'Evaluate Claude-generated outputs for accuracy and completeness'),
      task('2.2', 'Identify hallucinations, inconsistencies, and biases in responses'),
      task('2.3', 'Apply fact-checking and validation techniques'),
      task('2.4', 'Determine when human review or additional verification is required'),
      task('2.5', 'Edit, adapt, refine, and compare outputs for the intended audience'),
      task('2.6', 'Organize and curate information and select appropriate output formats (artifacts, inline, structured data)'),
    ],
  },
  {
    id: 3, slug: 'product-model-selection', name: 'Product and Model Selection', short: 'Product & Model', weight: 12, items: 7,
    summary: 'Choosing the right Claude feature (chat, Projects, research, artifacts) and model (Haiku, Sonnet, Opus) for the job, balancing cost, speed and quality, and managing long conversations and memory.',
    links: [L.models, L.research, L.limits],
    tasks: [
      task('3.1', 'Select appropriate Claude product features (Projects, research mode, chat, artifacts)'),
      task('3.2', 'Differentiate between Claude model types (Haiku, Sonnet, Opus)'),
      task('3.3', 'Align model selection with task requirements (cost, speed, quality)'),
      task('3.4', 'Understand and manage context limitations and memory considerations (when to restart, summarize, or persist)'),
    ],
  },
  {
    id: 4, slug: 'workflow-solution-design', name: 'Workflow Integration and Solution Design', short: 'Workflow & Design', weight: 16, items: 10,
    summary: 'Using Claude to analyse requirements, research and plan, design and iterate on solutions, fit Claude into existing workflows, and explain its value and limits to stakeholders.',
    links: [L.files, L.connectors],
    tasks: [
      task('4.1', 'Apply Claude to analyze requirements and use cases'),
      task('4.2', 'Leverage Claude for research, planning, and process optimization'),
      task('4.3', 'Use Claude to support solution design, development, and iteration'),
      task('4.4', 'Integrate Claude into existing workflows to augment or redesign them'),
      task('4.5', 'Communicate Claude\'s value and limitations to stakeholders'),
    ],
  },
  {
    id: 5, slug: 'configuration-knowledge', name: 'Configuration and Knowledge Management', short: 'Config & Knowledge', weight: 12, items: 7,
    summary: 'Setting up Projects with instructions and knowledge, managing uploaded files and connectors such as Google Drive and Gmail, writing good standing instructions, and keeping all of it up to date.',
    links: [L.projects, L.rag, L.skills],
    tasks: [
      task('5.1', 'Configure Claude Projects with instructions and knowledge sources'),
      task('5.2', 'Manage uploaded knowledge and connectors (e.g., Google Drive, Gmail)'),
      task('5.3', 'Create effective system-level instructions'),
      task('5.4', 'Inform, maintain, and update Claude configurations, knowledge sources, and instructions'),
    ],
  },
  {
    id: 6, slug: 'governance-responsible-use', name: 'Governance, Risk, and Responsible Use', short: 'Governance & Risk', weight: 15, items: 9,
    summary: 'Telling appropriate from inappropriate uses, handling sensitive and regulated data, following your organisation’s AI policies, and the ethics of using AI at work.',
    links: [L.aup, L.training],
    tasks: [
      task('6.1', 'Identify appropriate and inappropriate use cases'),
      task('6.2', 'Apply data sensitivity, regulatory, and privacy considerations'),
      task('6.3', 'Follow organizational AI policies and governance standards'),
      task('6.4', 'Understand the ethical implications of AI usage'),
    ],
  },
  {
    id: 7, slug: 'troubleshooting-optimization', name: 'Troubleshooting and Optimization', short: 'Troubleshooting', weight: 10, items: 6,
    summary: 'Diagnosing why a prompt or output is underperforming, adjusting based on feedback and results, and making Claude workflows faster and more effective.',
    links: [L.unhelpful, L.bestPractice, L.limits],
    tasks: [
      task('7.1', 'Identify, diagnose, and resolve issues with underperforming prompts or poor outputs'),
      task('7.2', 'Adjust approach based on feedback and results'),
      task('7.3', 'Optimize workflows for efficiency and effectiveness'),
    ],
  },
];

export const domainById = (id: number) => domains.find((d) => d.id === id);
export const taskById = (taskId: string) => domains.flatMap((d) => d.tasks).find((t) => t.id === taskId);
