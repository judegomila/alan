export interface GpuGroup {
  label: string;
  count: number;
  powerLimitW: number;
}

export function gpuPowerW(groups: GpuGroup[]): number {
  return groups.reduce((sum, g) => sum + g.count * g.powerLimitW, 0);
}

export function systemPowerW(
  groups: GpuGroup[],
  nodeCount: number,
  nodeOverheadW: number,
  coolingOverheadW: number
): number {
  return gpuPowerW(groups) + nodeCount * nodeOverheadW + coolingOverheadW;
}

export function headroomW(envelopeW: number, drawW: number): number {
  return envelopeW - drawW;
}

export function wattsToBtuHr(watts: number): number {
  return Math.round(watts * 3.412);
}
