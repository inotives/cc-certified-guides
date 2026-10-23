import type { Scenario } from '../types.js';

// The six scenarios from Exam Guide section 5. Each sitting draws 4 of the 6 at random.
export const scenarios: Scenario[] = [
  {
    id: 1,
    slug: 'customer-support',
    name: 'Customer Support Resolution Agent',
    context:
      'An Agent SDK agent handling high-ambiguity requests (returns, billing disputes, account issues) through custom MCP tools — get_customer, lookup_order, process_refund, escalate_to_human. Target: 80%+ first-contact resolution while knowing when to escalate.',
    domains: [1, 2, 5],
    watchFor: [
      'Identity verification before money moves must be enforced in code (prerequisite gate / hook), not prompt wording.',
      'Thin tool descriptions cause get_customer vs lookup_order confusion — fix descriptions first.',
      'Escalation calibration: explicit criteria + few-shot, not sentiment or self-reported confidence.',
      'Explicit “I want a human” → escalate immediately. Policy silent on the request → escalate.',
      'Persist amounts/order IDs in a case-facts block; trim 40-field order lookups.',
      'Handoffs to humans must be structured and self-contained.',
    ],
  },
  {
    id: 2,
    slug: 'code-generation',
    name: 'Code Generation with Claude Code',
    context:
      'A team uses Claude Code for code generation, refactoring, debugging and documentation, integrated with custom slash commands and CLAUDE.md configuration; the team must know when to use plan mode vs direct execution.',
    domains: [3, 5],
    watchFor: [
      'Shared vs personal: .claude/commands/ and project CLAUDE.md are version-controlled; ~/.claude/* is personal.',
      'Conventions by file type across directories → .claude/rules/ with paths globs.',
      'Plan mode for architectural or multi-file work; direct execution for scoped fixes.',
      'Explore subagent, scratchpads and /compact against context degradation.',
      'Iterative refinement: I/O examples, tests first, interview pattern.',
    ],
  },
  {
    id: 3,
    slug: 'multi-agent-research',
    name: 'Multi-Agent Research System',
    context:
      'An Agent SDK coordinator delegates to specialised subagents — web search, document analysis, synthesis, report generation — to produce comprehensive, cited research reports.',
    domains: [1, 2, 5],
    watchFor: [
      'Coverage gaps usually trace back to the coordinator’s decomposition.',
      'Subagents receive context only through their prompt; allowedTools must include "Task".',
      'Parallel subagents = multiple Task calls in one response.',
      'Structured error context; distinguish timeouts from genuine empty results.',
      'Claim–source mappings, dates, and annotated conflicts survive synthesis.',
      'Least-privilege tools per subagent, with narrow cross-role tools for frequent needs.',
    ],
  },
  {
    id: 4,
    slug: 'developer-productivity',
    name: 'Developer Productivity with Claude',
    context:
      'An Agent SDK tool that helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate and automate repetitive tasks, using built-in tools (Read, Write, Bash, Grep, Glob) and MCP servers.',
    domains: [2, 3, 1],
    watchFor: [
      'Grep for content, Glob for paths; Read + Write when Edit lacks a unique anchor.',
      'Explore incrementally: entry points first, then follow imports.',
      '.mcp.json (team, ${ENV} secrets) vs ~/.claude.json (personal).',
      'MCP resources for catalogs; better MCP descriptions so Grep isn’t preferred.',
      'Agentic loop control via stop_reason; resume vs fresh session with summary.',
    ],
  },
  {
    id: 5,
    slug: 'ci-cd',
    name: 'Claude Code for Continuous Integration',
    context:
      'Claude Code runs in the CI/CD pipeline: automated code review, test-case generation and pull-request feedback. Prompts must be actionable and minimise false positives.',
    domains: [3, 4],
    watchFor: [
      '-p / --print for non-interactive runs; --output-format json + --json-schema for parseable findings.',
      'Explicit report/skip criteria and severity examples beat “be conservative”.',
      'Independent reviewer instance; per-file + integration passes for large PRs.',
      'Batch API for overnight work only — never for blocking pre-merge checks.',
      'Feed prior findings and existing tests into context to avoid duplicates.',
    ],
  },
  {
    id: 6,
    slug: 'data-extraction',
    name: 'Structured Data Extraction',
    context:
      'A system that extracts information from unstructured documents, validates output against JSON schemas, maintains high accuracy, handles edge cases gracefully and feeds downstream systems.',
    domains: [4, 5],
    watchFor: [
      'tool_use + JSON schema for guaranteed structure; tool_choice "any" vs forced.',
      'Nullable/optional fields stop fabrication; enum "other" + detail, "unclear".',
      'Retry with specific errors works for format issues, not missing information.',
      'Semantic checks: calculated_total vs stated_total, conflict_detected.',
      'Segment accuracy by doc type/field; stratified sampling; calibrated confidence.',
      'Batch with custom_id; resubmit only failures; prompt-tune on a sample first.',
    ],
  },
];

export const scenarioById = (id: number) => scenarios.find((s) => s.id === id);
