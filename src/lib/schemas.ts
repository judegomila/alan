import { z } from "zod";

export const PhaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  budgetUsd: z.number().positive(),
  status: z.enum(["active", "planned", "complete"]),
  summary: z.string(),
  goals: z.array(z.string()),
  exitCriteria: z.array(z.string()),
});

export const GpuMetaSchema = z.object({
  vramGb: z.number().positive(),
  fp16Tflops: z.number().positive(),
  tdpW: z.number().positive(),
  powerLimitW: z.number().positive(),
  memBandwidthGBs: z.number().positive(),
});

export const PartSchema = z.object({
  id: z.string(),
  phaseId: z.string(),
  name: z.string(),
  category: z.enum([
    "gpu",
    "cpu",
    "motherboard",
    "memory",
    "storage",
    "psu",
    "network",
    "chassis",
    "cooling",
    "other",
  ]),
  qty: z.number().int().positive(),
  targetPriceUsd: z.number().nonnegative(),
  paidPriceUsd: z.number().nonnegative().nullable(),
  status: z.enum(["researching", "watching", "ordered", "installed"]),
  notes: z.string().optional(),
  link: z.string().url().optional(),
  gpu: GpuMetaSchema.optional(),
});

export const PowerConfigSchema = z.object({
  envelopeW: z.number().positive(),
  nodeOverheadW: z.number().positive(),
  coolingOverheadW: z.number().nonnegative(),
  notes: z.array(z.string()),
  thermalNotes: z.array(z.string()),
});

export const AvenueSchema = z.object({
  id: z.string(),
  name: z.string(),
  structure: z.string(),
  approach: z.enum(["proof-search", "numerical", "conjecture-mining"]),
  status: z.enum(["idea", "active", "paused", "promising", "dead-end"]),
  models: z.array(z.string()),
  links: z.array(z.object({ label: z.string(), url: z.string().url() })),
  notes: z.string().optional(),
});

export const ClusterStateSchema = z.object({
  updated: z.string(),
  online: z.boolean(),
  nodes: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      status: z.enum(["planned", "offline", "idle", "busy"]),
      gpus: z.number().int().nonnegative(),
      note: z.string().optional(),
    })
  ),
  jobs: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      avenueId: z.string(),
      state: z.enum(["queued", "running", "done", "failed"]),
    })
  ),
});

export type Phase = z.infer<typeof PhaseSchema>;
export type GpuMeta = z.infer<typeof GpuMetaSchema>;
export type Part = z.infer<typeof PartSchema>;
export type PowerConfig = z.infer<typeof PowerConfigSchema>;
export type Avenue = z.infer<typeof AvenueSchema>;
export type ClusterState = z.infer<typeof ClusterStateSchema>;
