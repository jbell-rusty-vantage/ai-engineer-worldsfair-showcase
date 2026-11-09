// One-off converter: raw pre-research packets (downloaded from Storage) -> trimmed static JSON.
// Usage: node scripts/build-data.mjs <rawDir> <taxonomySql>
import fs from "node:fs";
import path from "node:path";

const [rawDir, sqlPath] = process.argv.slice(2);
if (!rawDir || !sqlPath) throw new Error("usage: build-data.mjs <rawDir> <taxonomySql>");
const OUT = path.resolve("data");
fs.mkdirSync(path.join(OUT, "reports"), { recursive: true });

const arr = (x) => (Array.isArray(x) ? x : []);
const str = (x) => (typeof x === "string" && x.trim() ? x.trim() : null);
const rj = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null);
const title = (code) => code.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

// ---- taxonomy labels from the schema seed
const sql = fs.readFileSync(sqlPath, "utf8");
const catBlock = sql.slice(sql.indexOf("insert into public.research_category_definition"));
const categories = [];
const catRe = /'([a-z_]+)',\s*'([^']+)',\s*'((?:[^']|'')+)',\s*array\[([\s\S]*?)\],\s*array\[([\s\S]*?)\],\s*array\[([\s\S]*?)\],\s*(\d+)/g;
const lst = (s) => [...s.matchAll(/'((?:[^']|'')+)'/g)].map((m) => m[1].replace(/''/g, "'"));
for (const m of catBlock.matchAll(catRe)) {
  categories.push({ code: m[1], label: m[2], description: m[3].replace(/''/g, "'"), include: lst(m[4]), exclude: lst(m[5]), examples: lst(m[6]), sort: +m[7] });
}
const domainLabels = {};
for (const m of sql.matchAll(/\('([a-z_]+)', '([^']+)', '(?:[^']|'')*', (?:null|'[a-z_]+'), (?:true|false), \d+\)/g)) domainLabels[m[1]] = m[2];
const catLabel = Object.fromEntries(categories.map((c) => [c.code, c.label]));
console.log("categories", categories.length, "domains", Object.keys(domainLabels).length);

// ---- pick the latest applied run per video
const titlesPath = path.join(OUT, "titles.json");
const titles = fs.existsSync(titlesPath) ? JSON.parse(fs.readFileSync(titlesPath, "utf8")) : {};
const picked = [];
let skippedNoApplied = 0;
for (const vid of fs.readdirSync(rawDir)) {
  let best = null;
  for (const run of fs.readdirSync(path.join(rawDir, vid))) {
    const dir = path.join(rawDir, vid, run);
    const rec = rj(path.join(dir, "99-execution-receipt.json"));
    if (!rec || rec.status !== "applied" || rec.error_code) continue;
    if (!fs.existsSync(path.join(dir, "20-taxonomy-classification.json"))) continue;
    if (!best || String(rec.applied_at) > String(best.rec.applied_at)) best = { dir, rec, run };
  }
  if (best && !process.env.LIST_ONLY && !titles[vid]?.title) continue; // unavailable on YouTube
  if (best) picked.push({ vid, ...best });
  else skippedNoApplied++;
}
console.log("videos with applied run", picked.length, "skipped", skippedNoApplied);
if (process.env.LIST_ONLY) {
  fs.writeFileSync(path.join(OUT, "ids.json"), JSON.stringify(picked.map((p) => p.vid)));
  process.exit(0);
}

const index = [];
for (const { vid, dir, run } of picked) {
  const m = rj(path.join(dir, "00-run-manifest.json")) ?? {};
  const t10 = rj(path.join(dir, "10-transcript-analysis.json")) ?? {};
  const t20 = rj(path.join(dir, "20-taxonomy-classification.json")) ?? {};
  const t30 = rj(path.join(dir, "30-web-context.json")) ?? {};
  const t40 = rj(path.join(dir, "40-source-verification.json")) ?? {};
  const t50 = rj(path.join(dir, "50-curriculum-signals.json")) ?? {};
  const t60 = rj(path.join(dir, "initial-summary/60-initial-summary.json")) ?? {};
  const t70 = rj(path.join(dir, "technology-library-summary/70-technology-library-summary.json")) ?? {};
  const t80 = rj(path.join(dir, "organization-profile/80-organization-profile.json")) ?? {};

  const primaryCode = t20.primary?.category_code ?? "uncategorized";
  const concept = (c) => ({ name: str(c.name), explanation: str(c.explanation), importance: str(c.importance) });
  const org = t80.primary_featured_organization;
  const orgSources = arr(t80.sources).map((s) => ({ title: str(s.title), url: str(s.url), role: str(s.source_role), tier: str(s.authority_tier), verification: str(s.verification_status) }));
  const resourceMeta = new Map(arr(t30.resources).map((r) => [r.url, r]));
  const resources = arr(t40.resources).map((r) => ({
    type: str(r.resource_type) ?? str(resourceMeta.get(r.url)?.resource_type),
    title: str(r.title),
    url: str(r.url),
    why: str(resourceMeta.get(r.url)?.why_valuable) ?? str(r.claim_supported),
    verification: str(r.verification_status),
    firstParty: r.is_first_party ?? null,
  }));
  const report = {
    id: vid,
    title: titles[vid]?.title ?? null,
    channel: titles[vid]?.channel ?? null,
    url: `https://www.youtube.com/watch?v=${vid}`,
    publishedAt: m.video_published_at ?? null,
    pipeline: { runId: run, researchAsOf: m.research_as_of ?? null, model: m.model_id ?? null, promptBundle: m.prompt_bundle_version ?? null },
    taxonomy: {
      primary: { code: primaryCode, label: catLabel[primaryCode] ?? title(primaryCode), confidence: t20.primary?.confidence ?? null, rationale: str(t20.primary?.rationale) },
      secondary: arr(t20.secondary).map((s) => ({ code: s.category_code, label: catLabel[s.category_code] ?? title(s.category_code), confidence: s.confidence ?? null, rationale: str(s.rationale) })),
      contentForm: str(t20.content_form),
      difficulty: str(t20.difficulty),
      evidenceLevel: str(t20.evidence_level),
      domains: arr(t20.domains).map((d) => ({ code: d.domain_code, label: domainLabels[d.domain_code] ?? title(d.domain_code), confidence: d.confidence ?? null, rationale: str(d.rationale) })),
      lifecycle: arr(t20.lifecycle_stages),
    },
    summary: str(t60.transcript_summary) ?? str(t10.initial_summary) ?? str(t10.structured_summary),
    whyItMatters: str(t60.why_concepts_matter_together),
    temporalContext: str(t60.temporal_context),
    takeaways: arr(t10.key_takeaways),
    concepts: [...arr(t60.ai_concepts), ...arr(t60.software_engineering_concepts)].map(concept).filter((c) => c.name),
    sections: arr(t10.sections).map((s) => ({ title: str(s.title), summary: str(s.summary) })).filter((s) => s.title),
    demonstrations: arr(t10.demonstrations),
    limitations: arr(t10.limitations),
    quantitativeClaims: arr(t10.quantitative_claims),
    organization: org
      ? {
          name: org.canonical_name,
          official: str(org.official_url),
          summary: str(org.authoritative_summary),
          scope: str(org.organization_scope),
          roles: arr(org.relationship_roles),
          domain: domainLabels[org.primary_domain_code] ?? (org.primary_domain_code ? title(org.primary_domain_code) : null),
          status: str(org.current_status),
          sources: orgSources,
        }
      : null,
    technologies: arr(t70.families)
      .sort((a, b) => (a.family_rank ?? 99) - (b.family_rank ?? 99))
      .map((f) => ({ label: str(f.family_label), primary: str(f.primary_technology), kind: str(f.primary_technology_kind), summary: str(f.summary), role: str(f.role_in_video), status: str(f.temporal_status), urls: arr(f.official_urls) })),
    curriculum: {
      level: str(t50.recommended_learner_level),
      prerequisites: arr(t50.prerequisites).length ? arr(t50.prerequisites) : arr(t10.prerequisites),
      outcomes: arr(t50.learning_outcomes).length ? arr(t50.learning_outcomes) : arr(t10.learning_outcomes),
      roles: arr(t50.curriculum_roles),
      challengeSeeds: arr(t50.challenge_seeds),
    },
    entities: arr(t30.entities).map((e) => ({ kind: str(e.entity_kind), name: str(e.name), url: str(e.canonical_url), relation: str(e.relationship_to_video) })),
    resources,
    evidence: arr(t10.evidence_anchors).slice(0, 12).map((e) => ({ kind: str(e.source_kind), excerpt: str(e.short_excerpt), supports: str(e.supports) })),
    searches: arr(t30.searches).map((s) => str(s.query)).filter(Boolean),
  };
  fs.writeFileSync(path.join(OUT, "reports", `${vid}.json`), JSON.stringify(report));
  index.push({
    id: vid,
    title: report.title,
    publishedAt: report.publishedAt,
    category: primaryCode,
    form: report.taxonomy.contentForm,
    difficulty: report.taxonomy.difficulty,
    org: org?.canonical_name ?? null,
    tech: report.technologies.map((t) => t.primary).filter(Boolean).slice(0, 4),
    blurb: (report.summary ?? "").slice(0, 220),
  });
}
index.sort((a, b) => String(a.publishedAt).localeCompare(String(b.publishedAt)) || a.id.localeCompare(b.id));
fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify(index));
fs.writeFileSync(path.join(OUT, "categories.json"), JSON.stringify(categories));
console.log("wrote", index.length);
