import { describe, expect, it } from "vitest";
import {
  getAvenues,
  getClusterState,
  getParts,
  getPhases,
  getPowerConfig,
} from "@/lib/data";
import { PartSchema } from "@/lib/schemas";

describe("data loaders", () => {
  it("loads and validates all seed data files", () => {
    expect(getPhases().length).toBeGreaterThanOrEqual(3);
    expect(getParts().length).toBeGreaterThan(0);
    expect(getPowerConfig().envelopeW).toBe(5000);
    expect(getAvenues().length).toBeGreaterThanOrEqual(5);
    expect(getClusterState().online).toBe(false);
  });

  it("every part references an existing phase", () => {
    const phaseIds = new Set(getPhases().map((p) => p.id));
    for (const part of getParts()) {
      expect(phaseIds.has(part.phaseId)).toBe(true);
    }
  });

  it("every GPU part carries gpu metadata", () => {
    for (const part of getParts().filter((p) => p.category === "gpu")) {
      expect(part.gpu).toBeDefined();
    }
  });

  it("rejects invalid parts", () => {
    const bad = PartSchema.safeParse({ id: "x", name: "no fields" });
    expect(bad.success).toBe(false);
  });
});
