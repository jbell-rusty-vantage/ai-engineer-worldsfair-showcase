import Link from "next/link";
import { categories, categoryCounts, talks } from "@/lib/data";

export default function Home() {
  const counts = categoryCounts();
  const orgs = new Set(talks.map((t) => t.org).filter(Boolean)).size;
  const uncategorized = counts.get("uncategorized") ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <section className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">Initial research · machine-generated</p>
        <h1 className="h-serif mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
          {talks.length.toLocaleString()} AI Engineer talks, read and organized.
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted">
          An automated research pipeline watched the transcripts, classified each talk, researched the companies and tools it mentions, and wrote a
          brief for each. Browse by engineering category, then open a talk for its summary, taxonomy, organizations, technologies, curriculum
          signals and sources. Every brief links back to the original video.
        </p>
        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-sm">
          <div><dt className="text-muted">Talks</dt><dd className="h-serif text-2xl font-semibold">{talks.length.toLocaleString()}</dd></div>
          <div><dt className="text-muted">Categories</dt><dd className="h-serif text-2xl font-semibold">{categories.length}</dd></div>
          <div><dt className="text-muted">Organizations researched</dt><dd className="h-serif text-2xl font-semibold">{orgs.toLocaleString()}</dd></div>
        </dl>
        <Link href="/talks" className="mt-8 inline-block rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white hover:opacity-90 dark:text-black">
          Search all talks
        </Link>
      </section>

      <section className="mt-16">
        <h2 className="h-serif text-2xl font-semibold">Browse by category</h2>
        <p className="mt-2 max-w-2xl text-muted">Each talk lives in one primary engineering category.</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <li key={c.code}>
              <Link href={`/c/${c.code}`} className="group flex h-full flex-col rounded-xl border border-line bg-surface p-5 transition hover:border-accent">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="h-serif text-lg font-semibold leading-snug group-hover:text-accent">{c.label}</h3>
                  <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">{counts.get(c.code) ?? 0}</span>
                </div>
                <p className="mt-2 line-clamp-4 text-sm leading-6 text-muted">{c.description}</p>
              </Link>
            </li>
          ))}
          {uncategorized > 0 && (
            <li>
              <Link href="/c/uncategorized" className="group flex h-full flex-col rounded-xl border border-line bg-surface p-5 transition hover:border-accent">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="h-serif text-lg font-semibold group-hover:text-accent">Uncategorized</h3>
                  <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">{uncategorized}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">Talks without a primary category assignment.</p>
              </Link>
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
