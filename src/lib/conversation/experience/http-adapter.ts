import type { GenerationPort, GenerationRequest, GenerationResponse } from "./types";

function env(name: string): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export function httpGenerationConfig(): {
  url: string;
  apiKey: string;
  model: string;
} | null {
  const url = env("SGAI_GENERATION_URL");
  const apiKey = env("SGAI_GENERATION_API_KEY");
  if (!url || !apiKey) return null;
  return {
    url,
    apiKey,
    model: env("SGAI_GENERATION_MODEL") ?? "default",
  };
}

export function buildSystemPrompt(request: GenerationRequest): string {
  const facts = request.grounding.facts
    .map((fact) => `- ${fact.title}: ${fact.statement}${fact.caveat ? ` (${fact.caveat})` : ""}`)
    .join("\n");
  const occupancy = [
    `pantalla=${request.product.productScreen}`,
    `capability=${request.product.capability}`,
    `mode=${String(request.product.scientificMode)}`,
    `dataset=${String(request.product.hasDataset)}`,
    `series=${String(request.product.hasExperimentalSeries)}`,
    `analisisEjecutado=${String(request.product.hasExecutedAnalysis)}`,
    `grafico=${String(request.product.hasGraphedCurves)}`,
    `comparacionA=${String(request.product.slotAOccupied)}`,
    `comparacionB=${String(request.product.slotBOccupied)}`,
    `vgb=${String(request.product.hasVgbFigures)}`,
    `metodologia=${String(request.product.methodologyActive)}`,
    `reporte=${String(request.product.hasExistingReport)}`,
    `workflow=${String(request.product.workflowTemplate)}`,
  ].join("; ");
  return [
    "Sos la inteligencia conversacional de Scientific Graph AI.",
    "Conversá, orientá, aconsejá, explicá e interpretá. No ejecutes, no navegues, no pulses Cards, no mutes el workspace.",
    "Nunca inventes capacidades. Si no está en el catálogo, decí que no existe y ofrecé la alternativa real.",
    "Separá cálculo del sistema (Scientific Graph AI) de tu explicación generada.",
    "Respondé en el idioma del usuario. Variá la redacción. No uses una plantilla fija.",
    request.safety.outOfDomain
      ? "El pedido está fuera de dominio: marcá el límite con naturalidad y volvé al producto."
      : "",
    request.safety.autonomyRequested
      ? "El usuario pidió que actúes vos: rechazá la acción y ofrecé orientación."
      : "",
    request.safety.unsupportedCapability
      ? "El usuario pidió una capacidad que no existe: explicalo y ofrecé la alternativa real del catálogo."
      : "",
    `Pantalla actual: ${request.product.productScreen}.`,
    `Contexto científico: área=${request.scientific.analysisArea ?? "ninguna"}; resultados=${request.scientific.resultOccupancy}; reportes=${request.scientific.reportOccupancy}.`,
    `Ocupación: ${occupancy}.`,
    request.product.systemObservation
      ? `Observación del sistema (no recalcular): ${request.product.systemObservation}`
      : "",
    `Notas de retrieval: ${request.grounding.retrievalNotes.join(", ") || "(ninguna)"}.`,
    "Hechos de anclaje:",
    facts || "- (sin hechos adicionales)",
  ]
    .filter(Boolean)
    .join("\n");
}

export function createHttpGenerationPort(): GenerationPort | null {
  const config = httpGenerationConfig();
  if (!config) return null;
  return {
    async generate(request: GenerationRequest): Promise<GenerationResponse> {
      const response = await fetch(config.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          temperature: 0.7,
          messages: [
            { role: "system", content: buildSystemPrompt(request) },
            ...request.messages,
          ],
        }),
      });
      if (!response.ok) {
        throw new Error(`generation-http-${response.status}`);
      }
      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        content?: string;
        text?: string;
      };
      const text =
        payload.choices?.[0]?.message?.content ??
        payload.content ??
        payload.text ??
        "";
      if (!text.trim()) {
        throw new Error("generation-http-empty");
      }
      return { text: text.trim(), source: "http-provider" };
    },
  };
}
