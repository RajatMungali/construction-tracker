# College construction opportunity tracker — POC

A ranked, scored, source-cited dashboard of college/university capital-construction
opportunities in New England, built for an architecture firm's business development.
This repo covers 10 real schools as a proof of concept before scaling to ~300.

## Running it

```bash
npm install
npm run dev       # local dev server, hot reload
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

Requires Node 18+.

## Structure

```
src/
  data.js     data + scoring — schema-shaped so a future backend/API swap
              only requires replacing the SCHOOLS export with a fetch() call
  App.jsx     the dashboard UI: ranked list, filters, per-school breakdown
  main.jsx    React entry point
  index.css   base resets
index.html    loads Space Grotesk + IBM Plex Sans from Google Fonts
```

## Scoring

Each school is scored out of 100 across four weighted categories (see `RUBRIC`
in `src/data.js`):

| Category | Points |
|---|---|
| Financial health & construction trigger | 35 |
| Admissions & enrollment momentum | 20 |
| Waitlist & housing pressure | 25 |
| Signal confirmation | 20 |

Tiers: 80+ top pick · 60–79 strong · 40–59 moderate · 20–39 caution · under 20 quiet.

Every subscore carries a one-line note, and every underlying claim in a school's
detail view carries its source and as-of date. A missing data point (e.g. a school
with no published Common Data Set) scores at the low end of its range and is
labeled as a gap — it is never estimated or guessed.

## What's next (not in this repo yet)

This POC's data is static, hand-researched for 10 schools. Scaling to ~300 needs:

1. **Backbone data** — a bulk pull from College Scorecard + IPEDS Finance,
   filtered to New England, joined on IPEDS UnitID. Covers all 300 schools
   in one script run, refreshed annually.
2. **Common Data Set registry** — a one-time research pass recording each
   school's CDS landing page, then an annual job that finds the current PDF
   and extracts Section C1 (waitlist) and F1 (housing) figures.
3. **Bond/financial signals** — a monthly scheduled sweep of state conduit
   issuer press releases (CHEFA, MassDevelopment, NHHEFA, RIHEBC) plus a
   structured search sweep per school, logged with source + date. EMMA
   itself (emma.msrb.org) stays a manual verification step — confirming the
   obligated party actually matches the school before any bond figure is
   used in a client-facing context.
4. **A database** replacing `src/data.js` — schools table keyed by UnitID,
   an append-only signals log, so history accumulates instead of overwriting.

See the project discussion for the full phased plan and cost/legal notes
(EMMA/MSRB terms of use should be checked before any automated access).
