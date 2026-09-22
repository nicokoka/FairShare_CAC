# Graph Report - /Users/admin/Desktop/CAC project  (2026-09-21)

## Corpus Check
- 4 files · ~12,100 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 157 nodes · 244 edges · 15 communities (13 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_App Shell & Page Components|App Shell & Page Components]]
- [[_COMMUNITY_Task Board Components|Task Board Components]]
- [[_COMMUNITY_Foundations, Roadmap & Fairness Math|Foundations, Roadmap & Fairness Math]]
- [[_COMMUNITY_Package & Build Config|Package & Build Config]]
- [[_COMMUNITY_Data Model & Feature Sequence|Data Model & Feature Sequence]]
- [[_COMMUNITY_Project & Join-Code Data Layer|Project & Join-Code Data Layer]]
- [[_COMMUNITY_Project Page & Board Shell|Project Page & Board Shell]]
- [[_COMMUNITY_Social Loafing Research|Social Loafing Research]]
- [[_COMMUNITY_Peer Assessment Research|Peer Assessment Research]]
- [[_COMMUNITY_Landing Contribution Card|Landing Contribution Card]]
- [[_COMMUNITY_Out of Scope|Out of Scope]]

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 13 edges
2. `tasks subcollection` - 8 edges
3. `projects collection` - 7 edges
4. `Firestore Data Model` - 6 edges
5. `Firestore Security Rules` - 6 edges
6. `Milestone 1 — Two accounts, one live board (complete)` - 6 edges
7. `taskRef()` - 6 edges
8. `Stack: Vite + React + plain JS + Firebase` - 5 edges
9. `joinCodes collection` - 5 edges
10. `reviews subcollection` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Gitignored .env Firebase Config` --conceptually_related_to--> `Stack: Vite + React + plain JS + Firebase`  [INFERRED]
  CLAUDE.md → PLAN.md
- `FairShare (app)` --references--> `One-Feature-At-A-Time Workflow`  [EXTRACTED]
  CLAUDE.md → PLAN.md
- `FairShare (app)` --references--> `Stack: Vite + React + plain JS + Firebase`  [EXTRACTED]
  CLAUDE.md → PLAN.md
- `ProtectedRoute()` --calls--> `useAuth()`  [EXTRACTED]
  src/components/auth/ProtectedRoute.jsx → src/hooks/useAuth.jsx
- `CreateProjectModal()` --calls--> `useAuth()`  [EXTRACTED]
  src/components/dashboard/CreateProjectModal.jsx → src/hooks/useAuth.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Firestore data model collections** — plan_collection_projects, plan_collection_joincodes, plan_collection_tasks, plan_collection_reviews [EXTRACTED 1.00]
- **Fairness pure functions** — plan_fn_taskpoints, plan_fn_contributionshares, plan_fn_ratingaverages [EXTRACTED 1.00]
- **Milestone 1 features (complete)** — plan_f0, plan_f1, plan_f2, plan_f3, plan_f4, plan_f5 [EXTRACTED 1.00]
- **Research Foundation** — instructions_social_loafing, instructions_ringelmann_effect, instructions_peer_assessment, instructions_fairshare [EXTRACTED 0.85]

## Communities (15 total, 2 thin omitted)

### Community 0 - "App Shell & Page Components"
Cohesion: 0.11
Nodes (19): App(), ProtectedRoute(), LoadingScreen(), CreateProjectModal(), Dashboard(), JoinProjectModal(), ProjectCard(), Landing() (+11 more)

### Community 1 - "Task Board Components"
Cohesion: 0.14
Nodes (15): MarkDoneModal(), SizeChip(), TaskCard(), claimTask(), createTask(), deleteTask(), isValidProofUrl(), markTaskDone() (+7 more)

### Community 2 - "Foundations, Roadmap & Fairness Math"
Cohesion: 0.10
Nodes (22): Gitignored .env Firebase Config, FairShare (app), Graphify Knowledge Graph Workflow, Architecture (React SPA, no server), Rules for the Executing Model, F0 Scaffold & design system (done), F1 Firebase setup + Google sign-in (done), F10 Fairness math (pure functions) (+14 more)

### Community 3 - "Package & Build Config"
Cohesion: 0.12
Nodes (16): dependencies, firebase, react, react-dom, react-router-dom, devDependencies, vite, @vitejs/plugin-react (+8 more)

### Community 4 - "Data Model & Feature Sequence"
Cohesion: 0.25
Nodes (16): joinCodes collection, projects collection, reviews subcollection, tasks subcollection, F2 Create project + dashboard (done), F3 Join by code (done), F4 Task board — create & display (done), F5 Claim & move tasks (done) (+8 more)

### Community 5 - "Project & Join-Code Data Layer"
Cohesion: 0.25
Nodes (8): generateJoinCode(), createProject(), joinCodeRef(), joinProject(), lookupJoinCode(), projectRef(), projectsCollection, reserveUniqueCode()

### Community 6 - "Project Page & Board Shell"
Cohesion: 0.32
Nodes (4): ProjectPage(), COLUMNS, TaskBoard(), TaskColumn()

### Community 7 - "Social Loafing Research"
Cohesion: 0.50
Nodes (4): FairShare, Latane, Williams & Harkins (1979), Ringelmann Effect, Social Loafing

### Community 8 - "Peer Assessment Research"
Cohesion: 0.67
Nodes (3): CATME, Falchikov & Goldfinch (2000), Peer Assessment

## Knowledge Gaps
- **26 isolated node(s):** `TEAMMATES`, `FairShare`, `Ringelmann Effect`, `CATME`, `Latane, Williams & Harkins (1979)` (+21 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `firebase` connect `Package & Build Config` to `App Shell & Page Components`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **What connects `TEAMMATES`, `FairShare`, `Ringelmann Effect` to the rest of the system?**
  _29 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Shell & Page Components` be split into smaller, more focused modules?**
  _Cohesion score 0.10873440285204991 - nodes in this community are weakly interconnected._
- **Should `Task Board Components` be split into smaller, more focused modules?**
  _Cohesion score 0.14153846153846153 - nodes in this community are weakly interconnected._
- **Should `Foundations, Roadmap & Fairness Math` be split into smaller, more focused modules?**
  _Cohesion score 0.1038961038961039 - nodes in this community are weakly interconnected._
- **Should `Package & Build Config` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._