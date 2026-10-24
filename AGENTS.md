# AGENTS.md

This is a local study hub for Anthropic's Claude certifications. The home page (`/`) shows one card per exam on the path: Associate – Foundations (CCAO-F) → Developer – Foundations (CCDV-F) → Architect – Foundations (CCAR-F) → Architect – Professional (CCAR-P).

All four exams have full study sites:
- **Associate – Foundations** at `/associate-foundations`
- **Developer – Foundations** at `/developer-foundations`
- **Architect – Foundations** at `/architect-foundations`
- **Architect – Professional** at `/architect-professional`

The app is built with TypeScript, Express and SQLite. The server renders the HTML pages; the browser only runs small JavaScript files for interactivity. It is for one user and runs only on localhost.

## Commands

```bash
npm install
npm start            # tsx src/server.ts → http://localhost:4173
npm run dev          # same, with auto-reload
npm run typecheck    # tsc --noEmit (no build step; tsx runs the TS directly)
npm run validate     # tsx scripts/validate.ts: every exam's questions, study notes and diagrams
                     # (pass file paths after `--` to check only those)
```

Environment variables:
- `PORT` sets the port (default 4173).
- `CCA_DATA_DIR` moves the SQLite file (default `./data`). Point it at a temp directory for tests so you don't touch the user's progress.

Requires Node ≥ 22.13, because the app uses the built-in `node:sqlite` module. Don't add `better-sqlite3` or any other native database driver.

Before you finish a change, run `npm run typecheck` and `npm run validate`. If you changed behaviour, also start the server on a scratch `CCA_DATA_DIR` and a spare `PORT`, and exercise the affected routes for **all four** exam sites.

The user often has their own server running on port 4173. To stop a scratch server, kill it by its port (`lsof -ti tcp:<port> | xargs kill`), not with `pkill -f "tsx src/server.ts"`, which also matches `npm start`. `npm start` doesn't reload, so after code or content changes the user's server needs a restart to show them.

## Layout

```
README.md                      User-facing overview: the exams, pages, content sources, where to edit.
docs/guides/*.txt              Official exam guides (extracted text) for all 4 exams. Source of truth per exam.
scripts/validate.ts            Question-bank, study-notes and diagram validator (imports the exam registry).
src/certs.ts                   Home-card registry for all 4 certs (facts from docs/guides), LEVELS, AF_BASE.
src/exams/
  types.ts                     Shared types incl. ExamContent (one exam's content: domains, scenarios, plan, mock config) and Diagram.
  index.ts                     Registry of exams that have a study site (`exams`, `examBySlug`).
  notes.ts                     Shared study-notes loader (`loadNotes`, `withNotes`) for exams with notes/*.json.
  associate-foundations/       CCAO-F: index.ts, domains.ts (7 domains / 30 task statements, titles verbatim from the guide),
                               notes/*.json (study notes + diagrams per task), plan.ts, pages.ts, questions/*.json.
  architect-foundations/       CCAR-F: index.ts, domains.ts (5 domains / 30 task statements), scenarios.ts (6),
                               plan.ts, pages.ts (exam-focus + cheat-sheet bodies), questions/*.json.
  architect-professional/      CCAR-P: index.ts, domains.ts (7 domains / 38 task statements, titles verbatim from the guide),
                               scenarios.ts (6 unofficial study case studies), notes/*.json (study notes + diagrams per task),
                               plan.ts, pages.ts, questions/*.json (one file per domain).
  developer-foundations/       CCDV-F: index.ts, domains.ts (8 domains / 25 weighted skills; official descriptions),
                               notes/*.json (study notes merged into domains by skill id), diagrams.ts (typed diagrams
                               per skill), plan.ts, pages.ts, questions/*.json.
src/server.ts                  Home + profile; `examRouter(exam)` mounted at each exam's base; legacy redirects.
src/db.ts                      Schema + multi-exam migration, per-exam seeding, settings, per-exam exam dates.
src/practice.ts                Attempts (all modes), grading, stats, bookmarks, plan progress; every function takes an ExamContent.
src/views/
  home.ts                      Certification hub (profile + cards).
  layout.ts                    Page shell (exam-aware sidebar), helpers (esc, rich, pct, dates, icons, meter, ring).
  pages.ts                     Generic exam pages: dashboard, plan, domains, domain, scenarios, settings, guide/cheatsheet wrappers.
  exam-pages.ts                Registry of each exam's hand-written guide/cheat-sheet bodies.
  diagram.ts                   Server-side SVG renderer for study diagrams (flow, decision, compare, layers).
  practice.ts                  Practice chooser, exam shell, review, history, question bank.
src/public/                    styles.css (design tokens), app.js, exam.js.
data/cca-prep.db               The user's progress. Never commit it, delete it or reset it unless asked.
```

## Multi-exam structure

- **Every exam-owned row carries `cert`** (the exam slug): `questions`, `attempts`, `plan_progress`. Always filter on it. Bookmarks are keyed by question id, which is unique across exams. `db.ts` migrates older databases on start: it adds the column and treats existing rows as `architect-foundations`.
- **Question and plan ids must be globally unique:**
  - CCAR-F uses `s<N>-NNN` / `off-NN` / `d<NN>-…`.
  - CCDV-F uses `dv-<group>-NNN` / `dv-off-NN` / `dv-d<NN>-…`.
  - CCAO-F uses `as-<group>-NNN` / `as-off-NN` / `as-d<NN>-…`.
  - CCAR-P uses `ap-<group>-NNN` / `ap-off-NN` / `ap-d<NN>-…`.
- **Links:** write internal links as `href="${B}/…"` with `B = exam.base`, never hard-coded. Plan `href`s are base-relative; `planItem()` adds the prefix. Client scripts read the base from `<body data-base>`.
- **Exams without scenarios** (CCDV-F, CCAO-F) use `scenario: 0` on every question. The Scenarios nav item, page, drills and breakdowns are hidden for them, and the full mock is chosen by domain targets alone.
- **Case studies** (CCAR-P): `caseStudies: true` marks an exam's `scenarios` as this site's own study groupings, not official scenarios. Pages call them "case studies" (`scenarioTerm(exam)`) and say they're unofficial. The mock has no `scenariosPerSitting`, so it follows the domain targets alone. Questions outside a case study (the official samples) use `scenario: 0`.
- **Wording:** objectives are "task statements" (CCAR-F, CCAO-F) or "skills" (CCDV-F, whose guide publishes skill weights). Use `objectiveTerm(exam)` instead of hard-coding either word.
- **Per-exam settings:** the exam date is stored per exam (`settings` key `examDate:<slug>`, via `getExamDate`/`setExamDate`). The profile (`name`, `currentLevel`, `targetCert`) is shared.
- **Adding an exam site:**
  1. Create `src/exams/<slug>/` with an `index.ts` exporting an `ExamContent`.
  2. Add it to `src/exams/index.ts`.
  3. Add its pages to `views/exam-pages.ts`.
  4. Set `base` on its card in `certs.ts`.
  5. Pick a unique id prefix for its questions and plan items.
  6. If its objectives use study notes, load `notes/*.json` with `loadNotes`/`withNotes` from `src/exams/notes.ts` and set `studyNotes: true`.
  7. Update the exam table in `README.md` and the per-exam rules in this file.

## Home-page profile

- `currentLevel` is a `LEVELS` value from `certs.ts`: `none`, or the slug of the highest certification already held. `targetCert` is a cert slug. `''` means not set. `POST /profile` validates both.
- The path is shown as a linear sequence (`certs` order). Certifications at or below the current level are marked "Earned", and the target card gets a highlight and a ribbon. The official guides list **no prerequisites**, so never say lower certifications are required.

## Self-paced plans (no calendar)

- Each exam has a 21-day plan with no dates. The current day is the first day that still has an unchecked item (`planPosition(exam)`). "Mark day N complete" ticks the rest of that day's items.
- The exam date is optional. Only show a countdown when it's set, and never require it. Don't reintroduce start dates or date-based days.
- Plan item ids are persisted; add new ids instead of renaming.

## Content rules (most important)

- **Each exam's guide in `docs/guides/` is authoritative:** domains, weights, objectives, format and item count. Don't invent exam facts. If the guide doesn't cover something, say so rather than guessing.
- **CCAR-F** (60 items, 4 of 6 scenarios, 27/18/20/20/15):
  - Respect the guide's out-of-scope list (section 17): fine-tuning, auth/billing, MCP hosting, embeddings, computer use, vision, streaming, rate limits and pricing, prompt-caching internals, tokenization.
  - Its `knowledge`/`skills` bullets mirror the guide.
- **CCAO-F** (60 items, 7 domains 14/21/12/16/12/15/10, 30 task statements without weights, no scenarios):
  - Audience is non-technical business users of claude.ai. Write notes and questions in plain language; technical builds are escalated to Developers/Architects.
  - Task titles are the guide's bullets, verbatim. Everything in `notes/*.json` is study notes, not official text.
  - Product facts (Projects, connectors, memory, research, artifacts, skills) change often: teach concepts, not click-paths, plan availability or limits. The blueprint names only Haiku, Sonnet and Opus.
- **CCDV-F** (53 items, 8 domains, 25 skills with published weights, no scenarios):
  - The blueprint *includes* streaming, vision, thinking, caching, third-party vendors, websockets, security and secrets.
  - The guide gives one paragraph per skill (`description`, verbatim). The bullets in `notes/*.json` are study notes, not official text.
- **CCAR-P** (63 items, 7 domains 17/13/19/16/14/14/7, 38 task statements without weights, no scenarios on the exam):
  - Task titles are the guide's bullets, verbatim. Everything in `notes/*.json` and `scenarios.ts` is study material, not official text.
  - The guide has no out-of-scope list; RAG, embeddings, authentication and authorization, and compliance (GDPR, HIPAA, FedRAMP) are in scope. Pitch content above CCAR-F/CCDV-F level (trade-offs, enterprise constraints, stakeholders).
  - Teach compliance concepts. Don't state which Anthropic offerings hold which certifications or agreements.
- **Official samples:** CCAR-F has 12 (`official-samples.json`, ids `off-NN`), CCDV-F has 3 (`dv-off-NN`), CCAO-F has 3 (`as-off-NN`) and CCAR-P has 3 (`ap-off-NN`), all tagged `official-sample`. Keep their wording and answers as published.
- **Volatile facts:** avoid prices, exact limits, cache TTLs and model version strings unless the current official docs confirm them. Prefer relative wording ("a fraction of the base input price").

### Writing or editing questions

Every question must pass `npm run validate`. The schema is `Question` in `src/exams/types.ts`.

| Field | Values |
|---|---|
| `id` | unique across all exams (see prefixes above) |
| `scenario` | a scenario id of that exam, or `0` when the exam has none |
| `domain`, `task` | the task/skill id must belong to that domain in the exam's `domains.ts` |
| `type`, `select` | `"single"` with 4 options and select 1, or `"multi"` with 5–6 options, select ≥ 2, and a stem ending "(Select TWO.)" |
| `answer` | array of option keys |
| `explanation` | 2–4 sentences on why the answer is right, citing the principle |
| `distractors` | one-sentence rationale for **every** wrong option key |
| `difficulty` | 1–3 |
| `tags` | array |

Quality bar:
- Write in exam style: a concrete situation, then "most effective / first step / root cause / best fits". Test judgement, not trivia.
- Spread single-answer correct letters evenly across A–D within each file.
- **Avoid length tells:** the correct option should be the uniquely longest in only about 25% of single-answer questions; the validator prints this figure. 0% is a tell too.
- **Never refer to options by letter.** Options are shuffled per attempt and relabelled at runtime, and the validator rejects letter references.
- Use backticks for code identifiers. `rich()` renders them as `<code>`. No HTML in content.
- Removing a question from JSON deactivates it (`active = 0`) but keeps its history. Don't reuse an old id for a different question.

### Study notes (CCDV-F, CCAO-F and CCAR-P `notes/*.json`)

- Exams with notes set `studyNotes: true` in their `ExamContent`, so pages label the bullets "Know" / "Be able to" rather than as official text.
- One object per skill or task statement: `task`, `knowledge` (≥ 3), `skills` (≥ 3), `examLens` (≥ 2), `traps` (≥ 2), `links` (≥ 1), `cheat` (≥ 2 `[situation, answer]` rows, which feed the cheat sheet), and optional `diagrams` (see below).
- Links must be official pages (support.claude.com, privacy.claude.com, platform.claude.com, code.claude.com, modelcontextprotocol.io, anthropic.com) that resolve.

### Diagrams

- Each objective can carry `diagrams` (type `Diagram` in `types.ts`): `flow`, `decision`, `compare` or `layers`. CCDV-F keeps them in `diagrams.ts`; CCAO-F and CCAR-P keep them in each notes object.
- `views/diagram.ts` draws them as inline SVG, coloured through the `.dg-*` classes in `styles.css`, so they follow the theme and work offline. Text wraps by an estimated character width, so keep labels short.
- When an objective has diagrams, the domain page shows the diagrams, then exam lens and traps, and folds the Know / Be able to lists into a "Full study notes" toggle.
- Diagrams are study aids: they may only restate facts already in the notes or the guide.
- `npm run validate` checks every diagram's structure (kind, required fields, 2+ steps/branches/layers, 2–4 compare columns, known tones, no HTML outside backticks) and lists objectives that have none.
- Size: flows 3–6 steps, decisions 4–6 branches, compare 2–3 columns. Labels about 45 characters at most, notes about 90.
- The SVG has a 520 px minimum width and scrolls sideways inside `.diagram-scroll` on phones. Its grid container must keep `grid-template-columns: minmax(0, 1fr)`, or the diagram widens the whole page.
- Headless Chrome won't render a viewport narrower than about 500 px. To screenshot phone width, load the page in a 375 px iframe.

## How the practice engine works

- **Seeding:** `seedQuestions(exam)` upserts that exam's JSON files into SQLite on every server start. For schema changes, use `CREATE TABLE IF NOT EXISTS` plus additive `ALTER`s, and keep existing user data working.
- **Modes** (`/practice/start?mode=`): `full`, `quick`, `domain`, `task` (comma list), `scenario` (comma list; scenario exams only), `weak`, `unseen`, `bookmarked`, `official`. Optional parameters: `count`, `feedback=1` (instant feedback; ignored for `full`), `timed=1` (2 min per question).
- **Full mock** is configured by `exam.mock`:
  - CCAR-F: 60 items in 120 min, 4 random scenarios with 15 each, grouped by scenario. Domain targets 16/11/12/12/9 are best-effort within the scenarios drawn.
  - CCDV-F: 53 items in 120 min, domain targets 8/18/2/1/9/6/4/5, shuffled.
  - CCAO-F: 60 items in 120 min, domain targets 8/13/7/10/7/9/6, shuffled.
  - CCAR-P: 63 items in 120 min, domain targets 11/8/12/10/9/9/4, shuffled (case studies ignored).
  - All use deficit-based selection that prefers least-seen questions.
- **Option shuffling:** `attempt_items.option_order` stores original keys in display order. The API speaks in display letters; the database stores original keys. Convert only in `attemptView` and `saveAnswer`.
- **No answer leakage:** answers, explanations and per-option `correct`/`rationale` are only sent after submission, or per item after a feedback-mode check.
- **Isolation:** an attempt, bookmark or plan item is only reachable through its own exam's router (`getAttempt(exam, id)` checks `cert`).
- **Grading:** a question counts as correct only on an exact set match. Multi-response has no partial credit, and unanswered counts as wrong.
- **Stats:** readiness uses the last 30 graded answers per domain. `estimateScaled` is a rough linear guess, and the UI must keep saying so.

## UI conventions

- The look is Claude-like: ivory/slate surfaces, a clay accent (`--clay`), a serif for headings (Source Serif 4) and a sans for the interface (Inter). Use the CSS tokens in `:root`, never hard-coded colours. Keep the `prefers-color-scheme` and `[data-theme='dark']` blocks in sync.
- Domain colours are `--d1`…`--d8`, exposed as `DOMAIN_COLORS` in `layout.ts`.
- Escape all dynamic text with `esc()` (or `rich()` for content with backticks). Never interpolate raw strings into HTML.
- Keep client scripts as plain JavaScript in `src/public/` with no bundler. Don't use `alert`/`confirm`/`prompt`; use inline confirmation UI.
- Layouts must work down to phone width; the breakpoints are 1080 px and 860 px.

## Don'ts

- Don't add a frontend framework, a bundler or a native dependency.
- Don't commit or modify `data/`.
- Don't change exam facts or weights without a newer official guide. If one appears, update `docs/guides/<slug>.txt` first, then the content.
- Don't make network calls at runtime other than Google Fonts; the app must work offline, falling back to system fonts.
