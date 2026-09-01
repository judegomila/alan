import { describe, expect, it } from "vitest";
import { smallestPool } from "@/lib/stack";

const pools = [
  { id: "one-3090", name: "one 3090", vramGb: 24 },
  { id: "node", name: "one node", vramGb: 96 },
  { id: "v100-box", name: "V100 box", vramGb: 256 },
  { id: "fleet", name: "fleet", vramGb: 288 },
  { id: "everything", name: "everything", vramGb: 544 },
];

describe("smallestPool", () => {
  it("finds the smallest pool with 15% KV headroom", () => {
    expect(smallestPool(160, pools)?.id).toBe("v100-box"); // 184 needed
    expect(smallestPool(18, pools)?.id).toBe("one-3090"); // 20.7 needed
    expect(smallestPool(20, pools)?.id).toBe("one-3090"); // 23 needed
    expect(smallestPool(300, pools)?.id).toBe("everything"); // 345 needed
  });

  it("returns undefined when nothing fits", () => {
    expect(smallestPool(800, pools)).toBeUndefined();
  });
});
