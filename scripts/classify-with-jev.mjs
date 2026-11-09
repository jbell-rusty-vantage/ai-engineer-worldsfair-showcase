// Re-classify every talk's primary + secondary category with Jev (System One, direct provider, jev-1.13.0).
// Requires a running Jev service (knowledge-services: `node --env-file=.env apps/jev/dist/index.js serve`).
// Usage: node scripts/classify-with-jev.mjs [--limit N] [--out data/jev-classification.json]
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.JEV_SERVICE_URL ?? "http://127.0.0.1:4318";
const args = process.argv.slice(2);
const arg = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const LIMIT = +arg("--limit", 0);
const OUT = arg("--out", "data/jev-classification.json");
const VERSION = "v1";

const categories = JSON.parse(fs.readFileSync("data/categories.json", "utf8"));
const ids = fs.readdirSync("data/reports").map((f) => f.replace(/\.json$/, "")).sort();
const pick = LIMIT ? ids.filter((_, i) => i % Math.floor(ids.length / LIMIT) === 0).slice(0, LIMIT) : ids;

const catCriteria = Object.fromEntries(
  categories.map((c) => [
    c.code,
    `${c.label}: ${c.description} Includes: ${c.include.join("; ")}. Excludes: ${c.exclude.join("; ")}. Example topics: ${c.examples.join(", ")}.`,
  ]),
);
const questions = {
  primary_category: {
    type: "choice",
    instructions:
      "Choose the single engineering category that best describes the PRIMARY subject of the talk in `talk`. Judge by what the talk is mostly about (its main technical argument), not by the speaker's company or the mere tools mentioned. Respect each category's exclusions; a category named in an exclusion is the better fit for that kind of talk.",
    criteria: catCriteria,
  },
  secondary_category: {
    type: "choice",
    instructions:
      "Choose the engineering category that is the most significant SECONDARY theme of the talk in `talk` (a clearly present but non-primary subject). If the talk has no clear second theme, choose `none`.",
    criteria: { ...catCriteria, none: "No clear secondary theme beyond the main subject." },
  },
};

function state(r) {
  return {
    title: r.title,
    organization: r.organization?.name ?? null,
    summary: r.summary,
    why_it_matters: r.whyItMatters,
    key_takeaways: r.takeaways.slice(0, 8),
    concepts: r.concepts.slice(0, 10).map((c) => c.name),
    technologies: r.technologies.map((t) => t.primary ?? t.label).filter(Boolean),
    sections: r.sections.map((s) => s.title),
  };
}

const tasks = pick.map((id) => {
  const r = JSON.parse(fs.readFileSync(path.join("data/reports", `${id}.json`), "utf8"));
  return { idempotencyKey: `showcase-category-${VERSION}-${id}`, provider: "direct", model: "jev-1.13.0", input: { type: "inline", state: { talk: state(r) } }, questions };
});
console.log("tasks", tasks.length);

async function http(method, url, body) {
  const r = await fetch(BASE + url, { method, headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const text = await r.text();
  if (!r.ok) throw new Error(`${r.status} ${text.slice(0, 400)}`);
  return JSON.parse(text);
}

const result = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
const todo = tasks.filter((t) => !result[t.idempotencyKey.replace(`showcase-category-${VERSION}-`, "")]);
console.log("todo", todo.length);

let inTok = 0, outTok = 0, failed = 0;
for (let i = 0; i < todo.length; i += 100) {
  const chunk = todo.slice(i, i + 100);
  const sub = await http("POST", "/v1/jev/batches", { tasks: chunk });
  const jobs = sub.jobs ?? sub;
  const pending = new Set(jobs.map((j) => j.id));
  while (pending.size) {
    await new Promise((r) => setTimeout(r, 1500));
    for (const id of [...pending]) {
      const j = await http("GET", `/v1/jev/jobs/${id}`);
      if (!["succeeded", "failed", "cancelled"].includes(j.status)) continue;
      pending.delete(id);
      const vid = jobs.find((x) => x.id === id) && chunk[jobs.findIndex((x) => x.id === id)].idempotencyKey.replace(`showcase-category-${VERSION}-`, "");
      if (j.status !== "succeeded") { failed++; console.error("FAIL", vid, JSON.stringify(j.error ?? j.failure ?? j.status).slice(0, 200)); continue; }
      const a = j.result.answers;
      inTok += j.result.usage?.inputTokens ?? j.result.usage?.input_tokens ?? 0;
      outTok += j.result.usage?.outputTokens ?? j.result.usage?.output_tokens ?? 0;
      result[vid] = {
        primary: { code: a.primary_category.choice, confidence: a.primary_category.confidence ?? null, probabilities: a.primary_category.probabilities },
        secondary: { code: a.secondary_category.choice, confidence: a.secondary_category.confidence ?? null },
        model: j.result.model ?? j.result.returnedModel ?? "jev-1.13.0",
        jobId: id,
      };
    }
  }
  fs.writeFileSync(OUT, JSON.stringify(result));
  console.log(`batch ${i / 100 + 1}: total ${Object.keys(result).length}, failed ${failed}, tokens in ${inTok}`);
}
console.log("done", Object.keys(result).length, "failed", failed, "input tokens", inTok, "output", outTok);
