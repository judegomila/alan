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
  thermalDesign: z.array(z.object({ title: z.string(), body: z.string() })),
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

export const WorkloadSchema = z.object({
  id: z.string(),
  title: z.string(),
  zetaSections: z.array(z.string()),
  hardware: z.string(),
  why: z.string(),
});

export const MissionSchema = z.object({
  zetaExplorerUrl: z.string().url(),
  routes: z.object({
    total: z.number().int().positive(),
    substantive: z.number().int().positive(),
    deepFraction: z.number().min(0).max(1),
    numericsRoutes: z.number().int().nonnegative(),
  }),
  tokensPerRouteM: z.object({
    breadth: z.number().positive(),
    deep: z.number().positive(),
    frontierReview: z.number().positive(),
  }),
  fp64: z.object({
    gpuHoursPerRoute: z.number().positive(),
    cloudUsdPerGpuHour: z.number().positive(),
    v100Gpus: z.number().int().positive(),
    v100PowerKw: z.number().positive(),
    v100BoxUsd: z.number().positive(),
  }),
  pricingUsdPerMTok: z.object({
    fable5: z.number().positive(),
    opus5Batch: z.number().positive(),
    gpt56Sol: z.number().positive(),
    openCloud: z.number().positive(),
  }),
  electricityUsdPerKwh: z.number().positive(),
  clusterPowerKw: z.number().positive(),
  throughputMTokPerDay: z.object({
    phase0: z.number().positive(),
    full: z.number().positive(),
    v100Box: z.number().positive(),
  }),
});

export const StackSchema = z.object({
  pools: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      vramGb: z.number().positive(),
      note: z.string().optional(),
    })
  ),
  models: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      kind: z.enum(["local", "external"]),
      params: z.string(),
      quant: z.string().optional(),
      weightsGb: z.number().positive().nullable(),
      role: z.string(),
      runtime: z.string(),
      license: z.string().optional(),
      costNote: z.string().optional(),
      link: z.string().url(),
      status: z.enum(["planned", "testing", "deployed"]),
      notes: z.string().optional(),
    })
  ),
  layers: z.array(
    z.object({
      name: z.string(),
      tech: z.string(),
      runsOn: z.string(),
      purpose: z.string(),
    })
  ),
  pipelines: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      stages: z.array(z.object({ step: z.string(), who: z.string() })),
      verifier: z.string(),
      output: z.string(),
    })
  ),
  rules: z.array(z.object({ rule: z.string(), why: z.string() })),
});

export type Stack = z.infer<typeof StackSchema>;
export type StackPool = Stack["pools"][number];
export type StackModel = Stack["models"][number];
export type Workload = z.infer<typeof WorkloadSchema>;
export type Mission = z.infer<typeof MissionSchema>;
export type Phase = z.infer<typeof PhaseSchema>;
export type GpuMeta = z.infer<typeof GpuMetaSchema>;
export type Part = z.infer<typeof PartSchema>;
export type PowerConfig = z.infer<typeof PowerConfigSchema>;
export type Avenue = z.infer<typeof AvenueSchema>;
export type ClusterState = z.infer<typeof ClusterStateSchema>;
