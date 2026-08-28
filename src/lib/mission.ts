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
