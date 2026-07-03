export function normalizeIntentText(text: string): string {
  return ` ${text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()} `;
}

export function keywordMatches(text: string, keyword: string): boolean {
  const normalizedKeyword = normalizeIntentText(keyword).trim();
  if (!normalizedKeyword) return false;
  if (normalizedKeyword.includes(" ")) {
    return text.includes(normalizedKeyword);
  }
  return text.includes(` ${normalizedKeyword} `);
}
