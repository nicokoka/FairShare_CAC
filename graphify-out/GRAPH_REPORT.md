# Graph Report - .  (2026-10-22)

## Corpus Check
- 69 files · ~39,334 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 357 nodes · 652 edges · 25 communities (20 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Project Context & Research|Project Context & Research]]
- [[_COMMUNITY_App Shell, Home & Landing|App Shell, Home & Landing]]
- [[_COMMUNITY_Task Board & Modals|Task Board & Modals]]
- [[_COMMUNITY_Report Charts & Page|Report Charts & Page]]
- [[_COMMUNITY_Auth, Create Project & AI|Auth, Create Project & AI]]
- [[_COMMUNITY_Join, Invite & QR|Join, Invite & QR]]
- [[_COMMUNITY_Build Config & Dependencies|Build Config & Dependencies]]
- [[_COMMUNITY_Class Dashboard & Check-ins|Class Dashboard & Check-ins]]
- [[_COMMUNITY_Classes & Teacher Home|Classes & Teacher Home]]
- [[_COMMUNITY_Calendar Export|Calendar Export]]
- [[_COMMUNITY_Fairness Profile|Fairness Profile]]
- [[_COMMUNITY_Peer Review Form|Peer Review Form]]
- [[_COMMUNITY_Team Charter|Team Charter]]
- [[_COMMUNITY_Fairness Math|Fairness Math]]
- [[_COMMUNITY_Peer Assessment Research|Peer Assessment Research]]
- [[_COMMUNITY_Landing Contribution Card|Landing Contribution Card]]
- [[_COMMUNITY_Reviews Tests|Reviews Tests]]
- [[_COMMUNITY_F0 Scaffold|F0 Scaffold]]
- [[_COMMUNITY_F13 Polish|F13 Polish]]

## God Nodes (most connected - your core abstractions)
1. `Icon()` - 24 edges
2. `AppHeader()` - 11 edges
3. `taskRef()` - 9 edges
4. `projects Collection` - 7 edges
5. `tasks Subcollection` - 7 edges
6. `scripts` - 7 edges
7. `db` - 7 edges
8. `isValidProofUrl()` - 7 edges
9. `FairShare (App)` - 6 edges
10. `Firestore Security Rules` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Review Privacy Tradeoff (No Cloud Functions)` --semantically_similar_to--> `Peer-Review Validity Rationale`  [INFERRED] [semantically similar]
  PLAN.md → DEMO_SCRIPT.md
- `FairShare (App)` --conceptually_related_to--> `Social Loafing`  [INFERRED]
  CLAUDE.md → DEMO_SCRIPT.md
- `Review Privacy Tradeoff (No Cloud Functions)` --conceptually_related_to--> `Stack & Free-Tier Constraints (Vite + React + Firebase, no Cloud Functions)`  [INFERRED]
  PLAN.md → CLAUDE.md
- `ratingAverages(reviews, memberIds)` --conceptually_related_to--> `Peer-Review Validity Rationale`  [INFERRED]
  PLAN.md → DEMO_SCRIPT.md
- `Proof + Verification Anti-Cheating Core` --conceptually_related_to--> `Social Loafing`  [INFERRED]
  PLAN.md → DEMO_SCRIPT.md

## Import Cycles
- 1-file cycle: `src/components/project/QrCode.jsx -> src/components/project/QrCode.jsx`
- 4-file cycle: `src/App.jsx -> src/components/class/ClassDashboard.jsx -> src/lib/checkins.js -> src/lib/firebase.js -> src/App.jsx`
- 4-file cycle: `src/App.jsx -> src/components/class/ClassDashboard.jsx -> src/lib/tasks.js -> src/lib/firebase.js -> src/App.jsx`
- 4-file cycle: `src/App.jsx -> src/components/dashboard/Dashboard.jsx -> src/components/dashboard/CreateProjectModal.jsx -> src/lib/firebase.js -> src/App.jsx`
- 4-file cycle: `src/App.jsx -> src/components/join/JoinByLink.jsx -> src/lib/projects.js -> src/lib/firebase.js -> src/App.jsx`
- 5-file cycle: `src/App.jsx -> src/components/project/ProjectPage.jsx -> src/components/project/CheckInCard.jsx -> src/lib/checkins.js -> src/lib/firebase.js -> src/App.jsx`
- 5-file cycle: `src/App.jsx -> src/components/class/ClassDashboard.jsx -> src/components/layout/AppHeader.jsx -> src/lib/users.js -> src/lib/firebase.js -> src/App.jsx`
- 5-file cycle: `src/App.jsx -> src/components/dashboard/Dashboard.jsx -> src/components/layout/AppHeader.jsx -> src/lib/users.js -> src/lib/firebase.js -> src/App.jsx`
- 5-file cycle: `src/App.jsx -> src/components/join/JoinByLink.jsx -> src/components/layout/AppHeader.jsx -> src/lib/users.js -> src/lib/firebase.js -> src/App.jsx`
- 5-file cycle: `src/App.jsx -> src/components/profile/ProfilePage.jsx -> src/components/layout/AppHeader.jsx -> src/lib/users.js -> src/lib/firebase.js -> src/App.jsx`
- 5-file cycle: `src/App.jsx -> src/components/project/ProjectPage.jsx -> src/components/layout/AppHeader.jsx -> src/lib/users.js -> src/lib/firebase.js -> src/App.jsx`
- 5-file cycle: `src/App.jsx -> src/components/project/ProjectPage.jsx -> src/components/project/CharterCard.jsx -> src/lib/charter.js -> src/lib/firebase.js -> src/App.jsx`
- 5-file cycle: `src/App.jsx -> src/components/project/ProjectPage.jsx -> src/components/project/EndProjectModal.jsx -> src/lib/projects.js -> src/lib/firebase.js -> src/App.jsx`
- 5-file cycle: `src/App.jsx -> src/components/class/ClassDashboard.jsx -> src/hooks/useClasses.jsx -> src/lib/classes.js -> src/lib/firebase.js -> src/App.jsx`
- 5-file cycle: `src/App.jsx -> src/components/class/ClassDashboard.jsx -> src/hooks/useClasses.jsx -> src/lib/projects.js -> src/lib/firebase.js -> src/App.jsx`
- 5-file cycle: `src/App.jsx -> src/components/class/ClassDashboard.jsx -> src/lib/snapshot.js -> src/lib/checkins.js -> src/lib/firebase.js -> src/App.jsx`
- 5-file cycle: `src/App.jsx -> src/components/dashboard/Dashboard.jsx -> src/components/dashboard/CreateProjectModal.jsx -> src/lib/aiPlanner.js -> src/lib/firebase.js -> src/App.jsx`
- 5-file cycle: `src/App.jsx -> src/components/dashboard/Dashboard.jsx -> src/components/dashboard/CreateProjectModal.jsx -> src/lib/classes.js -> src/lib/firebase.js -> src/App.jsx`
- 5-file cycle: `src/App.jsx -> src/components/dashboard/Dashboard.jsx -> src/components/dashboard/CreateProjectModal.jsx -> src/lib/projects.js -> src/lib/firebase.js -> src/App.jsx`
- 5-file cycle: `src/App.jsx -> src/components/dashboard/Dashboard.jsx -> src/components/dashboard/CreateProjectModal.jsx -> src/lib/tasks.js -> src/lib/firebase.js -> src/App.jsx`

## Hyperedges (group relationships)
- **Fairness Report Pipeline (tasks + reviews → math → report)** — plan_collection_tasks, plan_collection_reviews, plan_fairness_math, plan_f11 [INFERRED 0.85]
- **Anti-Cheating Verification Flow (proof + teammate verify, no self-verify)** — plan_f6, plan_f7, plan_no_self_verify, plan_security_rules [INFERRED 0.85]
- **Research Foundation (social loafing + peer-review validity)** — demo_script_social_loafing, demo_script_latane_1979, demo_script_falchikov_goldfinch_2000, demo_script_catme [INFERRED 0.75]

## Communities (25 total, 5 thin omitted)

### Community 0 - "Project Context & Research"
Cohesion: 0.06
Nodes (47): Gitignored .env Firebase Config, FairShare (App), Graphify Knowledge Graph Workflow, Stack & Free-Tier Constraints (Vite + React + Firebase, no Cloud Functions), Demo Script (CAC Video), CATME (Peer Review Tool), Falchikov & Goldfinch (2000), Latané, Williams & Harkins (1979) (+39 more)

### Community 1 - "App Shell, Home & Landing"
Cohesion: 0.09
Nodes (20): Dashboard(), RoleHome(), RolePicker(), JoinByLink(), Landing(), AppHeader(), PlaceholderPage(), EndProjectModal() (+12 more)

### Community 2 - "Task Board & Modals"
Cohesion: 0.10
Nodes (26): AddTaskModal(), MarkDoneModal(), RejectTaskModal(), DueDate(), SizeChip(), TaskCard(), formatDueLabel(), formatShortDate() (+18 more)

### Community 3 - "Report Charts & Page"
Cohesion: 0.08
Nodes (12): ContributionBars(), CRITERION_COLORS, RatingChart(), formatDate(), ReportPage(), VerifiedTasksTable(), buildReportCsv(), downloadReportCsv() (+4 more)

### Community 4 - "Auth, Create Project & AI"
Cohesion: 0.11
Nodes (22): App(), ProtectedRoute(), LoadingScreen(), CreateProjectModal(), ReportSummary(), AuthContext, AuthProvider(), useAuth() (+14 more)

### Community 5 - "Join, Invite & QR"
Cohesion: 0.14
Nodes (15): qrcode, JoinProjectModal(), InvitePanel(), QrCode(), generateJoinCode(), inviteUrl(), createProject(), endProject() (+7 more)

### Community 6 - "Build Config & Dependencies"
Cohesion: 0.10
Nodes (20): dependencies, firebase, react, react-dom, react-router-dom, devDependencies, vite, @vitejs/plugin-react (+12 more)

### Community 7 - "Class Dashboard & Check-ins"
Cohesion: 0.18
Nodes (12): ClassDashboard(), ClassProjectCard(), FLAG_LABEL, CheckInCard(), SCALE, useCheckins(), useClassProjects(), checkinRef() (+4 more)

### Community 8 - "Classes & Teacher Home"
Cohesion: 0.28
Nodes (8): CreateClassModal(), TeacherHome(), useClasses(), classCodeRef(), classesCollection, createClass(), lookupClassCode(), reserveUniqueClassCode()

### Community 9 - "Calendar Export"
Cohesion: 0.24
Nodes (9): buildCalendar(), datedTaskCount(), downloadCalendar(), icsStamp(), nextIcsDate(), pad(), slugify(), NOW (+1 more)

### Community 10 - "Fairness Profile"
Cohesion: 0.29
Nodes (5): ProfilePage(), useProfileStats(), mean(), summarizeProfile(), rows

### Community 11 - "Peer Review Form"
Cohesion: 0.22
Nodes (4): STAR_VALUES, REVIEW_CRITERIA, reviewRef(), submitReview()

### Community 12 - "Team Charter"
Cohesion: 0.42
Nodes (6): CharterCard(), useCharter(), charterRef(), normalizeCharterItems(), saveCharter(), db

### Community 14 - "Peer Assessment Research"
Cohesion: 0.67
Nodes (3): CATME, Falchikov & Goldfinch (2000), Peer Assessment

## Knowledge Gaps
- **56 isolated node(s):** `TEAMMATES`, `FairShare`, `Ringelmann Effect`, `CATME`, `Falchikov & Goldfinch (2000)` (+51 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Icon()` connect `App Shell, Home & Landing` to `Task Board & Modals`, `Report Charts & Page`, `Auth, Create Project & AI`, `Join, Invite & QR`, `Class Dashboard & Check-ins`, `Classes & Teacher Home`, `Fairness Profile`, `Team Charter`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Build Config & Dependencies` to `Join, Invite & QR`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `firebase` connect `Build Config & Dependencies` to `Auth, Create Project & AI`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `projects Collection` (e.g. with `tasks Subcollection` and `F1 Firebase Setup + Google Sign-in`) actually correct?**
  _`projects Collection` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `TEAMMATES`, `FairShare`, `Ringelmann Effect` to the rest of the system?**
  _62 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Project Context & Research` be split into smaller, more focused modules?**
  _Cohesion score 0.05735430157261795 - nodes in this community are weakly interconnected._
- **Should `App Shell, Home & Landing` be split into smaller, more focused modules?**
  _Cohesion score 0.08788159111933395 - nodes in this community are weakly interconnected._