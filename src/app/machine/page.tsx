import { BomTable } from "@/components/BomTable";
import { PowerCalculator } from "@/components/PowerCalculator";
import { Section } from "@/components/Section";
import { StatCard } from "@/components/StatCard";
import { StatusPill } from "@/components/StatusPill";
import { getParts, getPhases, getPowerConfig } from "@/lib/data";
import { estTokensPerSec, machineStats, modelClassFor, partsForPhases } from "@/lib/stats";

export const metadata = { title: "The Machine — ALAN" };

export default function MachinePage() {
  const phases = getPhases();
  const parts = getParts();
  const power = getPowerConfig();

  const gpuParts = parts.filter((p) => p.gpu !== undefined);
  const calcGroups = gpuParts.map((p) => ({
    label: `${p.name} (${p.phaseId})`,
    count: p.qty,
    powerLimitW: p.gpu!.powerLimitW,
    maxTdpW: p.gpu!.tdpW,
    maxCount: p.qty * 2,
  }));
  const allStats = machineStats(parts, power);

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-zinc-100">The Machine</h1>

      <Section title="Power budget">
        <p className="mb-4 max-w-2xl text-sm text-zinc-400">
          Everything must fit a {(power.envelopeW / 1000).toFixed(1)} kW continuous envelope. Drag
          the sliders to explore configurations.
        </p>
        <PowerCalculator
          initialGroups={calcGroups}
          nodeCount={Math.max(1, allStats.nodeCount)}
          nodeOverheadW={power.nodeOverheadW}
          coolingOverheadW={power.coolingOverheadW}
          envelopeW={power.envelopeW}
        />
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-zinc-400">
          {power.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </Section>

      {phases.map((phase) => {
        const phaseParts = partsForPhases(parts, [phase.id]);
        const cumulative = partsForPhases(
          parts,
          phases.slice(0, phases.indexOf(phase) + 1).map((p) => p.id)
        );
        const stats = machineStats(cumulative, power);
        const gpu = cumulative.find((p) => p.gpu)?.gpu;
        return (
          <Section key={phase.id} title={`Phase ${phases.indexOf(phase)}: ${phase.name}`}>
            <div className="mb-3 flex items-center gap-3">
              <StatusPill status={phase.status} />
              <span className="text-sm text-zinc-400">{phase.summary}</span>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard label="Cumulative VRAM" value={`${stats.vramGb} GB`} sub={`${stats.gpuCount} GPUs`} />
              <StatCard label="FP16" value={`${Math.round(stats.fp16Tflops)} TFLOPS`} />
              <StatCard
                label="Worst-case power"
                value={`${(stats.worstCasePowerW / 1000).toFixed(1)} kW`}
                sub={stats.worstCasePowerW > power.envelopeW ? "over envelope!" : "in envelope"}
              />
              <StatCard label="Phase budget" value={`$${phase.budgetUsd.toLocaleString()}`} />
            </div>
            <p className="mb-4 text-sm text-zinc-400">
              Runs: <span className="text-zinc-200">{modelClassFor(stats.vramGb)}</span>
              {gpu ? (
                <>
                  {" "}· ~
                  <span className="font-mono text-zinc-200">
                    {estTokensPerSec(gpu.memBandwidthGBs, 40)}
                  </span>{" "}
                  tok/s per GPU stream on a 40 GB (70B Q4) model
                </>
              ) : null}
            </p>
            {phaseParts.length > 0 ? (
              <BomTable parts={phaseParts} />
            ) : (
              <p className="rounded-lg border border-dashed border-zinc-800 p-4 text-sm text-zinc-500">
                No parts listed yet — this phase is a decision gate sized by earlier results.
              </p>
            )}
            <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
              <div>
                <h3 className="mb-1 font-bold text-zinc-300">Goals</h3>
                <ul className="list-disc space-y-1 pl-5 text-zinc-400">
                  {phase.goals.map((g) => <li key={g}>{g}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="mb-1 font-bold text-zinc-300">Exit criteria</h3>
                <ul className="list-disc space-y-1 pl-5 text-zinc-400">
                  {phase.exitCriteria.map((g) => <li key={g}>{g}</li>)}
                </ul>
              </div>
            </div>
          </Section>
        );
      })}

      <Section title="Topology (full plan)">
        <p className="mb-4 text-sm text-zinc-400">
          {allStats.nodeCount} nodes · {allStats.gpuCount} GPUs · used 25GbE+ interconnect between
          nodes.
        </p>
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: Math.max(1, allStats.nodeCount) }, (_, i) => {
            const perNode = Math.ceil(allStats.gpuCount / Math.max(1, allStats.nodeCount));
            const gpusHere = Math.min(perNode, allStats.gpuCount - i * perNode);
            return (
              <div key={i} className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4">
                <div className="mb-2 font-mono text-xs text-zinc-400">alan-{i}</div>
                <div className="flex gap-1.5">
                  {Array.from({ length: Math.max(0, gpusHere) }, (_, j) => (
                    <div
                      key={j}
                      className="flex h-10 w-6 items-end justify-center rounded-sm bg-emerald-900 pb-0.5 font-mono text-[9px] text-emerald-400"
                    >
                      24G
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Thermals">
        <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-400">
          {power.thermalNotes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
