/** Maps Unicode symbols that jsPDF Helvetica cannot render reliably. */
const PDF_CHAR_REPLACEMENTS: ReadonlyArray<[string, string]> = [
  ["\u0394", "Delta"],
  ["\u2212", "-"],
  ["\u2013", "-"],
  ["\u2014", "-"],
  ["\u00b7", ", "],
  ["\u2192", "->"],
  ["\u2190", "<-"],
  ["\u2194", "<->"],
  ["\u2264", "<="],
  ["\u2265", ">="],
  ["\u2713", "OK"],
  ["\u2717", "X"],
];

export const sanitizeForPdfText = (text: string): string => {
  let result = text;
  for (const [from, to] of PDF_CHAR_REPLACEMENTS) {
    result = result.split(from).join(to);
  }
  return result;
};

export const prepareScientificReportPdfLine = (text: string): string =>
  sanitizeForPdfText(text);
