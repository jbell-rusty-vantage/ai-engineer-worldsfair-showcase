import type { Metadata } from "next";
import Link from "next/link";
import { talks } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description: "Where these talks come from: the AI Engineer conferences and YouTube channel, and how the research briefs were made.",
};

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-accent underline">
      {children}
    </a>
  );
}

export default function About() {
  const dates = talks.map((t) => t.publishedAt).filter(Boolean).sort() as string[];
  const from = new Date(dates[0]).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const to = new Date(dates[dates.length - 1]).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-fg">Library</Link> / <span className="text-fg">About</span>
      </nav>
      <h1 className="h-serif mt-4 text-4xl font-semibold leading-tight">Where these talks come from</h1>

      <div className="prose-brief mt-6 text-lg">
        <p>
          <strong>AI Engineer</strong> is a community and conference series for the people who build with AI: engineers, founders and technical
          leaders. Its flagship event is the <strong>AI Engineer World&rsquo;s Fair</strong>, and the organizers publish the talks on their YouTube
          channel, <Ext href="https://youtube.com/@aidotengineer">@aidotengineer</Ext>.
        </p>
        <p>
          The 2026 World&rsquo;s Fair ran <strong>June 29 &ndash; July 2, 2026</strong> at Moscone West in San Francisco. According to the
          organizers, it brought together 6,000+ attendees, around 300 speakers and 100 expo partners, with workshops, keynotes and parallel tracks
          on topics such as agents, evals, retrieval, security, context engineering, inference and AI in finance and healthcare. See the{" "}
          <Ext href="https://ai.engineer/worldsfair/2026">official site</Ext> and the machine-readable{" "}
          <Ext href="https://ai.engineer/worldsfair/2026/llms.md">event overview</Ext>.
        </p>
      </div>

      <h2 className="h-serif mt-12 text-2xl font-semibold">What is in this library</h2>
      <div className="prose-brief mt-3">
        <p>
          {talks.length.toLocaleString()} videos from the AI Engineer YouTube channel, published between {from} and {to}. That covers World&rsquo;s
          Fair sessions and talks from the organizers&rsquo; earlier summits and online events; this site does not label which event each talk
          belongs to.
        </p>
        <p>
          For each video, an automated research pipeline read the transcript, summarized it, researched the companies and technologies mentioned,
          verified sources on the web, and noted curriculum signals. Categories were then assigned with Jev, a decision model that picks from a
          fixed 17-category taxonomy of AI engineering topics, using each talk&rsquo;s summary and concepts.
        </p>
        <p>
          This is <strong>initial, machine-generated research</strong>. It has not been reviewed by people, summaries can be wrong or generic, and
          the pipeline&rsquo;s model varied between runs. Transcripts are not republished: watch the original talk on YouTube, where every speaker
          and organizer gets the credit and the views.
        </p>
      </div>

      <h2 className="h-serif mt-12 text-2xl font-semibold">Links</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
        <li><Ext href="https://youtube.com/@aidotengineer">AI Engineer on YouTube</Ext></li>
        <li><Ext href="https://ai.engineer/worldsfair/2026">AI Engineer World&rsquo;s Fair 2026</Ext></li>
        <li><Ext href="https://ai.engineer/newsletter">AI Engineer newsletter</Ext></li>
        <li><Ext href="https://x.com/aiDotEngineer">@aiDotEngineer on X</Ext> · <Ext href="https://www.linkedin.com/company/aidotengineer/">LinkedIn</Ext></li>
      </ul>
      <p className="mt-10 text-sm text-muted">
        This is an independent project and is not affiliated with or endorsed by the AI Engineer conference or the companies mentioned in the
        briefs. Thumbnails are loaded from YouTube.
      </p>
    </div>
  );
}
