# Graph Report - .  (2026-09-16)

## Corpus Check
- 8 files · ~11,412 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 153 nodes · 235 edges · 16 communities (14 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.85)
- Token cost: 61,289 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_App Shell & Page Components|App Shell & Page Components]]
- [[_COMMUNITY_App Context & Foundations|App Context & Foundations]]
- [[_COMMUNITY_Task Board Components|Task Board Components]]
- [[_COMMUNITY_Data Model & Feature Sequence|Data Model & Feature Sequence]]
- [[_COMMUNITY_Project & Join-Code Data Layer|Project & Join-Code Data Layer]]
- [[_COMMUNITY_Package & Build Config|Package & Build Config]]
- [[_COMMUNITY_Dependencies & Firebase Init|Dependencies & Firebase Init]]
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
7. `taskRef()` - 5 edges
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

## Communities (16 total, 2 thin omitted)

### Community 0 - "App Shell & Page Components"
Cohesion: 0.14
Nodes (14): App(), ProtectedRoute(), LoadingScreen(), CreateProjectModal(), Dashboard(), JoinProjectModal(), ProjectCard(), Landing() (+6 more)

### Community 1 - "App Context & Foundations"
Cohesion: 0.10
Nodes (22): Gitignored .env Firebase Config, FairShare (app), Graphify Knowledge Graph Workflow, Architecture (React SPA, no server), Rules for the Executing Model, F0 Scaffold & design system (done), F1 Firebase setup + Google sign-in (done), F10 Fairness math (pure functions) (+14 more)

### Community 2 - "Task Board Components"
Cohesion: 0.17
Nodes (12): SizeChip(), TaskMenu(), claimTask(), createTask(), deleteTask(), reassignTask(), SIZE_VALUES, sizePoints() (+4 more)

### Community 3 - "Data Model & Feature Sequence"
Cohesion: 0.25
Nodes (16): joinCodes collection, projects collection, reviews subcollection, tasks subcollection, F2 Create project + dashboard (done), F3 Join by code (done), F4 Task board — create & display (done), F5 Claim & move tasks (done) (+8 more)

### Community 4 - "Project & Join-Code Data Layer"
Cohesion: 0.25
Nodes (8): generateJoinCode(), createProject(), joinCodeRef(), joinProject(), lookupJoinCode(), projectRef(), projectsCollection, reserveUniqueCode()

### Community 5 - "Package & Build Config"
Cohesion: 0.17
Nodes (11): devDependencies, vite, @vitejs/plugin-react, name, private, scripts, build, dev (+3 more)

### Community 6 - "Dependencies & Firebase Init"
Cohesion: 0.18
Nodes (10): dependencies, firebase, react, react-dom, react-router-dom, app, db, firebaseConfig (+2 more)

### Community 7 - "Project Page & Board Shell"
Cohesion: 0.28
Nodes (5): ProjectPage(), COLUMNS, TaskBoard(), TaskCard(), TaskColumn()

### Community 8 - "Social Loafing Research"
Cohesion: 0.50
Nodes (4): FairShare, Latane, Williams & Harkins (1979), Ringelmann Effect, Social Loafing

### Community 9 - "Peer Assessment Research"
Cohesion: 0.67
Nodes (3): CATME, Falchikov & Goldfinch (2000), Peer Assessment

## Knowledge Gaps
- **26 isolated node(s):** `TEAMMATES`, `FairShare`, `Ringelmann Effect`, `CATME`, `Latane, Williams & Harkins (1979)` (+21 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Dependencies & Firebase Init` to `Package & Build Config`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **What connects `TEAMMATES`, `FairShare`, `Ringelmann Effect` to the rest of the system?**
  _29 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Shell & Page Components` be split into smaller, more focused modules?**
  _Cohesion score 0.1402116402116402 - nodes in this community are weakly interconnected._
- **Should `App Context & Foundations` be split into smaller, more focused modules?**
  _Cohesion score 0.1038961038961039 - nodes in this community are weakly interconnected._