export const cellToNumber = (cell: unknown): number | null => {
  if (typeof cell === "number" && Number.isFinite(cell)) return cell;
  if (typeof cell === "string") {
    const trimmed = cell.trim();
    if (!trimmed) return null;
    const normalized = trimmed.replace(",", ".");
    const value = Number(normalized);
    return Number.isFinite(value) ? value : null;
  }
  return null;
};

export const cellToText = (cell: unknown): string =>
  String(cell ?? "").trim();

export const isEmptyCell = (cell: unknown): boolean =>
  cellToText(cell).length === 0;
