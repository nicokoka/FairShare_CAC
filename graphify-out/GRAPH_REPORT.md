# Graph Report - .  (2026-09-03)

## Corpus Check
- Corpus is ~5,208 words - fits in a single context window. You may not need a graph.

## Summary
- 51 nodes · 56 edges · 11 communities (10 shown, 1 thin omitted)
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Build Config & Tooling|Build Config & Tooling]]
- [[_COMMUNITY_Fairness Math & Contribution View|Fairness Math & Contribution View]]
- [[_COMMUNITY_Core Data Model & Features|Core Data Model & Features]]
- [[_COMMUNITY_Playful Landing & Branding|Playful Landing & Branding]]
- [[_COMMUNITY_App Shell & Routing|App Shell & Routing]]
- [[_COMMUNITY_Peer Assessment Research|Peer Assessment Research]]
- [[_COMMUNITY_Social Loafing Research Foundation|Social Loafing Research Foundation]]
- [[_COMMUNITY_React Dependencies|React Dependencies]]
- [[_COMMUNITY_NPM Scripts|NPM Scripts]]

## God Nodes (most connected - your core abstractions)
1. `Task Board (To Do / Doing / Done)` - 5 edges
2. `Fairness Report` - 5 edges
3. `scripts` - 4 edges
4. `ContributionCard()` - 4 edges
5. `contributionShares()` - 4 edges
6. `Firestore Data Model` - 4 edges
7. `Landing()` - 3 edges
8. `Wordmark()` - 3 edges
9. `FairShare` - 3 edges
10. `Social Loafing` - 3 edges

## Surprising Connections (you probably didn't know these)
- `contributionShares()` --semantically_similar_to--> `ContributionCard()`  [INFERRED] [semantically similar]
  PLAN.md → src/components/landing/ContributionCard.jsx
- `Fairness Report` --conceptually_related_to--> `ContributionCard()`  [INFERRED]
  PLAN.md → src/components/landing/ContributionCard.jsx
- `Playful Design System` --conceptually_related_to--> `Landing()`  [INFERRED]
  PLAN.md → src/components/landing/Landing.jsx
- `Playful Design System` --conceptually_related_to--> `Wordmark()`  [INFERRED]
  PLAN.md → src/components/landing/Wordmark.jsx
- `FairShare` --conceptually_related_to--> `Fairness Report`  [EXTRACTED]
  instructions.txt → PLAN.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Fairness Report Computation Flow** — plan_task_points, plan_contribution_shares, plan_rating_averages, plan_fairness_report [EXTRACTED 0.90]
- **Research Foundation** — instructions_social_loafing, instructions_ringelmann_effect, instructions_peer_assessment, instructions_fairshare [EXTRACTED 0.85]

## Communities (11 total, 1 thin omitted)

### Community 0 - "Build Config & Tooling"
Cohesion: 0.25
Nodes (7): devDependencies, vite, @vitejs/plugin-react, name, private, type, version

### Community 1 - "Fairness Math & Contribution View"
Cohesion: 0.33
Nodes (4): contributionShares(), Fairness Report, ContributionCard(), TEAMMATES

### Community 2 - "Core Data Model & Features"
Cohesion: 0.33
Nodes (7): Firestore Data Model, Google Sign-in, Join Code, Proof Link, Real-time onSnapshot Sync, Task Board (To Do / Doing / Done), Teammate Verification

### Community 3 - "Playful Landing & Branding"
Cohesion: 0.47
Nodes (3): Playful Design System, Landing(), Wordmark()

### Community 5 - "Peer Assessment Research"
Cohesion: 0.50
Nodes (4): CATME, Falchikov & Goldfinch (2000), Peer Assessment, Peer Review (Effort / Quality / Teamwork)

### Community 6 - "Social Loafing Research Foundation"
Cohesion: 0.50
Nodes (4): FairShare, Latane, Williams & Harkins (1979), Ringelmann Effect, Social Loafing

### Community 7 - "React Dependencies"
Cohesion: 0.50
Nodes (4): dependencies, react, react-dom, react-router-dom

### Community 8 - "NPM Scripts"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

## Knowledge Gaps
- **20 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ContributionCard()` connect `Fairness Math & Contribution View` to `Playful Landing & Branding`?**
  _High betweenness centrality (0.202) - this node is a cross-community bridge._
- **Why does `Fairness Report` connect `Fairness Math & Contribution View` to `Peer Assessment Research`, `Social Loafing Research Foundation`?**
  _High betweenness centrality (0.189) - this node is a cross-community bridge._
- **Why does `FairShare` connect `Social Loafing Research Foundation` to `Fairness Math & Contribution View`, `Core Data Model & Features`?**
  _High betweenness centrality (0.116) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Task Board (To Do / Doing / Done)` (e.g. with `Join Code` and `Firestore Data Model`) actually correct?**
  _`Task Board (To Do / Doing / Done)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `ContributionCard()` (e.g. with `contributionShares()` and `Fairness Report`) actually correct?**
  _`ContributionCard()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._