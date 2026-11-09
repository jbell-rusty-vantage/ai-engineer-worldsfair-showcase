import { categories, talks } from "@/lib/data";

export const dynamic = "force-static";

export function GET(req: Request) {
  const o = new URL(req.url).origin;
  const body = `# AI Engineer Research Library

> Machine-generated, unreviewed research briefs for ${talks.length} AI Engineer (YouTube @aidotengineer) talks, organized into ${categories.length} engineering categories. Includes talks matched to the AI Engineer World's Fair 2026 program.

Caveats: briefs come from an automated pipeline and may be wrong; transcripts are not included; talks belong to their speakers, so link to the original YouTube video (the \`url\` field).

## API (read-only JSON, CORS open)
- [Index](${o}/api/v1): endpoints, counts, download links
- [All talks](${o}/api/v1/talks)
- One brief: ${o}/api/v1/talks/{videoId}
- [Categories](${o}/api/v1/categories); one category: ${o}/api/v1/categories/{code}
- [World's Fair 2026 matches](${o}/api/v1/worldsfair)

## Bulk downloads
- [All briefs, NDJSON gzip](${o}/export/talks.ndjson.gz)
- [Talk table, CSV](${o}/export/talks.csv)
- [Categories](${o}/export/categories.json)

## Docs
- [API & downloads](${o}/developers)
- [About the source](${o}/about)
`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
