import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { talks, getReport, displayTitle, fmtDate, label } from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return talks.map((t) => ({ id: t.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = getReport((await params).id);
  if (!r) return {};
  return { title: displayTitle(r), description: (r.summary ?? "").slice(0, 200) };
}

const NAV = [
  ["overview", "Overview"],
  ["summary", "Summary"],
  ["taxonomy", "Taxonomy"],
  ["organizations", "Organizations"],
  ["technologies", "Technologies"],
  ["curriculum", "Curriculum"],
  ["sources", "Sources"],
] as const;

function Section({ id, num, title, children }: { id: string; num?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line pt-8">
      <h2 className="h-serif text-2xl font-semibold">
        {num && <span className="mr-2 text-accent">{num}</span>}
        {title}
      </h2>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  );
}

function Empty() {
  return <p className="text-sm text-muted">None recorded.</p>;
}

function Sub({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">{children}</h3>;
}

function Bullets({ items }: { items: string[] }) {
  if (!items.length) return <Empty />;
  return (
    <ul className="list-disc space-y-2 pl-5 leading-7">
      {items.map((s, i) => (
        <li key={i}>{s}</li>
      ))}
    </ul>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs">{children}</span>;
}

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-accent underline break-words">
      {children}
    </a>
  );
}

const Paras = ({ text }: { text: string | null }) =>
  text ? (
    <div className="prose-brief">
      {text.split(/\n{2,}/).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  ) : (
    <Empty />
  );

export default async function TalkPage({ params }: Props) {
  const { id } = await params;
  const r = getReport(id);
  if (!r) notFound();
  const tx = r.taxonomy;
  const sameAsSummary = (r.whyItMatters ?? "").trim() === (r.summary ?? "").trim();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-fg">Library</Link> /{" "}
        <Link href={`/c/${tx.primary.code}`} className="hover:text-fg">{tx.primary.label}</Link>
      </nav>

      <header className="mt-4 max-w-3xl">
        <h1 className="h-serif text-3xl font-semibold leading-tight sm:text-4xl">{displayTitle(r)}</h1>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          {r.channel && <span>{r.channel}</span>}
          {r.publishedAt && <span>{fmtDate(r.publishedAt)}</span>}
          {r.organization && <span>Featured: {r.organization.name}</span>}
          <span>Video {r.id}</span>
        </p>
        <a
          href={r.url}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-block rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white hover:opacity-90 dark:text-black"
        >
          Watch on YouTube ↗
        </a>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[11rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <nav aria-label="Sections" className="flex flex-wrap gap-x-4 gap-y-2 text-sm lg:flex-col lg:gap-2">
            {NAV.map(([href, text]) => (
              <a key={href} href={`#${href}`} className="text-muted hover:text-accent">
                {text}
              </a>
            ))}
          </nav>
        </aside>

        <article className="max-w-3xl space-y-10">
          <Section id="overview" title="At a glance">
            <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
              <div><dt className="text-muted">Primary category</dt><dd className="mt-0.5 font-medium">{tx.primary.label}</dd></div>
              <div><dt className="text-muted">Content form</dt><dd className="mt-0.5 font-medium">{label(tx.contentForm) || "—"}</dd></div>
              <div><dt className="text-muted">Difficulty</dt><dd className="mt-0.5 font-medium">{tx.difficulty ?? "—"}</dd></div>
              <div><dt className="text-muted">Evidence level</dt><dd className="mt-0.5 font-medium">{label(tx.evidenceLevel) || "—"}</dd></div>
              <div><dt className="text-muted">Lifecycle</dt><dd className="mt-0.5 font-medium">{tx.lifecycle.map(label).join(", ") || "—"}</dd></div>
              <div><dt className="text-muted">Research as of</dt><dd className="mt-0.5 font-medium">{r.pipeline.researchAsOf ?? "—"}</dd></div>
            </dl>
            {tx.domains.length > 0 && (
              <div className="flex flex-wrap gap-2">{tx.domains.map((d) => <Pill key={d.code}>{d.label}</Pill>)}</div>
            )}
          </Section>

          <Section id="summary" num="01" title="Summary">
            {r.whyItMatters && !sameAsSummary && (
              <div><Sub>Why it matters</Sub><div className="mt-2"><Paras text={r.whyItMatters} /></div></div>
            )}
            <div><Sub>Summary</Sub><div className="mt-2"><Paras text={r.summary} /></div></div>
            {r.temporalContext && <div><Sub>Temporal context</Sub><div className="mt-2"><Paras text={r.temporalContext} /></div></div>}
            <div><Sub>Key takeaways</Sub><div className="mt-2"><Bullets items={r.takeaways} /></div></div>
            {r.sections.length > 0 && (
              <div>
                <Sub>Talk structure</Sub>
                <ol className="mt-2 space-y-3 leading-7">
                  {r.sections.map((s, i) => (
                    <li key={i}><span className="font-medium">{s.title}</span>{s.summary && <span className="text-muted"> — {s.summary}</span>}</li>
                  ))}
                </ol>
              </div>
            )}
            {r.concepts.length > 0 && (
              <div>
                <Sub>Concepts</Sub>
                <ul className="mt-2 space-y-2 leading-7">
                  {r.concepts.map((c, i) => (
                    <li key={i}><span className="font-medium">{c.name}</span>{c.explanation && c.explanation !== c.name && <span className="text-muted"> — {c.explanation}</span>}</li>
                  ))}
                </ul>
              </div>
            )}
            {(r.limitations.length > 0 || r.quantitativeClaims.length > 0) && (
              <div className="grid gap-6 sm:grid-cols-2">
                <div><Sub>Limitations noted</Sub><div className="mt-2"><Bullets items={r.limitations} /></div></div>
                <div><Sub>Quantitative claims</Sub><div className="mt-2"><Bullets items={r.quantitativeClaims} /></div></div>
              </div>
            )}
          </Section>

          <Section id="taxonomy" num="02" title="Taxonomy">
            <div>
              <Sub>Primary category</Sub>
              <p className="mt-2 leading-7"><span className="font-medium">{tx.primary.label}</span>{tx.primary.confidence != null && <span className="text-muted"> · confidence {Math.round(tx.primary.confidence * 100)}%</span>}</p>
              {tx.primary.rationale && <p className="mt-1 leading-7 text-muted">{tx.primary.rationale}</p>}
            </div>
            <div>
              <Sub>Secondary categories</Sub>
              {tx.secondary.length ? (
                <ul className="mt-2 space-y-2 leading-7">
                  {tx.secondary.map((s) => (
                    <li key={s.code}><span className="font-medium">{s.label}</span>{s.rationale && <span className="text-muted"> — {s.rationale}</span>}</li>
                  ))}
                </ul>
              ) : <div className="mt-2"><Empty /></div>}
            </div>
            <div>
              <Sub>Domains</Sub>
              {tx.domains.length ? (
                <ul className="mt-2 space-y-2 leading-7">
                  {tx.domains.map((d) => (
                    <li key={d.code}><span className="font-medium">{d.label}</span>{d.rationale && <span className="text-muted"> — {d.rationale}</span>}</li>
                  ))}
                </ul>
              ) : <div className="mt-2"><Empty /></div>}
            </div>
          </Section>

          <Section id="organizations" num="03" title="Organizations">
            {r.organization ? (
              <>
                <div>
                  <h3 className="text-lg font-semibold">
                    {r.organization.official ? <Ext href={r.organization.official}>{r.organization.name}</Ext> : r.organization.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{[r.organization.domain, r.organization.scope && label(r.organization.scope), ...r.organization.roles.map(label)].filter(Boolean).join(" · ")}</p>
                  {r.organization.summary && <p className="mt-3 leading-7">{r.organization.summary}</p>}
                  {r.organization.status && <p className="mt-2 text-sm text-muted">Status: {r.organization.status}</p>}
                </div>
                <div>
                  <Sub>Sources</Sub>
                  {r.organization.sources.length ? (
                    <ul className="mt-2 space-y-2 text-sm leading-6">
                      {r.organization.sources.map((s, i) => (
                        <li key={i}>
                          {s.url ? <Ext href={s.url}>{s.title ?? s.url}</Ext> : s.title}
                          <span className="text-muted">{[s.role, s.tier, s.verification].filter(Boolean).map((x) => ` · ${label(x)}`).join("")}</span>
                        </li>
                      ))}
                    </ul>
                  ) : <div className="mt-2"><Empty /></div>}
                </div>
              </>
            ) : <Empty />}
            {r.entities.length > 0 && (
              <div>
                <Sub>Other entities mentioned</Sub>
                <ul className="mt-2 space-y-1.5 text-sm leading-6">
                  {r.entities.map((e, i) => (
                    <li key={i}>
                      {e.url ? <Ext href={e.url}>{e.name}</Ext> : e.name}
                      <span className="text-muted">{[e.kind, e.relation].filter(Boolean).map((x) => ` · ${label(x)}`).join("")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>

          <Section id="technologies" num="04" title="Technologies">
            {r.technologies.length ? (
              <ol className="space-y-5">
                {r.technologies.map((t, i) => (
                  <li key={i}>
                    <p className="font-semibold">{t.label ?? t.primary}{t.primary && t.label && t.primary !== t.label && <span className="font-normal text-muted"> · {t.primary}</span>}</p>
                    <p className="text-sm text-muted">{[t.kind && label(t.kind), t.status && label(t.status)].filter(Boolean).join(" · ")}</p>
                    {t.summary && <p className="mt-1.5 leading-7">{t.summary}</p>}
                    {t.role && <p className="mt-1 text-sm text-muted">Role in the talk: {t.role}</p>}
                    {t.urls.length > 0 && <p className="mt-1 text-sm">{t.urls.map((u) => <span key={u} className="mr-3"><Ext href={u}>{u.replace(/^https?:\/\//, "")}</Ext></span>)}</p>}
                  </li>
                ))}
              </ol>
            ) : <Empty />}
          </Section>

          <Section id="curriculum" num="05" title="Curriculum signals">
            <p className="text-sm text-muted">Recommended learner level: <span className="font-medium text-fg">{r.curriculum.level ? label(r.curriculum.level) : "not recorded"}</span></p>
            <div><Sub>Learning outcomes</Sub><div className="mt-2"><Bullets items={r.curriculum.outcomes} /></div></div>
            <div><Sub>Prerequisites</Sub><div className="mt-2"><Bullets items={r.curriculum.prerequisites} /></div></div>
            <div><Sub>Challenge seeds</Sub><div className="mt-2"><Bullets items={r.curriculum.challengeSeeds} /></div></div>
            <div><Sub>Curriculum roles</Sub><div className="mt-2">{r.curriculum.roles.length ? <div className="flex flex-wrap gap-2">{r.curriculum.roles.map((x) => <Pill key={x}>{label(x)}</Pill>)}</div> : <Empty />}</div></div>
          </Section>

          <Section id="sources" num="06" title="Sources and evidence">
            <div>
              <Sub>Resources</Sub>
              {r.resources.length ? (
                <ul className="mt-2 space-y-3 text-sm leading-6">
                  {r.resources.map((x, i) => (
                    <li key={i}>
                      {x.url ? <Ext href={x.url}>{x.title ?? x.url}</Ext> : x.title}
                      <span className="text-muted">{[x.type, x.verification].filter(Boolean).map((v) => ` · ${label(v)}`).join("")}</span>
                      {x.why && <p className="text-muted">{x.why}</p>}
                    </li>
                  ))}
                </ul>
              ) : <div className="mt-2"><Empty /></div>}
            </div>
            <div>
              <Sub>Evidence excerpts</Sub>
              {r.evidence.length ? (
                <ul className="mt-2 space-y-3 text-sm leading-6">
                  {r.evidence.map((e, i) => (
                    <li key={i} className="border-l-2 border-line pl-4">
                      {e.excerpt && <p>“{e.excerpt}”</p>}
                      {e.supports && <p className="text-muted">Supports: {e.supports}</p>}
                    </li>
                  ))}
                </ul>
              ) : <div className="mt-2"><Empty /></div>}
            </div>
            <div>
              <Sub>Web searches run</Sub>
              <div className="mt-2">{r.searches.length ? <ul className="list-disc space-y-1 pl-5 text-sm text-muted">{r.searches.map((q, i) => <li key={i}>{q}</li>)}</ul> : <Empty />}</div>
            </div>
            <p className="text-xs text-muted">
              Generated {r.pipeline.researchAsOf ? `as of ${r.pipeline.researchAsOf}` : ""}{r.pipeline.model ? ` with ${r.pipeline.model}` : ""}. Machine-generated and not human reviewed.
            </p>
          </Section>
        </article>
      </div>
    </div>
  );
}
