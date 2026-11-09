import { categories, talksByCategory } from "@/lib/data";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((c) => ({ code: c.code }));
}

export async function GET(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const c = categories.find((x) => x.code === code);
  if (!c) return Response.json({ error: "not_found" }, { status: 404 });
  const origin = new URL(req.url).origin;
  const list = talksByCategory(code);
  return Response.json({
    ...c,
    talkCount: list.length,
    talks: list.map((t) => ({ id: t.id, title: t.title, publishedAt: t.publishedAt, organization: t.org, detail: `${origin}/api/v1/talks/${t.id}` })),
  });
}
