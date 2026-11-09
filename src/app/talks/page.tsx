import type { Metadata } from "next";
import Link from "next/link";
import { categories, talks } from "@/lib/data";
import { TalkList } from "@/components/talk-list";

export const metadata: Metadata = { title: "All talks" };

export default function AllTalks() {
  const labels = Object.fromEntries(categories.map((c) => [c.code, c.label]));
  const items = talks.map((t) => ({
    id: t.id,
    title: t.title,
    publishedAt: t.publishedAt,
    form: t.form,
    difficulty: t.difficulty,
    org: t.org,
    tech: t.tech,
    wf: t.wf,
    categoryLabel: labels[t.category] ?? "Uncategorized",
  }));
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-fg">Library</Link> / <span className="text-fg">All talks</span>
      </nav>
      <h1 className="h-serif mt-4 text-4xl font-semibold">All talks</h1>
      <p className="mt-3 max-w-2xl text-muted">Search across every researched talk by title, company or technology.</p>
      <div className="mt-8">
        <TalkList items={items} showCategory />
      </div>
    </div>
  );
}
