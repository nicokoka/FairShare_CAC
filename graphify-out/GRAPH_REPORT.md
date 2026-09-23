# Graph Report - .  (2026-09-22)

## Corpus Check
- 48 files · ~18,684 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 210 nodes · 304 edges · 17 communities (14 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Task Board & Modals|Task Board & Modals]]
- [[_COMMUNITY_Project Context & Research|Project Context & Research]]
- [[_COMMUNITY_App Shell, Project & Report|App Shell, Project & Report]]
- [[_COMMUNITY_Auth & Dashboard UI|Auth & Dashboard UI]]
- [[_COMMUNITY_Data Model & Roadmap|Data Model & Roadmap]]
- [[_COMMUNITY_Peer Review|Peer Review]]
- [[_COMMUNITY_Project Data & Hooks|Project Data & Hooks]]
- [[_COMMUNITY_Build Config & Scripts|Build Config & Scripts]]
- [[_COMMUNITY_Firebase & Dependencies|Firebase & Dependencies]]
- [[_COMMUNITY_Peer Assessment Research|Peer Assessment Research]]
- [[_COMMUNITY_Landing Contribution Card|Landing Contribution Card]]
- [[_COMMUNITY_F0 Scaffold|F0 Scaffold]]
- [[_COMMUNITY_F13 Polish|F13 Polish]]

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 13 edges
2. `taskRef()` - 8 edges
3. `projects Collection` - 7 edges
4. `tasks Subcollection` - 7 edges
5. `ReportPage()` - 6 edges
6. `FairShare (App)` - 6 edges
7. `Firestore Security Rules` - 6 edges
8. `Fairness Report Math (src/lib/fairness.js)` - 6 edges
9. `scripts` - 5 edges
10. `CAC Execution Plan` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Review Privacy Tradeoff (No Cloud Functions)` --semantically_similar_to--> `Peer-Review Validity Rationale`  [INFERRED] [semantically similar]
  PLAN.md → DEMO_SCRIPT.md
- `Proof + Verification Anti-Cheating Core` --conceptually_related_to--> `Social Loafing`  [INFERRED]
  PLAN.md → DEMO_SCRIPT.md
- `FairShare (App)` --conceptually_related_to--> `Social Loafing`  [INFERRED]
  CLAUDE.md → DEMO_SCRIPT.md
- `Review Privacy Tradeoff (No Cloud Functions)` --conceptually_related_to--> `Stack & Free-Tier Constraints (Vite + React + Firebase, no Cloud Functions)`  [INFERRED]
  PLAN.md → CLAUDE.md
- `ratingAverages(reviews, memberIds)` --conceptually_related_to--> `Peer-Review Validity Rationale`  [INFERRED]
  PLAN.md → DEMO_SCRIPT.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Fairness Report Pipeline (tasks + reviews → math → report)** — plan_collection_tasks, plan_collection_reviews, plan_fairness_math, plan_f11 [INFERRED 0.85]
- **Anti-Cheating Verification Flow (proof + teammate verify, no self-verify)** — plan_f6, plan_f7, plan_no_self_verify, plan_security_rules [INFERRED 0.85]
- **Research Foundation (social loafing + peer-review validity)** — demo_script_social_loafing, demo_script_latane_1979, demo_script_falchikov_goldfinch_2000, demo_script_catme [INFERRED 0.75]

## Communities (17 total, 3 thin omitted)

### Community 0 - "Task Board & Modals"
Cohesion: 0.10
Nodes (19): RejectTaskModal(), COLUMNS, SizeChip(), TaskCard(), TaskColumn(), approveTask(), claimTask(), createTask() (+11 more)

### Community 1 - "Project Context & Research"
Cohesion: 0.08
Nodes (29): Gitignored .env Firebase Config, FairShare (App), Graphify Knowledge Graph Workflow, Stack & Free-Tier Constraints (Vite + React + Firebase, no Cloud Functions), Demo Script (CAC Video), CATME (Peer Review Tool), Falchikov & Goldfinch (2000), Latané, Williams & Harkins (1979) (+21 more)

### Community 2 - "App Shell, Project & Report"
Cohesion: 0.11
Nodes (12): App(), ProjectPage(), formatDate(), ReportPage(), VerifiedTasksTable(), AuthProvider(), useReviews(), contributionShares() (+4 more)

### Community 3 - "Auth & Dashboard UI"
Cohesion: 0.14
Nodes (11): ProtectedRoute(), LoadingScreen(), CreateProjectModal(), Dashboard(), JoinProjectModal(), ProjectCard(), Landing(), AppHeader() (+3 more)

### Community 4 - "Data Model & Roadmap"
Cohesion: 0.16
Nodes (18): joinCodes Collection, projects Collection, reviews Subcollection, tasks Subcollection, Firestore Data Model, F1 Firebase Setup + Google Sign-in, F12 Security Rules Audit + Edge Cases, F2 Create Project + Dashboard (+10 more)

### Community 5 - "Peer Review"
Cohesion: 0.19
Nodes (9): ReviewForm(), ReviewPage(), STAR_VALUES, StarRating(), useMyReview(), isReviewComplete(), REVIEW_CRITERIA, reviewRef() (+1 more)

### Community 6 - "Project Data & Hooks"
Cohesion: 0.22
Nodes (8): createProject(), endProject(), joinCodeRef(), joinProject(), lookupJoinCode(), projectRef(), projectsCollection, reserveUniqueCode()

### Community 7 - "Build Config & Scripts"
Cohesion: 0.15
Nodes (12): devDependencies, vite, @vitejs/plugin-react, name, private, scripts, build, deploy (+4 more)

### Community 8 - "Firebase & Dependencies"
Cohesion: 0.17
Nodes (11): dependencies, firebase, react, react-dom, react-router-dom, app, auth, db (+3 more)

### Community 9 - "Peer Assessment Research"
Cohesion: 0.67
Nodes (3): CATME, Falchikov & Goldfinch (2000), Peer Assessment

## Knowledge Gaps
- **40 isolated node(s):** `TEAMMATES`, `FairShare`, `Ringelmann Effect`, `CATME`, `Falchikov & Goldfinch (2000)` (+35 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Firebase & Dependencies` to `Build Config & Scripts`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `projects Collection` (e.g. with `tasks Subcollection` and `F1 Firebase Setup + Google Sign-in`) actually correct?**
  _`projects Collection` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `TEAMMATES`, `FairShare`, `Ringelmann Effect` to the rest of the system?**
  _46 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Task Board & Modals` be split into smaller, more focused modules?**
  _Cohesion score 0.09841269841269841 - nodes in this community are weakly interconnected._
- **Should `Project Context & Research` be split into smaller, more focused modules?**
  _Cohesion score 0.0812807881773399 - nodes in this community are weakly interconnected._
- **Should `App Shell, Project & Report` be split into smaller, more focused modules?**
  _Cohesion score 0.10826210826210826 - nodes in this community are weakly interconnected._
- **Should `Auth & Dashboard UI` be split into smaller, more focused modules?**
  _Cohesion score 0.14153846153846153 - nodes in this community are weakly interconnected._