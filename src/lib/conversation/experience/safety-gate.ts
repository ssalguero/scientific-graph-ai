import type { ProductContext, SafetyVerdict } from "./types";
import { UNSUPPORTED_CAPABILITY_CUES } from "./product-catalog";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,;:()"'“”]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const AUTONOMY_CUES = [
  "hacelo vos",
  "hazlo vos",
  "hazlo tu",
  "hazlo tú",
  "andá a",
  "anda a",
  "ve a analisis",
  "ve a análisis",
  "ejecuta el analisis",
  "ejecuta el análisis",
  "ejecutalo",
  "ejecutá",
  "corre el analisis",
  "corré el análisis",
  "selecciona el metodo y",
  "elige el metodo y ejecuta",
  "navega a",
  "abri la card",
  "abrí la card",
  "pulsa importar",
  "hace el analisis por mi",
  "haz el análisis por mí",
  "actua por mi",
  "actúa por mí",
];

const OUT_OF_DOMAIN_CUES = [
  "sandwich",
  "sándwich",
  "hamburguesa",
  "receta de cocina",
  "clima de manana",
  "clima de mañana",
  "precio del bitcoin",
  "quien gano el partido",
  "quién ganó el partido",
];

export function inspectSafety(
  text: string,
  _product: ProductContext
): SafetyVerdict {
  const n = normalize(text);
  const autonomyRequested = AUTONOMY_CUES.some((cue) => n.includes(normalize(cue)));
  const outOfDomain = OUT_OF_DOMAIN_CUES.some((cue) => n.includes(normalize(cue)));
  const unsupportedCapability = UNSUPPORTED_CAPABILITY_CUES.some((item) =>
    item.needles.some((needle) => n.includes(normalize(needle)))
  );
  return {
    autonomyRequested,
    outOfDomain,
    unsupportedCapability,
    domainReturnHint:
      "Scientific Graph AI, sus datos, análisis, gráficos, resultados y reportes",
  };
}

export function applySafetyToOutput(
  text: string,
  safety: SafetyVerdict
): string {
  let next = text.trim();
  if (safety.autonomyRequested) {
    const claimsAction =
      /voy a (abrir|ir|ejecutar|navegar|pulsar|seleccionar)|ya (abrí|ejecuté|navegué)/i.test(
        next
      );
    if (claimsAction) {
      next =
        "No puedo hacerlo por vos: no navego ni ejecuto. Puedo ayudarte a decidir el siguiente paso; las Cards son las que ejecutan.";
    }
  }
  return next;
}

export const safetyAndCapabilityGate = {
  inspect: inspectSafety,
  applyToOutput: applySafetyToOutput,
};
