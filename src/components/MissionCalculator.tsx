"use client";

import { useState } from "react";
import type { Mission } from "@/lib/schemas";
import {
  alanElectricityUsd,
  costUsd,
  frontierReviewTokensM,
  searchTokensM,
  sweepDays,
} from "@/lib/mission";

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className="font-mono text-zinc-400">
          {value.toLocaleString()} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-amber-400"
      />
    </div>
  );
}

function usd(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

export function MissionCalculator({ mission }: { mission: Mission }) {
  const [substantive, setSubstantive] = useState(mission.routes.substantive);
  const [breadth, setBreadth] = useState(mission.tokensPerRouteM.breadth);
  const [deep, setDeep] = useState(mission.tokensPerRouteM.deep);
  const [throughput, setThroughput] = useState(
    mission.throughputMTokPerDay.full + mission.throughputMTokPerDay.v100Box
  );

  const routes = { ...mission.routes, substantive };
  const perRoute = { ...mission.tokensPerRouteM, breadth, deep };
  const tokensM = searchTokensM(routes, perRoute);
  const reviewM = frontierReviewTokensM(routes, perRoute);
  const days = sweepDays(tokensM, throughput);
  const power = alanElectricityUsd(days, mission.clusterPowerKw, mission.electricityUsdPerKwh);
  const p = mission.pricingUsdPerMTok;

  const rows = [
    { label: "Claude Fable 5 (frontier, standard)", cost: costUsd(tokensM, p.fable5) },
    { label: "GPT-5.6 Sol (frontier)", cost: costUsd(tokensM, p.gpt56Sol) },
    { label: "Claude Opus 5 (frontier, batch)", cost: costUsd(tokensM, p.opus5Batch) },
    { label: "Rented cloud GPUs / open-model APIs", cost: costUsd(tokensM, p.openCloud) },
  ];

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
      <Slider
        label="Substantive routes to explore"
        value={substantive}
        min={20}
        max={400}
        step={5}
        unit="routes"
        onChange={setSubstantive}
      />
      <Slider
        label="Breadth pass per route"
        value={breadth}
        min={1}
        max={50}
        step={1}
        unit="M tok"
        onChange={setBreadth}
      />
      <Slider
        label="Deep pass per surviving route"
        value={deep}
        min={10}
        max={300}
        step={5}
        unit="M tok"
        onChange={setDeep}
      />
      <Slider
        label="ALAN sustained throughput"
        value={throughput}
        min={10}
        max={250}
        step={5}
        unit="M tok/day"
        onChange={setThroughput}
      />

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-md border border-zinc-800 p-3">
          <div className="text-xs uppercase tracking-wider text-zinc-500">Sweep volume</div>
          <div className="mt-1 font-mono text-xl font-bold text-zinc-100">
            {(tokensM / 1000).toFixed(1)}B tok
          </div>
          <div className="text-xs text-zinc-500">+ {Math.round(reviewM)}M frontier review</div>
        </div>
        <div className="rounded-md border border-emerald-900 p-3">
          <div className="text-xs uppercase tracking-wider text-emerald-500">Time on ALAN</div>
          <div className="mt-1 font-mono text-xl font-bold text-emerald-400">
            {days.toFixed(0)} days
          </div>
          <div className="text-xs text-zinc-500">≈ {usd(power)} electricity</div>
        </div>
        <div className="rounded-md border border-zinc-800 p-3">
          <div className="text-xs uppercase tracking-wider text-zinc-500">Frontier review cost</div>
          <div className="mt-1 font-mono text-xl font-bold text-zinc-100">
            {usd(costUsd(reviewM, p.opus5Batch))}–{usd(costUsd(reviewM, p.fable5))}
          </div>
          <div className="text-xs text-zinc-500">Opus 5 batch → Fable 5</div>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
          Same sweep bought as cloud tokens
        </div>
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between border-t border-zinc-800/60 py-2 text-sm"
          >
            <span className="text-zinc-400">{r.label}</span>
            <span className="font-mono text-zinc-100">{usd(r.cost)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-zinc-700 py-2 text-sm">
          <span className="font-bold text-emerald-400">ALAN (electricity only)</span>
          <span className="font-mono font-bold text-emerald-400">{usd(power)}</span>
        </div>
      </div>
    </div>
  );
}
