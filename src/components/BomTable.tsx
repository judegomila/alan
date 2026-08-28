import type { Part } from "@/lib/schemas";
import { StatusPill } from "./StatusPill";

export function BomTable({ parts }: { parts: Part[] }) {
  const total = parts.reduce((n, p) => n + p.qty * (p.paidPriceUsd ?? p.targetPriceUsd), 0);
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-900 text-xs uppercase tracking-wider text-zinc-500">
          <tr>
            <th className="px-4 py-3">Part</th>
            <th className="px-4 py-3">Qty</th>
            <th className="px-4 py-3">Target $</th>
            <th className="px-4 py-3">Paid $</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((p) => (
            <tr key={p.id} className="border-t border-zinc-800/60">
              <td className="px-4 py-3">
                <div className="text-zinc-200">{p.name}</div>
                {p.notes ? <div className="mt-0.5 text-xs text-zinc-500">{p.notes}</div> : null}
              </td>
              <td className="px-4 py-3 font-mono">{p.qty}</td>
              <td className="px-4 py-3 font-mono">{p.targetPriceUsd.toLocaleString()}</td>
              <td className="px-4 py-3 font-mono">
                {p.paidPriceUsd !== null ? p.paidPriceUsd.toLocaleString() : "—"}
              </td>
              <td className="px-4 py-3"><StatusPill status={p.status} /></td>
            </tr>
          ))}
          <tr className="border-t border-zinc-700 bg-zinc-900/50">
            <td className="px-4 py-3 font-bold text-zinc-200">Total (paid or target)</td>
            <td />
            <td />
            <td className="px-4 py-3 font-mono font-bold text-amber-400">${total.toLocaleString()}</td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
