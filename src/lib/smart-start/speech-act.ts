import { normalizeGuidanceText } from "./normalize-intent-text";
import type { GuidanceSpeechAct } from "./types";

const EXPLORE_PHRASES = [
  "no se que analisis necesito",
  "no se que analisis",
  "que analisis puedo hacer",
  "que puedo hacer con mis datos",
  "que puedo hacer",
  "descubrir",
] as const;

const DEFINE_PHRASES = ["definicion de", "que es", "definir"] as const;

const USE_PHRASES = [
  "quiero usar",
  "quiero hacer",
  "quiero aplicar",
  "quiero analizar con",
  "quiero calcular",
  "usando",
  "utilizando",
] as const;

function includesPhrase(text: string, phrase: string): boolean {
  return text.includes(` ${phrase} `);
}

/**
 * Deterministic speech-act detector. Does not change classifyIntent.
 * Phrase order: explore, then define, then use.
 */
export function detectSpeechAct(input: string): GuidanceSpeechAct {
  const text = normalizeGuidanceText(input);
  if (text.trim().length === 0) return "unknown";
  if (EXPLORE_PHRASES.some((phrase) => includesPhrase(text, phrase))) {
    return "explore";
  }
  if (DEFINE_PHRASES.some((phrase) => includesPhrase(text, phrase))) {
    return "define";
  }
  if (USE_PHRASES.some((phrase) => includesPhrase(text, phrase))) {
    return "use";
  }
  return "unknown";
}

const DEFINE_STOPWORDS = new Set([
  "un",
  "una",
  "el",
  "la",
  "los",
  "las",
  "de",
  "del",
  "lo",
  "a",
  "al",
  "y",
  "o",
  "en",
  "con",
  "para",
  "mi",
  "mis",
  "el",
]);

/** First content token after a define cue. Null if none. */
export function extractDefineTerm(input: string): string | null {
  const text = normalizeGuidanceText(input);
  for (const cue of DEFINE_PHRASES) {
    const padded = ` ${cue} `;
    const idx = text.indexOf(padded);
    if (idx === -1) continue;
    const rest = text.slice(idx + padded.length).trim();
    const token = rest.split(" ").find((part) => part && !DEFINE_STOPWORDS.has(part));
    if (token) return token;
  }
  return null;
}
