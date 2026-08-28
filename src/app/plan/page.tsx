import { MissionCalculator } from "@/components/MissionCalculator";
import { Section } from "@/components/Section";
import { StatCard } from "@/components/StatCard";
import { getMission, getParts, getPowerConfig, getWorkloads } from "@/lib/data";
import {
  alanElectricityUsd,
  buildVsRent,
  costUsd,
  fp64Campaign,
  frontierReviewTokensM,
  searchTokensM,
  sweepDays,
} from "@/lib/mission";
import { machineStats } from "@/lib/stats";

export const metadata = { title: "Mission Plan — ALAN" };

function usd(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

export default function PlanPage() {
  const mission = getMission();
  const workloads = getWorkloads();

  const tokensM = searchTokensM(mission.routes, mission.tokensPerRouteM);
  const reviewM = frontierReviewTokensM(mission.routes, mission.tokensPerRouteM);
  const t = mission.throughputMTokPerDay;
  const combined = t.full + t.v100Box;
  const daysCombined = sweepDays(tokensM, combined);
  const fp64 = fp64Campaign(mission.routes, mission.fp64, mission.electricityUsdPerKwh);
  const p = mission.pricingUsdPerMTok;
  const bomCapex = machineStats(getParts(), getPowerConfig()).plannedCostUsd;
  const bvr = buildVsRent(mission, bomCapex);

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-zinc-100">Mission Plan</h1>
      <p className="mb-8 max-w-2xl text-sm text-zinc-400">
        The research program lives at{" "}
        <a href={mission.zetaExplorerUrl} className="text-amber-400 hover:underline">
          Zeta Explorer ↗
        </a>{" "}
        — {mission.routes.total} routes, of which ~{mission.routes.substantive} are substantive
        attack avenues. This page maps that program onto hardware and prices one full sweep of
        every route: cloud dollars vs ALAN days. All assumptions are editable in{" "}
        <span className="font-mono text-xs">data/mission.json</span> and will be tightened as real
        throughput numbers arrive.
      </p>

      <Section title="Workload map — what runs where">
        <div className="grid gap-4 md:grid-cols-2">
          {workloads.map((w) => (
            <div key={w.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
              <h3 className="font-bold text-zinc-100">{w.title}</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {w.zetaSections.map((s) => (
                  <span
                    key={s}
                    className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-400"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-sm text-amber-400/90">{w.hardware}</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{w.why}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="One full sweep — headline numbers">
        <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Sweep volume"
            value={`${(tokensM / 1000).toFixed(1)}B tok`}
            sub={`${mission.routes.substantive} routes, breadth + deep`}
          />
          <StatCard
            label="On ALAN"
            value={`${Math.round(daysCombined)} days`}
            sub={`at ${combined}M tok/day, ≈ ${usd(
              alanElectricityUsd(daysCombined, mission.clusterPowerKw, mission.electricityUsdPerKwh)
            )} power`}
          />
          <StatCard
            label="Same tokens on Fable 5"
            value={usd(costUsd(tokensM, p.fable5))}
            sub={`Opus 5 batch: ${usd(costUsd(tokensM, p.opus5Batch))}`}
          />
          <StatCard
            label="Frontier review layer"
            value={usd(costUsd(reviewM, p.opus5Batch))}
            sub={`${Math.round(reviewM)}M tok on Opus 5 batch`}
          />
        </div>
        <p className="max-w-2xl text-sm text-zinc-400">
          Phase 0 alone ({t.phase0}M tok/day) takes ~{Math.round(sweepDays(tokensM, t.phase0))}{" "}
          days for the same sweep; the full 12-GPU fleet ({t.full}M/day) takes ~
          {Math.round(sweepDays(tokensM, t.full))}; adding the V100 box brings it to ~
          {Math.round(daysCombined)}. And a sweep is not one-and-done — the improvement queue
          reruns routes as bounds tighten, which is what makes owning the machine compound.
        </p>
      </Section>

      <Section title="Explore the economics">
        <MissionCalculator mission={mission} />
      </Section>

      <Section title="Build vs rent — the cost delta">
        <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="ALAN capex"
            value={usd(bvr.capexUsd)}
            sub={`full BOM ${usd(bomCapex)} + V100 box ${usd(mission.fp64.v100BoxUsd)}`}
          />
          <StatCard
            label="Sweep electricity"
            value={usd(bvr.electricityUsd)}
            sub="LLM sweep + FP64 campaign"
          />
          <StatCard label="ALAN all-in" value={usd(bvr.alanAllInUsd)} sub="machine included" />
          <StatCard
            label="Best-case saving"
            value={usd(bvr.scenarios[0].deltaUsd)}
            sub="vs frontier-quality cloud"
          />
        </div>
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-3">Same sweep bought on cloud (tokens + FP64 rental)</th>
                <th className="px-4 py-3">Cloud cost</th>
                <th className="px-4 py-3">Delta vs ALAN all-in</th>
              </tr>
            </thead>
            <tbody>
              {bvr.scenarios.map((s) => (
                <tr key={s.id} className="border-t border-zinc-800/60">
                  <td className="px-4 py-3 text-zinc-300">{s.label}</td>
                  <td className="px-4 py-3 font-mono text-zinc-100">{usd(s.cloudUsd)}</td>
                  <td
                    className={`px-4 py-3 font-mono font-bold ${
                      s.deltaUsd > 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {s.deltaUsd > 0 ? `ALAN saves ${usd(s.deltaUsd)}` : `cloud saves ${usd(-s.deltaUsd)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-2xl text-sm text-zinc-400">
          Every scenario includes the {usd(fp64.cloudUsd)} FP64 rental on the cloud side, and the
          frontier review layer is excluded because it is paid identically in both worlds. Even in
          the most cloud-favorable case, ALAN pays for itself — hardware included — inside the
          first sweep. On token work alone (no FP64 campaign), break-even arrives after ~
          {Math.ceil(bvr.tokenBreakEvenSweeps)} sweeps; and a sweep is never one-and-done — each
          rerun from the improvement queue costs the cloud price again, but only ~
          {usd(bvr.sweepElectricityUsd)} of electricity on ALAN.
        </p>
      </Section>

      <Section title="The FP64 certificate campaign">
        <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Campaign size"
            value={`${fp64.totalGpuHours.toLocaleString()} GPU-hrs`}
            sub={`${mission.routes.numericsRoutes} numerics routes × ${mission.fp64.gpuHoursPerRoute} hrs`}
          />
          <StatCard label="Rented on cloud" value={usd(fp64.cloudUsd)} sub="A100/V100-class rental" />
          <StatCard
            label="On owned V100 box"
            value={`${Math.round(fp64.alanDays)} days`}
            sub={`8x V100 SXM2, ~$6k used`}
          />
          <StatCard
            label="V100 box electricity"
            value={usd(fp64.alanElectricityUsd)}
            sub="runs alongside the 3090 fleet"
          />
        </div>
        <p className="max-w-2xl text-sm text-zinc-400">
          The Λ-bound and H_t corridor-certificate campaigns are FP64 interval arithmetic, where
          gaming GPUs collapse (0.55 TFLOPS per 3090) and a used 8x V100 SXM2 server delivers 62
          TFLOPS — ten times the whole 3090 fleet. Owning the box turns a{" "}
          {usd(fp64.cloudUsd)} cloud line item into ~$6k of capex plus{" "}
          {usd(fp64.alanElectricityUsd)} of electricity, and it stays useful for every future
          certificate run.
        </p>
      </Section>
    </div>
  );
}
