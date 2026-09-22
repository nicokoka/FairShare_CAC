# Graph Report - .  (2026-09-21)

## Corpus Check
- 14 files · ~15,111 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 183 nodes · 280 edges · 16 communities (14 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Data Model, Roadmap & Foundations|Data Model, Roadmap & Foundations]]
- [[_COMMUNITY_App Shell & Dashboard UI|App Shell & Dashboard UI]]
- [[_COMMUNITY_Task Card & Modals|Task Card & Modals]]
- [[_COMMUNITY_Peer Review UI|Peer Review UI]]
- [[_COMMUNITY_Package & Build Config|Package & Build Config]]
- [[_COMMUNITY_Project Data & Hooks|Project Data & Hooks]]
- [[_COMMUNITY_Board Shell & Routing|Board Shell & Routing]]
- [[_COMMUNITY_Workflow & Project Rules|Workflow & Project Rules]]
- [[_COMMUNITY_Social Loafing Research|Social Loafing Research]]
- [[_COMMUNITY_Peer Assessment Research|Peer Assessment Research]]
- [[_COMMUNITY_Landing Contribution Card|Landing Contribution Card]]
- [[_COMMUNITY_Out of Scope|Out of Scope]]

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 13 edges
2. `tasks subcollection` - 8 edges
3. `taskRef()` - 8 edges
4. `projects collection` - 7 edges
5. `Firestore Data Model` - 6 edges
6. `Firestore Security Rules` - 6 edges
7. `Milestone 1 — Two accounts, one live board (complete)` - 6 edges
8. `Stack: Vite + React + plain JS + Firebase` - 5 edges
9. `joinCodes collection` - 5 edges
10. `reviews subcollection` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Gitignored .env Firebase Config` --conceptually_related_to--> `Stack: Vite + React + plain JS + Firebase`  [INFERRED]
  CLAUDE.md → PLAN.md
- `FairShare (app)` --references--> `Stack: Vite + React + plain JS + Firebase`  [EXTRACTED]
  CLAUDE.md → PLAN.md
- `FairShare (app)` --references--> `One-Feature-At-A-Time Workflow`  [EXTRACTED]
  CLAUDE.md → PLAN.md
- `ProtectedRoute()` --calls--> `useAuth()`  [EXTRACTED]
  src/components/auth/ProtectedRoute.jsx → src/hooks/useAuth.jsx
- `Landing()` --calls--> `useAuth()`  [EXTRACTED]
  src/components/landing/Landing.jsx → src/hooks/useAuth.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Firestore data model collections** — plan_collection_projects, plan_collection_joincodes, plan_collection_tasks, plan_collection_reviews [EXTRACTED 1.00]
- **Fairness pure functions** — plan_fn_taskpoints, plan_fn_contributionshares, plan_fn_ratingaverages [EXTRACTED 1.00]
- **Milestone 1 features (complete)** — plan_f0, plan_f1, plan_f2, plan_f3, plan_f4, plan_f5 [EXTRACTED 1.00]
- **Research Foundation** — instructions_social_loafing, instructions_ringelmann_effect, instructions_peer_assessment, instructions_fairshare [EXTRACTED 0.85]

## Communities (16 total, 2 thin omitted)

### Community 0 - "Data Model, Roadmap & Foundations"
Cohesion: 0.10
Nodes (33): Gitignored .env Firebase Config, Architecture (React SPA, no server), joinCodes collection, projects collection, reviews subcollection, tasks subcollection, F0 Scaffold & design system (done), F1 Firebase setup + Google sign-in (done) (+25 more)

### Community 1 - "App Shell & Dashboard UI"
Cohesion: 0.10
Nodes (17): ProtectedRoute(), LoadingScreen(), CreateProjectModal(), Dashboard(), JoinProjectModal(), ProjectCard(), Landing(), AppHeader() (+9 more)

### Community 2 - "Task Card & Modals"
Cohesion: 0.12
Nodes (16): RejectTaskModal(), SizeChip(), approveTask(), claimTask(), createTask(), deleteTask(), isValidProofUrl(), markTaskDone() (+8 more)

### Community 3 - "Peer Review UI"
Cohesion: 0.19
Nodes (9): ReviewForm(), ReviewPage(), STAR_VALUES, StarRating(), useMyReview(), isReviewComplete(), REVIEW_CRITERIA, reviewRef() (+1 more)

### Community 4 - "Package & Build Config"
Cohesion: 0.12
Nodes (16): dependencies, firebase, react, react-dom, react-router-dom, devDependencies, vite, @vitejs/plugin-react (+8 more)

### Community 5 - "Project Data & Hooks"
Cohesion: 0.22
Nodes (9): EndProjectModal(), createProject(), endProject(), joinCodeRef(), joinProject(), lookupJoinCode(), projectRef(), projectsCollection (+1 more)

### Community 6 - "Board Shell & Routing"
Cohesion: 0.21
Nodes (7): App(), ProjectPage(), COLUMNS, TaskBoard(), TaskCard(), TaskColumn(), AuthProvider()

### Community 7 - "Workflow & Project Rules"
Cohesion: 0.40
Nodes (5): FairShare (app), Graphify Knowledge Graph Workflow, Rules for the Executing Model, One-Feature-At-A-Time Workflow, Manual Two-Account Verification Approach

### Community 8 - "Social Loafing Research"
Cohesion: 0.50
Nodes (4): FairShare, Latane, Williams & Harkins (1979), Ringelmann Effect, Social Loafing

### Community 9 - "Peer Assessment Research"
Cohesion: 0.67
Nodes (3): CATME, Falchikov & Goldfinch (2000), Peer Assessment

## Knowledge Gaps
- **28 isolated node(s):** `TEAMMATES`, `FairShare`, `Ringelmann Effect`, `CATME`, `Latane, Williams & Harkins (1979)` (+23 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `firebase` connect `Package & Build Config` to `App Shell & Dashboard UI`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **What connects `TEAMMATES`, `FairShare`, `Ringelmann Effect` to the rest of the system?**
  _31 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Data Model, Roadmap & Foundations` be split into smaller, more focused modules?**
  _Cohesion score 0.10416666666666667 - nodes in this community are weakly interconnected._
- **Should `App Shell & Dashboard UI` be split into smaller, more focused modules?**
  _Cohesion score 0.10416666666666667 - nodes in this community are weakly interconnected._
- **Should `Task Card & Modals` be split into smaller, more focused modules?**
  _Cohesion score 0.12183908045977011 - nodes in this community are weakly interconnected._
- **Should `Package & Build Config` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._