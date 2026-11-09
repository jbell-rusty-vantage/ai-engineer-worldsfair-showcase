import { categories, categoryCounts } from "@/lib/data";

export const dynamic = "force-static";

export function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const counts = categoryCounts();
  return Response.json({
    count: categories.length,
    categories: categories.map((c) => ({ ...c, talkCount: counts.get(c.code) ?? 0, detail: `${origin}/api/v1/categories/${c.code}` })),
  });
}
