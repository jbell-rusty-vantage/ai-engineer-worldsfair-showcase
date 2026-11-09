import { talks, categories } from "@/lib/data";

export const dynamic = "force-static";

export function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const label = Object.fromEntries(categories.map((c) => [c.code, c.label]));
  return Response.json({
    count: talks.length,
    talks: talks.map((t) => ({
      id: t.id,
      title: t.title,
      url: `https://www.youtube.com/watch?v=${t.id}`,
      publishedAt: t.publishedAt,
      category: { code: t.category, label: label[t.category] ?? t.category },
      contentForm: t.form,
      difficulty: t.difficulty,
      organization: t.org,
      technologies: t.tech,
      worldsFair2026: Boolean(t.wf),
      summaryExcerpt: t.blurb,
      detail: `${origin}/api/v1/talks/${t.id}`,
    })),
  });
}
