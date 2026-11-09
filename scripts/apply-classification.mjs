// Apply data/jev-classification.json to data/reports/*.json and data/index.json (idempotent).
import fs from "node:fs";
import path from "node:path";

const cls = JSON.parse(fs.readFileSync("data/jev-classification.json", "utf8"));
const cats = JSON.parse(fs.readFileSync("data/categories.json", "utf8"));
const label = Object.fromEntries(cats.map((c) => [c.code, c.label]));
const index = JSON.parse(fs.readFileSync("data/index.json", "utf8"));

const dist = {};
for (const row of index) {
  const c = cls[row.id];
  if (!c || !label[c.primary.code]) continue;
  const file = path.join("data/reports", `${row.id}.json`);
  const r = JSON.parse(fs.readFileSync(file, "utf8"));
  const pct = (x) => (x == null ? "" : ` (confidence ${Math.round(x * 100)}%)`);
  r.taxonomy.primary = {
    code: c.primary.code,
    label: label[c.primary.code],
    confidence: c.primary.confidence,
    rationale: `Selected by Jev (System One, ${c.model}) from the 17-category taxonomy using the talk's summary, takeaways, concepts and technologies${pct(c.primary.confidence)}.`,
  };
  const s = c.secondary;
  r.taxonomy.secondary =
    s.code !== "none" && s.code !== c.primary.code && label[s.code]
      ? [{ code: s.code, label: label[s.code], confidence: s.confidence, rationale: `Selected by Jev (System One, ${c.model})${pct(s.confidence)}.` }]
      : [];
  r.taxonomy.classifiedBy = c.model;
  fs.writeFileSync(file, JSON.stringify(r));
  row.category = c.primary.code;
  dist[row.category] = (dist[row.category] ?? 0) + 1;
}
fs.writeFileSync("data/index.json", JSON.stringify(index));
console.log(Object.entries(dist).sort((a, b) => b[1] - a[1]));
