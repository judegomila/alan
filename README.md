# ALAN

**A DIY supercomputer for the Riemann Hypothesis.**

Named for Alan Turing, who computed zeta zeros on the Manchester Mark 1 in 1950.
ALAN is a phased cluster built from used eBay parts, running local AI models
continuously against many parallel research avenues on RH, in human/AI collaboration.

This repo is both the machine's design document and its public site (Next.js on Vercel).

## The idea

- **Phased:** ~$8k seed node → ~$20k three-node cluster → evidence-gated heavy phase.
- **Used parts:** RTX 3090s at ~$750/24 GB are the best $/VRAM available.
- **5 kW envelope:** home solar + battery; GPUs power-limited; industrial site if outgrown.
- **Portfolio research:** operator searches, positivity criteria, large-scale numerics,
  conjecture mining — avenues promoted or killed on evidence.

## Editing the site (repo-as-database)

All content lives in `/data` and is Zod-validated at build time — bad data fails the deploy:

| File | What |
|---|---|
| `data/phases.json` | Expansion phases, budgets, exit criteria |
| `data/bom.json` | Parts list with eBay targets and status |
| `data/power.json` | Power envelope + thermal notes |
| `data/avenues.json` | RH research avenue registry |
| `data/cluster-state.json` | Mission-control stub state |
| `data/log/*.mdx` | Build-log posts (markdown + frontmatter) |

## Development

```bash
npm install
npm run dev        # local dev
npm test           # vitest
npm run typecheck  # tsc
npm run lint       # eslint
npm run build      # static build (validates all data)
```
