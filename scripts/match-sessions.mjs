// Match talks to AI Engineer World's Fair 2026 sessions/speakers (official open endpoints) by title + speaker names.
// Output: data/worldsfair.json  { [videoId]: { sessionTitle, day, time, room, track, type, speakers:[{name,role,company}], score } }
import fs from "node:fs";

const BASE = "https://ai.engineer/worldsfair/2026";
const [sessions, speakers] = await Promise.all(
  ["sessions", "speakers"].map(async (n) => (await (await fetch(`${BASE}/${n}.json`)).json())[n]),
);
console.log("sessions", sessions.length, "speakers", speakers.length);
const speakerByName = new Map(speakers.map((s) => [s.name, s]));

// Track names from the official llms.md schedule (day -> room -> topic)
const TRACKS = {
  "Day 2": { "Main Stage": "Software Factories (keynotes)", "Track 1": "Claws & Personal Agents", "Track 2": "Vision & OCR", "Track 3": "Search & Retrieval", "Track 4": "Workshops", "Track 5": "Security", "Track 6": "Voice & Realtime AI", "Track 7": "LLM Recsys", "Track 8": "Forward Deployed Engineering", "Track 9": "Data Quality", "Leadership 1": "AI-Native Enterprises", "Leadership 2": "AI Architects: Show my Workflow" },
  "Day 3": { "Main Stage": "Autoresearch (keynotes)", "Track 1": "Sandbox & Platform Engineering", "Track 2": "Robotics & World Models", "Track 3": "Memory & Continual Learning", "Track 4": "Workshops", "Track 5": "Evals", "Track 6": "Design Engineering", "Track 7": "Computer Use", "Track 8": "Context Engineering", "Track 9": "Posttraining & Midtraining", "Leadership 1": "AI-Native Enterprises", "Leadership 2": "AI Architects: Tokenmaxxing" },
  "Day 4": { "Main Stage": "Harness Engineering (keynotes)", "Track 1": "Generative Media", "Track 2": "Agentic Commerce", "Track 3": "AI in Finance", "Track 4": "Local AI", "Track 5": "Graphs", "Track 6": "AI in GTM", "Track 7": "AI in Healthcare", "Track 8": "Agentic Engineering", "Track 9": "Inference", "Leadership 1": "AI-Native Enterprises", "Leadership 2": "AI Architects: AI Factories" },
};

const STOP = new Set(["the", "a", "an", "of", "and", "to", "in", "for", "with", "on", "at", "how", "your", "you", "is", "are", "from", "by", "we", "our", "it", "this", "that"]);
const toks = (s) =>
  s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ").filter((t) => t && !STOP.has(t));
const lastNames = (names) => names.map((n) => toks(n).pop()).filter(Boolean);

const index = JSON.parse(fs.readFileSync("data/index.json", "utf8"));
const prepared = sessions.map((s) => ({ s, t: new Set(toks(s.title)), last: lastNames(s.speakers ?? []) }));

const out = {};
for (const talk of index) {
  if (!talk.title || talk.publishedAt < "2026-05-01") continue;
  const y = new Set(toks(talk.title));
  let best = null;
  for (const p of prepared) {
    if (p.t.size < 2) continue;
    let hit = 0;
    for (const t of p.t) if (y.has(t)) hit++;
    const contain = hit / p.t.size;
    const spk = p.last.some((l) => y.has(l));
    const score = contain + (spk ? 0.25 : 0);
    if (!best || score > best.score) best = { p, score, contain, spk };
  }
  if (!best || best.score < 0.95) continue;
  const { s } = best.p;
  const dayKey = s.day.slice(0, 5);
  out[talk.id] = {
    sessionTitle: s.title,
    day: s.day.replace(/^Day (\d) — /, "Day $1 · "),
    time: s.time,
    room: s.room,
    track: TRACKS[dayKey]?.[s.room] ?? (s.day.startsWith("Day 1") ? "Workshop day" : null),
    type: s.type,
    speakers: (s.speakers ?? []).map((n) => ({ name: n, role: speakerByName.get(n)?.role ?? null, company: speakerByName.get(n)?.company ?? null })),
    score: +best.score.toFixed(2),
  };
}
fs.writeFileSync("data/worldsfair.json", JSON.stringify(out));
// apply to reports + index (idempotent)
for (const row of index) {
  const m = out[row.id];
  const file = `data/reports/${row.id}.json`;
  const r = JSON.parse(fs.readFileSync(file, "utf8"));
  if (m) { r.worldsFair = m; row.wf = true; } else { delete r.worldsFair; delete row.wf; }
  fs.writeFileSync(file, JSON.stringify(r));
}
fs.writeFileSync("data/index.json", JSON.stringify(index));
const recent = index.filter((t) => t.publishedAt >= "2026-05-01").length;
console.log("matched", Object.keys(out).length, "of", recent, "videos published since May 2026");
const sample = Object.entries(out).sort(() => 0.5 - Math.random()).slice(0, 12);
for (const [id, m] of sample) console.log(index.find((t) => t.id === id).title.slice(0, 50).padEnd(50), "|", m.sessionTitle.slice(0, 40).padEnd(40), m.score, m.track);
