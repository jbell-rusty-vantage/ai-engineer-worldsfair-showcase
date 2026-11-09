import fs from "node:fs";
import path from "node:path";
import { talks } from "@/lib/data";

export const dynamic = "force-static";

export function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const matches = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "worldsfair.json"), "utf8")) as Record<string, unknown>;
  const title = new Map(talks.map((t) => [t.id, t.title]));
  return Response.json({
    conference: "AI Engineer World's Fair 2026",
    dates: "June 29 - July 2, 2026",
    note: "Automatic, conservative title/speaker match against the organizers' public sessions.json; not every program talk is matched.",
    count: Object.keys(matches).length,
    talks: Object.entries(matches).map(([id, m]) => ({ id, title: title.get(id), url: `https://www.youtube.com/watch?v=${id}`, ...(m as object), detail: `${origin}/api/v1/talks/${id}` })),
  });
}
