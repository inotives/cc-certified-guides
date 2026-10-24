import type { ExamContent } from '../types.js';
import { DOMAIN_COLORS, esc, pageHead, rich, ring } from '../../views/layout.js';
import { notes } from './domains.js';

// Exam-specific pages for Architect – Professional: the "Exam focus" guide and the cheat sheet.

// ---------------- exam focus ----------------

export function guideBody(exam: ExamContent) {
  const B = exam.base;
  const { domains } = exam;
  const byWeight = [...domains].sort((a, b) => b.weight - a.weight);
  return `
  ${pageHead('Exam focus', 'What the CCAR-P exam actually tests',
    'Facts on this page come from the official Exam Guide (v1.0, July 2026). The exam checks that you can <b>own the full lifecycle of a production Claude system</b>: frame the business problem, pick the architecture and model, integrate it securely with enterprise systems and data, prove it works, govern it, and bring stakeholders along.')}

  <section class="grid g2">
    <div class="card"><h3>At a glance</h3><div class="table-wrap"><table><tbody>
      <tr><th>Exam code</th><td>CCAR-P</td></tr>
      <tr><th>Items</th><td>63 · multiple-choice and multiple-response (each item says how many to select)</td></tr>
      <tr><th>Structure</th><td>Standalone items across 7 weighted domains (no scenario sections)</td></tr>
      <tr><th>Time</th><td>120 minutes (just under 2 min per item)</td></tr>
      <tr><th>Passing</th><td>Scaled 720 on a 100–1,000 scale (criterion-referenced)</td></tr>
      <tr><th>Delivery</th><td>Proctored via Pearson VUE, online or at a test centre</td></tr>
      <tr><th>Fee / validity</th><td>$175 USD · credential valid 12 months (free renewal assessment)</td></tr>
      <tr><th>Retakes</th><td>Wait 14 → 30 → 90 days; max 4 attempts per rolling 12 months</td></tr>
      <tr><th>Prerequisites</th><td>None. Recommended: 3+ years in systems architecture or platform engineering and 6+ months hands-on with Claude or similar LLM systems in production</td></tr>
    </tbody></table></div></div>
    <div class="card"><h3>Blueprint</h3>
      ${byWeight.map((d) => `<div class="row" style="padding:8px 0;border-bottom:1px solid var(--border)">${ring(d.weight, `${d.weight}%`, DOMAIN_COLORS[d.id])}
        <div style="flex:1"><a href="${B}/domains/${d.slug}"><b>Domain ${d.id}</b> · ${esc(d.name)}</a><div class="small muted">~${d.items} of 63 items · ${d.tasks.length} task statements</div></div></div>`).join('')}
      <p class="small muted" style="margin-top:10px">Integration is the largest domain at about one item in five. Design, Evaluation, Governance and Stakeholders are close together, so there is no domain you can skip.</p>
    </div>
  </section>

  <h2>Who the exam is written for</h2>
  <div class="card flat"><p style="margin:0">The guide targets mid- to senior-level solution architects, AI/ML engineers, technical leads and senior software engineers who work where business requirements meet technical implementation. The minimally qualified candidate designs, implements and governs Claude solutions in production: prompt and context engineering, RAG, API integration, orchestration and evaluation, with a clear view of the trade-offs between cost, latency, performance, safety and maintainability. They also lead discussions with security, legal and executive stakeholders. The exam is <b>not</b> aimed at entry-level developers or people who only write prompts.</p></div>

  <h2>How to think on this exam</h2>
  <div class="callout" style="margin-bottom:14px">The rules below are this site’s study advice, drawn from the guide’s objectives and its three sample answers. They are not official text.</div>
  <div class="grid g2">
    <div class="card flat"><h3>Patterns that are usually right</h3><ul>
      <li><b>Start from the business outcome:</b> define the metric and constraints before choosing models or patterns.</li>
      <li><b>Simplest architecture that meets the need:</b> a workflow or augmented LLM before an autonomous agent; one agent before many.</li>
      <li><b>Remove privilege rather than monitor it:</b> drop tools and scopes the role does not need, and enforce authorization outside the model.</li>
      <li><b>Fix the stage that broke:</b> when answers go wrong after a data change, look at retrieval and indexing before the model.</li>
      <li><b>Measure, then change one thing:</b> eval sets and A/B comparisons before and after every prompt, model or retrieval change.</li>
      <li><b>Cache what repeats, load what is needed:</b> stable prefixes first with prompt caching; progressive discovery instead of stuffing every tool and document into context.</li>
      <li><b>Humans own consequential decisions</b> and regulated data shapes the design from discovery onwards, not at launch.</li>
      <li><b>Bring stakeholders along:</b> explain trade-offs in their terms (risk, cost, time) and agree SLAs you can measure.</li>
    </ul></div>
    <div class="card flat"><h3>Distractor patterns to reject</h3><ul>
      <li>“Use a bigger model” as the fix for a security, retrieval or design problem.</li>
      <li>Logging, confirmations or prompt instructions offered in place of removing an unneeded capability.</li>
      <li>Multi-agent or fully autonomous designs where a fixed workflow would do.</li>
      <li>Truncating or dropping required context to save tokens.</li>
      <li>Blaming silent model changes when something in your own pipeline changed.</li>
      <li>Shipping on a demo or a handful of examples without an eval set.</li>
      <li>Treating compliance as a checkbox at the end, or promising SLAs before measuring.</li>
    </ul></div>
  </div>

  <h2>Time strategy</h2>
  <div class="card flat"><ul>
    <li><b>First pass (≈80 min):</b> answer everything you can in under 90 seconds; flag anything that needs re-reading.</li>
    <li><b>Read the last sentence first</b> (“best reduces risk”, “most likely first place to investigate”, “Select TWO”). The qualifier decides between two plausible options.</li>
    <li><b>Second pass (≈30 min):</b> flagged items. Drop options that ignore a stated constraint (regulation, latency, cost, least privilege) or fix a different problem.</li>
    <li><b>Last 10 min:</b> make sure nothing is blank. There’s no penalty for guessing.</li>
  </ul></div>

  <h2>Official preparation advice</h2>
  <div class="grid g2">
    <div class="card flat"><ul>
      <li>Study the blueprint and self-assess against each objective (the Domain guide in this app follows it).</li>
      <li>Review official Anthropic documentation for the Claude API, models, prompt engineering, MCP and Skills.</li>
      <li>Complete the 3 official sample questions to learn the item style.</li>
    </ul></div>
    <div class="card flat"><ul>
      <li>Build and operate at least one end-to-end Claude solution, including RAG, evaluation and observability (the study plan’s “reference build” items walk through one).</li>
      <li>Practise architectural decision-making: model selection, integration protocols and security trade-offs.</li>
      <li>Anthropic doesn’t guarantee that any particular resource leads to a pass. There is no required course, and no CCAR-P prep course is listed on the Partner Academy yet.</li>
    </ul></div>
  </div>

  <h2>About the case studies</h2>
  <div class="card flat"><p style="margin:0">The real exam has <b>no scenarios</b>. This site groups its practice questions into <a href="${B}/scenarios">six enterprise case studies</a> as a study aid, so you practise moving between design, integration, evaluation, governance and stakeholder concerns in one setting. The full mock ignores them and draws questions by the blueprint weights.</p></div>
  <p class="small muted" style="margin-top:18px">Source: <a href="https://anthropic-partners.skilljar.com/claude-certified-architect-professional-certification" target="_blank" rel="noopener">Claude Certified Architect – Professional certification page</a> and its Exam Guide PDF. A local text copy is in <code>${esc(exam.guideFile)}</code>.</p>`;
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
  ${pageHead('Cheat sheet', 'Decision rules to remember', 'Domains are ordered as in the blueprint; spend your revision time in proportion to the weights. If a question matches the left column, the right column is usually the answer. These rules are study notes, not official text.')}
  <div class="grid g2">${cards.join('')}</div>`;
}
