"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type TalkItem = {
  id: string;
  title: string | null;
  publishedAt: string | null;
  form: string | null;
  difficulty: string | null;
  org: string | null;
  tech: string[];
  categoryLabel?: string;
  wf?: boolean;
};

const PAGE = 40;

function fmt(s: string | null) {
  if (!s) return "";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { year: "numeric", month: "short", timeZone: "UTC" });
}

export function TalkList({ items, showCategory = false }: { items: TalkItem[]; showCategory?: boolean }) {
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [difficulty, setDifficulty] = useState("");
  const [wfOnly, setWfOnly] = useState(false);
  const hasWf = useMemo(() => items.some((i) => i.wf), [items]);

  const difficulties = useMemo(() => [...new Set(items.map((i) => i.difficulty).filter(Boolean) as string[])], [items]);
  const filtered = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    return items.filter((i) => {
      if (difficulty && i.difficulty !== difficulty) return false;
      if (wfOnly && !i.wf) return false;
      if (!terms.length) return true;
      const hay = `${i.title ?? ""} ${i.org ?? ""} ${i.tech.join(" ")} ${i.categoryLabel ?? ""} ${i.id}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [items, q, difficulty, wfOnly]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setShown(PAGE);
          }}
          placeholder="Search title, company, technology…"
          aria-label="Search talks"
          className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm placeholder:text-muted"
        />
        {hasWf && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={wfOnly}
              onChange={(e) => {
                setWfOnly(e.target.checked);
                setShown(PAGE);
              }}
            />
            World&rsquo;s Fair 2026 program only
          </label>
        )}
        {difficulties.length > 1 && (
          <select
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setShown(PAGE);
            }}
            aria-label="Difficulty"
            className="rounded-lg border border-line bg-surface px-3 py-2.5 text-sm"
          >
            <option value="">Any difficulty</option>
            {difficulties.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        )}
      </div>
      <p className="mt-3 text-sm text-muted">
        {filtered.length.toLocaleString()} {filtered.length === 1 ? "talk" : "talks"}
      </p>
      <ul className="mt-2 divide-y divide-line border-y border-line">
        {filtered.slice(0, shown).map((t) => (
          <li key={t.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:gap-5">
            <Link href={`/t/${t.id}`} tabIndex={-1} aria-hidden className="block w-full shrink-0 sm:w-44">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://i.ytimg.com/vi/${t.id}/mqdefault.jpg`}
                alt=""
                loading="lazy"
                width={320}
                height={180}
                className="aspect-video w-full rounded-lg border border-line bg-surface object-cover"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/t/${t.id}`} className="h-serif text-lg font-medium leading-snug hover:text-accent">
                {t.title ?? `Talk ${t.id}`}
              </Link>
              <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
                {t.wf && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">World&rsquo;s Fair 2026</span>}
                {t.org && <span>{t.org}</span>}
                {showCategory && t.categoryLabel && <span>{t.categoryLabel}</span>}
                {t.form && <span>{t.form.replace(/_/g, " ")}</span>}
                {t.difficulty && <span>{t.difficulty}</span>}
                {t.publishedAt && <span>{fmt(t.publishedAt)}</span>}
              </p>
            </div>
            <a
              href={`https://www.youtube.com/watch?v=${t.id}`}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 self-start whitespace-nowrap rounded-md border border-line px-3 py-1.5 text-sm hover:border-accent hover:text-accent sm:mt-1"
            >
              Watch on YouTube ↗
            </a>
          </li>
        ))}
      </ul>
      {shown < filtered.length && (
        <button onClick={() => setShown((n) => n + PAGE)} className="mt-6 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm hover:border-accent">
          Show more ({filtered.length - shown} remaining)
        </button>
      )}
    </div>
  );
}
