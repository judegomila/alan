import type { Part, PowerConfig } from "./schemas";
import { systemPowerW } from "./power";

export interface MachineStats {
  gpuCount: number;
  vramGb: number;
  fp16Tflops: number;
  worstCasePowerW: number;
  spentUsd: number;
  plannedCostUsd: number;
  nodeCount: number;
}

export function machineStats(
  parts: Part[],
  power: PowerConfig,
  opts: { installedOnly?: boolean } = {}
): MachineStats {
  const included = opts.installedOnly
    ? parts.filter((p) => p.status === "installed")
    : parts;

  const gpus = included.filter((p) => p.gpu !== undefined);
  const gpuCount = gpus.reduce((n, p) => n + p.qty, 0);
  const vramGb = gpus.reduce((n, p) => n + p.qty * (p.gpu?.vramGb ?? 0), 0);
  const fp16Tflops = gpus.reduce((n, p) => n + p.qty * (p.gpu?.fp16Tflops ?? 0), 0);
  const nodeCount = included
    .filter((p) => p.category === "motherboard")
    .reduce((n, p) => n + p.qty, 0);

  const groups = gpus.map((p) => ({
    label: p.name,
    count: p.qty,
    powerLimitW: p.gpu?.powerLimitW ?? 0,
  }));
  const worstCasePowerW = systemPowerW(
    groups,
    nodeCount,
    power.nodeOverheadW,
    power.coolingOverheadW
  );

  const spentUsd = parts.reduce(
    (n, p) => n + (p.paidPriceUsd !== null ? p.qty * p.paidPriceUsd : 0),
    0
  );
  const plannedCostUsd = parts.reduce(
    (n, p) => n + p.qty * (p.paidPriceUsd ?? p.targetPriceUsd),
    0
  );

  return { gpuCount, vramGb, fp16Tflops, worstCasePowerW, spentUsd, plannedCostUsd, nodeCount };
}

export function partsForPhases(parts: Part[], phaseIds: string[]): Part[] {
  const ids = new Set(phaseIds);
  return parts.filter((p) => ids.has(p.phaseId));
}

export function estTokensPerSec(memBandwidthGBs: number, modelGb: number): number {
  return Math.round((0.5 * memBandwidthGBs / modelGb) * 10) / 10;
}

export function modelClassFor(vramGb: number): string {
  if (vramGb < 48) return "up to 32B FP16, 70B at Q4";
  if (vramGb < 150) return "70B at Q8, plus parallel 8-32B searchers";
  if (vramGb < 400) return "120B-class FP16, or 400B-class at Q4";
  return "frontier-scale models, quantized";
}
