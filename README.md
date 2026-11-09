# AI Engineer Research Library

A static showcase of ~1,000 AI Engineer conference talks, each with a machine-generated research brief: summary, taxonomy, organizations, technologies, curriculum signals and sources. Every brief links to the original YouTube video.

The briefs are **initial, automated, and not human reviewed**. Transcripts are not republished.

## How it works

- `data/` holds trimmed JSON generated once from the pre-research packets (taxonomy, summaries, organization/technology research). No database is used at runtime.
- Next.js (App Router) statically generates the home page, 17 category pages, an all-talks search page, and one page per talk.
- `scripts/build-data.mjs` converts raw packets to `data/`; `scripts/fetch-titles.mjs` resolves titles via YouTube oEmbed.

## Develop

```bash
pnpm install
pnpm dev
pnpm build
```

Not affiliated with the AI Engineer conference or any organization mentioned.
