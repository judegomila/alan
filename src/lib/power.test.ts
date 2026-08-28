import { describe, expect, it } from "vitest";
import { gpuPowerW, headroomW, systemPowerW, wattsToBtuHr } from "@/lib/power";

describe("power math", () => {
  const groups = [{ label: "RTX 3090", count: 12, powerLimitW: 250 }];

  it("sums GPU power across groups", () => {
    expect(gpuPowerW(groups)).toBe(3000);
    expect(gpuPowerW([])).toBe(0);
  });

  it("adds node and cooling overheads", () => {
    expect(systemPowerW(groups, 3, 350, 200)).toBe(3000 + 1050 + 200);
  });

  it("computes headroom, negative when over", () => {
    expect(headroomW(5000, 4250)).toBe(750);
    expect(headroomW(5000, 5600)).toBe(-600);
  });

  it("converts watts to BTU/hr", () => {
    expect(wattsToBtuHr(1000)).toBe(3412);
    expect(wattsToBtuHr(4250)).toBe(14501);
  });
});
