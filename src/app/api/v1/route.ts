import { categories, talks } from "@/lib/data";

export const dynamic = "force-static";

export function GET(req: Request) {
  const origin = new URL(req.url).origin;
  return Response.json({
    name: "AI Engineer Research Library API",
    version: "v1",
    description:
      "Read-only JSON over machine-generated research briefs for AI Engineer YouTube talks. Unreviewed; see /developers for caveats.",
    counts: { talks: talks.length, categories: categories.length, worldsFair2026: talks.filter((t) => t.wf).length },
    endpoints: {
      talks: `${origin}/api/v1/talks`,
      talk: `${origin}/api/v1/talks/{videoId}`,
      categories: `${origin}/api/v1/categories`,
      category: `${origin}/api/v1/categories/{code}`,
      worldsFair2026: `${origin}/api/v1/worldsfair`,
    },
    downloads: {
      reportsNdjson: `${origin}/export/talks.ndjson`,
      reportsNdjsonGzip: `${origin}/export/talks.ndjson.gz`,
      talksCsv: `${origin}/export/talks.csv`,
      categoriesJson: `${origin}/export/categories.json`,
      worldsFairMatchesJson: `${origin}/export/worldsfair-matches.json`,
    },
    docs: `${origin}/developers`,
  });
}
