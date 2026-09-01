import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALAN — a DIY supercomputer for the Riemann Hypothesis",
  description:
    "ALAN is a phased, eBay-sourced AI cluster built to attack the Riemann Hypothesis with local models in human/AI collaboration.",
};

const NAV = [
  { href: "/machine", label: "Machine" },
  { href: "/plan", label: "Plan" },
  { href: "/stack", label: "Stack" },
  { href: "/research", label: "Research" },
  { href: "/control", label: "Control" },
  { href: "/log", label: "Log" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-300 antialiased">
        <header className="border-b border-zinc-800">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="font-mono text-lg font-bold tracking-widest text-amber-400">
              ALAN
            </Link>
            <div className="flex gap-6 text-sm">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="text-zinc-400 hover:text-zinc-100">
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        <footer className="mx-auto max-w-5xl border-t border-zinc-800 px-6 py-8 text-xs text-zinc-500">
          ALAN — built in the open from used parts. Named for Alan Turing, who computed zeta zeros on
          the Manchester Mark 1 in 1950.
        </footer>
      </body>
    </html>
  );
}
