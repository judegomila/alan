import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import {
  AvenueSchema,
  ClusterStateSchema,
  MissionSchema,
  PartSchema,
  PhaseSchema,
  PowerConfigSchema,
  StackSchema,
  WorkloadSchema,
} from "./schemas";

function loadJson<S extends z.ZodTypeAny>(file: string, schema: S): z.infer<S> {
  const raw = readFileSync(join(process.cwd(), "data", file), "utf8");
  const result = schema.safeParse(JSON.parse(raw));
  if (!result.success) {
    throw new Error(`Invalid data in data/${file}: ${result.error.message}`);
  }
  return result.data;
}

export const getPhases = () => loadJson("phases.json", z.array(PhaseSchema));
export const getParts = () => loadJson("bom.json", z.array(PartSchema));
export const getPowerConfig = () => loadJson("power.json", PowerConfigSchema);
export const getAvenues = () => loadJson("avenues.json", z.array(AvenueSchema));
export const getClusterState = () => loadJson("cluster-state.json", ClusterStateSchema);
export const getMission = () => loadJson("mission.json", MissionSchema);
export const getWorkloads = () => loadJson("workloads.json", z.array(WorkloadSchema));
export const getStack = () => loadJson("stack.json", StackSchema);
