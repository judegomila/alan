const COLORS: Record<string, string> = {
  // parts
  researching: "bg-zinc-800 text-zinc-400",
  watching: "bg-sky-950 text-sky-400",
  ordered: "bg-amber-950 text-amber-400",
  installed: "bg-emerald-950 text-emerald-400",
  // phases
  active: "bg-emerald-950 text-emerald-400",
  planned: "bg-zinc-800 text-zinc-400",
  complete: "bg-sky-950 text-sky-400",
  // avenues
  idea: "bg-zinc-800 text-zinc-400",
  paused: "bg-amber-950 text-amber-400",
  promising: "bg-emerald-950 text-emerald-400",
  "dead-end": "bg-red-950 text-red-400",
  // nodes / jobs
  offline: "bg-red-950 text-red-400",
  idle: "bg-sky-950 text-sky-400",
  busy: "bg-emerald-950 text-emerald-400",
  queued: "bg-zinc-800 text-zinc-400",
  running: "bg-emerald-950 text-emerald-400",
  done: "bg-sky-950 text-sky-400",
  failed: "bg-red-950 text-red-400",
};

export function StatusPill({ status }: { status: string }) {
  const color = COLORS[status] ?? "bg-zinc-800 text-zinc-400";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 font-mono text-xs ${color}`}>
      {status}
    </span>
  );
}
