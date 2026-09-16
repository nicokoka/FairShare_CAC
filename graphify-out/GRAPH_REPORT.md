# Graph Report - .  (2026-09-16)

## Corpus Check
- 21 files · ~9,015 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 128 nodes · 203 edges · 11 communities (10 shown, 1 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.81)
- Token cost: 64,812 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Feature Sequence & Milestones|Feature Sequence & Milestones]]
- [[_COMMUNITY_App Shell & Page Components|App Shell & Page Components]]
- [[_COMMUNITY_Fairness Math & Research Foundation|Fairness Math & Research Foundation]]
- [[_COMMUNITY_Build Config & Dependencies|Build Config & Dependencies]]
- [[_COMMUNITY_Dashboard & Project UI|Dashboard & Project UI]]
- [[_COMMUNITY_Project & Join-Code Data Layer|Project & Join-Code Data Layer]]
- [[_COMMUNITY_Auth & Firebase Init|Auth & Firebase Init]]
- [[_COMMUNITY_Landing Contribution Card|Landing Contribution Card]]

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 13 edges
2. `Firestore Security Rules` - 8 edges
3. `Proof + Verification` - 6 edges
4. `Milestone M1 (live board)` - 6 edges
5. `tasks subcollection` - 5 edges
6. `reviews subcollection` - 5 edges
7. `Live Task Board` - 5 edges
8. `src/lib/fairness.js (pure functions)` - 5 edges
9. `Milestone M3 (report/polish/ship)` - 5 edges
10. `scripts` - 4 edges

## Surprising Connections (you probably didn't know these)
- `FairShare` --conceptually_related_to--> `Live Task Board`  [EXTRACTED]
  instructions.txt → PLAN.md
- `Peer Assessment` --rationale_for--> `Peer Review`  [INFERRED]
  instructions.txt → PLAN.md
- `FairShare` --conceptually_related_to--> `Fairness Report`  [EXTRACTED]
  instructions.txt → PLAN.md
- `One-feature-per-session Workflow` --rationale_for--> `FairShare (App)`  [EXTRACTED]
  PLAN.md → CLAUDE.md
- `Playful & student-y visual style` --rationale_for--> `FairShare (App)`  [EXTRACTED]
  PLAN.md → CLAUDE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Fairness computation pipeline (verified tasks + reviews to report)** — plan_proof_verification, plan_peer_review, plan_fairness_lib, plan_fairness_report [EXTRACTED 0.90]
- **Firestore data model collections** — plan_projects_collection, plan_joincodes_collection, plan_tasks_collection, plan_reviews_collection [EXTRACTED 0.90]
- **Serverless client-only + rules-enforced security** — plan_no_cloud_functions, plan_security_rules, plan_reviews_collection [EXTRACTED 0.85]
- **Research Foundation** — instructions_social_loafing, instructions_ringelmann_effect, instructions_peer_assessment, instructions_fairshare [EXTRACTED 0.85]

## Communities (11 total, 1 thin omitted)

### Community 0 - "Feature Sequence & Milestones"
Cohesion: 0.10
Nodes (31): Tech Stack (Vite + React + plain JS + Firebase Spark), CATME, Falchikov & Goldfinch (2000), Peer Assessment, End Project, F0 Scaffold & design system (done), F1 Firebase setup + Google sign-in (done), F2 Create project + dashboard (done) (+23 more)

### Community 1 - "App Shell & Page Components"
Cohesion: 0.18
Nodes (7): App(), ProtectedRoute(), LoadingScreen(), Landing(), MembersList(), ProjectPage(), useProject()

### Community 2 - "Fairness Math & Research Foundation"
Cohesion: 0.13
Nodes (17): FairShare (App), FairShare, Latane, Williams & Harkins (1979), Ringelmann Effect, Social Loafing, contributionShares(tasks, memberIds), F10 Fairness math (pure functions), F11 Fairness report page (+9 more)

### Community 3 - "Build Config & Dependencies"
Cohesion: 0.12
Nodes (16): dependencies, firebase, react, react-dom, react-router-dom, devDependencies, vite, @vitejs/plugin-react (+8 more)

### Community 4 - "Dashboard & Project UI"
Cohesion: 0.20
Nodes (8): CreateProjectModal(), Dashboard(), JoinProjectModal(), ProjectCard(), AppHeader(), useAuth(), useProjects(), projectsCollection

### Community 5 - "Project & Join-Code Data Layer"
Cohesion: 0.42
Nodes (7): generateJoinCode(), createProject(), joinCodeRef(), joinProject(), lookupJoinCode(), projectRef(), reserveUniqueCode()

### Community 6 - "Auth & Firebase Init"
Cohesion: 0.24
Nodes (8): AuthContext, AuthProvider(), app, auth, db, firebaseConfig, googleProvider, REQUIRED

## Knowledge Gaps
- **23 isolated node(s):** `TEAMMATES`, `Ringelmann Effect`, `CATME`, `Latane, Williams & Harkins (1979)`, `Falchikov & Goldfinch (2000)` (+18 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `firebase` connect `Build Config & Dependencies` to `Auth & Firebase Init`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `Firestore Security Rules` connect `Feature Sequence & Milestones` to `Fairness Math & Research Foundation`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Proof + Verification` (e.g. with `contributionShares(tasks, memberIds)` and `Join Code (6-char)`) actually correct?**
  _`Proof + Verification` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `TEAMMATES`, `Ringelmann Effect`, `CATME` to the rest of the system?**
  _25 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Feature Sequence & Milestones` be split into smaller, more focused modules?**
  _Cohesion score 0.0989247311827957 - nodes in this community are weakly interconnected._
- **Should `Fairness Math & Research Foundation` be split into smaller, more focused modules?**
  _Cohesion score 0.1323529411764706 - nodes in this community are weakly interconnected._
- **Should `Build Config & Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._