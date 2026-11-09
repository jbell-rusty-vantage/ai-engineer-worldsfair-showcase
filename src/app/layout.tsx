import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader" });

export const metadata: Metadata = {
  title: { default: "AI Engineer Research Library", template: "%s · AI Engineer Research Library" },
  description:
    "Machine-generated research briefs on AI Engineer conference talks: summaries, taxonomy, organizations, technologies and curriculum signals for about a thousand videos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`}>
      <body className="flex min-h-screen flex-col">
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
            <Link href="/" className="h-serif text-lg font-semibold tracking-tight">
              AI Engineer <span className="text-accent">Research Library</span>
            </Link>
            <nav className="flex gap-5 text-sm text-muted">
              <Link href="/" className="hover:text-fg">Categories</Link>
              <Link href="/talks" className="hover:text-fg">All talks</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line text-sm text-muted">
          <div className="mx-auto max-w-6xl space-y-2 px-5 py-8">
            <p>
              Initial, machine-generated research on public AI Engineer talks, produced by an automated pipeline from video transcripts plus web
              verification. It is not human reviewed and may contain errors. Transcripts are not republished; every talk belongs to its speakers,
              so use the Watch on YouTube link for the original.
            </p>
            <p>An independent research project, not affiliated with or endorsed by the AI Engineer conference or any organization mentioned.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
