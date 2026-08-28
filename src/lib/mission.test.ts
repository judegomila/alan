import { describe, expect, it } from "vitest";
import {
  alanElectricityUsd,
  costUsd,
  fp64Campaign,
  frontierReviewTokensM,
  searchTokensM,
  sweepDays,
} from "@/lib/mission";

// Mirrors data/mission.json seed values
const routes = { total: 560, substantive: 120, deepFraction: 0.33, numericsRoutes: 30 };
const perRoute = { breadth: 10, deep: 75, frontierReview: 1.5 };

describe("mission economics", () => {
  it("computes total search tokens across breadth and deep tiers", () => {
    // 120*10 + 120*0.33*75 = 1200 + 2970 = 4170M
    expect(searchTokensM(routes, perRoute)).toBeCloseTo(4170);
  });

  it("computes frontier review tokens", () => {
    expect(frontierReviewTokensM(routes, perRoute)).toBeCloseTo(180);
  });

  it("computes token costs", () => {
    expect(costUsd(4170, 12.5)).toBeCloseTo(52125);
    expect(costUsd(4170, 50)).toBeCloseTo(208500);
  });

  it("computes sweep duration in days", () => {
    expect(sweepDays(4170, 80)).toBeCloseTo(52.1, 1);
    expect(sweepDays(4170, 110)).toBeCloseTo(37.9, 1);
  });

  it("computes electricity for a sweep", () => {
    // 52 days * 4.3 kW * 24 h * $0.20 = $1073.28
    expect(alanElectricityUsd(52, 4.3, 0.2)).toBeCloseTo(1073.28);
  });

  it("computes the FP64 campaign on cloud vs owned V100 box", () => {
    const fp64 = { gpuHoursPerRoute: 800, cloudUsdPerGpuHour: 1.5, v100Gpus: 8, v100PowerKw: 3.0 };
    const c = fp64Campaign(routes, fp64, 0.2);
    expect(c.totalGpuHours).toBe(24000);
    expect(c.cloudUsd).toBe(36000);
    expect(c.alanDays).toBe(125);
    expect(c.alanElectricityUsd).toBeCloseTo(1800);
  });
});
