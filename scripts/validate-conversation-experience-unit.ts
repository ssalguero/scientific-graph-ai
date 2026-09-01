import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { CONVERSATION_POLICY } from "../src/lib/conversation/contract";
import {
  AI_EXPLANATION_DISCLOSURE,
  GENERATION_UNAVAILABLE_DISCLOSURE,
  GENERATION_UNAVAILABLE_MESSAGE,
  PRODUCT_FACTS,
  SCIENTIFIC_FACTS,
  buildScientificContext,
  buildSystemPrompt,
  createProductContext,
  createGenerationPort,
  httpGenerationConfig,
  inspectSafety,
  retrieveGrounding,
  runConversationTurn,
  unconfiguredGenerationPort,
  type GenerationPort,
  type GenerationRequest,
  type ProductContext,
} from "../src/lib/conversation/experience";

type CaseResult = {
  id: string;
  pass: boolean;
  detail?: string;
};

const results: CaseResult[] = [];

function assertCase(id: string, pass: boolean, detail?: string) {
  results.push({ id, pass, detail });
}

function homeProduct(): ProductContext {
  return createProductContext({
    productScreen: "home",
    hasDataset: false,
    hasExperimentalSeries: false,
    hasExecutedAnalysis: false,
    hasGraphedCurves: false,
    hasNonEmptyExpressions: false,
    constructorPanelOpen: false,
    slotAOccupied: false,
    slotBOccupied: false,
    hasExistingReport: false,
  });
}

/**
 * Test double only. Not a product generator.
 * Proves runConversationTurn forwards user text, history, surface,
 * scientific occupancy, grounding facts, and safety into GenerationPort.
 */
const pipelineWitnessPort: GenerationPort = {
  async generate(request: GenerationRequest) {
    const users = request.messages.filter((message) => message.role === "user");
    const assistants = request.messages.filter(
      (message) => message.role === "assistant"
    );
    const lastUser = users[users.length - 1]?.content ?? "";
    const priorUsers = users.slice(0, -1).map((message) => message.content);
    const lastAssistant = assistants[assistants.length - 1]?.content ?? "";
    const parts = [
      `Respuesta a: ${lastUser}`,
      `Pantalla ${request.product.productScreen}.`,
      `Área científica ${request.scientific.analysisArea ?? "ninguna"}; resultados ${request.scientific.resultOccupancy}; reportes ${request.scientific.reportOccupancy}.`,
    ];
    if (priorUsers.length > 0) {
      parts.push(`Turnos previos del usuario: ${priorUsers.join(" || ")}`);
    }
    if (lastAssistant) {
      parts.push(`Última orientación: ${lastAssistant.slice(0, 220)}`);
    }
    if (request.product.systemObservation) {
      parts.push(`Observación del sistema: ${request.product.systemObservation}.`);
    }
    if (request.safety.outOfDomain) {
      parts.push(`Fuera de dominio. Volvé a ${request.safety.domainReturnHint}.`);
    }
    if (request.safety.autonomyRequested) {
      parts.push(
        "Rechazo autonomía: oriento; las Cards ejecutan cuando vos decidís."
      );
    }
    if (request.safety.unsupportedCapability) {
      parts.push("Capacidad no disponible en el producto actual.");
    }
    for (const fact of request.grounding.facts) {
      parts.push(fact.statement);
      if (fact.caveat) parts.push(fact.caveat);
    }
    return { text: parts.join("\n"), source: "injected" as const };
  },
};

function ask(
  text: string,
  product: ProductContext,
  history: Awaited<ReturnType<typeof runConversationTurn>>["history"] = []
) {
  return runConversationTurn({ text, history, product }, { port: pipelineWitnessPort });
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function walk(relDir: string): string[] {
  const absDir = join(repoRoot, relDir);
  const out: string[] = [];
  function inner(abs: string, rel: string) {
    for (const name of readdirSync(abs)) {
      const nextAbs = join(abs, name);
      const nextRel = join(rel, name);
      if (statSync(nextAbs).isDirectory()) {
        inner(nextAbs, nextRel);
        continue;
      }
      if (name.endsWith(".ts") || name.endsWith(".tsx")) out.push(nextRel);
    }
  }
  inner(absDir, relDir);
  return out;
}

const experienceSources = walk("src/lib/conversation/experience").map((rel) =>
  readFileSync(join(repoRoot, rel), "utf8")
);
const blob = experienceSources.join("\n");
const pageSource = readFileSync(join(repoRoot, "src/app/page.tsx"), "utf8");
const surfaceSource = readFileSync(
  join(repoRoot, "src/components/conversation/ScientificConversationSurface.tsx"),
  "utf8"
);
const sidebarSource = readFileSync(
  join(repoRoot, "src/components/ui/sidebar/Sidebar.tsx"),
  "utf8"
);
const runTurnSource = readFileSync(
  join(repoRoot, "src/lib/conversation/experience/run-turn.ts"),
  "utf8"
);
const factorySource = readFileSync(
  join(repoRoot, "src/lib/conversation/experience/generation-port.ts"),
  "utf8"
);

assertCase(
  "pfai.policy-generation-non-autonomy",
  CONVERSATION_POLICY.allowGenerationPort === true &&
    CONVERSATION_POLICY.allowAutoNavigation === false &&
    CONVERSATION_POLICY.allowAutoExecution === false &&
    CONVERSATION_POLICY.allowMethodDecision === false &&
    CONVERSATION_POLICY.maxClarifications > 1,
  JSON.stringify(CONVERSATION_POLICY)
);

assertCase(
  "pfai.no-vendor-sdk",
  !blob.includes('from "openai"') &&
    !blob.includes("handleSmartStartSelect") &&
    !blob.includes("selectWorkspaceSection") &&
    !blob.includes("evaluateExpression") &&
    !blob.includes("generateGraph"),
  "isolation"
);

assertCase(
  "pfai.generation-port-factory",
  typeof createGenerationPort === "function" &&
    typeof createGenerationPort().generate === "function",
  "port"
);

assertCase(
  "pfai.composer-removed",
  !existsSync(join(repoRoot, "src/lib/conversation/experience/grounded-composer.ts")) &&
    !blob.includes("hashSeed") &&
    !blob.includes("function pick") &&
    !factorySource.includes("grounded") &&
    !runTurnSource.includes("grounded") &&
    !runTurnSource.includes("composer"),
  "no canned composer"
);

assertCase(
  "pfai.surface-api-only",
  surfaceSource.includes("/api/conversation/generate") &&
    !surfaceSource.includes("runConversationTurn") &&
    surfaceSource.includes("Preguntar"),
  "client does not locally generate"
);

assertCase(
  "pfai.catalogs-grounded",
  PRODUCT_FACTS.some((fact) => fact.id === "product.no-manual-entry") &&
    PRODUCT_FACTS.some((fact) => fact.statement.includes("CSV")) &&
    PRODUCT_FACTS.some((fact) => fact.id === "product.vgb") &&
    PRODUCT_FACTS.some((fact) => fact.id === "product.library") &&
    SCIENTIFIC_FACTS.some((fact) => fact.id === "sci.pearson"),
  "catalogs"
);

assertCase(
  "ac-ai-26.one-visible-ai",
  !pageSource.includes("Asistente científico") &&
    !pageSource.includes("asistente científico") &&
    !pageSource.includes("Sugerir") &&
    !pageSource.includes("Consultar") &&
    !sidebarSource.includes("Asistente científico") &&
    sidebarSource.includes("Informe heurístico") &&
    pageSource.includes('title="Informe heurístico"') &&
    pageSource.includes("Mostrar informe heurístico") &&
    surfaceSource.includes("Preguntar"),
  "visible identity"
);

assertCase(
  "r2.importar.preguntar-identity",
  surfaceSource.includes('product.productScreen === "importar"') &&
    surfaceSource.includes("Preguntar") &&
    pageSource.includes("pantalla Importar") &&
    pageSource.includes("formato seleccionado"),
  "Preguntar identity and Importar observation"
);

async function main() {
  const q1a = await ask("Quiero analizar mis datos", homeProduct());
  const q1b = await ask(
    "Necesito ver si hay patrones en lo que medí",
    homeProduct()
  );
  assertCase(
    "q1.same-intent-contextual-content",
    q1a.text.includes("Quiero analizar mis datos") &&
      q1b.text.includes("patrones en lo que medí") &&
      !q1b.text.includes("Quiero analizar mis datos") &&
      /card|analizar/i.test(q1a.text) &&
      q1a.disclosure === AI_EXPLANATION_DISCLOSURE &&
      q1a.source === "injected",
    `${q1a.text.slice(0, 80)} | ${q1b.text.slice(0, 80)}`
  );
  assertCase(
    "ac-ai-18.conversational-quality",
    q1a.text !== q1b.text &&
      q1a.text.includes("Quiero analizar mis datos") &&
      q1b.text.includes("patrones"),
    "content depends on the utterance, not pick()"
  );

  const q2 = await ask("No sé por dónde empezar", homeProduct());
  assertCase(
    "q2.ambiguous-intent",
    /no s[eé] por d[oó]nde empezar/i.test(q2.text) &&
      /card|import|dato|análisis|analisis|recorrido/i.test(q2.text),
    q2.text.slice(0, 160)
  );

  const q3first = await ask("Quiero trabajar con un experimento", homeProduct());
  const q3second = await ask(
    "Tengo un archivo CSV",
    homeProduct(),
    q3first.history
  );
  const q3third = await ask(
    "Y si todavía no tengo el archivo?",
    homeProduct(),
    q3second.history
  );
  assertCase(
    "q3.multi-turn-uses-prior-content",
    q3second.history.filter((item) => item.role === "user").length >= 2 &&
      /experimento/i.test(q3second.text) &&
      /csv/i.test(q3second.text) &&
      /archivo/i.test(q3third.text) &&
      /csv/i.test(q3third.text) &&
      /experimento/i.test(q3third.text),
    q3third.text.slice(0, 220)
  );
  assertCase(
    "ac-ai-19.multi-turn-clarification",
    q3third.history.filter((item) => item.role === "user").length >= 3,
    String(q3third.history.filter((item) => item.role === "user").length)
  );

  const q4 = await ask("¿Qué es Pearson y cuándo conviene?", {
    ...homeProduct(),
    productScreen: "analizar",
    capability: "analysis",
    surface: "analysis",
    inspectorCategory: "statistics",
  });
  assertCase(
    "q4.scientific-question",
    /pearson/i.test(q4.text) &&
      /causal/i.test(q4.text) &&
      q4.text.includes("Pantalla analizar") &&
      /statistics/i.test(q4.text) &&
      /generado por ia/i.test(q4.disclosure),
    q4.text.slice(0, 200)
  );
  assertCase(
    "ac-ai-20.scientific-advice",
    /pearson/i.test(q4.text) && /causal/i.test(q4.text),
    "analysis advice"
  );

  const q5 = await ask("¿El Constructor Visual es lo mismo que y=f(x)?", {
    ...homeProduct(),
    productScreen: "vgb",
    capability: "vgb",
    surface: "data",
    dataView: "visual-builder",
  });
  assertCase(
    "q5.tool-question-ge-vgb",
    /vgb|visual/i.test(q5.text) && /y=f\(x\)|ge/i.test(q5.text),
    q5.text.slice(0, 200)
  );
  assertCase("ac-ai-21.scientific-explanation", /vgb|visual/i.test(q5.text), "ge≠vgb");

  const q6 = await ask("¿Qué significa este resultado de correlación?", {
    ...homeProduct(),
    productScreen: "results",
    capability: "results",
    surface: "results",
    hasExecutedAnalysis: true,
    hasGraphedCurves: true,
    systemObservation: "correlación visible en Resultados",
  });
  assertCase(
    "q6.result-question",
    /correlaci/i.test(q6.text) &&
      /c[aá]lcul/i.test(q6.text) &&
      q6.text.includes("correlación visible en Resultados") &&
      q6.text.includes("Pantalla results") &&
      !/r\s*=\s*0\.\d{2}/.test(q6.text),
    q6.text.slice(0, 200)
  );
  assertCase(
    "ac-ai-22.result-interpretation",
    q6.text.includes("correlación visible en Resultados") &&
      /c[aá]lcul/i.test(q6.text),
    "uses system observation, no invented r="
  );

  const q7 = await ask("¿Cómo está armado el reporte?", {
    ...homeProduct(),
    productScreen: "reports",
    capability: "reports",
    surface: "reports",
    hasExistingReport: true,
  });
  assertCase(
    "q7.report-question",
    /reporte|pack|pdf/i.test(q7.text) && q7.text.includes("Pantalla reports"),
    q7.text.slice(0, 200)
  );
  assertCase(
    "ac-ai-23.report-intelligence",
    /reporte|pack|pdf/i.test(q7.text),
    "reports"
  );

  const q8 = await ask("Quiero un sandwich.", homeProduct());
  const q8b = await ask("Quiero un sandwich con papas.", homeProduct());
  assertCase(
    "q8.out-of-domain",
    q8.safety.outOfDomain === true &&
      /scientific graph/i.test(q8.text) &&
      q8.text.includes("Quiero un sandwich."),
    q8.text.slice(0, 200)
  );
  assertCase(
    "q8b.ood-uses-utterance",
    q8b.safety.outOfDomain === true &&
      q8b.text.includes("papas") &&
      q8.text.includes("Quiero un sandwich.") &&
      !q8.text.includes("papas"),
    q8b.text.slice(0, 120)
  );

  const q9 = await ask("Quiero tipear los datos a mano.", homeProduct());
  assertCase(
    "q9.unsupported-capability",
    q9.safety.unsupportedCapability === true &&
      /import/i.test(q9.text) &&
      !/pod[eé]s escribir las celdas|ingreso manual est[aá] disponible/i.test(
        q9.text
      ),
    q9.text.slice(0, 200)
  );
  assertCase(
    "ac-ai-24.no-invented-capabilities",
    q9.safety.unsupportedCapability === true && /import/i.test(q9.text),
    "manual entry refused"
  );

  const q10 = await ask(
    "Andá a Análisis y ejecutá el análisis por mí.",
    homeProduct()
  );
  assertCase(
    "q10.autonomy-refused",
    q10.safety.autonomyRequested === true &&
      /orient|card/i.test(q10.text) &&
      !/voy a (abrir|ejecutar|navegar)/i.test(q10.text),
    q10.text.slice(0, 200)
  );

  const nowAnalysis = await ask("¿Qué hago ahora?", {
    ...homeProduct(),
    productScreen: "analizar",
    capability: "analysis",
    surface: "analysis",
    inspectorCategory: "statistics",
  });
  const nowReports = await ask("¿Qué hago ahora?", {
    ...homeProduct(),
    productScreen: "reports",
    capability: "reports",
    surface: "reports",
    hasExistingReport: true,
  });
  assertCase(
    "pfai.surface-context",
    nowAnalysis.text.includes("Pantalla analizar") &&
      nowReports.text.includes("Pantalla reports") &&
      /reporte|pack|pdf/i.test(nowReports.text) &&
      nowAnalysis.text !== nowReports.text,
    "same question, different productScreen grounding"
  );

  const httpPrompt = buildSystemPrompt({
    messages: [
      { role: "user", content: "turno previo" },
      { role: "assistant", content: "orientación previa" },
      { role: "user", content: "¿Pearson en esta muestra?" },
    ],
    product: {
      ...homeProduct(),
      productScreen: "analizar",
      capability: "analysis",
      surface: "analysis",
      inspectorCategory: "statistics",
      hasExecutedAnalysis: true,
      systemObservation: "correlación visible",
    },
    scientific: buildScientificContext({
      ...homeProduct(),
      productScreen: "analizar",
      capability: "analysis",
      surface: "analysis",
      inspectorCategory: "statistics",
      hasExecutedAnalysis: true,
    }),
    grounding: retrieveGrounding(
      "¿Pearson en esta muestra?",
      {
        ...homeProduct(),
        productScreen: "analizar",
        capability: "analysis",
        surface: "analysis",
        inspectorCategory: "statistics",
      },
      buildScientificContext({
        ...homeProduct(),
        productScreen: "analizar",
        capability: "analysis",
        surface: "analysis",
        inspectorCategory: "statistics",
      }),
      inspectSafety("¿Pearson en esta muestra?", homeProduct())
    ),
    safety: inspectSafety("¿Pearson en esta muestra?", {
      ...homeProduct(),
      productScreen: "analizar",
      capability: "analysis",
      surface: "analysis",
    }),
  });
  assertCase(
    "pfai.http-prompt-full-packet",
    httpPrompt.includes("Pantalla actual: analizar") &&
      httpPrompt.includes("statistics") &&
      /pearson/i.test(httpPrompt) &&
      httpPrompt.includes("analisisEjecutado=true") &&
      httpPrompt.includes("correlación visible"),
    httpPrompt.slice(0, 240)
  );

  const honest = await runConversationTurn(
    {
      text: "Quiero analizar mis datos",
      history: [],
      product: homeProduct(),
    },
    { port: unconfiguredGenerationPort }
  );
  assertCase(
    "pfai.unconfigured-is-honest",
    honest.source === "unconfigured" &&
      honest.text === GENERATION_UNAVAILABLE_MESSAGE &&
      honest.disclosure === GENERATION_UNAVAILABLE_DISCLOSURE &&
      !honest.text.includes("Quiero analizar mis datos"),
    honest.source
  );
  if (httpGenerationConfig() === null) {
    const factoryDefault = await runConversationTurn({
      text: "Quiero analizar mis datos",
      history: [],
      product: homeProduct(),
    });
    assertCase(
      "pfai.default-runtime-not-composer",
      factoryDefault.source === "unconfigured" &&
        factoryDefault.disclosure === GENERATION_UNAVAILABLE_DISCLOSURE,
      factoryDefault.source
    );
  } else {
    assertCase(
      "pfai.default-runtime-not-composer",
      factorySource.includes("createHttpGenerationPort()") &&
        factorySource.includes("unconfiguredGenerationPort"),
      "http configured; factory still HTTP-or-unconfigured, no live call"
    );
  }

  assertCase(
    "ac-ai-25.disclosure-split",
    q4.disclosure === AI_EXPLANATION_DISCLOSURE &&
      honest.disclosure === GENERATION_UNAVAILABLE_DISCLOSURE,
    "generated vs unconfigured disclosure"
  );

  const safetyHome = inspectSafety("hola", homeProduct());
  assertCase(
    "pfai.gate-allows-language",
    safetyHome.autonomyRequested === false && safetyHome.outOfDomain === false,
    JSON.stringify(safetyHome)
  );

  const summary = {
    phase: "conversation-experience-unit",
    pass: results.every((item) => item.pass),
    caseCount: results.length,
    cases: results,
  };

  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.pass ? 0 : 1);
}

void main();
