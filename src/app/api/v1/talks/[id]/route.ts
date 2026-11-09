import { talks, getReport } from "@/lib/data";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return talks.map((t) => ({ id: t.id }));
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const r = getReport((await ctx.params).id);
  if (!r) return Response.json({ error: "not_found" }, { status: 404 });
  return Response.json(r);
}
