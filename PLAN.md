# FairShare — Congressional App Challenge Execution Plan

> **Handoff step (do this first upon approval):** Save this entire document verbatim as `/Users/admin/Desktop/CAC project/PLAN.md`. That file is the single source of truth for the executing model (e.g., Opus). Each new session starts with: *"Read PLAN.md, find the first unchecked feature, and build only that feature following the Rules for the Executing Model."* Track progress by adding `✅ done <date>` next to each finished feature header in PLAN.md.

## Context

FairShare is a web app that makes group projects fair by tracking who actually does the work. Students create a project, teammates join with a code, everyone works off a live task board, completed work requires a proof link **and** teammate verification, and at project end everyone privately rates teammates. The app produces a printable fairness report the teacher can use when grading. Full rationale and research citations live in `/Users/admin/Desktop/CAC project/instructions.txt`.

The developer is a high-school student who knows JavaScript/HTML/CSS but is **new to React and Firebase**. Target milestones (self-paced, in this order): M1 ~Sept 18 (auth + projects + live board), M2 ~Oct 9 (proof, verification, peer reviews), Final ~Oct 26 (report, polish, deploy, demo video).

## Decisions Locked In (from user interview — do not re-litigate)

| Topic | Decision |
|---|---|
| Stack | Vite + React + **plain JavaScript** (no TypeScript) + Firebase (Auth, Firestore, Hosting). Free (Spark) tier only — **no Cloud Functions**. |
| Auth | Google sign-in **only**. |
| Projects | Users can be in multiple projects; dashboard lists them with Create/Join. |
| Task assignment | Both: tasks can be created unassigned (anyone claims) **or** assigned to a specific member. |
| Task effort | Sizes Small/Medium/Large = 1/2/3 points, chosen at creation. |
| Verification | Any teammate **except the task's assignee** can Approve or **Reject with a written reason** (reject sends the task back to Doing). Verifier identity is stored and shown on the report. |
| Project end | Only the **creator** can end a project. Board locks, peer-review phase opens. |
| Peer review | Rate each teammate 1–5 stars on three criteria — Effort, Quality, Teamwork — plus optional comment. Private. |
| Missing reviews | Report generates regardless; it **lists who didn't submit reviews**. Averages use whatever exists. |
| Report | Two headline numbers per person — **% of verified task points** and **average peer rating** — NO single combined score. Printable web page (browser Print / Save as PDF). |
| Visual style | **Playful & student-y**: bright colors, rounded shapes, friendly typography, fun empty states. Must NOT look like a default template. |
| Workflow | **One feature at a time.** After each feature: STOP, explain what was built in plain English, give the user a manual test script, and wait for their approval before starting the next feature. |

## Rules for the Executing Model (read before every session)

1. **Build exactly one feature per session, in order.** Do not scaffold ahead, do not "while I'm here" extra features. If a feature seems to need something from a later feature, stub it minimally and note it.
2. **After each feature, stop and produce:** (a) a plain-English explanation of every file you created/changed and how the code works — the user must be able to explain this app to judges; (b) the manual test script from this plan; (c) any Firebase Console steps the user must do themselves.
3. **The user runs Firebase Console actions.** The model never assumes console state — it gives numbered click-by-click instructions and waits.
4. **Dependencies allowed:** `react`, `react-dom`, `react-router-dom`, `firebase`. Nothing else without asking the user first. No UI kits, no Tailwind, no component libraries — hand-written CSS with design tokens.
5. **Code style:** files under ~300 lines; components in `src/components/<feature>/`; hooks in `src/hooks/`; pure logic in `src/lib/`; feature CSS colocated with components; design tokens in `src/styles/tokens.css`. camelCase functions, PascalCase components. No mutation — always create new objects/arrays.
6. **Firestore security rules are updated in the same feature that introduces the data they protect** — never left for later.
7. **Real-time first:** all project/task/review reads use `onSnapshot` listeners, not one-time gets, so two browsers always stay in sync (this is the M1 demo).
8. **The fairness math lives in pure functions in `src/lib/fairness.js`** with zero Firebase imports, so the user can read, explain, and (later) unit-test it in isolation.

## Architecture

```
Browser (React SPA, Vite)
  ├─ Firebase Auth (Google popup) → user identity
  ├─ Firestore (onSnapshot live listeners) → all app data
  └─ Firebase Hosting → deployed site
No server code. All logic client-side. Security enforced by Firestore rules.
```

### Firestore data model

```
projects/{projectId}
  name            string
  createdBy       uid
  createdAt       timestamp
  status          "active" | "ended"
  endedAt         timestamp | null
  joinCode        string (6 chars, A–Z + 2–9, no confusable chars)
  memberIds       array<uid>            // for security rules + queries
  members         map<uid, {name, photoURL, joinedAt}>   // for display

joinCodes/{CODE}                        // lookup so non-members can find a project to join
  projectId       string

projects/{projectId}/tasks/{taskId}
  title           string
  size            "S" | "M" | "L"       // 1 / 2 / 3 points (constant in lib/fairness.js)
  status          "todo" | "doing" | "done" | "verified"
  assignee        uid | null            // null = unclaimed, claimable
  createdBy       uid
  createdAt       timestamp
  proofUrl        string | null         // required to enter "done"
  submittedAt     timestamp | null
  verifiedBy      uid | null
  verifiedAt      timestamp | null
  lastRejection   {by: uid, reason: string, at: timestamp} | null

projects/{projectId}/reviews/{reviewerUid}    // one doc per reviewer
  submittedAt     timestamp
  ratings         map<revieweeUid, {effort: 1-5, quality: 1-5, teamwork: 1-5, comment: string}>
```

### Security rules summary (implemented incrementally per feature)

- `projects`: read only by members (`request.auth.uid in resource.data.memberIds`). Create by any signed-in user (creator auto-member). Update: members may update tasks-related fields; **only creator** may set `status: "ended"`; a non-member may update only to add **their own uid** to `memberIds`/`members` (join flow).
- `joinCodes`: read by any signed-in user; created only alongside project creation by the creator.
- `tasks`: read/write members only. Verification writes must have `verifiedBy == request.auth.uid != assignee`.
- `reviews`: create/read own doc always (`reviewerUid == request.auth.uid`); read **others'** review docs only when parent project `status == "ended"` (needed for client-side report math, since no Cloud Functions on free tier). ⚠️ Known tradeoff: a determined member could see raw ratings via devtools after project end. UI shows only averages and anonymized comments. Acceptable for classroom scale; mention honestly if judges ask.

### Fairness report math (`src/lib/fairness.js` — pure functions)

- `taskPoints(size)` → S:1, M:2, L:3.
- `contributionShares(tasks, memberIds)` → for each member: sum of points of their **verified** tasks ÷ total verified points across the project → percentage. Also returns raw counts (verified tasks, points).
- `ratingAverages(reviews, memberIds)` → per member, per criterion: mean of all ratings **about** them (self-rating not collected); plus overall mean of the three criteria; plus list of members who never submitted a review.
- No combined single score. The report presents both columns side by side.

### Route map

```
/                → Landing page (logo, one-liner, Sign in with Google)
/dashboard       → My Projects (list, Create, Join by code)
/project/:id     → Task board (main screen; shows End Project for creator)
/project/:id/review  → Peer review form (only when status == "ended")
/project/:id/report  → Fairness report (printable; only when status == "ended")
```

## Feature Sequence

Each feature below = one execution session ending in a user manual-test gate. **Do not proceed past a gate without user approval.**

---

### Milestone 1 — "Two accounts see the same live board"

**F0. Scaffold & design system.** ✅ done 2026-09-03
Vite React app in the project directory; folder structure per Rules §5; `react-router-dom` with the route map (placeholder pages); `src/styles/tokens.css` with the playful design system — bright confident palette (pick a primary like coral/violet + 2 support colors, defined as CSS custom properties in oklch), rounded radii (12–20px), a friendly Google Font pairing (e.g., a rounded display face like Baloo 2 or Fredoka for headings + a clean body face like Nunito), spacing scale, motion tokens. Landing page with app name, tagline, and a (non-functional) sign-in button so there's something to look at.
*User test:* `npm run dev` opens; landing page looks intentionally designed (not a template); clicking through routes shows placeholder pages.

**F1. Firebase setup + Google sign-in.**
Model walks the user through Firebase Console: create project, enable Google auth provider, create Firestore DB (production mode), copy web app config. Config goes in `src/lib/firebase.js` (web API keys are safe to commit — explain this to the user). Build `useAuth` hook + auth context: sign-in popup, sign-out, loading state; protected routes redirect to `/`; header shows user photo + name + sign-out.
*User test:* sign in with Google → lands on dashboard placeholder with their name/photo; refresh keeps them signed in; sign-out returns to landing.

**F2. Create project + dashboard.**
Dashboard lists the user's projects (`onSnapshot` query on `memberIds array-contains uid`), newest first, each card showing name, member avatars, status. "Create project" modal → writes `projects` doc (creator in `memberIds`/`members`) + `joinCodes/{CODE}` doc; join code generated in `src/lib/joinCode.js` (6 chars, unambiguous alphabet). Project page header shows name + join code with copy button. First Firestore rules deploy (projects: member-only read; joinCodes as specified).
*User test:* create a project → appears on dashboard instantly; open it → see join code; second Google account sees nothing (rules working).

**F3. Join by code.**
Dashboard "Join project" input → look up `joinCodes/{CODE}` → add self to `memberIds` + `members` (rules permit self-add only). Friendly errors: bad code, already a member, project ended. Members list on project page (avatars + names, creator badge).
*User test (2 browsers/accounts):* account B enters A's code → project appears on B's dashboard; both see both members on the project page; wrong code shows a friendly error.

**F4. Task board — create & display tasks.**
Board layout: three columns (To Do / Doing / Done) with playful column headers and an empty-state illustration/message per column. "Add task" modal: title, size picker (S/M/L shown as fun-sized chips with point values), optional assignee dropdown (members or "anyone can claim"). Tasks render as cards (title, size chip, assignee avatar or "unclaimed" state) via `onSnapshot` on the tasks subcollection. Task rules added.
*User test (2 browsers):* A creates a task → B sees it appear **live without refreshing** (this is the M1 wow moment); assigned vs unclaimed tasks display differently.

**F5. Claim & move tasks.**
Unclaimed tasks show a "Claim" button (sets `assignee` to self, moves to Doing). Assigned To Do tasks: assignee can "Start" → Doing. Doing tasks show "Mark done" (leads to F6 — for now a disabled button with tooltip "next up!"). Only the assignee can move their task; creator can reassign or delete a task (small kebab menu).
*User test (2 browsers):* B claims A's unclaimed task → both boards update live; B cannot move A's task; creator can delete a task.

🏁 **Milestone 1 demo checkpoint** — user records/tests: two accounts, one project, live board. Matches proposal M1 demo.

---

### Milestone 2 — "Proof, verification, and peer reviews work"

**F6. Mark done with proof.**
"Mark done" opens a modal requiring a proof URL (validated as a plausible link; helper text suggests Google Docs/GitHub/photos links). Task moves to Done column with status `done`, styled as "waiting for verification" (e.g., dashed border + hourglass motif), showing the clickable proof link.
*User test:* mark a Doing task done → proof required (empty/invalid rejected with friendly message); Done column shows the pending state; teammate sees it live.

**F7. Verification — approve or reject.**
On `done` tasks, any member **except the assignee** sees Approve / Reject buttons. Approve → status `verified`, stores `verifiedBy`/`verifiedAt`, card gets a celebratory verified style (stamp/check + subtle confetti-ish flourish). Reject → modal requires a reason → task returns to `doing` with `lastRejection` stored; assignee sees the reason on the card. Assignee sees "waiting for a teammate to verify" on their own done tasks. Rules enforce verifier ≠ assignee.
*User test (2 browsers):* assignee sees no verify buttons on own task; teammate rejects with reason → task back in Doing with reason visible; teammate approves → verified style; try to self-verify via UI absence (and note rules block it).

**F8. End project.**
Creator-only "End project" button (confirmation dialog explaining what happens). Sets `status: "ended"`, `endedAt`. Board becomes read-only (no create/claim/move/verify); banner appears: "Project ended — time for peer reviews!" with a button to `/project/:id/review`. Non-creators never see the end button. Rules: only creator can set `ended`.
*User test (2 browsers):* B sees no End button; A ends → both instantly see locked board + review banner; all task buttons gone.

**F9. Peer review form.**
`/project/:id/review` (only reachable when ended): for each teammate (not self), 1–5 star inputs for Effort / Quality / Teamwork + optional comment box. One submission per user (doc id = uid); after submitting, the form shows a read-only "you rated" summary. Star inputs are keyboard-accessible and fun (hover fill animation). Review rules added (own-doc write; others readable only when ended).
*User test (2 browsers):* both accounts submit reviews of each other; resubmission not possible (shows summary instead); reviews not visible to the other person as raw data anywhere in the UI.

🏁 **Milestone 2 demo checkpoint** — verify a task with proof + submit peer reviews from two accounts. Matches proposal M2 demo.

---

### Milestone 3 — "Report, polish, ship"

**F10. Fairness math (pure functions).**
`src/lib/fairness.js`: `taskPoints`, `contributionShares`, `ratingAverages` exactly per the Architecture section. **This is the code the user must deeply understand** — the model writes it WITH the user: explain the approach first, write each function with narrated reasoning, then walk through worked examples by hand (e.g., 3 members, 5 tasks of mixed sizes, one missing review) and confirm the numbers match the user's own hand calculation.
*User test:* user computes a small example on paper; a temporary dev-only page (or console call) shows the functions produce the same numbers.

**F11. Fairness report page.**
`/project/:id/report` (ended projects only, members only): project header (name, dates, members); per-member section with the two headline stats (contribution % of verified points + average peer rating) shown as friendly stat cards; table of each member's verified tasks with size, points, proof links, and who verified them; per-criterion rating averages; anonymized comments; callout listing members who didn't submit reviews; note of any tasks never verified. Print stylesheet (`@media print`) that strips nav/buttons and lays the report out cleanly on paper; prominent "Print / Save as PDF" button.
*User test:* end-to-end run with 2 accounts produces a report whose numbers match F10 hand-math; browser Print preview looks like a clean teacher-ready document.

**F12. Security rules audit + edge-case pass.**
Full review of `firestore.rules` against every feature; test with the Firebase emulator or manual second-account probing: non-member can't read a project, non-creator can't end it, self-verification blocked at the rules level, review privacy holds pre-end. Fix loose ends: leaving a project? (out of scope — document as future work), deleted-task effects on report (they're simply absent), ended-project join attempts (blocked with friendly error).
*User test:* model provides an adversarial checklist (things a sneaky classmate would try); user attempts each with account B and confirms failure.

**F13. Visual polish + responsive pass.**
One dedicated pass over every screen against the playful direction: consistent tokens, designed hover/focus/active states, delightful empty states everywhere (empty dashboard, empty columns, no reviews yet), micro-motion on card moves and verification (compositor-friendly transforms/opacity only, respecting `prefers-reduced-motion`), responsive at 320/768/1024/1440 (board columns stack on phones), color-contrast check. No new features.
*User test:* click through the whole app at phone + laptop widths; nothing overflows; everything feels like one designed product.

**F14. Deploy + demo prep.**
`firebase init hosting` + deploy; add the live URL to Google auth authorized domains; full production smoke test with two real accounts. Model produces `DEMO_SCRIPT.md`: a beat-by-beat run-through for the challenge video (create → join → tasks → proof → reject → verify → end → reviews → report → print) plus talking points connecting features to the social-loafing research in the proposal.
*User test:* the full demo script executed successfully on the **live URL** with two accounts.

🏁 **Final checkpoint** — matches proposal final demo: complete run-through ending with the finished report.

---

## Verification approach (global)

- Every feature gate is a **manual two-account test** (Chrome regular + incognito, or two browsers) using the scripts above — real-time sync makes single-account testing insufficient.
- The fairness math (F10) is additionally verified against hand-worked examples.
- F12 is a dedicated adversarial/security gate; F14 is a production smoke test on the deployed URL.
- No automated test suite is planned (user chose manual verification); if time remains after F14, unit tests for `lib/fairness.js` are the highest-value addition.

## Out of scope (documented so nobody "helpfully" adds them)

File uploads for proof (links only), teacher accounts, shareable public report links, notifications/email, drag-and-drop board (buttons are fine), leaving/removing members, editing submitted reviews, AI report summary (only if everything else ships early, as a stretch).
