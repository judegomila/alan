import { describe, expect, it } from "vitest";
import {
  alanElectricityUsd,
  buildVsRent,
  costUsd,
  fp64Campaign,
  frontierReviewTokensM,
  searchTokensM,
  sweepDays,
} from "@/lib/mission";
import type { Mission } from "@/lib/schemas";

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
    const fp64 = {
      gpuHoursPerRoute: 800, cloudUsdPerGpuHour: 1.5, v100Gpus: 8, v100PowerKw: 3.0,
      v100BoxUsd: 6000,
    };
    const c = fp64Campaign(routes, fp64, 0.2);
    expect(c.totalGpuHours).toBe(24000);
    expect(c.cloudUsd).toBe(36000);
    expect(c.alanDays).toBe(125);
    expect(c.alanElectricityUsd).toBeCloseTo(1800);
  });

  it("computes build-vs-rent all-in delta from a BOM capex figure", () => {
    const mission: Mission = {
      zetaExplorerUrl: "https://zetaexplorer.vercel.app/",
      routes,
      tokensPerRouteM: perRoute,
      fp64: {
        gpuHoursPerRoute: 800, cloudUsdPerGpuHour: 1.5, v100Gpus: 8, v100PowerKw: 3.0,
        v100BoxUsd: 6000,
      },
      pricingUsdPerMTok: { fable5: 50, opus5Batch: 12.5, gpt56Sol: 30, openCloud: 1.0 },
      electricityUsdPerKwh: 0.2,
      clusterPowerKw: 4.3,
      throughputMTokPerDay: { phase0: 25, full: 80, v100Box: 30 },
    };
    const r = buildVsRent(mission, 15610);
    expect(r.capexUsd).toBe(21610); // BOM + V100 box
    expect(r.electricityUsd).toBeCloseTo(2582.4, 0); // sweep 782.4 + fp64 1800
    expect(r.alanAllInUsd).toBeCloseTo(24192.4, 0);
    const fable = r.scenarios.find((s) => s.id === "fable5")!;
    expect(fable.cloudUsd).toBeCloseTo(244500);
    expect(fable.deltaUsd).toBeCloseTo(220307.6, 0);
    const cheap = r.scenarios.find((s) => s.id === "openCloud")!;
    expect(cheap.cloudUsd).toBeCloseTo(40170);
    expect(cheap.deltaUsd).toBeCloseTo(15977.6, 0);
    // token-work break-even: LLM capex / (cloud sweep - sweep electricity)
    expect(r.tokenBreakEvenSweeps).toBeCloseTo(15610 / (4170 - 782.4), 1);
  });
});
