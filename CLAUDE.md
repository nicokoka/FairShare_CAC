# FairShare — project context for Claude

FairShare is a web app that makes school group projects fair by tracking who
actually does the work: teammates join a project with a code, work off a live
task board, completed work needs a proof link **and** a teammate's verification,
and at the end everyone privately rates each other. The app produces a printable
fairness report for the teacher.

Built by a high-school student for the Congressional App Challenge. Stack: **Vite
+ React + plain JavaScript** (no TypeScript) + **Firebase** (Auth, Firestore,
Hosting), free Spark tier only — **no Cloud Functions**.

## Start here — use the knowledge graph, don't re-read everything

This repo has a **prebuilt graphify knowledge graph**. To understand the codebase
without spending credits reading every file:

1. **Read `graphify-out/GRAPH_REPORT.md`** — a compact map of the code, its
   concepts, the research behind it, and how everything connects.
2. **For any codebase question, run `/graphify query "<your question>"`** — it
   answers from `graphify-out/graph.json` (the graph) instead of scanning files.
3. **After changing code, refresh the graph** with `/graphify . --update` so it
   stays accurate (re-extracts only changed files).
4. Browsable version: open `graphify-out/obsidian/` as a vault in Obsidian.

## The build workflow (source of truth: `PLAN.md`)

Work is done **one feature at a time** from `PLAN.md`. Standard session prompt:

> Read PLAN.md, find the first feature without a ✅, and build only that feature
> following the Rules for the Executing Model.

Key rules from PLAN.md: build exactly one feature per session; after each, stop
and explain what was built in plain English + give a manual test script + list
any Firebase Console steps for the user to do themselves. Deps allowed: `react`,
`react-dom`, `react-router-dom`, `firebase` — nothing else without asking. No UI
kits, hand-written CSS with tokens in `src/styles/tokens.css`. Fairness math
lives in pure functions in `src/lib/fairness.js` with zero Firebase imports.

## Progress

Completed features are marked `✅ done <date>` in `PLAN.md`. Check there for the
current state rather than assuming. As of last session: **F0–F5 are done**
(scaffold, Google auth, create project + dashboard, join by code, task board —
create & display, claim & move tasks) — this completes **Milestone 1** (two
accounts, one live board). Firestore rules are live for `projects`/`joinCodes`
(including the self-join rule) and the `tasks` subcollection (member read +
create; assignee claim/start; creator reassign/delete). Next up is **F6 (Mark
done with proof)** — the start of Milestone 2.

## Environment notes (non-obvious)

- **Firebase config lives in a gitignored `.env`** (`VITE_FIREBASE_*` vars), read
  by `src/lib/firebase.js`. A committed `.env.example` documents the keys. The
  real values are already filled in locally. Don't hardcode config or commit `.env`.
- **Repo is public:** `nicokoka/FairShare_CAC`. The `gh` CLI is installed at
  `~/.local/bin/gh` and authenticated as `nicokoka`. Feature tasks exist as GitHub
  issues #1–#20 across milestones M1/M2/M3. (Issue #1 = F1 may still be open.)
- **Graph freshness:** run `/graphify . --update` after code changes so
  `graph.json`/`GRAPH_REPORT.md` reflect the latest code. The graphify interpreter
  is already resolved in `graphify-out/.graphify_python` (no reinstall needed).
