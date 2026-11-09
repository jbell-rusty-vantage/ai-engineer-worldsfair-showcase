import fs from "node:fs";
import path from "node:path";
import indexJson from "../../data/index.json";
import categoriesJson from "../../data/categories.json";

export type Category = {
  code: string;
  label: string;
  description: string;
  include: string[];
  exclude: string[];
  examples: string[];
  sort: number;
};

export type Talk = {
  id: string;
  title: string | null;
  publishedAt: string | null;
  category: string;
  form: string | null;
  difficulty: string | null;
  org: string | null;
  tech: string[];
  blurb: string;
};

export type Report = {
  id: string;
  title: string | null;
  channel: string | null;
  url: string;
  publishedAt: string | null;
  pipeline: { runId: string; researchAsOf: string | null; model: string | null; promptBundle: string | null };
  taxonomy: {
    primary: { code: string; label: string; confidence: number | null; rationale: string | null };
    secondary: { code: string; label: string; confidence: number | null; rationale: string | null }[];
    contentForm: string | null;
    difficulty: string | null;
    evidenceLevel: string | null;
    domains: { code: string; label: string; confidence: number | null; rationale: string | null }[];
    lifecycle: string[];
  };
  summary: string | null;
  whyItMatters: string | null;
  temporalContext: string | null;
  takeaways: string[];
  concepts: { name: string | null; explanation: string | null; importance: string | null }[];
  sections: { title: string | null; summary: string | null }[];
  demonstrations: string[];
  limitations: string[];
  quantitativeClaims: string[];
  organization: {
    name: string;
    official: string | null;
    summary: string | null;
    scope: string | null;
    roles: string[];
    domain: string | null;
    status: string | null;
    sources: { title: string | null; url: string | null; role: string | null; tier: string | null; verification: string | null }[];
  } | null;
  technologies: { label: string | null; primary: string | null; kind: string | null; summary: string | null; role: string | null; status: string | null; urls: string[] }[];
  curriculum: { level: string | null; prerequisites: string[]; outcomes: string[]; roles: string[]; challengeSeeds: string[] };
  entities: { kind: string | null; name: string | null; url: string | null; relation: string | null }[];
  resources: { type: string | null; title: string | null; url: string | null; why: string | null; verification: string | null; firstParty: boolean | null }[];
  evidence: { kind: string | null; excerpt: string | null; supports: string | null }[];
  searches: string[];
};

export const categories = (categoriesJson as Category[]).sort((a, b) => a.sort - b.sort);
export const talks = indexJson as Talk[];

export function displayTitle(t: { id: string; title: string | null }) {
  return t.title ?? `Talk ${t.id}`;
}

export function talksByCategory(code: string) {
  return talks.filter((t) => t.category === code);
}

export function categoryCounts() {
  const m = new Map<string, number>();
  for (const t of talks) m.set(t.category, (m.get(t.category) ?? 0) + 1);
  return m;
}

export function getReport(id: string): Report | null {
  const file = path.join(process.cwd(), "data", "reports", `${id}.json`);
  if (!/^[\w-]{6,20}$/.test(id) || !fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as Report;
}

export function youtubeUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function label(s: string | null | undefined) {
  return s ? s.replace(/_/g, " ") : "";
}

export function fmtDate(s: string | null | undefined) {
  if (!s) return "";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}
