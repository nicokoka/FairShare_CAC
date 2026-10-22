# FairShare

[![CI](https://github.com/nicokoka/FairShare_CAC/actions/workflows/ci.yml/badge.svg)](https://github.com/nicokoka/FairShare_CAC/actions/workflows/ci.yml)

**Make school group projects fair by tracking who actually does the work.**
Teammates join a project with a code, work off a live task board, completed work
needs a **proof link _and_ a teammate's verification**, and at the end everyone
privately rates each other. FairShare turns that into a printable **fairness
report** a teacher can grade from.

🔗 **Live app:** https://fairshare-3d5c2.web.app

Built for the Congressional App Challenge. The design is grounded in research on
social loafing (Latané, Williams & Harkins, 1979) and peer-assessment validity
(Falchikov & Goldfinch, 2000; the CATME approach).

## Why it isn't just another CRUD app

- **The fairness math is pure and tested.** All scoring lives in dependency-free
  functions in [`src/lib/fairness.js`](src/lib/fairness.js) and
  [`src/lib/insights.js`](src/lib/insights.js), unit-tested with
  [Vitest](https://vitest.dev/) — see the green CI badge above. Run `npm test`.
- **Credit follows _verified_ effort.** A task only counts once a teammate who
  isn't the assignee approves its proof. Self-verification is blocked both in the
  UI and in the Firestore security rules.
- **An "At a glance" report** reads the numbers and surfaces plain-English
  insights (imbalance, effort-vs-rating mismatches, non-participation), with
  hand-built SVG charts and an optional Gemini-written summary layered on top.
- **Real-time everywhere.** Two browsers stay in sync via Firestore
  `onSnapshot` listeners — no refresh.
- **No server, no secrets.** Entirely client-side on Firebase's free Spark tier;
  access control is enforced by [`firestore.rules`](firestore.rules).

## Features

- Google sign-in; create projects; **join by code, shareable link, or QR**
- Live task board with sizes (S/M/L = 1/2/3 pts), claims, and due dates
- **Calendar export** (`.ics`) of task deadlines
- Mark done with a proof URL → teammate **approve / reject with a reason**
- Private 1–5 peer reviews on Effort / Quality / Teamwork
- Printable fairness report with charts, insights, and **CSV export**

## Tech

Vite + React + plain JavaScript · Firebase (Auth, Firestore, Hosting) · Vitest ·
no UI kit (hand-written CSS with design tokens in `src/styles/tokens.css`).

## Develop

```bash
npm install
cp .env.example .env     # fill in your Firebase web config
npm run dev              # start the dev server
npm test                 # run the unit tests
npm run build            # production build
npm run deploy           # build + deploy hosting and Firestore rules
```

### Optional: AI-polished report summary

The report always shows a rule-based summary. To also offer a Gemini-written
version, enable **Firebase AI Logic (Gemini Developer API)** in the Firebase
console, then set `VITE_AI_SUMMARY=on` in `.env`. Left off, the feature is
invisible and nothing else changes.
