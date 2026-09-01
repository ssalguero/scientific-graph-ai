import { PRODUCT_FACTS } from "./product-catalog";
import { SCIENTIFIC_FACTS, SCIENTIFIC_TOPIC_CUES } from "./scientific-catalog";
import type {
  GroundingBundle,
  GroundingFact,
  ProductContext,
  SafetyVerdict,
  ScientificContext,
} from "./types";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,;:()"'“”]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text: string, needles: readonly string[]): boolean {
  const n = normalize(text);
  return needles.some((needle) => n.includes(normalize(needle)));
}

function uniqueFacts(facts: GroundingFact[]): GroundingFact[] {
  const seen = new Set<string>();
  const out: GroundingFact[] = [];
  for (const fact of facts) {
    if (seen.has(fact.id)) continue;
    seen.add(fact.id);
    out.push(fact);
  }
  return out;
}

export function retrieveGrounding(
  text: string,
  product: ProductContext,
  scientific: ScientificContext,
  safety: SafetyVerdict
): GroundingBundle {
  const facts: GroundingFact[] = [];
  const retrievalNotes: string[] = [];
  const byId = (id: string) => PRODUCT_FACTS.find((fact) => fact.id === id);
  const sciById = (id: string) => SCIENTIFIC_FACTS.find((fact) => fact.id === id);

  const identity = byId("product.identity");
  if (identity) facts.push(identity);
  const nonAutonomy = byId("product.non-autonomy");
  if (nonAutonomy) facts.push(nonAutonomy);

  if (product.productScreen === "home" || product.surface === "home") {
    const cards = byId("product.cards");
    const journey = byId("product.journey");
    if (cards) facts.push(cards);
    if (journey) facts.push(journey);
    retrievalNotes.push("home-orientation");
  }
  if (
    product.productScreen === "importar" ||
    product.capability === "import" ||
    includesAny(text, ["dato", "import", "csv", "excel", "xlsx", "archivo", "ods", "sgproj"])
  ) {
    const imp = byId("product.import");
    if (imp) facts.push(imp);
    retrievalNotes.push("data-import");
  }
  if (
    product.productScreen === "graph" ||
    includesAny(text, ["y=f(x)", "funcion", "función", "expresion", "ge ", "constructor y"])
  ) {
    const ge = byId("product.ge");
    if (ge) facts.push(ge);
  }
  if (
    product.productScreen === "vgb" ||
    includesAny(text, ["visual", "vgb", "figura"])
  ) {
    const vgb = byId("product.vgb");
    if (vgb) facts.push(vgb);
  }
  if (
    product.productScreen === "comparar" ||
    product.capability === "comparison" ||
    includesAny(text, ["comparar", "grupos", "slot"])
  ) {
    const cmp = byId("product.compare");
    if (cmp) facts.push(cmp);
  }
  if (
    product.productScreen === "analizar" ||
    product.capability === "analysis" ||
    includesAny(text, ["analisis", "análisis", "metodo", "método", "parametro"])
  ) {
    const analysis = byId("product.analysis");
    if (analysis) facts.push(analysis);
  }
  if (product.productScreen === "results" || includesAny(text, ["resultado", "significa este valor", "por que obtuve"])) {
    const results = byId("product.results");
    if (results) facts.push(results);
  }
  if (product.productScreen === "reports" || includesAny(text, ["reporte", "pack", "pdf"])) {
    const reports = byId("product.reports");
    if (reports) facts.push(reports);
    const structure = sciById("sci.report-structure");
    if (structure) facts.push(structure);
  }
  if (
    product.productScreen === "evaluar-metodologia" ||
    product.capability === "evaluate" ||
    includesAny(text, ["evaluar", "metodolog", "sci-50", "publicacion"])
  ) {
    const evaluate = byId("product.evaluate");
    if (evaluate) facts.push(evaluate);
  }
  if (includesAny(text, ["biblioteca"])) {
    const library = byId("product.library");
    if (library) facts.push(library);
  }
  if (includesAny(text, ["guardar", "abrir proyecto", "sgproj", "persist"])) {
    const persistence = byId("product.persistence");
    if (persistence) facts.push(persistence);
  }

  if (safety.unsupportedCapability) {
    const absence = byId("product.no-manual-entry");
    if (absence) facts.push(absence);
    retrievalNotes.push("unsupported-capability");
  }

  for (const cue of SCIENTIFIC_TOPIC_CUES) {
    if (includesAny(text, cue.needles)) {
      const fact = sciById(cue.factId);
      if (fact) facts.push(fact);
    }
  }

  if (product.productScreen === "analizar" && scientific.analysisArea) {
    retrievalNotes.push(`analysis-area:${scientific.analysisArea}`);
    const advice = sciById("sci.advice-pattern");
    if (advice) facts.push(advice);
  }
  if (product.productScreen === "results") {
    const reading = sciById("sci.correlation-reading");
    if (reading) facts.push(reading);
    const assumptions = sciById("sci.assumptions");
    if (assumptions) facts.push(assumptions);
  }

  if (product.productScreen === "graph" || product.dataView === "curves") {
    const ge = byId("product.ge");
    if (ge) facts.push(ge);
  }
  if (product.productScreen === "vgb" || product.dataView === "visual-builder") {
    const vgb = byId("product.vgb");
    if (vgb) facts.push(vgb);
  }

  return {
    facts: uniqueFacts(facts).slice(0, 8),
    retrievalNotes,
  };
}

export function buildScientificContext(product: ProductContext): ScientificContext {
  const area =
    product.inspectorCategory === "mathematics" ||
    product.inspectorCategory === "statistics" ||
    product.inspectorCategory === "visualization" ||
    product.inspectorCategory === "inference" ||
    product.inspectorCategory === "advisor"
      ? product.inspectorCategory
      : null;
  const resultOccupancy =
    product.hasGraphedCurves === true || product.hasExecutedAnalysis === true
      ? "present"
      : product.hasExperimentalSeries === true || product.hasDataset === true
        ? "partial"
        : "none";
  return {
    analysisArea: area,
    resultOccupancy,
    reportOccupancy: product.hasExistingReport === true ? "present" : "none",
  };
}
