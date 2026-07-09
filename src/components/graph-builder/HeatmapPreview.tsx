import type { VisualGraphPreviewHeatmapCell } from "@/lib/visualGraphBuilder";

type HeatmapPreviewProps = {
  data: VisualGraphPreviewHeatmapCell[];
};

const NEUTRAL_RGB: [number, number, number] = [148, 163, 184];
const POSITIVE_RGB: [number, number, number] = [37, 99, 235];
const NEGATIVE_RGB: [number, number, number] = [220, 38, 38];

function interpolateRgb(
  start: [number, number, number],
  end: [number, number, number],
  factor: number
): string {
  const clamped = Math.max(0, Math.min(1, factor));
  const red = Math.round(start[0] + (end[0] - start[0]) * clamped);
  const green = Math.round(start[1] + (end[1] - start[1]) * clamped);
  const blue = Math.round(start[2] + (end[2] - start[2]) * clamped);
  return `rgb(${red}, ${green}, ${blue})`;
}

function getCorrelationCellColors(value: number): {
  backgroundColor: string;
  color: string;
} {
  if (!Number.isFinite(value)) {
    return {
      backgroundColor: "rgb(148, 163, 184)",
      color: "#ffffff",
    };
  }

  const clamped = Math.max(-1, Math.min(1, value));

  if (clamped === 0) {
    return {
      backgroundColor: "rgb(148, 163, 184)",
      color: "#ffffff",
    };
  }

  if (clamped > 0) {
    return {
      backgroundColor: interpolateRgb(NEUTRAL_RGB, POSITIVE_RGB, clamped),
      color: "#ffffff",
    };
  }

  return {
    backgroundColor: interpolateRgb(NEGATIVE_RGB, NEUTRAL_RGB, Math.abs(clamped)),
    color: "#ffffff",
  };
}

function extractOrderedLabels(
  cells: VisualGraphPreviewHeatmapCell[],
  axis: "row" | "column"
): string[] {
  const order: string[] = [];
  const seen = new Set<string>();

  for (const cell of cells) {
    const label = axis === "row" ? cell.row : cell.column;
    if (!seen.has(label)) {
      seen.add(label);
      order.push(label);
    }
  }

  return order;
}

function getCellValue(
  cells: VisualGraphPreviewHeatmapCell[],
  row: string,
  column: string
): number {
  return (
    cells.find((cell) => cell.row === row && cell.column === column)?.value ??
    Number.NaN
  );
}

function formatCellValue(value: number): string {
  if (!Number.isFinite(value)) {
    return "N/A";
  }

  return value.toFixed(2);
}

export function HeatmapPreview({ data }: HeatmapPreviewProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-full min-h-[12rem] items-center justify-center text-sm text-[var(--app-text-muted)]">
        Sin datos válidos para el heatmap.
      </div>
    );
  }

  const rows = extractOrderedLabels(data, "row");
  const columns = extractOrderedLabels(data, "column");
  const showCellValues = columns.length <= 14 && rows.length <= 10;

  return (
    <div className="overflow-x-auto">
      <div
        className="min-w-max gap-0.5"
        style={{
          display: "grid",
          gridTemplateColumns: `minmax(6.5rem, auto) repeat(${columns.length}, minmax(3rem, 1fr))`,
        }}
      >
        <div className="px-2 py-1" />
        {columns.map((column) => (
          <div
            key={`heatmap-col-${column}`}
            className="truncate px-1 py-1 text-center text-xs font-semibold text-[var(--app-heading)]"
            title={column}
          >
            {column}
          </div>
        ))}

        {rows.map((row) => (
          <div key={`heatmap-row-${row}`} className="contents">
            <div
              className="truncate px-2 py-1 text-xs font-semibold text-[var(--app-heading)]"
              title={row}
            >
              {row}
            </div>
            {columns.map((column) => {
              const value = getCellValue(data, row, column);
              const colors = getCorrelationCellColors(value);

              return (
                <div
                  key={`heatmap-cell-${row}-${column}`}
                  className="flex min-h-[2.25rem] items-center justify-center rounded-sm px-1 py-1 text-xs tabular-nums"
                  style={{
                    backgroundColor: colors.backgroundColor,
                    color: colors.color,
                  }}
                  title={`${row} × ${column}: ${formatCellValue(value)}`}
                >
                  {showCellValues ? formatCellValue(value) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
