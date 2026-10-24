# Claude Certification Prep

A local study hub for Anthropic's Claude certifications. The home page (`/`) has a card for each exam on the path, with its official details:

1. **Associate – Foundations (CCAO-F): study site ready** at `/associate-foundations`
2. **Developer – Foundations (CCDV-F): study site ready** at `/developer-foundations`
3. **Architect – Foundations (CCAR-F): study site ready** at `/architect-foundations`
4. **Architect – Professional (CCAR-P): study site ready** at `/architect-professional`

A profile on the home page records your current level and target certification. The official guides list no prerequisites, so you can start with any exam.

Each study site is built from that exam's official guide and has the same structure:

- a self-paced 21-day study plan (no calendar dates; the exam date is optional)
- a domain guide for every objective, with diagrams and study notes
- a cheat sheet of "if you see X → answer Y" rules
- practice drills and full mock exams that follow the real format

Progress, attempts and exam dates are kept separately for each exam.

Built with TypeScript, Express and SQLite (Node's built-in `node:sqlite`, so there is nothing native to compile). It runs entirely on localhost and works offline.

## Run it

```bash
npm install
npm start          # → http://localhost:4173
```

You need Node ≥ 22.13; it was tested on Node 24. Use `npm run dev` to auto-reload while editing. Set `PORT=…` to change the port, or `CCA_DATA_DIR=…` to keep the database somewhere else.

## The four exams

| | Associate (CCAO-F) | Developer (CCDV-F) | Architect (CCAR-F) | Architect Pro (CCAR-P) |
|---|---|---|---|---|
| For | Business users of claude.ai | Engineers building with the API | Solution architects | Senior architects owning production systems |
| Format | 60 items · 120 min | 53 items · 120 min | 60 items · 120 min | 63 items · 120 min |
| Blueprint | 7 domains · 30 task statements | 8 domains · 25 weighted skills | 5 domains · 30 task statements | 7 domains · 38 task statements |
| Scenarios | None | None | 4 of 6 per sitting | None on the exam; 6 unofficial study case studies |
| Full-mock mix (items per domain) | 8/13/7/10/7/9/6 | 8/18/2/1/9/6/4/5 | 16/11/12/12/9 | 11/8/12/10/9/9/4 |
| Question bank | 200 + 3 official samples | 211 + 3 official samples | 168 + 12 official samples | 200 + 3 official samples |
| Diagrams | 60 (2 per task) | 40 (1–2 per skill) | — | 38 (1 per task) |

## What's inside each study site

| Page | Purpose |
|---|---|
| Dashboard | Current plan day and its tasks (plus a countdown once you add a booked exam date in Settings), recent accuracy per domain against an 80% target, recent sessions |
| Study plan | 21 self-paced study days with checkboxes. A "day" is one session, not a calendar date; your current day is the first with unfinished tasks. "Mark day complete" ticks a whole day |
| Exam focus | Format, blueprint, how to reason, time strategy and the official preparation advice |
| Domain guide | Each objective: diagrams first, then an "exam lens" (how correct answers reason) and common traps, with the full study notes one click away, links to official docs and a drill button |
| Scenarios | Architect – Foundations only: the 6 exam scenarios (4 appear per sitting), what to watch for in each, and drills |
| Case studies | Architect – Professional only: 6 enterprise case studies written for this site (the exam itself has no scenarios), what to watch for in each, and drills |
| Cheat sheet | "If you see X → answer Y" rules for every domain |
| Practice | Full mock, quick set, domain/task drills (and scenario or case-study drills for the Architect exams), weak areas, unseen, bookmarked, official samples, timed custom set |
| Results & history | Score trend, per-domain accuracy, a review of every question with the reasoning for each option |
| Question bank | Browse and filter all questions with answers |

**Full mock exams** follow each exam's real format:
- item count and time limit as in the official guide
- the domain mix follows the blueprint weights
- Architect – Foundations mocks draw 4 of the 6 scenarios at random and group questions by scenario; Architect – Professional mocks ignore the case studies
- questions you haven't seen yet come first
- answer options are shuffled on every attempt

### Diagrams

The Associate, Developer and Architect – Professional domain guides open each objective with diagrams instead of long bullet lists:

- **Flow:** a process step by step.
- **Decision:** a situation and the answer that fits it.
- **Compare:** options side by side.
- **Layers:** a hierarchy or an order of precedence.

The server draws them as SVG, so they follow the light and dark themes and need no network. On a phone, a wide diagram scrolls sideways inside its own box.

## Content sources

- **Official guides:** each exam's domains, weights, objectives, format and sample questions come from its official exam guide. Text copies are in `docs/guides/`. Where a guide's wording is quoted (objective titles, Developer skill descriptions, sample questions), it is kept as published.
- **Original questions:** the other questions are original. They were written against the guide's objectives, and each has an explanation plus a reason why every wrong option is wrong.
- **Study notes:** the notes and diagrams are study aids, not official text.
  - Associate product facts were checked against Anthropic's help centre (`support.claude.com`, `privacy.claude.com`).
  - Details that change often are left out or worded in relative terms: prices, plan availability, limits, menu paths and model version numbers.
- **Score estimate:** the scaled score assumes a straight linear mapping from percent correct. It's a rough guide only, because Anthropic hasn't published how scores are scaled.

## Editing content

| What | Where |
|---|---|
| Questions | `src/exams/<exam>/questions/*.json` |
| Study notes (Associate, Developer, Architect – Professional) | `src/exams/<exam>/notes/*.json` |
| Diagrams | Associate and Architect – Professional: inside each notes object · Developer: `src/exams/developer-foundations/diagrams.ts` |
| Domains and objectives | `src/exams/<exam>/domains.ts` |
| Study plan | `src/exams/<exam>/plan.ts` |
| Exam focus and cheat sheet pages | `src/exams/<exam>/pages.ts` |

Run `npm run validate` to check every question, notes file and diagram, and `npm run typecheck` before you finish a change. Questions are loaded into SQLite every time the server starts. Removing a question deactivates it but keeps your history.

Your progress is kept in `data/cca-prep.db`; delete that file to start over. Contributor rules (content rules, id prefixes, question quality bar, UI conventions) are in `AGENTS.md`.
