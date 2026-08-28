import type { Mission } from "./schemas";

type Routes = Mission["routes"];
type PerRoute = Mission["tokensPerRouteM"];
type Fp64 = Mission["fp64"];

/** Total local-model search tokens (millions) for one full sweep of all routes. */
export function searchTokensM(routes: Routes, perRoute: PerRoute): number {
  const breadth = routes.substantive * perRoute.breadth;
  const deep = routes.substantive * routes.deepFraction * perRoute.deep;
  return breadth + deep;
}

/** Frontier-model review tokens (millions) for one full sweep. */
export function frontierReviewTokensM(routes: Routes, perRoute: PerRoute): number {
  return routes.substantive * perRoute.frontierReview;
}

export function costUsd(tokensM: number, usdPerMTok: number): number {
  return tokensM * usdPerMTok;
}

/** Days to generate a token volume at a sustained throughput. */
export function sweepDays(tokensM: number, mTokPerDay: number): number {
  return tokensM / mTokPerDay;
}

export function alanElectricityUsd(days: number, clusterKw: number, usdPerKwh: number): number {
  return days * clusterKw * 24 * usdPerKwh;
}

export interface Fp64Campaign {
  totalGpuHours: number;
  cloudUsd: number;
  alanDays: number;
  alanElectricityUsd: number;
}

export interface RentScenario {
  id: "fable5" | "gpt56Sol" | "opus5Batch" | "openCloud";
  label: string;
  cloudUsd: number;
  deltaUsd: number;
}

export interface BuildVsRent {
  capexUsd: number;
  electricityUsd: number;
  alanAllInUsd: number;
  sweepElectricityUsd: number;
  scenarios: RentScenario[];
  tokenBreakEvenSweeps: number;
}

/**
 * All-in cost of building ALAN (BOM capex + V100 box + electricity for one full
 * sweep incl. the FP64 campaign) vs buying the same work as cloud tokens + rented
 * FP64 GPU-hours. Frontier review is excluded — it is paid in every scenario.
 */
export function buildVsRent(m: Mission, bomCapexUsd: number): BuildVsRent {
  const tokensM = searchTokensM(m.routes, m.tokensPerRouteM);
  const combined = m.throughputMTokPerDay.full + m.throughputMTokPerDay.v100Box;
  const sweepElectricityUsd = alanElectricityUsd(
    sweepDays(tokensM, combined),
    m.clusterPowerKw,
    m.electricityUsdPerKwh
  );
  const fp64 = fp64Campaign(m.routes, m.fp64, m.electricityUsdPerKwh);

  const capexUsd = bomCapexUsd + m.fp64.v100BoxUsd;
  const electricityUsd = sweepElectricityUsd + fp64.alanElectricityUsd;
  const alanAllInUsd = capexUsd + electricityUsd;

  const p = m.pricingUsdPerMTok;
  const mk = (id: RentScenario["id"], label: string, perM: number): RentScenario => {
    const cloudUsd = costUsd(tokensM, perM) + fp64.cloudUsd;
    return { id, label, cloudUsd, deltaUsd: cloudUsd - alanAllInUsd };
  };

  return {
    capexUsd,
    electricityUsd,
    alanAllInUsd,
    sweepElectricityUsd,
    scenarios: [
      mk("fable5", "Claude Fable 5 (frontier, standard)", p.fable5),
      mk("gpt56Sol", "GPT-5.6 Sol (frontier)", p.gpt56Sol),
      mk("opus5Batch", "Claude Opus 5 (frontier, batch)", p.opus5Batch),
      mk("openCloud", "Rented GPUs / open-model APIs", p.openCloud),
    ],
    tokenBreakEvenSweeps:
      bomCapexUsd / Math.max(1, costUsd(tokensM, p.openCloud) - sweepElectricityUsd),
  };
}

/** The FP64 certificate campaign: rented cloud GPUs vs an owned V100 box. */
export function fp64Campaign(routes: Routes, fp64: Fp64, usdPerKwh: number): Fp64Campaign {
  const totalGpuHours = routes.numericsRoutes * fp64.gpuHoursPerRoute;
  const boxHours = totalGpuHours / fp64.v100Gpus;
  return {
    totalGpuHours,
    cloudUsd: totalGpuHours * fp64.cloudUsdPerGpuHour,
    alanDays: boxHours / 24,
    alanElectricityUsd: boxHours * fp64.v100PowerKw * usdPerKwh,
  };
}
