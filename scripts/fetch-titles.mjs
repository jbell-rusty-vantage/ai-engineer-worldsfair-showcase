// Resolve video titles/channels through YouTube oEmbed (no API key). Cached in data/titles.json.
// Usage: node scripts/fetch-titles.mjs   (reads data/ids.json from `LIST_ONLY=1 build-data.mjs`)
import fs from "node:fs";

const ids = JSON.parse(fs.readFileSync("data/ids.json", "utf8"));
const file = "data/titles.json";
const titles = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
const todo = ids.filter((id) => !titles[id] || titles[id].missing);
console.log("to fetch", todo.length);

let i = 0, ok = 0, miss = 0;
await Promise.all(
  Array.from({ length: 8 }, async () => {
    for (;;) {
      const id = todo[i++];
      if (!id) return;
      try {
        const r = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent("https://www.youtube.com/watch?v=" + id)}&format=json`);
        if (!r.ok) throw new Error(String(r.status));
        const j = await r.json();
        titles[id] = { title: j.title, channel: j.author_name };
        ok++;
      } catch (e) {
        titles[id] = { missing: true, title: null, channel: null };
        miss++;
      }
    }
  }),
);
fs.writeFileSync(file, JSON.stringify(titles));
console.log("ok", ok, "missing", miss);
