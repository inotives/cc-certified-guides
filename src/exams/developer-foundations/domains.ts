import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadNotes, withNotes, type ObjectiveDef } from '../notes.js';
import type { Domain } from '../types.js';
import { diagrams } from './diagrams.js';

// Domains, skills, weights and descriptions follow the official CCDV-F Exam Guide v1.0 (July 2026), section 6.
// The guide describes each skill in one paragraph; the study bullets (knowledge, skills, examLens, traps, links)
// live in notes/*.json and are merged in by skill id.

export const notes = loadNotes(join(dirname(fileURLToPath(import.meta.url)), 'notes'));

const skill = (s: ObjectiveDef) => withNotes(notes, s, diagrams[s.id]);

const L = {
  api: { label: 'Claude API overview', url: 'https://platform.claude.com/docs/en/api/overview' },
  sdk: { label: 'Agent SDK overview', url: 'https://platform.claude.com/docs/en/agent-sdk/overview' },
  agents: { label: 'Building effective agents', url: 'https://www.anthropic.com/engineering/building-effective-agents' },
  toolUse: { label: 'Tool use overview', url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview' },
  batch: { label: 'Message Batches API', url: 'https://platform.claude.com/docs/en/build-with-claude/batch-processing' },
  caching: { label: 'Prompt caching', url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-caching' },
  models: { label: 'Models overview', url: 'https://platform.claude.com/docs/en/about-claude/models/overview' },
  prompting: { label: 'Prompt engineering overview', url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview' },
  context: { label: 'Effective context engineering', url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents' },
  cc: { label: 'Claude Code overview', url: 'https://code.claude.com/docs/en/overview' },
  ccSettings: { label: 'Claude Code settings', url: 'https://code.claude.com/docs/en/settings' },
  ccHooks: { label: 'Claude Code hooks', url: 'https://code.claude.com/docs/en/hooks' },
  mcp: { label: 'MCP introduction', url: 'https://modelcontextprotocol.io/docs/getting-started/intro' },
  tools: { label: 'Writing effective tools for agents', url: 'https://www.anthropic.com/engineering/writing-tools-for-agents' },
  skills: { label: 'Agent Skills', url: 'https://code.claude.com/docs/en/skills' },
};

export const domains: Domain[] = [
  {
    id: 1, slug: 'agents-workflows', name: 'Agents and Workflows', short: 'Agents & Workflows', weight: 14.7, items: 8,
    summary: 'When to use a workflow versus an agent, manager/supervisor hierarchies and subagents, building agents with the Claude Agent SDK or custom loops, hosting models, hooks, and common agent patterns and frameworks.',
    links: [L.agents, L.sdk],
    tasks: [
      skill({ id: '1.1', title: 'Agent Architecture', weight: 4.5, description: 'Principles, patterns, and tradeoffs of agent and workflow architecture, including the decision criteria for using a workflow versus an agent, the structure of manager/supervisor hierarchies, and the role of subagents in improving task execution.' }),
      skill({ id: '1.2', title: 'Agent Construction with Claude', weight: 5.3, description: 'Methods, tools, and platforms for constructing Claude agents, including the Claude Agent SDK, custom agent loops and harnesses, managed agent deployment models (self-hosted vs. Anthropic-hosted), and hooks for deterministic actions.' }),
      skill({ id: '1.3', title: 'Agent Patterns and Frameworks', weight: 4.9, description: 'Common agent design patterns (tool-use loops, sub-agents, memory, context-window management) and agentic abstraction frameworks (e.g., Strands, LangGraph, PydanticAI) for building agents and workflows for multi-step tasks.' }),
    ],
  },
  {
    id: 2, slug: 'applications-integration', name: 'Applications and Integration', short: 'Apps & Integration', weight: 33.1, items: 18,
    summary: 'The heaviest domain by far. Turning business requirements into systems, the software life cycle, Claude API mechanics (messages, tools, streaming, vision, thinking, caching, batch, third-party vendors), software-engineering fundamentals, Claude application design and configuration management.',
    links: [L.api, L.batch, L.caching],
    tasks: [
      skill({ id: '2.1', title: 'Understanding Requirements', weight: 3.4, description: 'Functional and infrastructure requirements based on business requirements and solution architecture.' }),
      skill({ id: '2.2', title: 'Systems Life Cycle', weight: 2.8, description: 'Systems life cycle management concepts and frameworks used to develop, implement, operate, and maintain IT systems.' }),
      skill({ id: '2.3', title: 'Claude API Mechanics', weight: 6.8, description: 'Claude API behavior and mechanics, including messages, tools, streaming, vision, thinking, caching, invoking Claude through third-party vendors, Messages API data access patterns, batch API use, and tradeoffs between realtime and batch API selection.' }),
      skill({ id: '2.4', title: 'Software Engineering Foundations', weight: 7.4, description: 'Core software engineering principles and practices, including REST APIs, JSON, asynchronous programming, version control, SDLC integration, code review, and small- and large-scale refactoring.' }),
      skill({ id: '2.5', title: 'Claude Application Design', weight: 8.6, description: 'Design considerations for building Claude applications, including how Claude interprets instructions across interfaces (Claude Code, Desktop, claude.ai, API, SDKs), content boundaries, schema design, session hygiene, and plugin management.' }),
      skill({ id: '2.6', title: 'Configuration Management', weight: 4.1, description: 'Configuration management for Claude system components, including CLAUDE.md files, settings.json, model version pinning, prompt versioning, and plugin dependencies.' }),
    ],
  },
  {
    id: 3, slug: 'claude-code', name: 'Claude Code', short: 'Claude Code', weight: 3.1, items: 2,
    summary: 'Claude Code components (rules, skills, commands, agents, memory), sessions, slash commands, headless and streaming modes, auto mode, the CLAUDE.md hierarchy, repository initialisation and settings.json.',
    links: [L.cc, L.ccSettings],
    tasks: [
      skill({ id: '3.1', title: 'Claude Code Operation', weight: 3.1, description: 'Claude Code core components (Rules, Skills, Commands, Agents, Agent Memory), features (session management, built-in and custom slash commands, headless mode, streaming mode, auto-mode), the CLAUDE.md hierarchy, repository initialization, and settings.json configuration.' }),
    ],
  },
  {
    id: 4, slug: 'eval-testing-debugging', name: 'Eval, Testing, and Debugging', short: 'Eval & Debugging', weight: 2.6, items: 1,
    summary: 'Identifying error types, choosing recovery strategies, reading traces to find failure modes, and isolating whether a problem comes from the integration layer or the model output.',
    links: [L.api],
    tasks: [
      skill({ id: '4.1', title: 'Debugging and Error Handling', weight: 2.6, description: 'Debugging and error handling techniques for Claude applications, including error type identification, recovery strategy selection, trace analysis to identify failure modes, and problem origin isolation between the integration layer and model output.' }),
    ],
  },
  {
    id: 5, slug: 'model-selection-optimization', name: 'Model Selection and Optimization', short: 'Models & Optimization', weight: 16.8, items: 9,
    summary: 'LLM fundamentals (tokens, context, sampling, non-determinism), thinking and effort options, SDK/REST/websocket fundamentals, choosing between Opus, Sonnet and Haiku, behaviour changes across releases, and token and cost management including prompt caching.',
    links: [L.models, L.caching],
    tasks: [
      skill({ id: '5.1', title: 'LLM Fundamentals', weight: 5.2, description: 'Basic understanding of LLMs (tokens, context windows, sampling, non-determinism, next-token generation), model options (fast mode, extended thinking, adaptive thinking, effort levels), and fundamental prompting techniques (zero-shot, single-shot, multi-shot).' }),
      skill({ id: '5.2', title: 'Technical Fundamentals', weight: 6.1, description: 'Foundational technical concepts supporting AI application development, including basic engineering practices (integrating with SDKs that wrap REST APIs, websockets).' }),
      skill({ id: '5.3', title: 'Model Selection and Tradeoffs', weight: 2.7, description: 'Claude model capabilities (Opus vs. Sonnet vs. Haiku use cases, adaptive thinking support), tradeoffs across quality/latency/cost parameters, and breaking behavior changes across model releases when selecting models for tasks.' }),
      skill({ id: '5.4', title: 'Cost and Token Management', weight: 2.8, description: 'Token budgeting and cost management techniques for Claude applications, including token usage tracking, cost modeling, and caching techniques (prompt caching, cache check-pointing) for cost optimization.' }),
    ],
  },
  {
    id: 6, slug: 'prompt-context-engineering', name: 'Prompt and Context Engineering', short: 'Prompt & Context', weight: 11, items: 6,
    summary: 'Managing the context window (pruning, compaction, isolation through subagents), writing clear prompts (few-shot, system vs user placement, output constraints, input sanitisation), and producing, validating and defensively parsing output.',
    links: [L.prompting, L.context],
    tasks: [
      skill({ id: '6.1', title: 'Context Engineering', weight: 3.8, description: 'Context and memory management techniques for Claude applications, including context window management, prevention of context drift and bloat (tool output pruning, compaction), and context isolation through subagents or multi-step agentic workflows.' }),
      skill({ id: '6.2', title: 'Prompt Engineering', weight: 4.6, description: 'Prompt engineering principles and methods (instruction clarity, few-shot examples, system versus user placement, output constraints, prompt and instruction placement across components, iterative refinement, prompt adjustment, input sanitization) when writing and iterating on prompts for Claude.' }),
      skill({ id: '6.3', title: 'Output Handling', weight: 2.6, description: 'Established patterns and techniques for producing, validating, and consuming Claude output, including structured output patterns, response validation, defensive parsing, and skepticism toward confident output.' }),
    ],
  },
  {
    id: 7, slug: 'security-safety', name: 'Security and Safety', short: 'Security & Safety', weight: 8.1, items: 4,
    summary: 'Prompt injection and jailbreak defence, untrusted input, data leakage and PII, layered guardrails and least privilege, hooks that block destructive actions, and secrets, keys and identity management.',
    links: [L.ccHooks],
    tasks: [
      skill({ id: '7.1', title: 'AI Application Security', weight: 3.2, description: 'Data privacy and security best practices, including prompt injection awareness and mitigation, jailbreak defense, untrusted input handling, data leakage prevention, PII handling, and ensuring authentication, authorization, confidentiality, privacy, and integrity.' }),
      skill({ id: '7.2', title: 'Guardrails and Safe Deployment', weight: 2.3, description: 'Safe and responsible deployment practices (content policy, guardrail layering) and secure-by-design principles (privacy, identity and access management, least privilege).' }),
      skill({ id: '7.3', title: 'Claude Hooks', weight: 1.0, description: 'Leveraging hooks for guardrails and safety controls to prevent destructive actions within Claude applications.' }),
      skill({ id: '7.4', title: 'Identity, Secrets, and Key Management', weight: 1.6, description: 'Managing secrets, credentials, and API keys across Claude development and production environments, including identity validation and authentication, access approval and level verification, and authorized access monitoring.' }),
    ],
  },
  {
    id: 8, slug: 'tools-mcps', name: 'Tools and MCPs', short: 'Tools & MCPs', weight: 10.6, items: 5,
    summary: 'Implementing tools and function calling, writing tool descriptions, client- vs server-side tools and approval patterns, authoring MCP servers (tools, resources, prompts, transports), and choosing between built-in tools, custom tools, Skills and MCP.',
    links: [L.toolUse, L.tools, L.mcp, L.skills],
    tasks: [
      skill({ id: '8.1', title: 'Tool Implementation', weight: 4.4, description: 'Tool implementation practices for Claude applications, including tool use and function calling, configuration for external system interaction, tool description writing, error handling, tool usage patterns (agentic harness dispatch, client-side vs. server-side tools, approval patterns), and tool set construction best practices.' }),
      skill({ id: '8.2', title: 'MCP Server Development', weight: 2.1, description: 'MCP server development practices, including server authoring, deployment, integration with Claude applications, MCP resources, tools, and prompts, and communication patterns (stdio, sockets, client vs. server).' }),
      skill({ id: '8.3', title: 'Agentic Customization', weight: 4.1, description: 'Tradeoffs among built-in Tools, custom Tools, Skills, and MCPs for selecting and applying the appropriate approach for a given use case.' }),
    ],
  },
];

export const domainById = (id: number) => domains.find((d) => d.id === id);
export const taskById = (taskId: string) => domains.flatMap((d) => d.tasks).find((t) => t.id === taskId);
