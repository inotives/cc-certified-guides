import type { ExamContent } from '../types.js';
import { DOMAIN_COLORS, esc, pageHead, rich, ring } from '../../views/layout.js';

// Exam-specific pages for Architect – Foundations: the "Exam focus" guide and the cheat sheet.

// ---------------- exam focus ----------------

export function guideBody(exam: ExamContent) {
  const B = exam.base;
  const { domains } = exam;
  const body = `
  ${pageHead('Exam focus', 'What the CCAR-F exam actually tests',
    'Everything on this page comes from the official Exam Guide (v1.0, July 2026). The exam rewards <b>practical judgment about tradeoffs</b> in production, not recall of API trivia.')}

  <section class="grid g2">
    <div class="card"><h3>At a glance</h3><div class="table-wrap"><table><tbody>
      <tr><th>Exam code</th><td>CCAR-F</td></tr>
      <tr><th>Items</th><td>60 · multiple-choice and multiple-response (each item says how many to select)</td></tr>
      <tr><th>Structure</th><td>4 scenarios drawn at random from a bank of 6</td></tr>
      <tr><th>Time</th><td>120 minutes (~2 min per item)</td></tr>
      <tr><th>Passing</th><td>Scaled 720 on a 100–1,000 scale (criterion-referenced)</td></tr>
      <tr><th>Delivery</th><td>Proctored via Pearson VUE — online or test centre</td></tr>
      <tr><th>Fee / validity</th><td>$125 USD · credential valid 12 months (free renewal assessment)</td></tr>
      <tr><th>Retakes</th><td>Wait 14 → 30 → 90 days; max 4 attempts per rolling 12 months</td></tr>
    </tbody></table></div></div>
    <div class="card"><h3>Blueprint</h3>
      ${domains.map((d) => `<div class="row" style="padding:8px 0;border-bottom:1px solid var(--border)">${ring(d.weight, `${d.weight}%`, DOMAIN_COLORS[d.id])}
        <div style="flex:1"><a href="${B}/domains/${d.slug}"><b>Domain ${d.id}</b> · ${esc(d.name)}</a><div class="small muted">~${d.items} of 60 items · ${d.tasks.length} task statements</div></div></div>`).join('')}
      <p class="small muted" style="margin-top:10px">Pass/fail is decided on the total scaled score; per-domain percentages on the score report are informational only.</p>
    </div>
  </section>

  <h2>How to think on this exam</h2>
  <div class="grid g2">
    <div class="card flat"><h3>Patterns that are usually right</h3><ul>
      <li><b>Deterministic beats probabilistic</b> when the rule must always hold (money, identity, compliance) → hooks / programmatic gates, not stronger prompts.</li>
      <li><b>Fix the root cause</b> named in the logs, with the <b>proportionate first step</b> (better tool descriptions, explicit criteria + few-shot) before new infrastructure.</li>
      <li><b>Least privilege</b>: scoped tools per agent; a narrow cross-role tool for the frequent case.</li>
      <li><b>Explicit context</b>: subagents only know what you put in their prompt.</li>
      <li><b>Structured, not generic</b>: errors with category/retryability/partial results; findings with claim → source → date.</li>
      <li><b>Split for attention</b>: per-file passes + integration pass; independent reviewer instance.</li>
      <li><b>Right scope</b>: shared team config lives in the repo (.claude/, .mcp.json); personal stuff in ~/.</li>
    </ul></div>
    <div class="card flat"><h3>Distractor patterns to reject</h3><ul>
      <li>“Make the prompt say MANDATORY / be conservative / only high-confidence.”</li>
      <li>Self-reported confidence or sentiment as an escalation trigger.</li>
      <li>A bigger model or larger context window to fix attention or reasoning problems.</li>
      <li>Over-engineering as a <i>first</i> step: classifiers, routing layers, new ML models.</li>
      <li>Silently swallowing errors, or killing the whole workflow on one failure.</li>
      <li>Batch API for anything someone is waiting on.</li>
      <li>Non-existent features: <code>CLAUDE_HEADLESS</code>, <code>--batch</code>, <code>.claude/config.json</code> commands arrays.</li>
      <li>Blaming a downstream component that did exactly what it was told.</li>
    </ul></div>
  </div>

  <h2>Time strategy</h2>
  <div class="card flat"><ul>
    <li><b>First pass (≈80 min):</b> answer everything you can in ≤ 90 seconds; flag anything that needs re-reading.</li>
    <li><b>Read the last sentence first</b> (“most effective <i>first</i> step”, “most likely <i>root cause</i>”, “Select TWO”) — the qualifier decides between two plausible options.</li>
    <li><b>Second pass (≈30 min):</b> flagged items. Eliminate options that solve a different problem than the one stated.</li>
    <li><b>Last 10 min:</b> make sure nothing is blank — there's no penalty for guessing.</li>
  </ul></div>

  <h2>Scope</h2>
  <div class="grid g2">
    <div class="card flat"><h3><span class="badge olive">In scope</span></h3><ul class="small">
      <li>Agentic loops (stop_reason), coordinator–subagent orchestration, parallel subagents, refinement loops</li>
      <li>Explicit context passing, state persistence, crash recovery with manifests</li>
      <li>Tool descriptions, splitting vs consolidating tools, naming</li>
      <li>MCP tools vs resources, project vs user scope, env-var expansion, multi-server access</li>
      <li>Structured errors: transient / validation / business / permission; local recovery</li>
      <li>Escalation criteria, honouring customer requests, policy gaps</li>
      <li>CLAUDE.md hierarchy, @import, .claude/rules/ globs; commands & skills frontmatter</li>
      <li>Plan mode vs direct execution; iterative refinement</li>
      <li>tool_use structured output, tool_choice, nullable fields; few-shot prompting</li>
      <li>Message Batches API suitability & failure handling by custom_id</li>
      <li>Context optimisation, human review & calibration, provenance</li>
    </ul></div>
    <div class="card flat"><h3><span class="badge danger">Out of scope</span></h3><ul class="small">
      <li>Fine-tuning or training models; Claude internals, RLHF, Constitutional AI</li>
      <li>API auth, billing, account management, OAuth, key rotation</li>
      <li>Hosting/deploying MCP servers; cloud-provider specifics</li>
      <li>Embeddings and vector database internals</li>
      <li>Computer use, vision/image analysis, streaming/SSE</li>
      <li>Rate limits, quotas, pricing calculations, benchmarks</li>
      <li>Prompt caching implementation details; tokenization specifics</li>
    </ul></div>
  </div>

  <h2>Official preparation exercises</h2>
  <div class="grid g2">
    ${[
      ['Exercise 1 · Multi-tool agent with escalation', 'D1 · D2 · D5', 'Differentiated tool descriptions, stop_reason loop, structured errors (errorCategory, isRetryable), a hook that blocks over-threshold operations, multi-concern requests.'],
      ['Exercise 2 · Claude Code for a team', 'D3 · D2', 'Project CLAUDE.md, .claude/rules/ with globs, a context: fork skill with allowed-tools, .mcp.json + ~/.claude.json servers, plan mode vs direct on varied tasks.'],
      ['Exercise 3 · Structured extraction pipeline', 'D4 · D5', 'Schema with required/optional/nullable + enum "other"+detail, validation-retry loop, few-shot for varied formats, batch of 100 with custom_id resubmission, confidence-based human review.'],
      ['Exercise 4 · Multi-agent research pipeline', 'D1 · D2 · D5', 'Coordinator with "Task" in allowedTools, parallel Task calls, claim/evidence/source/date outputs, simulated timeout with structured error, conflicting sources preserved.'],
    ].map(([t, d, x]) => `<div class="card flat"><div class="spread"><h3>${t}</h3><span class="badge">${d}</span></div><p class="small muted" style="margin:0">${x}</p></div>`).join('')}
  </div>
  <p class="small muted" style="margin-top:18px">Source: <a href="https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification" target="_blank" rel="noopener">Claude Certified Architect – Foundations certification page</a> and its Exam Guide PDF. A local text copy is in <code>docs/guides/architect-foundations.txt</code>.</p>`;
  return body;
}

// ---------------- cheat sheet ----------------

export function cheatsheetBody(_exam: ExamContent) {
  const rows = (r: [string, string][]) => `<div class="table-wrap"><table><tbody>${r.map(([a, b]) => `<tr><td style="width:44%">${rich(a)}</td><td>${rich(b)}</td></tr>`).join('')}</tbody></table></div>`;
  const body = `
  ${pageHead('Cheat sheet', 'Decision rules & facts to memorise', 'One page to revisit on days 7, 14, 19 and 21. If a scenario matches the left column, the right column is almost always the answer.')}
  <div class="grid g2">
    <div class="card"><h3><span class="dot" style="background:var(--d1)"></span> Agentic architecture</h3>${rows([
      ['Loop: when to continue / stop?', 'Continue on stop_reason `tool_use`; stop on `end_turn`. Append every tool_result to messages.'],
      ['Must-happen ordering (verify ID before refund)', 'Programmatic prerequisite gate / hook — not prompt wording or few-shot'],
      ['Normalise mixed timestamps/status codes', 'PostToolUse hook'],
      ['Block refunds > threshold', 'Tool-call interception hook → redirect to escalation'],
      ['Coordinator can’t spawn subagents', 'allowedTools must include `Task`'],
      ['Run subagents in parallel', 'Multiple Task calls in ONE coordinator response'],
      ['Subagent lacks facts', 'Pass complete findings explicitly in its prompt'],
      ['Report misses whole sub-areas', 'Coordinator decomposition too narrow'],
      ['Predictable multi-aspect review vs open investigation', 'Prompt chaining vs adaptive decomposition'],
      ['Continue named investigation', '`--resume <session-name>` (tell it what files changed)'],
      ['Compare two approaches from one baseline', '`fork_session`'],
      ['Stale tool results after big code changes', 'New session + injected structured summary'],
    ])}</div>
    <div class="card"><h3><span class="dot" style="background:var(--d2)"></span> Tools & MCP</h3>${rows([
      ['Wrong tool picked, thin descriptions', 'Expand descriptions: inputs, examples, edge cases, when-not-to-use'],
      ['Two overlapping tools', 'Rename / split into purpose-specific tools'],
      ['18 tools on one agent', 'Scope to 4–5 role-relevant tools'],
      ['Frequent simple cross-role need', 'Narrow tool (e.g. verify_fact); complex cases via coordinator'],
      ['Model must call some tool', '`tool_choice: "any"`'],
      ['Model must call a specific tool first', '`tool_choice: {"type":"tool","name":"…"}`'],
      ['Model may answer in text', '`tool_choice: "auto"`'],
      ['Tool failure signalling', 'MCP `isError` + errorCategory, isRetryable, readable message'],
      ['Team MCP server', '`.mcp.json` in repo with `${ENV_VAR}` secrets'],
      ['Personal / experimental MCP server', '`~/.claude.json`'],
      ['Agent ignores MCP tool for Grep', 'Improve the MCP tool’s description'],
      ['Expose a catalog (schemas, docs index)', 'MCP resource'],
      ['Search file contents / find files by name', 'Grep / Glob'],
      ['Edit can’t find unique anchor', 'Read + Write'],
    ])}</div>
    <div class="card"><h3><span class="dot" style="background:var(--d3)"></span> Claude Code</h3>${rows([
      ['Personal instructions', '`~/.claude/CLAUDE.md` (not shared)'],
      ['Team instructions', 'Root `CLAUDE.md` or `.claude/CLAUDE.md` (version-controlled)'],
      ['Folder-specific conventions', 'Subdirectory `CLAUDE.md`'],
      ['Conventions by file type across the tree', '`.claude/rules/*.md` with `paths: ["**/*.test.tsx"]`'],
      ['Modular includes', '`@import path/to/standards.md`'],
      ['Which memory files loaded?', '`/memory`'],
      ['Team slash command', '`.claude/commands/` (personal: `~/.claude/commands/`)'],
      ['Skill frontmatter', '`context: fork` (isolate output) · `allowed-tools` · `argument-hint`'],
      ['Skills vs CLAUDE.md', 'On-demand workflows vs always-loaded standards'],
      ['Architectural / 45-file migration', 'Plan mode, then direct execution'],
      ['Clear single-file fix', 'Direct execution'],
      ['Verbose discovery', 'Explore subagent; `/compact` when context fills'],
      ['CI non-interactive', '`claude -p "…"` (`--print`)'],
      ['CI structured output', '`--output-format json --json-schema …`'],
    ])}</div>
    <div class="card"><h3><span class="dot" style="background:var(--d4)"></span> Prompts & structured output</h3>${rows([
      ['Too many false positives', 'Explicit report/skip categories + severity examples; disable noisy category meanwhile'],
      ['Inconsistent output format', '2–4 few-shot examples showing exact format'],
      ['Guaranteed JSON structure', 'tool_use with JSON schema'],
      ['Model fabricates missing fields', 'Make them optional / nullable'],
      ['Extensible categories', 'enum + `"other"` with detail string; `"unclear"`'],
      ['Valid JSON, wrong totals', 'Semantic validation: calculated_total vs stated_total, conflict_detected'],
      ['Retry strategy', 'Send document + failed output + specific errors. Useless if info is absent'],
      ['Track dismissed findings', '`detected_pattern` field'],
      ['Batch API facts', '~50% cheaper · ≤ 24 h · no SLA · no multi-turn tools · `custom_id`'],
      ['Batch failures', 'Resubmit only failed custom_ids (chunk oversize docs)'],
      ['Blocking pre-merge check', 'Synchronous API, never batch'],
      ['Review generated code', 'Independent instance, not same session'],
      ['14-file PR, shallow/contradictory review', 'Per-file passes + integration pass'],
    ])}</div>
    <div class="card" style="grid-column:1/-1"><h3><span class="dot" style="background:var(--d5)"></span> Context & reliability</h3>
      <div class="grid g2">${rows([
        ['Numbers/dates lost in long chats', 'Persistent “case facts” block outside summarised history'],
        ['40-field tool responses', 'Trim to relevant fields before they accumulate'],
        ['Long aggregated input', 'Key findings first; headed sections (lost-in-the-middle)'],
        ['Customer says “human please”', 'Escalate immediately'],
        ['Frustrated but simple issue', 'Acknowledge, offer to resolve; escalate if repeated'],
        ['Policy silent on request', 'Escalate'],
        ['Multiple customer matches', 'Ask for more identifiers'],
        ['Escalation calibration poor', 'Explicit criteria + few-shot (not sentiment/confidence)'],
      ])}${rows([
        ['Subagent failure', 'Structured: failure type, query attempted, partial results, alternatives'],
        ['Timeout vs no results', 'Access failure ≠ valid empty result'],
        ['Long exploration drifts', 'Scratchpad files, subagents, phase summaries, `/compact`'],
        ['Crash recovery', 'Agents export state; coordinator loads a manifest'],
        ['97% overall accuracy', 'Segment by doc type & field before automating'],
        ['Monitor high-confidence outputs', 'Stratified random sampling'],
        ['Confidence routing', 'Field-level scores calibrated on labelled sets'],
        ['Conflicting sources', 'Keep both with attribution + dates; mark contested'],
      ])}</div></div>
  </div>`;
  return body;
}

