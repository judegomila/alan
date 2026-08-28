import { Section } from "@/components/Section";
import { StatusPill } from "@/components/StatusPill";
import { getAvenues, getClusterState } from "@/lib/data";

export const metadata = { title: "Mission Control — ALAN" };

export default function ControlPage() {
  const state = getClusterState();
  const avenueName = new Map(getAvenues().map((a) => [a.id, a.name]));

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-zinc-100">Mission Control</h1>
      <p className="mb-8 max-w-2xl text-sm text-zinc-400">
        {state.online
          ? "ALAN is online."
          : "ALAN is not yet powered on — this console reads a static state file and will switch to live telemetry when the Phase 0 node boots."}{" "}
        <span className="font-mono text-xs text-zinc-500">last updated {state.updated}</span>
      </p>

      <Section title="Nodes">
        <div className="grid gap-4 md:grid-cols-2">
          {state.nodes.map((node) => (
            <div key={node.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-zinc-100">{node.name}</span>
                <StatusPill status={node.status} />
              </div>
              <div className="mt-2 font-mono text-sm text-zinc-400">{node.gpus} GPUs</div>
              {node.note ? <p className="mt-2 text-xs text-zinc-500">{node.note}</p> : null}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Job queue">
        {state.jobs.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-800 p-6 text-center text-sm text-zinc-500">
            No jobs yet. The queue fills when the first avenue experiments are scheduled.
          </p>
        ) : (
          <div className="space-y-2">
            {state.jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3"
              >
                <div>
                  <div className="text-sm text-zinc-200">{job.title}</div>
                  <div className="text-xs text-zinc-500">
                    {avenueName.get(job.avenueId) ?? job.avenueId}
                  </div>
                </div>
                <StatusPill status={job.state} />
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
