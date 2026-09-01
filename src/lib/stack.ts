import type { StackPool } from "./schemas";

/** KV-cache/activation headroom on top of raw weight size. */
const HEADROOM = 1.15;

/** Smallest VRAM pool that holds the weights plus headroom, or undefined. */
export function smallestPool(weightsGb: number, pools: StackPool[]): StackPool | undefined {
  return [...pools]
    .sort((a, b) => a.vramGb - b.vramGb)
    .find((p) => p.vramGb >= weightsGb * HEADROOM);
}
