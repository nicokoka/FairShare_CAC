# FairShare — Demo Script (Congressional App Challenge)

A beat-by-beat run-through for the demo video, plus talking points that connect
each feature to the research in the proposal. Target length: **3–4 minutes**.

**Live URL:** https://fairshare-3d5c2.web.app
**You'll need:** two Google accounts (e.g. your main account + a second one, or a
regular window + an incognito window). Call them **Ana** (creator) and **Ben**.

---

## The one-sentence hook (say this first)

> "Group projects are unfair because one or two people do all the work — that's a
> studied problem called *social loafing* — so I built FairShare to make effort
> visible and back it up with proof."

---

## Beat 1 — The problem (0:00–0:20)

**Say:** "Everyone's been in a group where someone slacks. Psychologists have a
name for it: *social loafing* — Latané, Williams & Harkins showed in 1979 that
people put in less effort in a group, building on the older Ringelmann effect
where the bigger the group, the less each person does. FairShare fixes that."

**Show:** the landing page at the live URL.

## Beat 2 — Sign in & create a project (0:20–0:45)

1. **Ana:** click **Sign in with Google** → lands on the dashboard.
2. Click **Create project**, name it e.g. "History Presentation" → it appears on
   the dashboard instantly.
3. Open it → point out the **6-character join code** in the header.

**Say:** "One person starts the project and gets a join code to share."

## Beat 3 — Join live (0:45–1:05)

1. **Ben** (second account / incognito): sign in → **Join project** → type Ana's code.
2. The project appears on Ben's dashboard; open it — both see both members.

**Say (the M1 wow moment):** "Everything's live — watch." Keep both windows
visible for the next beat.

## Beat 4 — The task board, live (1:05–1:35)

1. **Ana:** **Add task** → title, pick a **size (S/M/L = 1/2/3 points)**, leave it
   unassigned. Add a second task assigned to Ben.
2. **Point at Ben's window** — the tasks appear **without a refresh**.
3. **Ben:** **Claim** the unassigned task → it moves to Doing on **both** boards.

**Say:** "The board syncs in real time, so nobody argues about what's been done."

## Beat 5 — Proof + verification (the anti-cheating core) (1:35–2:15)

1. **Ben:** on his task, **Mark done** → a modal **requires a proof link** (paste
   any Google Doc / GitHub / photo URL). Try submitting empty first to show it's
   required.
2. The task moves to Done with a "waiting for verification" look + the proof link.
3. **Ana:** on Ben's done task she sees **Approve / Reject**. First **Reject** with
   a reason ("add your sources") → it bounces back to Doing with the note visible.
4. **Ben** fixes it and marks done again; **Ana Approves** → the task gets the
   **verified ✓ stamp**.
5. **Point out:** on Ben's *own* task he has **no verify buttons** — you can't sign
   off on your own work.

**Say:** "To mark work done you need a proof link **and** a teammate's approval —
you can't verify yourself. That's what makes it hard to fake."

## Beat 6 — End project & peer reviews (2:15–2:45)

1. **Ana** (creator only) clicks **End project** → confirm. The board **locks** on
   both windows and a "time for peer reviews" banner appears.
2. Both **Ana and Ben** open **Rate teammates** → give 1–5 stars on **Effort,
   Quality, Teamwork** + an optional comment → **Submit**.
3. Note the form locks after submitting (one review each) and ratings are private.

**Say:** "At the end everyone privately rates each other. Peer review is backed by
research too — Falchikov & Goldfinch (2000) found student ratings line up well with
teacher grades. There's a college tool called CATME that does this, but it needs a
professor account; FairShare is free and student-run."

## Beat 7 — The fairness report (the payoff) (2:45–3:20)

1. Open **📊 Fairness report**.
2. Walk through it:
   - **Two headline numbers per person** side by side — **% of verified work** and
     **average peer rating**. "There's no single combined score on purpose — both
     tell part of the story."
   - The **verified work table**: each task, its points, the proof link, and **who
     verified it**.
   - Per-criterion rating averages + anonymized comments.
   - The honest callout of anyone who didn't submit a review, and any unverified
     tasks that don't count.
3. Click **Print / Save as PDF** → show the clean, teacher-ready printout.

**Say:** "The teacher gets one clean page: who did the verified work, and how the
team rated each other — so the grade can match the effort."

## Beat 8 — Close (3:20–3:40)

**Say:** "FairShare makes effort visible, requires proof, and turns it into a fair
report — a real fix for a problem every student knows. Built with React and
Firebase. Thanks for watching."

---

## Talking points cheat-sheet (if judges ask)

- **Why is this needed?** Social loafing / Ringelmann effect — effort drops in
  groups. *Latané, Williams & Harkins (1979).*
- **Why trust peer reviews?** They match teacher marks. *Falchikov & Goldfinch
  (2000).* CATME proves the model works at the college level.
- **How do you stop cheating?** Proof link + a teammate's verification, and you
  can't verify your own task (enforced in the Firestore security rules, not just
  the UI).
- **The math** (in `src/lib/fairness.js`, written to be explainable): contribution
  = your verified task points ÷ the team's total verified points; peer rating =
  the average of everyone else's ratings about you. Pure functions, no combined
  score.
- **Privacy:** peer ratings are private; the report only ever shows averages and
  anonymized comments.
- **Stack & constraints:** React + Firebase (Auth, Firestore, Hosting), free tier,
  no server code — all logic client-side, secured by Firestore rules. Built for
  small classroom groups (2–6).
- **Honest limitation:** because there's no paid server, a determined user could
  read raw ratings via devtools *after* a project ends — fine at classroom scale,
  and the UI never surfaces them.

---

## Pre-record checklist

- [ ] Firestore rules published (F12) — the reject/verify/self-rating guards must
      be live, or the demo behaves differently than described.
- [ ] Deployed the latest build to the live URL.
- [ ] Both test accounts can sign in on the **live URL** (not localhost).
- [ ] Seeded nothing — do it live, or pre-stage a project and rehearse once.
- [ ] Browser zoom ~110–125% so text is readable on video.
- [ ] Close unrelated tabs / notifications.
