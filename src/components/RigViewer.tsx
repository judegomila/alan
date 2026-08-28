"use client";

import dynamic from "next/dynamic";

const RigModel = dynamic(() => import("./RigModel").then((m) => m.RigModel), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center font-mono text-sm text-zinc-500">
      loading 3D rig…
    </div>
  ),
});

export function RigViewer({ gpusPerNode }: { gpusPerNode: number[] }) {
  return (
    <div className="h-80 w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 md:h-96">
      <RigModel gpusPerNode={gpusPerNode} />
    </div>
  );
}
