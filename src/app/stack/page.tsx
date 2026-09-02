import { Section } from "@/components/Section";
import { StatusPill } from "@/components/StatusPill";
import { getStack } from "@/lib/data";
import { smallestPool } from "@/lib/stack";

export const metadata = { title: "Software Stack — ALAN" };

export default function StackPage() {
  const stack = getStack();
  const local = stack.models.filter((m) => m.kind === "local");
  const external = stack.models.filter((m) => m.kind === "external");

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-zinc-100">Software Stack</h1>
      <p className="mb-8 max-w-2xl text-sm text-zinc-400">
        The zero-cloud-cost operating principle: every routine token is generated on owned
        hardware for electricity, with exactly two external exceptions — Aristotle while it is
        free, and a budget-capped frontier rigor layer. Everything below is data (
        <span className="font-mono text-xs">data/stack.json</span>); swapping a model is an edit,
        not a rewrite.
      </p>

      <Section title="Local model roster (pure electricity)">
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Params</th>
                <th className="px-4 py-3">Quant</th>
                <th className="px-4 py-3">Weights</th>
                <th className="px-4 py-3">Fits in</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {local.map((m) => {
                const fit = m.weightsGb !== null ? smallestPool(m.weightsGb, stack.pools) : undefined;
                return (
                  <tr key={m.id} className="border-t border-zinc-800/60 align-top">
                    <td className="px-4 py-3">
                      <a href={m.link} className="font-bold text-zinc-100 hover:text-amber-400">
                        {m.name} ↗
                      </a>
                      <div className="mt-0.5 max-w-xs text-xs text-zinc-500">{m.role}</div>
                      {m.notes ? (
                        <div className="mt-1 max-w-xs text-xs text-zinc-600">{m.notes}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{m.params}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{m.quant ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-zinc-300">
                      {m.weightsGb !== null ? `${m.weightsGb} GB` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {fit ? (
                        <span className="rounded bg-emerald-950 px-2 py-0.5 font-mono text-xs text-emerald-400">
                          {fit.name}
                        </span>
                      ) : (
                        <span className="rounded bg-red-950 px-2 py-0.5 font-mono text-xs text-red-400">
                          does not fit
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={m.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          Fit check assumes weights + 15% KV/activation headroom against each VRAM pool:{" "}
          {stack.pools.map((p) => `${p.name} (${p.vramGb} GB)`).join(" · ")}. Runtimes:{" "}
          {local.map((m) => m.runtime).filter((v, i, a) => a.indexOf(v) === i).length} distinct —
          see the architecture below.
        </p>
      </Section>

      <Section title="External services (the two exceptions)">
        <div className="grid gap-4 md:grid-cols-2">
          {external.map((m) => (
            <div key={m.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
              <div className="flex items-start justify-between gap-3">
                <a href={m.link} className="font-bold text-zinc-100 hover:text-amber-400">
                  {m.name} ↗
                </a>
                <StatusPill status={m.status} />
              </div>
              <p className="mt-2 text-sm text-zinc-400">{m.role}</p>
              <p className="mt-2 text-sm text-amber-400/90">{m.costNote}</p>
              {m.notes ? <p className="mt-2 text-xs text-zinc-500">{m.notes}</p> : null}
              <p className="mt-2 font-mono text-xs text-zinc-500">{m.runtime}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="How ALAN explores math — the four pipelines">
        <p className="mb-4 max-w-2xl text-sm text-zinc-400">
          Chatting with a model does not explore mathematics — a loop does. Every pipeline below
          fans a route card out into many parallel attempts and ends in a verifier that is not an
          LLM. The model proposes; something ruthless disposes.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {stack.pipelines.map((pl) => (
            <div key={pl.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
              <h3 className="font-bold text-zinc-100">{pl.title}</h3>
              <ol className="mt-3 space-y-2">
                {pl.stages.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="font-mono text-xs text-amber-400">{i + 1}</span>
                    <span>
                      <span className="text-zinc-300">{s.step}</span>{" "}
                      <span className="text-xs text-zinc-500">— {s.who}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-3 border-t border-zinc-800 pt-3 text-xs">
                <div>
                  <span className="text-zinc-500">verifier: </span>
                  <span className="text-emerald-400">{pl.verifier}</span>
                </div>
                <div className="mt-1">
                  <span className="text-zinc-500">output: </span>
                  <span className="text-zinc-300">{pl.output}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Operating rules">
        <div className="space-y-3">
          {stack.rules.map((r) => (
            <div key={r.rule} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <h3 className="text-sm font-bold text-amber-400">{r.rule}</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-400">{r.why}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Serving architecture">
        <div className="space-y-3">
          {stack.layers.map((l) => (
            <div key={l.name} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-bold text-zinc-100">{l.name}</h3>
                <span className="font-mono text-xs text-amber-400">{l.tech}</span>
              </div>
              <div className="mt-1 font-mono text-xs text-zinc-500">runs on: {l.runsOn}</div>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{l.purpose}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 max-w-2xl text-sm text-zinc-400">
          Data flows down-stack and results flow up: the orchestrator fans out through the
          gateway, local layers generate and verify, and only survivors reach the paid frontier
          layer. Marginal cost of a token anywhere in layers 3-6: electricity.
        </p>
      </Section>
    </div>
  );
}
