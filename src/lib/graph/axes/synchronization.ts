export const alignVisibleRangeToDataRange = (
  minX: number,
  maxX: number
): { visibleMinX: number; visibleMaxX: number } => ({
  visibleMinX: minX,
  visibleMaxX: maxX,
});
