import { Section } from "@/components/Section";
import { StatusPill } from "@/components/StatusPill";
import type { Avenue } from "@/lib/schemas";
import { getAvenues } from "@/lib/data";

export const metadata = { title: "Research — ALAN" };

const STATUS_ORDER = ["promising", "active", "idea", "paused", "dead-end"] as const;

const APPROACH_LABEL: Record<Avenue["approach"], string> = {
  "proof-search": "proof search",
  numerical: "numerical",
  "conjecture-mining": "conjecture mining",
};

function AvenueCard({ avenue }: { avenue: Avenue }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-bold text-zinc-100">{avenue.name}</h3>
        <StatusPill status={avenue.status} />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{avenue.structure}</p>
      <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs text-zinc-500">
        <span className="rounded bg-zinc-800 px-2 py-0.5">{APPROACH_LABEL[avenue.approach]}</span>
        {avenue.models.map((m) => (
          <span key={m} className="rounded bg-zinc-800 px-2 py-0.5">{m}</span>
        ))}
      </div>
      {avenue.notes ? <p className="mt-3 text-xs text-zinc-500">{avenue.notes}</p> : null}
      {avenue.links.length > 0 ? (
        <div className="mt-3 flex gap-3 text-xs">
          {avenue.links.map((l) => (
            <a key={l.url} href={l.url} className="text-amber-400 hover:underline">
              {l.label} ↗
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function ResearchPage() {
  const avenues = getAvenues();
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-zinc-100">The Research</h1>
      <p className="mb-8 max-w-2xl text-sm text-zinc-400">
        The strategy is portfolio-shaped: many independent attacks on the Riemann Hypothesis, run
        in parallel by local models, triaged by results. Avenues are promoted, paused, or killed on
        evidence. This registry is the shell of the full workbench that arrives with the hardware.
      </p>
      {STATUS_ORDER.map((status) => {
        const group = avenues.filter((a) => a.status === status);
        if (group.length === 0) return null;
        return (
          <Section key={status} title={status.replace("-", " ")}>
            <div className="grid gap-4 md:grid-cols-2">
              {group.map((a) => <AvenueCard key={a.id} avenue={a} />)}
            </div>
          </Section>
        );
      })}
    </div>
  );
}
