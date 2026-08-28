"use client";

import { useState } from "react";
import { headroomW, systemPowerW } from "@/lib/power";

export interface CalcGroup {
  label: string;
  count: number;
  powerLimitW: number;
  maxTdpW: number;
  maxCount: number;
}

interface Props {
  initialGroups: CalcGroup[];
  nodeCount: number;
  nodeOverheadW: number;
  coolingOverheadW: number;
  envelopeW: number;
}

export function PowerCalculator(props: Props) {
  const [groups, setGroups] = useState(props.initialGroups);
  const [nodes, setNodes] = useState(props.nodeCount);

  const draw = systemPowerW(groups, nodes, props.nodeOverheadW, props.coolingOverheadW);
  const headroom = headroomW(props.envelopeW, draw);
  const pct = Math.min(100, (draw / props.envelopeW) * 100);
  const over = headroom < 0;

  function update(i: number, patch: Partial<CalcGroup>) {
    setGroups((gs) => gs.map((g, j) => (j === i ? { ...g, ...patch } : g)));
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
      {groups.map((g, i) => (
        <div key={g.label + i} className="mb-4">
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-zinc-300">{g.label}</span>
            <span className="font-mono text-zinc-400">
              {g.count}× @ {g.powerLimitW} W
            </span>
          </div>
          <div className="flex gap-4">
            <label className="flex flex-1 items-center gap-2 text-xs text-zinc-500">
              count
              <input
                type="range"
                min={0}
                max={g.maxCount}
                value={g.count}
                onChange={(e) => update(i, { count: Number(e.target.value) })}
                className="flex-1 accent-amber-400"
              />
            </label>
            <label className="flex flex-1 items-center gap-2 text-xs text-zinc-500">
              limit
              <input
                type="range"
                min={100}
                max={g.maxTdpW}
                step={10}
                value={g.powerLimitW}
                onChange={(e) => update(i, { powerLimitW: Number(e.target.value) })}
                className="flex-1 accent-amber-400"
              />
            </label>
          </div>
        </div>
      ))}

      <div className="mb-4">
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-zinc-300">Nodes ({props.nodeOverheadW} W overhead each)</span>
          <span className="font-mono text-zinc-400">{nodes}</span>
        </div>
        <input
          type="range"
          min={1}
          max={8}
          value={nodes}
          onChange={(e) => setNodes(Number(e.target.value))}
          className="w-full accent-amber-400"
        />
      </div>

      <div className="mt-6">
        <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
          <div
            className={`h-full ${over ? "bg-red-500" : "bg-emerald-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between font-mono text-sm">
          <span className={over ? "text-red-400" : "text-zinc-200"}>
            {(draw / 1000).toFixed(2)} kW draw
          </span>
          <span className={over ? "text-red-400" : "text-emerald-400"}>
            {over ? `${(-headroom / 1000).toFixed(2)} kW OVER — industrial site` : `${(headroom / 1000).toFixed(2)} kW headroom`}
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Includes {props.coolingOverheadW} W cooling overhead. Envelope {(props.envelopeW / 1000).toFixed(1)} kW.
        </p>
      </div>
    </div>
  );
}
