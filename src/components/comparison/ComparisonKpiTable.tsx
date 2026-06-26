"use client";

import {
  formatComparisonNumericDelta,
  getComparisonDeltaDirectionLabel,
  type ComparisonKpiRow,
} from "@/lib/scientific/comparison";

type ComparisonKpiTableProps = {
  rows: ComparisonKpiRow[];
  heading?: string;
};

export function ComparisonKpiTable({ rows, heading }: ComparisonKpiTableProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <div>
      {heading ? (
        <p className="text-sm font-semibold text-[var(--app-heading)] mb-2">
          {heading}
        </p>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--app-border)]">
              <th className="text-left py-2 pr-3 font-semibold">KPI</th>
              <th className="text-left py-2 px-3 font-semibold">Slot A</th>
              <th className="text-left py-2 px-3 font-semibold">Slot B</th>
              <th className="text-left py-2 pl-3 font-semibold">Δ (B−A)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className="border-b border-[var(--app-border)]/60"
              >
                <td className="py-2 pr-3 text-[var(--app-heading)]">
                  {row.title}
                </td>
                <td className="py-2 px-3 text-[var(--app-text-muted)]">
                  {row.slotAValue}
                </td>
                <td className="py-2 px-3 text-[var(--app-text-muted)]">
                  {row.slotBValue}
                </td>
                <td className="py-2 pl-3 tabular-nums text-[var(--app-text)]">
                  {row.delta !== null
                    ? `${formatComparisonNumericDelta(row.delta)} (${getComparisonDeltaDirectionLabel(row.deltaDirection)})`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
