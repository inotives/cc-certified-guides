import type { ExamContent } from '../types.js';
import { DOMAIN_COLORS, esc, pageHead, rich, ring } from '../../views/layout.js';
import { notes } from './domains.js';

// Exam-specific pages for Associate – Foundations: the "Exam focus" guide and the cheat sheet.

// ---------------- exam focus ----------------

export function guideBody(exam: ExamContent) {
  const B = exam.base;
  const { domains } = exam;
  const byWeight = [...domains].sort((a, b) => b.weight - a.weight);
  return `
  ${pageHead('Exam focus', 'What the CCAO-F exam actually tests',
    'Everything on this page comes from the official Exam Guide (v1.0, July 2026). The exam checks that you can <b>use Claude well in everyday business work</b>: ask clearly, check what comes back, pick the right feature, handle data responsibly, and know when to hand technical work to a Developer or Architect.')}

  <section class="grid g2">
    <div class="card"><h3>At a glance</h3><div class="table-wrap"><table><tbody>
      <tr><th>Exam code</th><td>CCAO-F</td></tr>
      <tr><th>Items</th><td>60 · multiple-choice and multiple-response (each item says how many to select)</td></tr>
      <tr><th>Structure</th><td>Standalone items across 7 weighted domains (no scenario sections)</td></tr>
      <tr><th>Time</th><td>120 minutes (2 min per item)</td></tr>
      <tr><th>Passing</th><td>Scaled 720 on a 100–1,000 scale (criterion-referenced)</td></tr>
      <tr><th>Delivery</th><td>Proctored via Pearson VUE, online or at a test centre</td></tr>
      <tr><th>Fee / validity</th><td>$99 USD · credential valid 12 months (free renewal assessment)</td></tr>
      <tr><th>Retakes</th><td>Wait 14 → 30 → 90 days; max 4 attempts per rolling 12 months</td></tr>
      <tr><th>Prerequisites</th><td>None, and no coding or API experience needed. Recommended: regular hands-on use of Claude at work</td></tr>
    </tbody></table></div></div>
    <div class="card"><h3>Blueprint</h3>
      ${byWeight.map((d) => `<div class="row" style="padding:8px 0;border-bottom:1px solid var(--border)">${ring(d.weight, `${d.weight}%`, DOMAIN_COLORS[d.id])}
        <div style="flex:1"><a href="${B}/domains/${d.slug}"><b>Domain ${d.id}</b> · ${esc(d.name)}</a><div class="small muted">~${d.items} of 60 items · ${d.tasks.length} task statements</div></div></div>`).join('')}
      <p class="small muted" style="margin-top:10px">Output Evaluation and Validation is the largest domain at about one item in five. Checking Claude’s work also shows up inside other domains’ questions.</p>
    </div>
  </section>

  <h2>Who the exam is written for</h2>
  <div class="card flat"><p style="margin:0">The guide describes the candidate as someone between a casual prompt user and a technical AI practitioner: a professional in operations, marketing, project management, education, communications or similar, who builds Claude Projects and uses Claude daily. You are expected to turn business goals into good AI interactions, pick the right tools and features, write structured prompts, judge output critically, adapt it for different audiences, and recognise when human expertise, validation or escalation is needed. You are <b>not</b> expected to build against APIs or design enterprise AI architectures; that work is escalated to Claude Developers and Architects.</p></div>

  <h2>How to think on this exam</h2>
  <div class="grid g2">
    <div class="card flat"><h3>Patterns that are usually right</h3><ul>
      <li><b>Verify before you share:</b> check specific facts, figures and citations against the source, especially for high-stakes readers.</li>
      <li><b>Fit the tool to the task:</b> a faster, lower-cost model for simple high-volume work; the most capable model for complex reasoning.</li>
      <li><b>Protect data first, then proceed:</b> remove or anonymise sensitive details so the work can still go ahead within policy.</li>
      <li><b>Give Claude what it needs:</b> clear goal, audience, context, format and examples, set once in a Project when the task repeats.</li>
      <li><b>Keep a human in the loop</b> where errors are costly or decisions affect people.</li>
      <li><b>Diagnose before fixing:</b> find out why output is poor (missing context, vague ask, wrong feature) before rewriting everything.</li>
      <li><b>Escalate</b> technical builds and integrations to Developers or Architects instead of improvising them.</li>
    </ul></div>
    <div class="card flat"><h3>Distractor patterns to reject</h3><ul>
      <li>Trusting output because Claude sounds confident, or because it rated its own confidence highly.</li>
      <li>Telling Claude not to retain data as a substitute for following the data policy.</li>
      <li>Always choosing the biggest model, or the cheapest one regardless of quality.</li>
      <li>Polishing the wording of an answer instead of checking whether it is correct.</li>
      <li>Abandoning a task, or switching platforms, when a simple safeguard would let it proceed.</li>
      <li>Fixing a vague prompt by repeating it louder rather than adding context and structure.</li>
    </ul></div>
  </div>

  <h2>Time strategy</h2>
  <div class="card flat"><ul>
    <li><b>First pass (≈80 min):</b> answer everything you can in under 90 seconds; flag anything that needs re-reading.</li>
    <li><b>Read the last sentence first</b> ("most appropriate action", "best fits the task", "Select TWO"). The qualifier decides between two plausible options.</li>
    <li><b>Second pass (≈30 min):</b> flagged items. Drop options that ignore a stated constraint (policy, audience, cost, accuracy) or solve a different problem.</li>
    <li><b>Last 10 min:</b> make sure nothing is blank. There's no penalty for guessing.</li>
  </ul></div>

  <h2>Official preparation advice</h2>
  <div class="grid g2">
    <div class="card flat"><ul>
      <li>Study the blueprint and self-assess against each objective (the Domain guide in this app follows it).</li>
      <li>Review official Anthropic documentation and help articles for Projects, Artifacts, Memory, Skills and Code Execution.</li>
      <li>Complete the 3 official sample questions to learn the item style.</li>
    </ul></div>
    <div class="card flat"><ul>
      <li>Practise structuring prompts, decomposing tasks and iterating to improve outputs.</li>
      <li>Build real workflows: configure a Project with instructions and knowledge sources, and evaluate outputs for accuracy and bias.</li>
      <li>Practise responsible-use judgement: data sensitivity, appropriate use cases, and when to escalate or seek human review.</li>
    </ul></div>
  </div>
  <p class="small muted" style="margin-top:18px">Source: <a href="https://anthropic-partners.skilljar.com/claude-certified-associate-foundations-certification" target="_blank" rel="noopener">Claude Certified Associate – Foundations certification page</a> and its Exam Guide PDF. A local text copy is in <code>${esc(exam.guideFile)}</code>.</p>`;
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
  ${pageHead('Cheat sheet', 'Decision rules to remember', 'Domains are ordered as in the blueprint; spend your revision time in proportion to the weights. If a question matches the left column, the right column is usually the answer.')}
  <div class="grid g2">${cards.join('')}</div>`;
}
