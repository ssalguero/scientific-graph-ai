import { FUNCTION_OPERAND } from "./constants";
import { isValidMathExpression, normalizeExpressionForMath } from "./expression";

export const normalizeNaturalLanguage = (input: string): string =>
  input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

export const translateNaturalLanguageToMath = (input: string): string => {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;

  let text = normalizeNaturalLanguage(trimmed);

  text = text.replace(/e elevado a x al cuadrado/g, "exp(x^2)");
  text = text.replace(/e elevado a menos x/g, "exp(-x)");
  text = text.replace(
    new RegExp(`e elevado a (${FUNCTION_OPERAND})`, "g"),
    "exp($1)"
  );

  text = text.replace(/\b([a-z0-9]+)\s+al cuadrado\b/g, "$1^2");
  text = text.replace(/\b([a-z0-9]+)\s+al cubo\b/g, "$1^3");
  text = text.replace(/\b([a-z0-9]+)\s+a la cuarta\b/g, "$1^4");
  text = text.replace(/\b([a-z0-9]+)\s+a la quinta\b/g, "$1^5");

  const functionPhrases: [RegExp, string][] = [
    [new RegExp(`logaritmo natural de (${FUNCTION_OPERAND})`, "g"), "log($1)"],
    [new RegExp(`logaritmo base 10 de (${FUNCTION_OPERAND})`, "g"), "log10($1)"],
    [new RegExp(`ln de (${FUNCTION_OPERAND})`, "g"), "log($1)"],
    [new RegExp(`raiz cuadrada de (${FUNCTION_OPERAND})`, "g"), "sqrt($1)"],
    [new RegExp(`raiz de (${FUNCTION_OPERAND})`, "g"), "sqrt($1)"],
    [new RegExp(`arcotangente de (${FUNCTION_OPERAND})`, "g"), "atan($1)"],
    [new RegExp(`arcoseno de (${FUNCTION_OPERAND})`, "g"), "asin($1)"],
    [new RegExp(`arcocoseno de (${FUNCTION_OPERAND})`, "g"), "acos($1)"],
    [new RegExp(`tangente de (${FUNCTION_OPERAND})`, "g"), "tan($1)"],
    [new RegExp(`coseno de (${FUNCTION_OPERAND})`, "g"), "cos($1)"],
    [new RegExp(`seno de (${FUNCTION_OPERAND})`, "g"), "sin($1)"],
  ];

  for (const [pattern, replacement] of functionPhrases) {
    text = text.replace(pattern, replacement);
  }

  text = text.replace(/\bnumero pi\b/g, "pi");
  text = text.replace(/\bnumero e\b/g, "e");

  text = text.replace(/\s+multiplicado por\s+/g, "*");
  text = text.replace(/\s+dividido por\s+/g, "/");
  text = text.replace(/\s+por\s+/g, "*");
  text = text.replace(/\s+mas\s+/g, "+");
  text = text.replace(/\s+menos\s+/g, "-");

  text = text.replace(/\s+/g, "");

  return text;
};

export const resolveNaturalLanguageExpression = (
  expression: string,
  enabled: boolean
): string => {
  const trimmed = expression.trim();
  if (!trimmed || !enabled) return trimmed;

  const translated = translateNaturalLanguageToMath(trimmed);
  return isValidMathExpression(translated) ? translated : trimmed;
};
