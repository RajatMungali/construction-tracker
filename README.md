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
public/data/
  schools.json          the actual data — this is what automation updates
src/
  scoring.js             the rubric + pure scoring functions (weights live here,
                          reviewed/changed by a human, not touched by automation)
  App.jsx                dashboard UI: fetches schools.json at runtime, renders
                          ranked list, filters, per-school breakdown
  main.jsx                React entry point
  index.css               base resets
index.html                 loads Space Grotesk + IBM Plex Sans from Google Fonts
scripts/
  pull_backbone.py         Tier 1 automation: Scorecard + IPEDS bulk pull
  school_registry.json.example   template for the school-id → UnitID map
                                  (copy to school_registry.json and fill in
                                  real UnitIDs before running the script)
  requirements.txt         Python deps for scripts/
.github/workflows/
  refresh-backbone.yml     runs pull_backbone.py on a schedule, commits any
                            changes to schools.json — free, no server needed
```

The app never imports school data directly — it fetches `/data/schools.json`
at runtime. That's the seam automation writes to: update that one file (by
script or by hand) and the live site reflects it on next deploy.

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

## Automation status

| Tier | Status | How it runs |
|---|---|---|
| Backbone (Scorecard/IPEDS) | **Scaffolded** — `scripts/pull_backbone.py` + GitHub Actions | Annual cron, fully automatic, no human step |
| Common Data Set (waitlist/housing) | Not started | Needs a registry of CDS landing pages, then an annual PDF-read job |
| Bond/financial signals | Not started | Needs a monthly conduit-issuer sweep + a human EMMA-verification gate |

### Before the backbone automation can run for real

1. Copy `scripts/school_registry.json.example` to `scripts/school_registry.json`
   and fill in each school's real IPEDS UnitID (placeholders are intentional —
   look each one up at collegescorecard.ed.gov or nces.ed.gov/collegenavigator
   rather than guessing).
2. Confirm the `SCORECARD_BULK_URL` in `pull_backbone.py` still points at the
   current file — the Department of Education's bulk download filenames
   occasionally change vintage tags.
3. Push to GitHub — the workflow needs `contents: write` permission on the
   repo (Settings → Actions → General → Workflow permissions).

### Scaling to ~300 schools still needs

- **CDS registry + extraction** — a one-time pass recording each school's
  Common Data Set landing page (not the PDF itself, since that changes
  yearly), then an annual job that finds the current PDF and has an LLM
  extract Section C1 (waitlist) and F1 (housing) into the same JSON schema.
- **Bond/financial signals** — a monthly scheduled sweep of state conduit
  issuer press releases (CHEFA, MassDevelopment, NHHEFA, RIHEBC) plus a
  structured search sweep per school, logged with source + date into a
  review queue. EMMA itself (emma.msrb.org) stays a manual verification
  step — confirming the obligated party actually matches the school before
  any bond figure is used client-facing.
- **A real database**, once the registry moves past a few hundred rows or
  needs multi-user editing — schools.json works fine as the "database" at
  this scale since git gives free versioning and audit history, which
  happens to match the source+as-of requirement nicely.
