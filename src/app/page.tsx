import Link from "next/link";
import { StatCard } from "@/components/StatCard";
import { StatusPill } from "@/components/StatusPill";
import { getParts, getPhases, getPowerConfig } from "@/lib/data";
import { machineStats } from "@/lib/stats";

export default function Home() {
  const phases = getPhases();
  const parts = getParts();
  const power = getPowerConfig();
  const planned = machineStats(parts, power);
  const current = phases.find((p) => p.status === "active") ?? phases[0];

  return (
    <div>
      <p className="font-mono text-sm text-amber-400">a DIY supercomputer for the Riemann Hypothesis</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-100">ALAN</h1>
      <div className="mt-6 max-w-2xl space-y-4 leading-relaxed">
        <p>
          In 1950, Alan Turing used the Manchester Mark 1 — one of the first computers on Earth — to
          hunt for zeros of the Riemann zeta function. He got to a few over a thousand before the
          machine gave out.
        </p>
        <p>
          ALAN picks up the thread: a phased cluster built from used datacenter parts off eBay,
          running local AI models around the clock to attack the Riemann Hypothesis from many
          directions at once — operator searches, positivity criteria, large-scale numerics, and
          conjecture mining — in tight human/AI collaboration.
        </p>
        <p>
          It runs on a 10 kW home power envelope (dedicated 240 V circuits, 5 kW solar + battery
          behind it), scales in phases where each
          phase must earn the next, and everything about it — the parts list, the power budget, the
          research avenues — lives in the open in this site&apos;s repo.
        </p>
      </div>

      <div className="mt-10 flex items-center gap-3">
        <span className="text-sm text-zinc-500">Current phase:</span>
        <span className="font-mono font-bold text-zinc-100">{current.name}</span>
        <StatusPill status={current.status} />
        <span className="text-sm text-zinc-500">{current.summary}</span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Planned VRAM" value={`${planned.vramGb} GB`} sub={`${planned.gpuCount} GPUs`} />
        <StatCard label="Planned FP16" value={`${Math.round(planned.fp16Tflops)} TFLOPS`} />
        <StatCard
          label="Worst-case power"
          value={`${(planned.worstCasePowerW / 1000).toFixed(1)} kW`}
          sub={`of ${(power.envelopeW / 1000).toFixed(1)} kW envelope`}
        />
        <StatCard
          label="Spent so far"
          value={`$${planned.spentUsd.toLocaleString()}`}
          sub={`$${planned.plannedCostUsd.toLocaleString()} full plan`}
        />
      </div>

      <div className="mt-10 flex gap-4 text-sm">
        <Link href="/machine" className="rounded-md bg-amber-400 px-4 py-2 font-bold text-zinc-950 hover:bg-amber-300">
          The Machine
        </Link>
        <Link href="/research" className="rounded-md border border-zinc-700 px-4 py-2 text-zinc-300 hover:border-zinc-500">
          The Research
        </Link>
      </div>
    </div>
  );
}
