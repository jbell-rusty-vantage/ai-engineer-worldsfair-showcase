import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, categoryCounts, talksByCategory } from "@/lib/data";
import { TalkList } from "@/components/talk-list";

export const dynamicParams = false;

export function generateStaticParams() {
  const codes = categories.map((c) => c.code);
  if ((categoryCounts().get("uncategorized") ?? 0) > 0) codes.push("uncategorized");
  return codes.map((code) => ({ code }));
}

type Props = { params: Promise<{ code: string }> };

function resolve(code: string) {
  const c = categories.find((x) => x.code === code);
  if (c) return c;
  if (code === "uncategorized") {
    return { code, label: "Uncategorized", description: "Talks without a primary category assignment.", include: [], exclude: [], examples: [], sort: 999 };
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = resolve((await params).code);
  return c ? { title: c.label, description: c.description } : {};
}

export default async function CategoryPage({ params }: Props) {
  const { code } = await params;
  const c = resolve(code);
  if (!c) notFound();
  const items = talksByCategory(code).map((t) => ({ id: t.id, title: t.title, publishedAt: t.publishedAt, form: t.form, difficulty: t.difficulty, org: t.org, tech: t.tech }));

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-fg">Library</Link> / <span className="text-fg">{c.label}</span>
      </nav>
      <h1 className="h-serif mt-4 text-4xl font-semibold leading-tight">{c.label}</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">{c.description}</p>

      {(c.include.length > 0 || c.exclude.length > 0 || c.examples.length > 0) && (
        <details className="mt-6 rounded-xl border border-line bg-surface p-5 text-sm">
          <summary className="cursor-pointer font-medium">What belongs in this category</summary>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {c.include.length > 0 && (
              <div>
                <h2 className="font-medium">Includes</h2>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted">{c.include.map((s) => <li key={s}>{s}</li>)}</ul>
              </div>
            )}
            {c.exclude.length > 0 && (
              <div>
                <h2 className="font-medium">Excludes</h2>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted">{c.exclude.map((s) => <li key={s}>{s}</li>)}</ul>
              </div>
            )}
          </div>
          {c.examples.length > 0 && (
            <p className="mt-5 text-muted"><span className="font-medium text-fg">Example topics:</span> {c.examples.join(", ")}</p>
          )}
        </details>
      )}

      <div className="mt-10">
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line p-8 text-center text-muted">No finished talks in this category yet.</p>
        ) : (
          <TalkList items={items} />
        )}
      </div>
    </div>
  );
}
