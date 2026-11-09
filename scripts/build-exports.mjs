// Build downloadable exports into public/export (generated at build time, gitignored).
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const OUT = "public/export";
fs.mkdirSync(OUT, { recursive: true });

const index = JSON.parse(fs.readFileSync("data/index.json", "utf8"));
const categories = JSON.parse(fs.readFileSync("data/categories.json", "utf8"));
const label = Object.fromEntries(categories.map((c) => [c.code, c.label]));

// NDJSON: one full report per line
const lines = [];
const rows = [];
for (const t of index) {
  const raw = fs.readFileSync(path.join("data/reports", `${t.id}.json`), "utf8");
  lines.push(raw);
  const r = JSON.parse(raw);
  rows.push({
    id: r.id,
    title: r.title,
    url: r.url,
    published_at: r.publishedAt,
    channel: r.channel,
    primary_category: r.taxonomy.primary.code,
    primary_category_label: r.taxonomy.primary.label,
    primary_confidence: r.taxonomy.primary.confidence,
    secondary_category: r.taxonomy.secondary[0]?.code ?? "",
    content_form: r.taxonomy.contentForm,
    difficulty: r.taxonomy.difficulty,
    evidence_level: r.taxonomy.evidenceLevel,
    domains: r.taxonomy.domains.map((d) => d.label).join("; "),
    organization: r.organization?.name ?? "",
    organization_url: r.organization?.official ?? "",
    technologies: r.technologies.map((x) => x.primary ?? x.label).filter(Boolean).join("; "),
    worlds_fair_2026: r.worldsFair ? "yes" : "",
    worlds_fair_track: r.worldsFair?.track ?? "",
    worlds_fair_day: r.worldsFair?.day ?? "",
    worlds_fair_speakers: r.worldsFair?.speakers.map((s) => s.name).join("; ") ?? "",
    summary: r.summary ?? "",
  });
}
const nd = lines.join("\n") + "\n";
fs.writeFileSync(path.join(OUT, "talks.ndjson"), nd);
fs.writeFileSync(path.join(OUT, "talks.ndjson.gz"), zlib.gzipSync(nd, { level: 9 }));

const cols = Object.keys(rows[0]);
const esc = (v) => {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
fs.writeFileSync(path.join(OUT, "talks.csv"), [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n") + "\n");

fs.writeFileSync(
  path.join(OUT, "categories.json"),
  JSON.stringify(categories.map((c) => ({ ...c, talkCount: index.filter((t) => t.category === c.code).length })), null, 1),
);
if (fs.existsSync("data/worldsfair.json")) fs.copyFileSync("data/worldsfair.json", path.join(OUT, "worldsfair-matches.json"));
for (const f of fs.readdirSync(OUT)) console.log(f.padEnd(26), (fs.statSync(path.join(OUT, f)).size / 1e6).toFixed(2) + " MB");
