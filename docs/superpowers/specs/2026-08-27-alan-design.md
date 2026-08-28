# ALAN — Design Spec

**Date:** 2026-08-27
**Status:** Approved by Jude (brainstorming session)

## What ALAN is

ALAN is a DIY supercomputer for AI-driven mathematics — specifically a sustained,
many-avenue attack on the Riemann Hypothesis via local AI models in human/AI
collaboration. It is named for Alan Turing, who used the Manchester Mark 1 in 1950
to compute zeros of the zeta function.

This repo contains the **ALAN web app**: a public Next.js site deployed on Vercel
that serves as the machine's design HQ, research workbench, and (eventually)
mission control. The repo is also the machine's design document: all data lives
as files in git ("repo-as-database").

## Constraints & context

- **Power envelope:** ~5 kW continuous (home, 5 kW solar + battery). Fallback:
  relocate to an industrial site if a later phase exceeds it.
- **Cooling:** solved by the owner — the app only documents thermal decisions.
- **Sourcing:** eBay / used-market parts; budget is phased and open-ended, each
  phase independently useful and justified by results of the last.
- **Audience:** public, build-in-the-open.
- **Editing model:** human + Claude edit JSON/MDX in the repo; push → Vercel
  redeploy. No database, no auth, no CMS until the cluster needs live telemetry.

## Architecture

- **Framework:** Next.js (App Router), TypeScript, Tailwind CSS. Static-first:
  every page statically generated at build time from repo data. Interactive
  widgets (power calculator) are client components fed static data.
- **Data layer:** `/data/*.json` + `/data/log/*.mdx`, each JSON file validated
  against a Zod schema at build time. Invalid data fails the build — this is the
  safety net for repo-as-database editing.
- **Deployment:** Vercel, public.

### Data files

| File | Contents |
|---|---|
| `data/phases.json` | Expansion phases: id, name, budget, goals, exit criteria, status |
| `data/bom.json` | Parts keyed to phases: name, category, qty, eBay target price, price paid, status (`researching` → `watching` → `ordered` → `installed`), notes, link |
| `data/power.json` | Envelope constants (5 kW), per-part TDP/power-limit defaults, node overheads |
| `data/avenues.json` | RH attack avenues: name, mathematical structure, approach type (`proof-search` / `numerical` / `conjecture-mining`), status, assigned models, findings links |
| `data/cluster-state.json` | Stub node/job state for Mission Control until live telemetry exists |
| `data/log/*.mdx` | Build-log posts (frontmatter: title, date, tags) |

### Pages

- **`/` Home** — manifesto (Turing hook), current-phase banner, headline stats
  derived from data: total VRAM, est. FP16 TFLOPS, worst-case power vs 5 kW,
  $ spent vs phase budget.
- **`/machine` Design HQ** (fully functional at launch)
  - Per-phase BOM table with status pills and cost roll-ups.
  - **Power-budget calculator** (client component): per-GPU power-limit sliders
    + node overheads summed against the 5 kW envelope, headroom readout.
  - Compute projections: VRAM totals, FP16 TFLOPS, rough tokens/s for target
    model classes per phase.
  - Node topology (simple diagram from data) and a thermal-decisions log.
- **`/research` RH Workbench** (functional shell) — avenue registry rendered
  from `avenues.json`, grouped by status; each avenue shows structure, approach
  type, model assignments, findings links.
- **`/control` Mission Control** (stub) — node and job cards from
  `cluster-state.json`, clearly labeled as awaiting hardware; designed so the
  data source later swaps to a live API without page rework.
- **`/log` Build Log** — MDX post index + post pages.

### Seed hardware plan (lives in data, editable without code changes)

- **Phase 0 "Seed" (~$8k):** 1 node — used EPYC 7002-class CPU, 256 GB RAM,
  4× used RTX 3090 (24 GB, ~$700–800 eBay), power-limited ~250 W each.
  96 GB VRAM: quantized 70B-class models, or many parallel small-model searchers.
- **Phase 1 "Scale" (~$20k cumulative):** 2–3 nodes, 8–12× 3090, used
  ConnectX-4/5 25 GbE+ interconnect. Worst case ~4 kW — inside envelope.
- **Phase 2 "Heavy" ($40k+):** decision gate — used A100 / RTX 6000 Ada class
  vs more 3090s vs next-gen; industrial location if power demands it.

### Error handling

- Zod parse of every data file at build time; a schema error aborts the deploy
  with a message naming the file and field.
- MDX posts with missing/invalid frontmatter fail the build likewise.
- Power calculator clamps slider inputs to hardware-plausible ranges.

### Testing

- `tsc --noEmit` + ESLint.
- Unit tests (Vitest) for power-budget math and data-derived stat roll-ups.
- Build itself is the data-validation test.

## Out of scope (for this version)

Live cluster telemetry, auth, database, job submission, eBay price scraping,
comments/collaboration features. The Control stub and Research shell mark where
these will land.
