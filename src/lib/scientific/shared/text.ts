export const deduplicateTextLines = (lines: string[]): string[] => {
  const uniqueLines: string[] = [];
  lines.forEach((line) => {
    if (!uniqueLines.includes(line)) uniqueLines.push(line);
  });
  return uniqueLines;
};

export const pushUniqueTextLine = (lines: string[], line: string) => {
  if (!lines.includes(line)) {
    lines.push(line);
  }
};
