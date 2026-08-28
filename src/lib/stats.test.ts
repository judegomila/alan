import { describe, expect, it } from "vitest";
import type { Part, PowerConfig } from "@/lib/schemas";
import { estTokensPerSec, machineStats, modelClassFor, partsForPhases } from "@/lib/stats";

const gpuMeta = { vramGb: 24, fp16Tflops: 35.6, tdpW: 350, powerLimitW: 250, memBandwidthGBs: 936 };

const parts: Part[] = [
  {
    id: "gpu-a", phaseId: "phase-0", name: "3090", category: "gpu", qty: 4,
    targetPriceUsd: 750, paidPriceUsd: 700, status: "installed", gpu: gpuMeta,
  },
  {
    id: "gpu-b", phaseId: "phase-1", name: "3090", category: "gpu", qty: 8,
    targetPriceUsd: 750, paidPriceUsd: null, status: "researching", gpu: gpuMeta,
  },
  {
    id: "mobo-a", phaseId: "phase-0", name: "H12SSL", category: "motherboard", qty: 1,
    targetPriceUsd: 520, paidPriceUsd: 500, status: "installed",
  },
  {
    id: "mobo-b", phaseId: "phase-1", name: "node kit", category: "motherboard", qty: 2,
    targetPriceUsd: 1700, paidPriceUsd: null, status: "researching",
  },
];

const power: PowerConfig = {
  envelopeW: 10000, nodeOverheadW: 350, coolingOverheadW: 200, notes: [], thermalNotes: [],
  thermalDesign: [],
};

describe("machineStats", () => {
  it("rolls up all planned parts by default", () => {
    const s = machineStats(parts, power);
    expect(s.gpuCount).toBe(12);
    expect(s.vramGb).toBe(288);
    expect(s.fp16Tflops).toBeCloseTo(427.2);
    expect(s.nodeCount).toBe(3);
    // 12*250 + 3*350 + 200
    expect(s.worstCasePowerW).toBe(4250);
    // spent: 4*700 + 1*500
    expect(s.spentUsd).toBe(3300);
    // planned: paid where known else target — 4*700 + 8*750 + 500 + 2*1700
    expect(s.plannedCostUsd).toBe(12700);
  });

  it("filters to installed parts only", () => {
    const s = machineStats(parts, power, { installedOnly: true });
    expect(s.gpuCount).toBe(4);
    expect(s.vramGb).toBe(96);
    expect(s.nodeCount).toBe(1);
  });
});

describe("helpers", () => {
  it("filters parts by phase", () => {
    expect(partsForPhases(parts, ["phase-0"]).map((p) => p.id)).toEqual(["gpu-a", "mobo-a"]);
  });

  it("estimates tokens/sec", () => {
    expect(estTokensPerSec(936, 40)).toBeCloseTo(11.7);
  });

  it("labels model class by VRAM", () => {
    expect(modelClassFor(24)).toContain("32B");
    expect(modelClassFor(96)).toContain("70B");
    expect(modelClassFor(288)).toContain("Q4");
  });
});
