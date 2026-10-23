import type { ExamContent } from '../types.js';
import { DOMAIN_COLORS, esc, pageHead, rich, ring } from '../../views/layout.js';
import { notes } from './domains.js';

// Exam-specific pages for Developer – Foundations: the "Exam focus" guide and the cheat sheet.

// ---------------- exam focus ----------------

export function guideBody(exam: ExamContent) {
  const B = exam.base;
  const { domains } = exam;
  return `
  ${pageHead('Exam focus', 'What the CCDV-F exam actually tests',
    'Everything on this page comes from the official Exam Guide (v1.0, July 2026). The exam checks that you can <b>build, integrate and ship</b> Claude-powered applications, agents and workflows, and that you understand the tradeoffs.')}

  <section class="grid g2">
    <div class="card"><h3>At a glance</h3><div class="table-wrap"><table><tbody>
      <tr><th>Exam code</th><td>CCDV-F</td></tr>
      <tr><th>Items</th><td>53 · multiple-choice and multiple-response (each item says how many to select)</td></tr>
      <tr><th>Structure</th><td>Standalone items across 8 weighted domains (no scenario sections)</td></tr>
      <tr><th>Time</th><td>120 minutes (~2¼ min per item)</td></tr>
      <tr><th>Passing</th><td>Scaled 720 on a 100–1,000 scale (criterion-referenced)</td></tr>
      <tr><th>Delivery</th><td>Proctored via Pearson VUE, online or at a test centre</td></tr>
      <tr><th>Fee / validity</th><td>$125 USD · credential valid 12 months (free renewal assessment)</td></tr>
      <tr><th>Retakes</th><td>Wait 14 → 30 → 90 days; max 4 attempts per rolling 12 months</td></tr>
      <tr><th>Prerequisites</th><td>None. Recommended: 1–5 years of software engineering and 6+ months hands-on with Claude</td></tr>
    </tbody></table></div></div>
    <div class="card"><h3>Blueprint</h3>
      ${domains.map((d) => `<div class="row" style="padding:8px 0;border-bottom:1px solid var(--border)">${ring(d.weight, `${d.weight}%`, DOMAIN_COLORS[d.id])}
        <div style="flex:1"><a href="${B}/domains/${d.slug}"><b>Domain ${d.id}</b> · ${esc(d.name)}</a><div class="small muted">~${d.items} of 53 items · ${d.tasks.length} skill${d.tasks.length === 1 ? '' : 's'}</div></div></div>`).join('')}
      <p class="small muted" style="margin-top:10px">Applications and Integration alone is a third of the exam. Claude Code (3.1%) and Eval/Debugging (2.6%) are only about one or two items each.</p>
    </div>
  </section>

  <h2>All 25 skills by weight</h2>
  <div class="card"><div class="table-wrap"><table><thead><tr><th>Skill</th><th>Domain</th><th style="width:40%">Share of the exam</th></tr></thead><tbody>
    ${domains.flatMap((d) => d.tasks.map((t) => ({ d, t }))).sort((a, b) => (b.t.weight ?? 0) - (a.t.weight ?? 0)).map(({ d, t }) => `<tr>
      <td><a href="${B}/domains/${d.slug}#t${t.id}"><b>${t.id}</b> ${esc(t.title)}</a></td>
      <td><span class="dot" style="background:${DOMAIN_COLORS[d.id]}"></span> ${esc(d.short)}</td>
      <td><div class="row" style="flex-wrap:nowrap"><div class="bar" style="flex:1"><span style="width:${((t.weight ?? 0) / 8.6) * 100}%;background:${DOMAIN_COLORS[d.id]}"></span></div><b class="small" style="width:44px;text-align:right">${t.weight}%</b></div></td></tr>`).join('')}
  </tbody></table></div>
  <p class="small muted" style="margin-top:10px">Study time should follow these weights: the top six skills (Claude Application Design, Software Engineering Foundations, Claude API Mechanics, Technical Fundamentals, Agent Construction, LLM Fundamentals) are almost 40% of the exam.</p></div>

  <h2>How to think on this exam</h2>
  <div class="grid g2">
    <div class="card flat"><h3>Patterns that are usually right</h3><ul>
      <li><b>Match the API to the latency need:</b> Message Batches for large, non-urgent work; synchronous calls when someone is waiting.</li>
      <li><b>Untrusted input stays data:</b> keep retrieved or user content separate from trusted instructions, and enforce least privilege with guardrails or hooks.</li>
      <li><b>Reusable integrations belong in MCP servers or tools</b> that several apps share, not pasted into prompts.</li>
      <li><b>Choose the cheapest model and settings that meet the quality bar</b>, and re-evaluate before you switch model versions.</li>
      <li><b>Deterministic controls</b> (hooks, validation, schemas) for rules that must always hold; prompts for guidance.</li>
      <li><b>Isolate where a failure comes from:</b> the integration layer (request, auth, parsing) or the model's output.</li>
    </ul></div>
    <div class="card flat"><h3>Distractor patterns to reject</h3><ul>
      <li>Temperature, a larger model or a polite system-prompt request as a <i>security</i> fix.</li>
      <li>Hard-coding logic or pasting data into prompts when a tool or MCP server is needed.</li>
      <li>Assuming built-in tools can reach any internal system.</li>
      <li>Lowering <code>max_tokens</code> or shrinking the model as a cost strategy without regard to the real tradeoff.</li>
      <li>Synchronous fan-out for non-urgent bulk work; batch for interactive paths.</li>
      <li>Trusting confident output without validation or defensive parsing.</li>
    </ul></div>
  </div>

  <h2>Time strategy</h2>
  <div class="card flat"><ul>
    <li><b>First pass (≈75 min):</b> answer everything you can in under 90 seconds; flag anything that needs re-reading.</li>
    <li><b>Read the last sentence first</b> ("best fits the requirement", "most effective mitigation", "Select TWO"). The qualifier decides between two plausible options.</li>
    <li><b>Second pass (≈35 min):</b> flagged items. Eliminate options that solve a different problem than the one stated, or that ignore the stated constraint (cost, latency, security).</li>
    <li><b>Last 10 min:</b> make sure nothing is blank. There's no penalty for guessing.</li>
  </ul></div>

  <h2>Official preparation advice</h2>
  <div class="grid g2">
    <div class="card flat"><ul>
      <li>Self-assess against every skill in the blueprint (the Domain guide in this app follows it).</li>
      <li>Review the official documentation for the Claude API, models, prompt engineering, Claude Code, Skills and MCP.</li>
      <li>Do the 3 official sample questions to learn the item style.</li>
    </ul></div>
    <div class="card flat"><ul>
      <li>Build and operate at least one Claude application that calls the API, integrates one or more tools, applies basic prompt and context engineering, and includes simple security and evaluation practices.</li>
      <li>Practise the core competencies: prompts and system instructions, agents and workflows, configuring Claude Code, token and cost management, guardrails, and custom tools or MCP servers.</li>
    </ul></div>
  </div>
  <div class="callout sky" style="margin-top:18px">Unlike the Architect – Foundations exam, this blueprint explicitly covers streaming, vision, extended thinking, prompt caching, third-party vendors, websockets, security and secrets management. Don't skip them.</div>
  <p class="small muted" style="margin-top:18px">Source: <a href="https://anthropic-partners.skilljar.com/claude-certified-developer-foundations-certification" target="_blank" rel="noopener">Claude Certified Developer – Foundations certification page</a> and its Exam Guide PDF. A local text copy is in <code>${esc(exam.guideFile)}</code>.</p>`;
}

// ---------------- cheat sheet ----------------

export function cheatsheetBody(exam: ExamContent) {
  const cards = exam.domains.map((d) => {
    const rows = d.tasks.flatMap((t) => (notes.get(t.id)?.cheat ?? []).map(([a, b]) => ({ t, a, b })));
    return `<div class="card"><h3><span class="dot" style="background:${DOMAIN_COLORS[d.id]}"></span> D${d.id} · ${esc(d.name)} <span class="badge">${d.weight}%</span></h3>
      ${rows.length
        ? `<div class="table-wrap"><table><tbody>${rows.map((r) => `<tr><td style="width:44%">${rich(r.a)}</td><td>${rich(r.b)}<div class="small muted">${r.t.id} ${esc(r.t.title)}</div></td></tr>`).join('')}</tbody></table></div>`
        : '<p class="small muted">Rules for this domain are being written.</p>'}
    </div>`;
  });
  return `
  ${pageHead('Cheat sheet', 'Decision rules & facts to memorise', 'Domains are ordered as in the blueprint; spend your revision time in proportion to the weights. If a question matches the left column, the right column is usually the answer.')}
  <div class="grid g2">${cards.join('')}</div>`;
}
