import type { Diagram } from '../types.js';

// Study diagrams per skill id, rendered as SVG on the domain pages. Like notes/*.json these are study aids, not
// official text: every fact here must already be in that skill's notes (or the official guide).

export const diagrams: Record<string, Diagram[]> = {
  // ---------- Domain 1: Agents and Workflows ----------
  '1.1': [
    {
      kind: 'decision', title: 'Pick the simplest architecture that works',
      question: 'What does the task look like?',
      branches: [
        { when: 'Fixed, known steps that must be reproducible and auditable', then: 'Prompt chaining (workflow) with programmatic gates' },
        { when: 'Distinct input categories needing different prompts or tools', then: 'Routing workflow' },
        { when: 'Independent subtasks, or several attempts to vote on', then: 'Parallelization workflow' },
        { when: 'Clear quality criteria; drafts improve with feedback', then: 'Evaluator-optimizer' },
        { when: 'Number or order of steps can’t be known in advance', then: 'Agent with scoped tools and an iteration cap', tone: 'accent' },
        { when: 'Broad work that splits into separable parts', then: 'Supervisor + subagents (fresh contexts, condensed results)', tone: 'accent' },
      ],
    },
  ],
  '1.2': [
    {
      kind: 'compare', title: 'Where the agent loop runs',
      columns: [
        { head: 'Client SDK', items: ['Calls the Claude API directly', 'You write the tool loop (or use the tool runner)', 'Return `tool_result` blocks citing each `tool_use_id`'] },
        { head: 'Agent SDK (self-hosted)', items: ['Claude Code’s loop, built-in tools, sessions and hooks', 'Runs in sandboxed containers you operate', 'Loads CLI settings unless `settingSources: []`'] },
        { head: 'Managed Agents', items: ['Hosted harness runs the loop', 'Sandbox is Anthropic-managed or self-hosted', 'Long-running agents without operating containers'] },
      ],
    },
    {
      kind: 'flow', title: 'One tool call through the Agent SDK',
      steps: [
        { label: 'Claude requests a tool call', tone: 'sky' },
        { label: '`PreToolUse` hook', note: 'Deterministic code: can block or modify the call. Checked first.', tone: 'accent' },
        { label: 'Permission rules', note: 'A hook’s `allow` does not bypass a deny rule.' },
        { label: '`canUseTool` callback', note: 'Runtime approval for anything the rules don’t settle (e.g. a human sign-off).' },
        { label: 'Tool runs' },
        { label: '`PostToolUse` hook', note: 'After execution: audit log or follow-up. Cannot prevent the call.', tone: 'good' },
      ],
    },
  ],
  '1.3': [
    {
      kind: 'flow', title: 'The tool-use loop',
      loop: 'repeat until done',
      steps: [
        { label: 'Send `messages` + tool definitions', tone: 'sky' },
        { label: 'Claude asks for a tool', note: '`stop_reason` is `tool_use`' },
        { label: 'Your app runs the tool', note: 'Failures go back as informative error results, not crashes.' },
        { label: 'Return `tool_result`', note: 'Appended to the history; the API itself is stateless.', tone: 'good' },
      ],
    },
    {
      kind: 'decision', title: 'Long-running agent: symptom → technique',
      question: 'What is going wrong with context or memory?',
      branches: [
        { when: 'Context filling up with old tool results', then: 'Compaction or tool-result clearing' },
        { when: 'Must remember across separate conversations', then: 'Memory tool backed by your own storage' },
        { when: 'Hundreds of documents loaded up front', then: 'Just-in-time retrieval: references in context, load via tools' },
        { when: 'Progress lost after compaction', then: 'Progress file outside the context window' },
        { when: 'Framework agent picks the wrong tool', then: 'Trace the real requests the framework sends', tone: 'amber' },
      ],
    },
  ],

  // ---------- Domain 2: Applications and Integration ----------
  '2.1': [
    {
      kind: 'decision', title: 'Business requirement → technical decision',
      question: 'What did the business actually ask for?',
      branches: [
        { when: '“Answer while the customer is on the line”', then: 'Realtime Messages API, streamed' },
        { when: 'High volume, results can wait', then: 'Message Batches API (lower price)' },
        { when: '“Data must stay in one geography”', then: '`inference_geo`, or a regional endpoint on a cloud platform' },
        { when: 'Same long prefix every request, tight budget', then: 'Prompt caching on the stable prefix' },
        { when: '“A human must approve before sending”', then: 'Approval gate enforced in the app, not the prompt', tone: 'accent' },
        { when: 'High availability target, occasional 529s', then: 'Backoff retries plus a fallback route' },
      ],
    },
  ],
  '2.2': [
    {
      kind: 'flow', title: 'A model or prompt change is a release',
      loop: 'next change',
      steps: [
        { label: 'Plan', note: 'Deprecation notice? Find where the model is used (audit usage).' },
        { label: 'Build', note: 'New prompt version or pinned model ID, versioned in source control.' },
        { label: 'Test', note: 'Run the fixed eval set; compare with the current baseline.', tone: 'accent' },
        { label: 'Deploy', note: 'Stage the rollout; roll back if errors spike.' },
        { label: 'Operate', note: 'Watch `stop_reason` (`max_tokens`), errors by type, latency, cache usage.', tone: 'sky' },
        { label: 'Maintain', note: 'Add failing cases to the regression suite; move off deprecated models before retirement.' },
        { label: 'Retire', note: 'Revoke keys; delete or archive stored files and logs.', tone: 'warn' },
      ],
    },
  ],
  '2.3': [
    {
      kind: 'decision', title: 'Read `stop_reason` before anything else',
      question: 'The response came back. Why did generation stop?',
      branches: [
        { when: '`end_turn`', then: 'Finished normally' },
        { when: '`tool_use`', then: 'Run the tool; reply with `tool_result` first, citing `tool_use_id`', tone: 'sky' },
        { when: '`max_tokens`', then: 'Truncated: raise the limit or continue', tone: 'amber' },
        { when: '`stop_sequence`', then: 'Hit one of your stop sequences' },
        { when: '`refusal`', then: 'Handle as a refusal; don’t parse it as normal output', tone: 'warn' },
        { when: '`model_context_window_exceeded`', then: 'Context is full: trim or compact the history', tone: 'amber' },
      ],
    },
    {
      kind: 'compare', title: 'Realtime vs batch',
      columns: [
        { head: 'Messages API (realtime)', items: ['A user is waiting', 'Stateless: resend `system` + full `messages` each time', 'Stream with SSE; `error` events can arrive after HTTP 200'] },
        { head: 'Message Batches API', items: ['Latency-tolerant, high volume, half price', 'Results when all finish or after 24 hours', 'Any order: join on `custom_id`', 'No `stream`'] },
      ],
    },
  ],
  '2.4': [
    {
      kind: 'compare', title: 'Is it safe to retry this request?',
      columns: [
        { head: 'Idempotent: retry freely', tone: 'good', items: ['GET (also safe: no side effects)', 'PUT', 'DELETE'] },
        { head: 'Not idempotent: dedupe first', tone: 'warn', items: ['POST', 'PATCH (not guaranteed)', 'Webhook handlers: deduplicate on event ID'] },
      ],
    },
    {
      kind: 'decision', title: 'Engineering symptom → fix',
      question: 'What broke?',
      branches: [
        { when: '429 or 529 during traffic spikes', then: 'Honour `retry-after`; capped exponential backoff with jitter' },
        { when: 'Rows skipped or duplicated while paging', then: 'Cursor (keyset) pagination on a stable sort key' },
        { when: 'Long non-streaming generation times out', then: 'Streaming, or Message Batches if latency-tolerant' },
        { when: 'Deployed clients broke after an API change', then: 'Only additive changes: new optional fields', tone: 'amber' },
        { when: 'Hundreds of files to migrate', then: 'Prove the pattern, then batches with tests and commits' },
      ],
    },
  ],
  '2.5': [
    {
      kind: 'compare', title: 'What each interface actually gives Claude',
      columns: [
        { head: 'claude.ai & apps', items: ['Their own system prompt (date, formatting habits)', 'Not applied to the API'] },
        { head: 'Messages API & client SDKs', items: ['Only the `system` you send', 'Stateless: your app owns the session', 'No repo files, no file or shell tools'] },
        { head: 'Claude Code & Agent SDK', items: ['Reads `CLAUDE.md`', 'Built-in file and shell tools', 'Plugins: skills, agents, hooks, MCP servers'] },
      ],
    },
    {
      kind: 'flow', title: 'Structured output is two checks, not one',
      steps: [
        { label: 'Schema guarantee', note: 'Structured outputs (`output_config.format`) or `strict: true` tools.', tone: 'sky' },
        { label: 'Business rules in your code', note: 'The schema can’t check totals, ranges or consistency.', tone: 'accent' },
      ],
    },
  ],
  '2.6': [
    {
      kind: 'layers', title: 'Claude Code settings precedence',
      axis: { label: 'higher wins', dir: 'up' },
      layers: [
        { label: 'Managed settings', note: 'Org policy; can’t be overridden' },
        { label: 'Command-line `--settings`' },
        { label: '`.claude/settings.local.json`', note: 'Personal, kept out of git' },
        { label: '`.claude/settings.json`', note: 'Shared with the team, committed' },
        { label: '`~/.claude/settings.json`', note: 'User, all projects' },
      ],
    },
    {
      kind: 'compare', title: 'Context vs enforcement',
      columns: [
        { head: 'Context (can be ignored)', tone: 'amber', items: ['`CLAUDE.md` files', 'Keep each ~200 lines; scope the rest with `.claude/rules/` or skills', '`@path` imports still load into context'] },
        { head: 'Enforced', tone: 'good', items: ['Permission deny rules', '`PreToolUse` hooks', 'Pinned full model ID, not an alias', 'Semver range in `plugin.json` `dependencies`'] },
      ],
    },
  ],

  // ---------- Domain 3: Claude Code ----------
  '3.1': [
    {
      kind: 'layers', title: 'Where CLAUDE.md instructions come from',
      axis: { label: 'broadest scope', dir: 'up' },
      layers: [
        { label: 'Managed policy CLAUDE.md', note: 'Organisation-wide' },
        { label: '`~/.claude/CLAUDE.md`', note: 'You, every project' },
        { label: '`./CLAUDE.md`', note: 'The project, shared via git' },
        { label: '`CLAUDE.local.md`', note: 'You, this project, kept out of git' },
        { label: 'Subdirectory CLAUDE.md and `.claude/rules/`', note: 'Loaded on demand / when matching `paths`' },
      ],
    },
    {
      kind: 'decision', title: 'Which Claude Code feature?',
      question: 'What do you need?',
      branches: [
        { when: 'Personal note for one repo, not committed', then: '`CLAUDE.local.md`' },
        { when: 'Conventions only for `src/api/` files', then: '`.claude/rules/` file with `paths` frontmatter' },
        { when: 'A rule that must always hold', then: '`PreToolUse` hook or permission deny rule', tone: 'accent' },
        { when: 'On-demand `/release` Claude must never start', then: 'Skill with `disable-model-invocation: true`' },
        { when: 'CI dashboard needs live events', then: '`claude -p --output-format stream-json`', tone: 'sky' },
      ],
    },
  ],

  // ---------- Domain 4: Eval, Testing, and Debugging ----------
  '4.1': [
    {
      kind: 'decision', title: 'Error → recovery strategy',
      question: 'What came back?',
      branches: [
        { when: '400 `invalid_request_error` / 413', then: 'Change the request; a retry fails the same way', tone: 'warn' },
        { when: '401 / 403', then: 'Check the API key and its permissions', tone: 'warn' },
        { when: '429 `rate_limit_error`', then: 'Back off, honour `retry-after`, smooth the rate' },
        { when: '500 / 529 `overloaded_error`', then: 'Transient: back off and retry; fall back if exhausted' },
        { when: '200 with `stop_reason` `max_tokens`', then: 'Not an error: raise the limit or continue', tone: 'amber' },
        { when: '200, then an `error` event in the stream', then: 'Handle errors inside the SSE stream', tone: 'amber' },
        { when: 'Trace shows `[object Object]` as a tool result', then: 'Integration bug (serialisation), not the model', tone: 'sky' },
      ],
    },
  ],

  // ---------- Domain 5: Model Selection and Optimization ----------
  '5.1': [
    {
      kind: 'layers', title: 'Everything counts toward the context window',
      layers: [
        { label: 'System prompt', tone: 'plain' },
        { label: 'Tool definitions' },
        { label: 'All messages, including tool results' },
        { label: 'This turn’s output, including thinking', tone: 'accent' },
      ],
    },
    {
      kind: 'decision', title: 'Consistency comes from design, not sampling knobs',
      question: 'Output is inconsistent or off. Which lever?',
      branches: [
        { when: 'Same input, different labels across runs', then: 'Enumerated output format + examples, checked by a repeated-run eval' },
        { when: 'Unusual house format', then: '3–5 diverse examples in example tags' },
        { when: 'Justification rationalises a verdict given first', then: 'Reasoning before the verdict, or enable thinking' },
        { when: 'Verbose and slow on easy, scoped tasks', then: 'Lower `effort`' },
        { when: 'Bill far above visible text with thinking on', then: 'Full thinking is billed as output, not the summary', tone: 'amber' },
      ],
    },
  ],
  '5.2': [
    {
      kind: 'flow', title: 'Interactive streaming architecture',
      steps: [
        { label: 'Browser', note: 'User can stop or follow up mid-answer.', tone: 'sky' },
        { label: 'Your backend', note: 'WebSocket to the browser (full-duplex). Holds the API key; aborts upstream on stop.', tone: 'accent' },
        { label: 'Claude API', note: '`stream: true` over HTTP: server-sent events, not WebSockets.', tone: 'good' },
      ],
    },
    {
      kind: 'flow', title: 'SSE event order for one message',
      steps: [
        { label: '`message_start`' },
        { label: '`content_block_start`', note: 'Repeats per content block.' },
        { label: '`content_block_delta` × N', note: 'Text, or partial JSON (`input_json_delta`) for tool input.', tone: 'sky' },
        { label: '`content_block_stop`' },
        { label: '`message_delta`', note: '`stop_reason` and cumulative usage.' },
        { label: '`message_stop`', note: '`ping` events may also appear; an `error` event can arrive after HTTP 200.', tone: 'good' },
      ],
    },
  ],
  '5.3': [
    {
      kind: 'compare', title: 'Model tiers',
      columns: [
        { head: 'Haiku', items: ['Fastest, lowest cost', 'High-volume classification, extraction, routing', 'Subagent tasks'] },
        { head: 'Sonnet', items: ['Best balance of speed and intelligence', 'Everyday coding, agents, enterprise work'] },
        { head: 'Opus', items: ['Complex, long-running agentic coding', 'Accuracy outweighs cost and latency'] },
      ],
    },
    {
      kind: 'flow', title: 'Choosing (and changing) a model',
      steps: [
        { label: 'Start from the eval set', note: 'Pick the cheapest tier that passes.', tone: 'accent' },
        { label: 'Tune `effort` before switching models', note: 'Trades intelligence for latency and cost within one model.' },
        { label: 'Pin the model ID', note: 'New releases ship under new IDs.' },
        { label: 'New release? Read the migration guide', note: 'Breaking changes: rejected parameters, prefill errors, new tokenizers.', tone: 'amber' },
      ],
    },
  ],
  '5.4': [
    {
      kind: 'layers', title: 'Prompt cache prefix order',
      axis: { label: 'a change invalidates everything below', dir: 'down' },
      layers: [
        { label: '`tools`', note: 'Keep stable: a per-user tool kills the cache' },
        { label: '`system`', note: 'No timestamps before the breakpoint' },
        { label: '`messages`', note: 'Add intermediate breakpoints on long turns' },
      ],
    },
    {
      kind: 'decision', title: 'Reading `usage` when caching',
      question: 'What do the usage fields show?',
      branches: [
        { when: '`input_tokens` near zero after enabling caching', then: 'Total input = input + cache read + cache write' },
        { when: 'Fresh cache write on every request', then: 'Something early in the prefix changes; move it after the breakpoint', tone: 'amber' },
        { when: 'Both cache fields always 0, no error', then: 'Prefix is below the minimum cacheable length', tone: 'amber' },
        { when: 'Hits drop on turns that add many blocks', then: 'Add an intermediate breakpoint (check-point)' },
      ],
    },
  ],

  // ---------- Domain 6: Prompt and Context Engineering ----------
  '6.1': [
    {
      kind: 'decision', title: 'Context problem → fix',
      question: 'Why is the context degrading?',
      branches: [
        { when: 'Mostly old file reads and search output', then: 'Clear or prune processed tool results' },
        { when: 'Hours-long chat nearing the limit', then: 'Compaction: summarise older turns, keep recent ones' },
        { when: 'Lead agent drowning in deep explorations', then: 'Subagents with clean contexts returning short summaries' },
        { when: 'Multi-session task redoes finished work', then: 'Progress notes or memory tool, read at session start' },
        { when: 'Context editing raised costs with caching on', then: 'Set `clear_at_least` so each clearing is worth it', tone: 'amber' },
      ],
    },
  ],
  '6.2': [
    {
      kind: 'flow', title: 'Prompt layout, top to bottom',
      steps: [
        { label: '`system`: role and policy', note: 'Stable instructions; explain why they matter.', tone: 'accent' },
        { label: 'Long documents', note: 'At the top of the user turn.' },
        { label: 'Examples', note: '3–5 relevant, diverse examples in `<example>` tags.' },
        { label: 'Untrusted input', note: 'Clearly delimited, e.g. in XML tags.', tone: 'warn' },
        { label: 'Query and instructions last', note: 'Exact format, length, audience; ask for quotes first.', tone: 'good' },
      ],
    },
  ],
  '6.3': [
    {
      kind: 'flow', title: 'Consuming output safely',
      steps: [
        { label: 'Check `stop_reason`', note: '`max_tokens` or `refusal`: the schema guarantee doesn’t hold.', tone: 'amber' },
        { label: 'Parse against the schema', note: 'Structured outputs or strict tool use (constrained decoding).' },
        { label: 'Validate semantics in code', note: 'Totals, ranges (`minimum`/`maximum` aren’t supported in the schema).', tone: 'accent' },
        { label: 'Check grounding', note: 'Confident wording isn’t evidence; require sources and citations.' },
        { label: 'Use it, or retry / send to human review', tone: 'good' },
      ],
    },
  ],

  // ---------- Domain 7: Security and Safety ----------
  '7.1': [
    {
      kind: 'flow', title: 'Where each security control belongs',
      steps: [
        { label: 'Untrusted content', note: 'Web pages, emails, documents, tool results, user messages: data, not instructions.', tone: 'warn' },
        { label: 'Retrieval / tool layer', note: 'Filter by the session’s tenant ID before data reaches the model.' },
        { label: 'Before the API call', note: 'Redact or tokenise PII the task doesn’t need.' },
        { label: 'Context window', note: 'No secrets anywhere, including the system prompt.' },
        { label: 'Model requests a tool', note: 'Its arguments can be manipulated.', tone: 'amber' },
        { label: 'Authorise in code', note: 'Identity from the server-side session; gate sensitive actions.', tone: 'good' },
      ],
    },
  ],
  '7.2': [
    {
      kind: 'layers', title: 'Layered guardrails',
      layers: [
        { label: 'Input screening', note: 'Often a fast, cheap model such as Haiku', tone: 'sky' },
        { label: 'Policy in the system prompt', note: 'Company-specific rules stated explicitly' },
        { label: 'Output validation', note: 'Check against the policy' },
        { label: 'Human review' },
        { label: 'Logging' },
      ],
    },
    {
      kind: 'compare', title: 'Secure by design',
      columns: [
        { head: 'Least privilege', items: ['Read-only token scoped to needed resources', 'Never admin credentials just to read'] },
        { head: 'Sandboxed execution', items: ['No secrets inside', 'Restricted filesystem', 'Allowlisted network egress'] },
        { head: 'Unbypassable rules', items: ['Managed settings win', 'Deny rules evaluated before ask and allow'] },
      ],
    },
  ],
  '7.3': [
    {
      kind: 'flow', title: 'Hook lifecycle around one tool call',
      steps: [
        { label: '`PreToolUse`', note: 'Can block. Matcher filters on tool name: `Bash`, `Edit|Write`, `mcp__server__.*`.', tone: 'accent' },
        { label: 'Tool runs' },
        { label: '`PostToolUse`', note: 'Already ran: can report or feed back to Claude, not prevent.', tone: 'amber' },
      ],
    },
    {
      kind: 'decision', title: 'What the hook’s result means',
      question: 'The command hook finished. How?',
      branches: [
        { when: 'Exit 0, no output', then: 'No decision: normal flow continues' },
        { when: 'Exit 2', then: 'Blocks the action; stderr is the reason', tone: 'good' },
        { when: 'Any other exit code (e.g. 1)', then: 'Non-blocking error: the action still runs', tone: 'warn' },
        { when: 'JSON `permissionDecision`', then: '`allow`, `deny`, `ask` or `defer`', tone: 'sky' },
      ],
    },
  ],
  '7.4': [
    {
      kind: 'flow', title: 'API key lifecycle',
      steps: [
        { label: 'Create', note: 'Service account or workload identity for CI and prod, not a personal key.', tone: 'accent' },
        { label: 'Store', note: 'Secrets manager or environment variable (`ANTHROPIC_API_KEY`).' },
        { label: 'Separate', note: 'Workspaces per environment, each with its own rate and spend limits.' },
        { label: 'Monitor', note: 'Per-service keys, so usage can be grouped by key.' },
        { label: 'Rotate', note: 'Periodically, with expirations set.' },
        { label: 'Leaked? Disable or delete now', note: 'Then replace it and review usage.', tone: 'warn' },
      ],
    },
  ],

  // ---------- Domain 8: Tools and MCPs ----------
  '8.1': [
    {
      kind: 'flow', title: 'Client tool round trip',
      loop: 'until `end_turn`',
      steps: [
        { label: 'Claude stops with `tool_use`', note: 'One or more `tool_use` blocks.', tone: 'sky' },
        { label: 'Harness dispatches each call', note: 'Approval gate for sensitive calls, e.g. refunds over a threshold.', tone: 'accent' },
        { label: 'Run the tool', note: 'On failure: `is_error: true` with an actionable message.' },
        { label: 'One user message back', note: 'All `tool_result` blocks first, matched by `tool_use_id`.', tone: 'good' },
      ],
    },
    {
      kind: 'compare', title: 'Client vs server tools',
      columns: [
        { head: 'Client tools', items: ['Run in your application', 'User-defined, or Anthropic-schema (`bash`, `text_editor`)', 'You return `tool_result` and handle `is_error`'] },
        { head: 'Server tools', items: ['Run on Anthropic’s infrastructure', '`web_search`, `web_fetch`, code execution', 'No `is_error` handling on your side'] },
      ],
    },
  ],
  '8.2': [
    {
      kind: 'compare', title: 'MCP server primitives',
      columns: [
        { head: 'Tools', items: ['Model-controlled', 'Actions, e.g. run a query'] },
        { head: 'Resources', items: ['Application-driven', 'Context, e.g. a schema'] },
        { head: 'Prompts', items: ['User-controlled', 'Templates the user picks'] },
      ],
    },
    {
      kind: 'compare', title: 'Transports',
      columns: [
        { head: 'stdio', items: ['Local subprocess', 'e.g. wrapping a local CLI for one user', 'Not reachable from the Messages API MCP connector'] },
        { head: 'Streamable HTTP', items: ['Remote; many users and teams', 'Standard HTTP auth; OAuth recommended', 'Messages API connector (`mcp_servers`) can use it', 'Replaces the deprecated SSE transport'] },
      ],
    },
  ],
  '8.3': [
    {
      kind: 'decision', title: 'Which extension point?',
      question: 'What do you need Claude to gain?',
      branches: [
        { when: 'Common needs: read files, search, run tests', then: 'Built-in tools with permission rules' },
        { when: 'Exact statistics on uploaded data via the API', then: 'Code execution server tool' },
        { when: 'Live data from a private service, one app', then: 'Custom client tool (server tools can’t reach it)' },
        { when: 'Integration reused across Claude apps', then: 'MCP server' },
        { when: 'Repeatable procedure, templates, helper script', then: 'Skill (`SKILL.md`, loaded progressively)', tone: 'accent' },
      ],
    },
  ],
};
