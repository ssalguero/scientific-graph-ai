/** Detects characters that often break jsPDF Helvetica rendering. */
const PROBLEMATIC_PDF_PATTERN =
  /[\u0394\u2192\u2212\u2013\u2014\u00b7\u2190\u2264\u2265\u2713\u2717]/g;

export const findProblematicPdfCharacters = (
  text: string
): { char: string; code: number }[] => {
  const found: { char: string; code: number }[] = [];
  const matches = text.match(PROBLEMATIC_PDF_PATTERN);
  if (!matches) {
    return found;
  }
  for (const char of matches) {
    found.push({ char, code: char.charCodeAt(0) });
  }
  return found;
};

export const auditPdfLines = (
  lines: string[]
): {
  lineCount: number;
  linesWithIssues: { index: number; preview: string; issues: { char: string; code: number }[] }[];
  pipeKpiLines: { index: number; preview: string }[];
} => {
  const linesWithIssues: {
    index: number;
    preview: string;
    issues: { char: string; code: number }[];
  }[] = [];
  const pipeKpiLines: { index: number; preview: string }[] = [];

  lines.forEach((line, index) => {
    const issues = findProblematicPdfCharacters(line);
    if (issues.length > 0) {
      linesWithIssues.push({
        index,
        preview: line.slice(0, 120),
        issues,
      });
    }
    if (line.includes(" | Slot A:") || line.includes("Δ (B")) {
      pipeKpiLines.push({ index, preview: line.slice(0, 120) });
    }
  });

  return { lineCount: lines.length, linesWithIssues, pipeKpiLines };
};
