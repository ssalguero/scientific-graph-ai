import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  CARD_OPTION_TO_PRODUCT_SCREEN,
  PRODUCT_FACE_ROUTE_SEGMENTS,
  PRODUCT_SCREEN_IDS,
  PRODUCT_SCREEN_PATHNAME,
  guidedWorkflowHostMatchesProductScreen,
  guidedWorkflowHostProductScreenLabel,
  guidedWorkflowTabToProductScreen,
  isProductScreenId,
  isShareGraphPathname,
  legacyRenderPlanForScreen,
  legacyWorkspaceSectionFromScreen,
  pathnameToProductScreen,
  persistedWorkspaceToProductScreen,
  productScreenForCardOption,
  productScreenToPathname,
  resolvePersistedProductScreen,
} from "../src/lib/product-navigation";
import { SMART_START_OPTIONS } from "../src/lib/smart-start/options";

type CaseResult = { id: string; pass: boolean; detail?: string };
const results: CaseResult[] = [];

function assertCase(id: string, pass: boolean, detail?: string) {
  results.push({ id, pass, detail });
}

assertCase(
  "pf0.screens.complete",
  PRODUCT_SCREEN_IDS.length === 9 &&
    PRODUCT_SCREEN_IDS.join(",") ===
      "home,importar,comparar,graph,vgb,analizar,evaluar-metodologia,results,reports",
  PRODUCT_SCREEN_IDS.join(",")
);

assertCase(
  "pf0.screens.has-vgb-no-avanzado",
  isProductScreenId("vgb") &&
    !PRODUCT_SCREEN_IDS.includes("avanzado" as (typeof PRODUCT_SCREEN_IDS)[number]),
  "vgb in Face; avanzado out"
);

assertCase(
  "pf0.cards.map-all-six",
  CARD_OPTION_TO_PRODUCT_SCREEN["analyze-dataset"] === "importar" &&
    CARD_OPTION_TO_PRODUCT_SCREEN["compare-datasets"] === "comparar" &&
    CARD_OPTION_TO_PRODUCT_SCREEN["math-graph"] === "graph" &&
    CARD_OPTION_TO_PRODUCT_SCREEN["analyze-workspace"] === "analizar" &&
    CARD_OPTION_TO_PRODUCT_SCREEN["evaluate-publication"] ===
      "evaluar-metodologia" &&
    CARD_OPTION_TO_PRODUCT_SCREEN["constructor-visual"] === "vgb" &&
    productScreenForCardOption("analyze-dataset") === "importar" &&
    productScreenForCardOption("unknown") === null,
  "cards"
);

assertCase(
  "pf0.url.roundtrip",
  PRODUCT_SCREEN_IDS.every(
    (screen) => pathnameToProductScreen(productScreenToPathname(screen)) === screen
  ),
  "pathname roundtrip"
);

assertCase(
  "pf0.url.graph-not-share-collision",
  PRODUCT_SCREEN_PATHNAME.graph === "/grafico" &&
    pathnameToProductScreen("/graph/abc") === "home",
  PRODUCT_SCREEN_PATHNAME.graph
);

assertCase(
  "pf0.url.home-root",
  productScreenToPathname("home") === "/" &&
    pathnameToProductScreen("/") === "home" &&
    pathnameToProductScreen("/unknown") === "home",
  "home"
);

assertCase(
  "pf0.legacy.direction-screen-to-section",
  legacyWorkspaceSectionFromScreen("importar") === "data" &&
    legacyWorkspaceSectionFromScreen("comparar") === "data" &&
    legacyWorkspaceSectionFromScreen("graph") === "data" &&
    legacyWorkspaceSectionFromScreen("vgb") === "data" &&
    legacyWorkspaceSectionFromScreen("analizar") === "analysis" &&
    legacyWorkspaceSectionFromScreen("evaluar-metodologia") === "analysis" &&
    legacyWorkspaceSectionFromScreen("results") === "results" &&
    legacyWorkspaceSectionFromScreen("reports") === "reports" &&
    legacyWorkspaceSectionFromScreen("home") === "home",
  "derived section is not the router"
);

const importPlan = legacyRenderPlanForScreen("importar");
const graphPlan = legacyRenderPlanForScreen("graph");
const vgbPlan = legacyRenderPlanForScreen("vgb");
const evalPlan = legacyRenderPlanForScreen("evaluar-metodologia");
assertCase(
  "pf0.legacy.renderer-flags",
  importPlan.importDestinationActive === true &&
    graphPlan.dataWorkspaceView === "curves" &&
    vgbPlan.dataWorkspaceView === "visual-builder" &&
    evalPlan.analysisInspectorSection === "statistics" &&
    evalPlan.highlightPublicationDashboards === true,
  "renderer"
);

assertCase(
  "pf0.persist.temp-data-uses-control-tab",
  persistedWorkspaceToProductScreen({
    activeSection: "data",
    controlPanelTab: "graph",
  }) === "graph" &&
    persistedWorkspaceToProductScreen({
      activeSection: "data",
      controlPanelTab: "library",
    }) === "graph" &&
    persistedWorkspaceToProductScreen({
      activeSection: "data",
      controlPanelTab: "data",
    }) === "importar" &&
    persistedWorkspaceToProductScreen({ activeSection: "analysis" }) ===
      "analizar",
  "fase-0 persist mapping"
);

assertCase(
  "pf0.workflow.data-is-null",
  guidedWorkflowTabToProductScreen("data", "compare-groups") === null &&
    guidedWorkflowTabToProductScreen("analysis", "compare-groups") ===
      "analizar" &&
    guidedWorkflowTabToProductScreen("analysis", "evaluate-publication") ===
      "evaluar-metodologia" &&
    guidedWorkflowTabToProductScreen("results", null) === "results",
  "workflow map"
);

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const pageSource = readFileSync(join(repoRoot, "src/app/page.tsx"), "utf8");
const hookSource = readFileSync(
  join(repoRoot, "src/app/useSmartStart.ts"),
  "utf8"
);
const templatesSource = readFileSync(
  join(repoRoot, "src/lib/scientific/workflow/templates.ts"),
  "utf8"
);
const catalogSource = readFileSync(
  join(repoRoot, "src/lib/scientific/workflow/catalog.ts"),
  "utf8"
);
const planSource = readFileSync(
  join(repoRoot, "src/lib/scientific/workflow/plan.ts"),
  "utf8"
);
const urlSource = readFileSync(
  join(repoRoot, "src/lib/product-navigation/url.ts"),
  "utf8"
);
const productScreenHook = readFileSync(
  join(repoRoot, "src/app/useProductScreen.ts"),
  "utf8"
);
const nextConfig = readFileSync(join(repoRoot, "next.config.ts"), "utf8");
const layoutSource = readFileSync(join(repoRoot, "src/app/layout.tsx"), "utf8");
const homeScreenSource = readFileSync(
  join(repoRoot, "src/components/home/SmartStartScreen.tsx"),
  "utf8"
);
const sharePageSource = readFileSync(
  join(repoRoot, "src/app/graph/[id]/page.tsx"),
  "utf8"
);
const productScreenRouteSource = readFileSync(
  join(repoRoot, "src/app/product-screen-route.tsx"),
  "utf8"
);
const homeExport = pageSource.slice(
  pageSource.lastIndexOf("export default function Home()")
);
const shellExport = pageSource.slice(
  pageSource.lastIndexOf("export function ProductWorkspaceShell")
);

const requiredDeepLinks: Array<[string, (typeof PRODUCT_SCREEN_IDS)[number]]> =
  [
    ["/importar", "importar"],
    ["/comparar", "comparar"],
    ["/grafico", "graph"],
    ["/analizar", "analizar"],
    ["/evaluar-metodologia", "evaluar-metodologia"],
    ["/vgb", "vgb"],
    ["/resultados", "results"],
    ["/reportes", "reports"],
  ];

assertCase(
  "pf0.url.deep-link-map",
  requiredDeepLinks.every(
    ([pathname, screen]) => pathnameToProductScreen(pathname) === screen
  ),
  requiredDeepLinks
    .map(([pathname, screen]) => `${pathname}->${screen}`)
    .join(",")
);

assertCase(
  "pf0.url.avanzado-leftover-not-graph",
  pathnameToProductScreen("/avanzado") === "home" &&
    pathnameToProductScreen("/avanzado") !== "graph" &&
    urlSource.includes('if (normalized === "/avanzado")') &&
    !urlSource.includes('avanzado: "/grafico"') &&
    existsSync(join(repoRoot, "src/app/avanzado/page.tsx")),
  "/avanzado leftover resolves to home, not graph"
);

assertCase(
  "pf0.vgb.face-foundation",
  CARD_OPTION_TO_PRODUCT_SCREEN["constructor-visual"] === "vgb" &&
    productScreenToPathname("vgb") === "/vgb" &&
    pathnameToProductScreen("/vgb") === "vgb" &&
    existsSync(join(repoRoot, "src/app/vgb/page.tsx")) &&
    pageSource.includes('openProductScreen("vgb")') &&
    pageSource.includes('if (view === "visual-builder")') &&
    !pageSource.includes("VGB has no ProductScreenId"),
  "vgb is a ProductScreen; leftover visual-builder uses Face routing"
);

assertCase(
  "pf0.url.refresh-same-as-deep-link",
  requiredDeepLinks.every(
    ([pathname, screen]) =>
      pathnameToProductScreen(pathname) ===
      pathnameToProductScreen(`${pathname}/`)
  ) && pathnameToProductScreen("/") === "home",
  "refresh reads the requested pathname"
);

const historyStack = ["/", "/importar", "/vgb", "/analizar", "/grafico"];
assertCase(
  "pf0.url.back-forward-stack",
  pathnameToProductScreen(historyStack[0]) === "home" &&
    pathnameToProductScreen(historyStack[1]) === "importar" &&
    pathnameToProductScreen(historyStack[2]) === "vgb" &&
    pathnameToProductScreen(historyStack[3]) === "analizar" &&
    pathnameToProductScreen(historyStack[4]) === "graph" &&
    pathnameToProductScreen(historyStack[1]) ===
      pathnameToProductScreen("/importar"),
  "back/forward restore ProductScreenId from pathname"
);

assertCase(
  "pf0.url.real-routes",
  PRODUCT_FACE_ROUTE_SEGMENTS.length === 8 &&
    PRODUCT_FACE_ROUTE_SEGMENTS.every((segment) =>
      existsSync(join(repoRoot, "src/app", segment, "page.tsx"))
    ),
  PRODUCT_FACE_ROUTE_SEGMENTS.join(",")
);

const productScreenRouteFn = productScreenRouteSource.slice(
  productScreenRouteSource.indexOf("export default function ProductScreenRoutePage")
);
assertCase(
  "r1.routing.face-page-not-null",
  productScreenRouteFn.includes("export default function ProductScreenRoutePage") &&
    !/\breturn\s+null\b/.test(productScreenRouteFn) &&
    productScreenRouteFn.includes("data-product-face-route") &&
    PRODUCT_FACE_ROUTE_SEGMENTS.every((segment) => {
      const leaf = readFileSync(
        join(repoRoot, "src/app", segment, "page.tsx"),
        "utf8"
      );
      return (
        leaf.includes('from "../product-screen-route"') &&
        !/\bnotFound\s*\(/.test(leaf)
      );
    }),
  "Product Face leaves return a real node; Next must not treat them as 404"
);

assertCase(
  "pf0.url.no-rewrites",
  !nextConfig.includes("rewrites") &&
    !nextConfig.includes('destination: "/"'),
  "App Router pages, not rewrites"
);

assertCase(
  "pf0.url.no-navigation-entry-hack",
  !urlSource.includes("getEntriesByType") &&
    !urlSource.includes("performance.navigation") &&
    !urlSource.includes("history.pushState") &&
    !urlSource.includes("readProductScreenFromWindow") &&
    !urlSource.includes("syncProductScreenUrl"),
  "no rewrite recovery hacks"
);

assertCase(
  "pf0.openProductScreen.defined",
  /const openProductScreen = \(screen: ProductScreenId\) => \{/.test(
    pageSource
  ) &&
    productScreenHook.includes("usePathname") &&
    productScreenHook.includes("router.push"),
  "openProductScreen → router.push"
);

assertCase(
  "pf0.url.pathname-is-source-of-truth",
  productScreenHook.includes("pathnameToProductScreen(pathname)") &&
    !productScreenHook.includes("useState") &&
    !productScreenHook.includes("popstate") &&
    !productScreenHook.includes("readProductScreenFromWindow"),
  "ProductScreenId from usePathname"
);

assertCase(
  "pf0.url.share-route-intact",
  isShareGraphPathname("/graph/abc") &&
    sharePageSource.includes("shareGraphId") &&
    PRODUCT_SCREEN_PATHNAME.graph === "/grafico",
  "share /graph/[id] intact"
);

assertCase(
  "pf0.cards.openProductScreen-not-tabs",
  hookSource.includes("productScreenForCardOption") &&
    hookSource.includes('openProductScreen(screen)') &&
    !hookSource.includes("setActiveWorkspaceSection") &&
    !hookSource.includes("selectWorkspaceSection") &&
    !hookSource.includes("setSmartStartNavIntent") &&
    /handleOpenProjectFromIntent[\s\S]*scrollIntoView/.test(hookSource) &&
    !/handleSmartStartSelect[\s\S]*scrollIntoView/.test(hookSource),
  "cards"
);

assertCase(
  "pf0.page.tabs-not-router",
  !pageSource.includes("onSelect={selectWorkspaceSection}") &&
    pageSource.includes("onSelect={() => undefined}") &&
    /className="hidden flex flex-wrap/.test(pageSource) &&
    pageSource.includes("activeWorkspaceSection is DERIVED"),
  "tabs hidden and disconnected"
);

assertCase(
  "pf0.shared-state.persistent-shell",
  layoutSource.includes("ProductWorkspaceShell") &&
    shellExport.includes("<ProductCompositionHost>") &&
    shellExport.includes("<GraphEditor />") &&
    homeExport.includes("return null") &&
    !pageSource.includes("createProductNavigationStore") &&
    pageSource.includes("legacyDatosSurfaceActive"),
  "shell persists GraphEditor across product routes"
);

assertCase(
  "pf0.direction.screen-to-render",
  pageSource.includes("legacyWorkspaceSectionFromScreen(productScreen)") &&
    !pageSource.includes("setProductScreen(activeWorkspaceSection") &&
    pageSource.includes("legacyRenderPlanForScreen(screen)"),
  "direction"
);

assertCase(
  "pf0.comparar.own-screen-no-auto-analizar",
  CARD_OPTION_TO_PRODUCT_SCREEN["compare-datasets"] === "comparar" &&
    guidedWorkflowTabToProductScreen("analysis", "compare-groups") ===
      "analizar" &&
    hookSource.includes("openProductScreen(screen)") &&
    hookSource.includes('startGuidedWorkflow("compare-groups")') &&
    pageSource.includes(
      'if (templateId === "compare-groups" && screen === "analizar")'
    ),
  "card Comparar stays on comparar; compare-groups does not auto-open analizar"
);

function sliceBetween(
  source: string,
  startNeedle: string,
  endNeedle: string
): string {
  const start = source.indexOf(startNeedle);
  const end = source.indexOf(endNeedle, start + 1);
  if (start < 0 || end < 0) return "";
  return source.slice(start, end);
}

const homeSurfaceSlice = sliceBetween(
  pageSource,
  'data-product-surface="home"',
  'data-product-surface="importar"'
);
const importarSurfaceSlice = sliceBetween(
  pageSource,
  'data-product-surface="importar"',
  'data-product-surface="graph"'
);
const graphSurfaceSlice = sliceBetween(
  pageSource,
  'data-product-surface="graph"',
  'data-product-surface="vgb"'
);
const vgbSurfaceSlice = sliceBetween(
  pageSource,
  'data-product-surface="vgb"',
  'data-product-surface="comparar"'
);
const compararSurfaceSlice = sliceBetween(
  pageSource,
  'data-product-surface="comparar"',
  'data-product-surface="analizar"'
);
const analizarSurfaceSlice = sliceBetween(
  pageSource,
  'data-product-surface="analizar"',
  'data-product-surface="evaluar-metodologia"'
);
const evaluarSurfaceSlice = sliceBetween(
  pageSource,
  'data-product-surface="evaluar-metodologia"',
  'data-product-surface="reports"'
);
const reportsSurfaceSlice = sliceBetween(
  pageSource,
  'data-product-surface="reports"',
  'data-product-surface="results"'
);
const resultsSurfaceSlice = sliceBetween(
  pageSource,
  'data-product-surface="results"',
  'id={workspacePanelId("data")}'
);
const datosPanelSlice = sliceBetween(
  pageSource,
  'id={workspacePanelId("data")}',
  'id={workspacePanelId("analysis")}'
);
const analysisPanelSlice = sliceBetween(
  pageSource,
  'id={workspacePanelId("analysis")}',
  'id={workspacePanelId("results")}'
);
const resultsPanelSlice = sliceBetween(
  pageSource,
  'id={workspacePanelId("results")}',
  'id={workspacePanelId("reports")}'
);
const reportsPanelSlice = sliceBetween(
  pageSource,
  'id={workspacePanelId("reports")}',
  "shareNotFound &&"
);
const evaluarBodySlice = sliceBetween(
  pageSource,
  "const evaluarMethodologyBody =",
  "const analizarAnalysisBody ="
);
const analizarBodySlice = sliceBetween(
  pageSource,
  "const analizarAnalysisBody =",
  "const reportsOutputBody ="
);
const reportsBodySlice = sliceBetween(
  pageSource,
  "const reportsOutputBody =",
  "const resultsReviewBody ="
);
const resultsBodySlice = sliceBetween(
  pageSource,
  "const resultsReviewBody =",
  "const showProductFaceConversation ="
);
const importarDestMatches = pageSource.match(/<ImportarDestination\b/g) ?? [];
const importarDestinationSource = readFileSync(
  join(repoRoot, "src/components/import/ImportarDestination.tsx"),
  "utf8"
);
const expressionSource = readFileSync(
  join(repoRoot, "src/lib/graph/curves/expression.ts"),
  "utf8"
);

assertCase(
  "pf1.importar.card-opens-screen",
  CARD_OPTION_TO_PRODUCT_SCREEN["analyze-dataset"] === "importar" &&
    productScreenToPathname("importar") === "/importar" &&
    pathnameToProductScreen("/importar") === "importar" &&
    hookSource.includes("productScreenForCardOption") &&
    hookSource.includes("openProductScreen(screen)"),
  "Card Importar → openProductScreen(importar) → /importar"
);

assertCase(
  "pf1.importar.own-surface-not-datos-tabpanel",
  pageSource.includes('data-product-surface="importar"') &&
    importarDestMatches.length === 1 &&
    importarSurfaceSlice.includes("<ImportarDestination") &&
    !importarSurfaceSlice.includes('role="tabpanel"') &&
    !importarSurfaceSlice.includes('workspaceTabId("data")') &&
    !importarSurfaceSlice.includes('workspacePanelId("data")') &&
    !datosPanelSlice.includes("<ImportarDestination") &&
    pageSource.includes('productScreen === "importar"') &&
    pageSource.includes("!legacyDatosSurfaceActive") &&
    !pageSource.includes(
      "importDestinationActive && activeWorkspaceSection === \"data\""
    ),
  "ImportarDestination is owned by ProductScreenId, not the Datos tabpanel"
);

assertCase(
  "pf1.importar.legacy-datos-import-not-face-path",
  datosPanelSlice.includes("Importar datos experimentales") &&
    datosPanelSlice.includes("handleExperimentalImport") &&
    !datosPanelSlice.includes("<ImportarDestination"),
  "legacy import NotebookSection remains in Datos; Product Face does not use it"
);

assertCase(
  "pf1.importar.no-scroll-or-tab-select",
  !/handleSmartStartSelect[\s\S]*scrollIntoView/.test(hookSource) &&
    !hookSource.includes("setActiveWorkspaceSection") &&
    pageSource.includes("onSelect={() => undefined}") &&
    !pageSource.includes("dataImportSectionRef.current?.scrollIntoView") &&
    !pageSource.includes("importarDestinationRef.current?.scrollIntoView"),
  "Card Importar does not select a Tab or scroll to Importar"
);

assertCase(
  "pf1.importar.reuses-session-dataset",
  pageSource.includes("createSessionDatasetFromImport") &&
    pageSource.includes("handleExperimentalImport") &&
    pageSource.includes("registerAndActivateImportedDataset") &&
    importarSurfaceSlice.includes("onImportFile={handleExperimentalImport}"),
  "Importar reuses existing pipeline and SessionDataset"
);

assertCase(
  "pf1.importar.other-cards-untouched",
  CARD_OPTION_TO_PRODUCT_SCREEN["compare-datasets"] === "comparar" &&
    CARD_OPTION_TO_PRODUCT_SCREEN["math-graph"] === "graph" &&
    CARD_OPTION_TO_PRODUCT_SCREEN["analyze-workspace"] === "analizar" &&
    CARD_OPTION_TO_PRODUCT_SCREEN["evaluate-publication"] ===
      "evaluar-metodologia" &&
    CARD_OPTION_TO_PRODUCT_SCREEN["constructor-visual"] === "vgb",
  "other five Cards unchanged"
);

assertCase(
  "r2.importar.face-not-datos-continue",
  !importarSurfaceSlice.includes("Continuar a Datos") &&
    !importarSurfaceSlice.includes("continuar a Datos") &&
    !importarSurfaceSlice.includes("onContinueToDatos") &&
    !importarSurfaceSlice.includes("openLegacyDatosSurface") &&
    !importarDestinationSource.includes("onContinueToDatos") &&
    !importarDestinationSource.includes("Continuar a Datos") &&
    importarSurfaceSlice.includes('openProductScreen("analizar")') &&
    importarSurfaceSlice.includes('openProductScreen("comparar")') &&
    importarSurfaceSlice.includes('openProductScreen("graph")') &&
    importarSurfaceSlice.includes('openProductScreen("vgb")') &&
    importarSurfaceSlice.includes("onOpenProductScreen") &&
    importarDestinationSource.includes("onOpenProductScreen"),
  "Product Face Importar continues via openProductScreen, not Datos overlay"
);

assertCase(
  "r2.importar.formats-preserved",
  importarDestinationSource.includes(
    'const SUPPORTED_FORMATS = ["CSV", "TXT", "XLSX", "XLS", "ODS"]'
  ) &&
    importarDestinationSource.includes('XLS: ".xls,application/vnd.ms-excel"') &&
    !importarDestinationSource.includes("xls is now supported") &&
    !importarDestinationSource.includes("convertir .xls"),
  "existing import formats unchanged; .xls not newly declared supported"
);

assertCase(
  "r2.importar.pipeline-single-owner",
  importarDestMatches.length === 1 &&
    importarSurfaceSlice.includes("onImportFile={handleExperimentalImport}") &&
    !datosPanelSlice.includes("<ImportarDestination") &&
    datosPanelSlice.includes("handleExperimentalImport") &&
    pageSource.includes("createSessionDatasetFromImport") &&
    pageSource.includes("registerAndActivateImportedDataset"),
  "single ImportarDestination owner; leftover Datos import is not Face path"
);

assertCase(
  "r2.importar.preguntar-observation",
  pageSource.includes("isImportarShell") &&
    pageSource.includes("pantalla Importar") &&
    pageSource.includes("formato seleccionado") &&
    pageSource.includes("productScreen={productScreen}") &&
    pageSource.includes(
      'productScreen === "importar" || importDestinationActive'
    ),
  "Preguntar on Importar receives productScreen and import observation"
);

assertCase(
  "pf2.graph.navigation",
  CARD_OPTION_TO_PRODUCT_SCREEN["math-graph"] === "graph" &&
    productScreenToPathname("graph") === "/grafico" &&
    pathnameToProductScreen("/grafico") === "graph" &&
    hookSource.includes("openProductScreen(screen)") &&
    pageSource.includes('openProductScreen("graph")'),
  "Card Gráfico → openProductScreen(graph) → /grafico"
);

assertCase(
  "pf2.graph.own-screen",
  pageSource.includes('data-product-surface="graph"') &&
    graphSurfaceSlice.includes("data-graph-constructor") &&
    graphSurfaceSlice.includes("{graphConstructor}") &&
    !graphSurfaceSlice.includes('role="tabpanel"') &&
    !graphSurfaceSlice.includes('workspaceTabId("data")') &&
    pageSource.includes("productScreen === \"graph\"") &&
    pageSource.includes("const isGraphShell"),
  "Graph constructor is owned by ProductScreenId, not a Tab"
);

assertCase(
  "pf2.graph.no-data-tab-owner",
  !datosPanelSlice.includes("data-graph-constructor") &&
    !datosPanelSlice.includes('title="Constructor de curvas"') &&
    datosPanelSlice.includes("graphConstructor") &&
    graphSurfaceSlice.includes("data-graph-constructor") &&
    pageSource.includes("!isGraphShell"),
  "Product Face Graph is not workspace-panel-data; Datos keeps leftover curves view"
);

assertCase(
  "pf2.graph.no-scroll",
  !/handleSmartStartSelect[\s\S]*scrollIntoView/.test(hookSource) &&
    !pageSource.includes("dataConstructorSectionRef.current?.scrollIntoView") &&
    !hookSource.includes("setActiveWorkspaceSection") &&
    pageSource.includes("onSelect={() => undefined}"),
  "Card Graph does not select a Tab or scroll to the constructor"
);

assertCase(
  "pf2.graph.engine-intact",
  expressionSource.includes(
    "export const evaluateExpression = (expression: string, scope: { x: number }) =>"
  ) &&
    pageSource.includes("evaluateExpression,") &&
    pageSource.includes("const generateGraph = (curveSource?: Curve[]) => {") &&
    (pageSource.match(/const generateGraph = /g) ?? []).length === 1 &&
    pageSource.includes("onClick={() => generateGraph()}"),
  "evaluateExpression and generateGraph contracts unchanged"
);

assertCase(
  "pf2.graph.persistence",
  layoutSource.includes("ProductWorkspaceShell") &&
    pageSource.includes("<GraphEditor />") &&
    pageSource.includes("const graphConstructor =") &&
    !pageSource.includes("createProductNavigationStore"),
  "constructor state stays in persistent GraphEditor shell"
);

assertCase(
  "pf3.comparar.own-screen",
  CARD_OPTION_TO_PRODUCT_SCREEN["compare-datasets"] === "comparar" &&
    productScreenToPathname("comparar") === "/comparar" &&
    pathnameToProductScreen("/comparar") === "comparar" &&
    pageSource.includes('data-product-surface="comparar"') &&
    pageSource.includes("const isCompararShell") &&
    pageSource.includes('productScreen === "comparar"') &&
    compararSurfaceSlice.includes("data-comparar-surface") &&
    compararSurfaceSlice.includes("{compararDatasetsSection}") &&
    compararSurfaceSlice.includes("CompareStepsBanner") &&
    !compararSurfaceSlice.includes('role="tabpanel"') &&
    !compararSurfaceSlice.includes('workspaceTabId("data")'),
  "Card Comparar → ProductScreenId(comparar) owns /comparar"
);

assertCase(
  "pf3.comparar.no-data-owner",
  pageSource.includes("!isCompararShell") &&
    pageSource.includes("showLegacyDatosPanel = isDatosShell") &&
    !datosPanelSlice.includes("data-comparar-surface") &&
    datosPanelSlice.includes("{compararDatasetsSection}") &&
    compararSurfaceSlice.includes("data-comparar-surface") &&
    compararSurfaceSlice.includes("{compararDatasetsSection}") &&
    !compararSurfaceSlice.includes('workspacePanelId("data")') &&
    pageSource.includes(
      "Product Face owner is ProductScreenId(comparar), not this panel."
    ),
  "Product Face Comparar is not workspace-panel-data; Datos keeps leftover slots"
);

assertCase(
  "pf3.comparar.no-tab",
  !compararSurfaceSlice.includes('role="tabpanel"') &&
    !compararSurfaceSlice.includes('workspaceTabId("data")') &&
    pageSource.includes("onSelect={() => undefined}") &&
    !hookSource.includes("setActiveWorkspaceSection") &&
    !hookSource.includes("selectWorkspaceSection"),
  "Card Comparar does not open a Tab; tablist is not the Face router"
);

assertCase(
  "pf3.comparar.no-scroll",
  !/handleSmartStartSelect[\s\S]*scrollIntoView/.test(hookSource) &&
    !pageSource.includes(
      "dataMultiDatasetSectionRef.current?.scrollIntoView"
    ) &&
    pageSource.includes("onSelect={() => undefined}"),
  "Card Comparar does not scroll to comparison inside Datos"
);

assertCase(
  "pf3.comparar.no-auto-analizar",
  CARD_OPTION_TO_PRODUCT_SCREEN["compare-datasets"] === "comparar" &&
    hookSource.includes("openProductScreen(screen)") &&
    hookSource.includes('startGuidedWorkflow("compare-groups")') &&
    !hookSource.includes('openProductScreen("analizar")') &&
    pageSource.includes(
      'if (templateId === "compare-groups" && screen === "analizar")'
    ) &&
    pageSource.includes("openScreenFromWorkflowTab(firstStep.workspaceTab"),
  "compare-groups may start in Comparar; it must not auto-open Analizar"
);

assertCase(
  "pf3.comparar.explicit-analizar",
  compararSurfaceSlice.includes('label: "Continuar a Análisis →"') &&
    compararSurfaceSlice.includes('openProductScreen("analizar")') &&
    !compararSurfaceSlice.includes("openScreenFromWorkflowTab") &&
    pageSource.includes('if (templateId === "compare-groups" && screen === "analizar")'),
  "Analizar opens only via the existing explicit Continuar a Análisis CTA"
);

assertCase(
  "pf3.comparar.shared-state",
  layoutSource.includes("ProductWorkspaceShell") &&
    pageSource.includes("<GraphEditor />") &&
    pageSource.includes("const [comparisonSlots, setComparisonSlots]") &&
    pageSource.includes("createSessionDatasetFromImport") &&
    pageSource.includes("const compararDatasetsSection =") &&
    !pageSource.includes("createProductNavigationStore") &&
    (pageSource.match(/const \[comparisonSlots, setComparisonSlots\]/g) ?? [])
      .length === 1,
  "comparisonSlots and SessionDataset stay in the persistent GraphEditor shell"
);

assertCase(
  "pf4.analizar.own-screen",
  CARD_OPTION_TO_PRODUCT_SCREEN["analyze-workspace"] === "analizar" &&
    productScreenToPathname("analizar") === "/analizar" &&
    pathnameToProductScreen("/analizar") === "analizar" &&
    pageSource.includes('data-product-surface="analizar"') &&
    pageSource.includes("const isAnalizarShell") &&
    pageSource.includes('productScreen === "analizar"') &&
    analizarSurfaceSlice.includes("data-analizar-surface") &&
    analizarSurfaceSlice.includes("{analizarAnalysisBody}") &&
    !analizarSurfaceSlice.includes('role="tabpanel"') &&
    !analizarSurfaceSlice.includes('workspaceTabId("analysis")'),
  "Card Analizar → ProductScreenId(analizar) owns /analizar"
);

assertCase(
  "pf4.analizar.no-analysis-tab-owner",
  pageSource.includes("showLegacyAnalysisPanel = isAnalysisShell") &&
    pageSource.includes("!isAnalizarShell") &&
    pageSource.includes("!isEvaluarShell") &&
    !analizarSurfaceSlice.includes('workspacePanelId("analysis")') &&
    !analizarSurfaceSlice.includes('workspaceTabId("analysis")') &&
    analysisPanelSlice.includes("analizarAnalysisBody") &&
    analysisPanelSlice.includes("showLegacyAnalysisPanel") &&
    !analysisPanelSlice.includes("data-analizar-surface") &&
    !analysisPanelSlice.includes("data-evaluar-surface") &&
    analizarSurfaceSlice.includes("data-analizar-surface") &&
    pageSource.includes(
      "Evaluar methodology lives on data-product-surface=evaluar-metodologia."
    ),
  "Product Face Analizar is not workspace-panel-analysis; leftover is not Evaluar owner"
);

assertCase(
  "pf4.analizar.no-tab",
  !analizarSurfaceSlice.includes('role="tabpanel"') &&
    !analizarSurfaceSlice.includes('workspaceTabId("analysis")') &&
    pageSource.includes("onSelect={() => undefined}") &&
    !hookSource.includes("setActiveWorkspaceSection") &&
    !hookSource.includes("selectWorkspaceSection"),
  "Card Analizar does not open Tab Análisis; tablist is not the Face router"
);

assertCase(
  "pf4.analizar.no-scroll",
  !/handleSmartStartSelect[\s\S]*scrollIntoView/.test(hookSource) &&
    !pageSource.includes(
      "dataAnalysisSectionRef.current?.scrollIntoView"
    ) &&
    pageSource.includes("onSelect={() => undefined}") &&
    !hookSource.includes("setActiveWorkspaceSection"),
  "Card Analizar does not scroll to the inspector"
);

assertCase(
  "pf4.analizar.analysis-state",
  pageSource.includes(
    "const [analysisInspectorSection, setAnalysisInspectorSection]"
  ) &&
    pageSource.includes("ANALYSIS_INSPECTOR_CATEGORIES") &&
    pageSource.includes('data-workspace-surface="analysis-controls"') &&
    pageSource.includes("const analizarAnalysisBody =") &&
    (pageSource.match(/const analizarAnalysisBody =/g) ?? []).length === 1 &&
    (pageSource.match(/data-workspace-surface="analysis-controls"/g) ?? [])
      .length === 1,
  "inspector categories, toggles, and analysisInspectorSection stay shared"
);

assertCase(
  "pf4.analizar.shared-state",
  layoutSource.includes("ProductWorkspaceShell") &&
    pageSource.includes("<GraphEditor />") &&
    pageSource.includes("createSessionDatasetFromImport") &&
    pageSource.includes("const [analysisInspectorSection, setAnalysisInspectorSection]") &&
    !pageSource.includes("createProductNavigationStore"),
  "Analizar reuses the persistent GraphEditor shell; no new store"
);

assertCase(
  "pf4.analizar.scientific-behavior",
  expressionSource.includes(
    "export const evaluateExpression = (expression: string, scope: { x: number }) =>"
  ) &&
    pageSource.includes("ANALYSIS_INSPECTOR_CATEGORIES") &&
    pageSource.includes("setShowCorrelation") &&
    pageSource.includes("setShowStatistics") &&
    pageSource.includes("correlationMethod") &&
    (pageSource.match(/const generateGraph = /g) ?? []).length === 1,
  "existing analysis toggles and ENGINE contracts unchanged"
);

assertCase(
  "pf4.analizar.not-evaluar",
  CARD_OPTION_TO_PRODUCT_SCREEN["evaluate-publication"] ===
    "evaluar-metodologia" &&
    productScreenToPathname("evaluar-metodologia") ===
      "/evaluar-metodologia" &&
    pathnameToProductScreen("/evaluar-metodologia") ===
      "evaluar-metodologia" &&
    CARD_OPTION_TO_PRODUCT_SCREEN["analyze-workspace"] === "analizar" &&
    productScreenToPathname("analizar") === "/analizar" &&
    !analizarSurfaceSlice.includes("evaluate-publication") &&
    evaluarSurfaceSlice.includes("data-evaluar-surface") &&
    evaluarSurfaceSlice.includes("{evaluarMethodologyBody}") &&
    legacyWorkspaceSectionFromScreen("analizar") === "analysis" &&
    legacyWorkspaceSectionFromScreen("evaluar-metodologia") === "analysis",
  "Analizar and Evaluar metodología remain distinct Product Screens"
);

const homeCardTitles = SMART_START_OPTIONS.map((option) => option.title);
const forbiddenHomeCards = ["Avanzado", "Herramientas", "Más", "Otros", "Configuración"];
assertCase(
  "r1.home.card-count-six-coherent",
  SMART_START_OPTIONS.length === 6 &&
    homeCardTitles.join("|") ===
      "Importar datos|Comparar datos|Gráfico y=f(x)|Constructor Visual|Analizar|Evaluar metodología" &&
    SMART_START_OPTIONS.every((option) => option.destinationHint.startsWith("Abre ")) &&
    forbiddenHomeCards.every(
      (title) => !homeCardTitles.some((card) => card === title)
    ),
  homeCardTitles.join(",")
);

assertCase(
  "r1.home.hierarchy",
  homeScreenSource.includes("data-home-identity") &&
    homeScreenSource.includes("data-home-preguntar") &&
    homeScreenSource.includes("data-home-cards") &&
    homeScreenSource.includes("data-home-continuity") &&
    homeScreenSource.includes("SmartStartIntentAssistant") &&
    homeScreenSource.includes("Producto científico") &&
    /Importar, graficar, analizar, comparar, evaluar, interpretar/.test(
      homeScreenSource
    ) &&
    homeScreenSource.includes("Cada Card abre su Product Screen") &&
    !homeScreenSource.includes("¿Qué deseas hacer hoy?") &&
    !homeScreenSource.includes("role=\"tooltip\""),
  "identity → Preguntar → Cards → continuity"
);

assertCase(
  "r1.home.cards-open-product-screen",
  CARD_OPTION_TO_PRODUCT_SCREEN["analyze-dataset"] === "importar" &&
    CARD_OPTION_TO_PRODUCT_SCREEN["compare-datasets"] === "comparar" &&
    CARD_OPTION_TO_PRODUCT_SCREEN["math-graph"] === "graph" &&
    CARD_OPTION_TO_PRODUCT_SCREEN["constructor-visual"] === "vgb" &&
    CARD_OPTION_TO_PRODUCT_SCREEN["analyze-workspace"] === "analizar" &&
    CARD_OPTION_TO_PRODUCT_SCREEN["evaluate-publication"] ===
      "evaluar-metodologia" &&
    hookSource.includes("productScreenForCardOption") &&
    hookSource.includes("openProductScreen(screen)") &&
    !/handleSmartStartSelect[\s\S]*scrollIntoView/.test(hookSource) &&
    !hookSource.includes("setActiveWorkspaceSection") &&
    homeScreenSource.includes("data-home-card={capability.id}") &&
    homeScreenSource.includes("onSelect(capability.id)"),
  "Card → openProductScreen; not Tab/scroll"
);

assertCase(
  "r3.biblioteca.entry-opens-graph",
  pageSource.includes("onOpenFunctionLibrary={() => {") &&
    pageSource.includes('openProductScreen("graph")') &&
    /onOpenFunctionLibrary=\{\(\) => \{[^}]*openProductScreen\("graph"\)/.test(
      pageSource
    ) &&
    !PRODUCT_SCREEN_IDS.includes(
      "biblioteca" as (typeof PRODUCT_SCREEN_IDS)[number]
    ) &&
    !homeCardTitles.includes("Biblioteca") &&
    productScreenToPathname("graph") === "/grafico" &&
    graphSurfaceSlice.includes("{functionLibrarySection}") &&
    graphSurfaceSlice.includes("data-function-library") &&
    datosPanelSlice.includes(
      'dataWorkspaceView === "advanced" ? functionLibrarySection'
    ) &&
    (pageSource.match(/const FUNCTION_LIBRARY/g) ?? []).length === 1 &&
    pageSource.includes("onClick={() => graphExpression(fn.expression)}"),
  "Biblioteca → openProductScreen(graph); reused catalog; leftover Avanzado is not Face owner"
);

assertCase(
  "r3.avanzado.not-product-face",
  !PRODUCT_SCREEN_IDS.includes(
    "avanzado" as (typeof PRODUCT_SCREEN_IDS)[number]
  ) &&
    pathnameToProductScreen("/avanzado") === "home" &&
    pathnameToProductScreen("/avanzado") !== "graph" &&
    !urlSource.includes('avanzado: "/grafico"') &&
    existsSync(join(repoRoot, "src/app/avanzado/page.tsx")) &&
    forbiddenHomeCards.every(
      (title) => !homeCardTitles.some((card) => card === title)
    ) &&
    pageSource.includes('id: "advanced"') &&
    (() => {
      const start = pageSource.indexOf('if (view === "advanced")');
      const end = pageSource.indexOf('if (view === "experimental")', start);
      const slice = start >= 0 && end > start ? pageSource.slice(start, end) : "";
      return (
        slice.includes('setDataWorkspaceView("advanced")') &&
        !slice.includes('openProductScreen("graph")')
      );
    })(),
  "Avanzado is leftover, not Face, not redirected to Graph"
);

assertCase(
  "r4.vgb.card-opens-screen",
  CARD_OPTION_TO_PRODUCT_SCREEN["constructor-visual"] === "vgb" &&
    productScreenToPathname("vgb") === "/vgb" &&
    pathnameToProductScreen("/vgb") === "vgb" &&
    hookSource.includes("openProductScreen(screen)") &&
    pageSource.includes('openProductScreen("vgb")') &&
    existsSync(join(repoRoot, "src/app/vgb/page.tsx")) &&
    !PRODUCT_SCREEN_IDS.includes(
      "constructor-visual" as (typeof PRODUCT_SCREEN_IDS)[number]
    ) &&
    !PRODUCT_SCREEN_IDS.includes(
      "visualizacion" as (typeof PRODUCT_SCREEN_IDS)[number]
    ),
  "Card Constructor Visual → openProductScreen(vgb) → /vgb"
);

assertCase(
  "r4.vgb.own-surface-not-datos-tabpanel",
  pageSource.includes('data-product-surface="vgb"') &&
    pageSource.includes("const isVgbShell") &&
    pageSource.includes('productScreen === "vgb"') &&
    vgbSurfaceSlice.includes("data-vgb-constructor") &&
    vgbSurfaceSlice.includes("{visualBuilderSection}") &&
    vgbSurfaceSlice.includes("<div data-vgb-constructor=\"\">{visualBuilderSection}</div>") &&
    !vgbSurfaceSlice.includes('role="tabpanel"') &&
    !vgbSurfaceSlice.includes('workspaceTabId("data")') &&
    !vgbSurfaceSlice.includes('workspacePanelId("data")') &&
    !vgbSurfaceSlice.includes("graphConstructor") &&
    !vgbSurfaceSlice.includes("data-graph-constructor"),
  "VGB is owned by ProductScreenId, not the Datos tabpanel"
);

assertCase(
  "r4.vgb.legacy-datos-not-face-path",
  pageSource.includes("!isVgbShell") &&
    pageSource.includes("showLegacyDatosPanel = isDatosShell") &&
    !datosPanelSlice.includes("data-vgb-constructor") &&
    datosPanelSlice.includes("visualBuilderSection") &&
    vgbSurfaceSlice.includes("data-vgb-constructor") &&
    (pageSource.match(/<VisualGraphBuilder\b/g) ?? []).length === 1 &&
    pageSource.includes(
      "Product Face owner is ProductScreenId(vgb), not this panel."
    ),
  "Product Face VGB is not workspace-panel-data; Datos keeps leftover visual-builder"
);

assertCase(
  "r4.vgb.no-scroll-or-tab",
  !/handleSmartStartSelect[\s\S]*scrollIntoView/.test(hookSource) &&
    !hookSource.includes("setActiveWorkspaceSection") &&
    pageSource.includes("onSelect={() => undefined}") &&
    /if \(view === "visual-builder"\) \{[^}]*openProductScreen\("vgb"\)/.test(
      pageSource
    ),
  "Card VGB does not select a Tab or scroll to visual-builder"
);

assertCase(
  "r4.vgb.ge-not-vgb",
  graphSurfaceSlice.includes("{graphConstructor}") &&
    graphSurfaceSlice.includes("data-graph-constructor") &&
    !graphSurfaceSlice.includes("data-vgb-constructor") &&
    !graphSurfaceSlice.includes("{visualBuilderSection}") &&
    vgbSurfaceSlice.includes("{visualBuilderSection}") &&
    vgbSurfaceSlice.includes("data-vgb-constructor") &&
    !vgbSurfaceSlice.includes("{graphConstructor}") &&
    CARD_OPTION_TO_PRODUCT_SCREEN["math-graph"] === "graph" &&
    CARD_OPTION_TO_PRODUCT_SCREEN["constructor-visual"] === "vgb" &&
    productScreenToPathname("graph") === "/grafico" &&
    productScreenToPathname("vgb") === "/vgb",
  "GE and VGB remain distinct Product Screens"
);

assertCase(
  "r4.vgb.science-unmodified",
  pageSource.includes("const handleVisualGraphCreate") &&
    pageSource.includes("onCreateGraph={handleVisualGraphCreate}") &&
    (() => {
      const start = pageSource.indexOf("const handleVisualGraphCreate");
      const end = pageSource.indexOf(
        "const buildCurrentComparisonProfileProvenance",
        start
      );
      const slice =
        start >= 0 && end > start ? pageSource.slice(start, end) : "";
      return (
        (slice.match(/openProductScreen\("results"\)/g) ?? []).length === 2 &&
        slice.includes("createProjectVisualGraphEntry") &&
        slice.includes("replaceWorkingVisualGraphEntry")
      );
    })() &&
    existsSync(
      join(repoRoot, "src/components/graph-builder/VisualGraphBuilder.tsx")
    ) &&
    existsSync(join(repoRoot, "src/lib/visualGraphBuilder.ts")),
  "VGB science handlers and VisualGraphBuilder reused"
);

assertCase(
  "r4.vgb.shared-shell",
  layoutSource.includes("ProductWorkspaceShell") &&
    pageSource.includes("<GraphEditor />") &&
    pageSource.includes("const visualBuilderSection") &&
    !pageSource.includes("createProductNavigationStore") &&
    !pageSource.includes('data-product-surface="visualizacion"'),
  "VGB state stays in persistent GraphEditor shell"
);

assertCase(
  "r4.vgb.preguntar-context",
  pageSource.includes("isVgbShell") &&
    pageSource.includes("pantalla Constructor Visual") &&
    pageSource.includes("VGB distinto de Gráfico y=f(x) (GE)") &&
    pageSource.includes("productScreen={productScreen}") &&
    pageSource.includes("isVgbShell ||") &&
    !pageSource.includes("Asistente VGB") &&
    !pageSource.includes("Asistente científico"),
  "Preguntar on VGB receives productScreen vgb observation"
);

assertCase(
  "r5.comparar.face-owns-ab",
  pageSource.includes('data-product-surface="comparar"') &&
    pageSource.includes("const isCompararShell") &&
    compararSurfaceSlice.includes("data-comparar-surface") &&
    pageSource.includes("{compararDatasetsSection}") &&
    /isCompararShell\s*\?\s*"flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto"/.test(
      pageSource
    ) &&
    compararSurfaceSlice.includes('stepLabel="Ahora · Comparar"') &&
    compararSurfaceSlice.includes("Distinto de Analizar") &&
    !compararSurfaceSlice.includes('role="tabpanel"') &&
    !compararSurfaceSlice.includes('workspacePanelId("data")') &&
    !compararSurfaceSlice.includes("{analizarAnalysisBody}") &&
    !compararSurfaceSlice.includes("GuidedWorkflowPanel"),
  "Comparar Face owns A/B; not Datos tabpanel; not Analizar inspector"
);

assertCase(
  "r5.comparar.ab-visible-on-face",
  pageSource.includes("open={isCompararShell || dataSectionOpen.multiDataset}") &&
    pageSource.includes("const captureComparisonSlot") &&
    pageSource.includes("const clearComparisonSlot") &&
    compararSurfaceSlice.includes("CompareStepsBanner") &&
    (pageSource.match(/const \[comparisonSlots, setComparisonSlots\]/g) ?? [])
      .length === 1,
  "A/B stay on Face Comparar; single comparisonSlots"
);

assertCase(
  "r5.comparar.explicit-analizar-and-results",
  compararSurfaceSlice.includes('label: "Continuar a Análisis →"') &&
    compararSurfaceSlice.includes('openProductScreen("analizar")') &&
    (() => {
      const start = compararSurfaceSlice.indexOf(
        'label: "Continuar a Análisis →"'
      );
      const slice =
        start >= 0 ? compararSurfaceSlice.slice(start, start + 320) : "";
      return (
        slice.includes('openProductScreen("analizar")') &&
        !slice.includes('prominence: "primary"')
      );
    })() &&
    compararSurfaceSlice.includes('openProductScreen("results")') &&
    compararSurfaceSlice.includes("Ver comparación en Resultados") &&
    !compararSurfaceSlice.includes("openScreenFromWorkflowTab") &&
    pageSource.includes(
      'if (templateId === "compare-groups" && screen === "analizar")'
    ),
  "Analizar is explicit and not primary; Results continuity uses openProductScreen"
);

assertCase(
  "r5.comparar.preguntar-context",
  pageSource.includes("isCompararShell") &&
    pageSource.includes("pantalla Comparar") &&
    pageSource.includes("Comparar distinto de Analizar") &&
    pageSource.includes("A vacío") &&
    pageSource.includes("B vacío") &&
    pageSource.includes("productScreen={productScreen}") &&
    !pageSource.includes("Asistente de Comparación"),
  "Preguntar on Comparar receives A/B occupancy observation"
);

assertCase(
  "r5.comparar.science-unmodified",
  pageSource.includes("const captureComparisonSlot") &&
    pageSource.includes("const clearComparisonSlot") &&
    pageSource.includes("hasEnoughDataForMultiDatasetComparison") &&
    pageSource.includes("buildCurrentDatasetAnalysisProfile") &&
    !pageSource.includes("createProductNavigationStore") &&
    !pageSource.includes("createComparisonStore"),
  "comparisonSlots handlers and comparison science unchanged"
);

assertCase(
  "r6.analizar.scientific-domains",
  pageSource.includes('label: "Muestreo y ejes"') &&
    pageSource.includes('label: "Modelado de curvas"') &&
    pageSource.includes('label: "Descripción y relación"') &&
    pageSource.includes('label: "Inferencia"') &&
    pageSource.includes('label: "Orientación heurística"') &&
    pageSource.includes('title="Descripción y diagnóstico"') &&
    pageSource.includes('title="Relación (Pearson / Spearman)"') &&
    pageSource.includes('title="Pruebas de grupos"') &&
    analizarBodySlice.includes('stepLabel="Ahora · Analizar"') &&
    pageSource.includes("Distinto de Comparar y de Evaluar metodología") &&
    pageSource.includes("Dominios científicos del análisis") &&
    !pageSource.includes('label: "Visualización"') &&
    !pageSource.includes('title="Esencial"'),
  "Analizar Face groups by scientific function, not the inherited mega-inspector labels"
);

assertCase(
  "r6.analizar.inference-owns-group-tests",
  (() => {
    const inferenceStart = pageSource.indexOf(
      'aria-hidden={analysisInspectorSection !== "inference"}'
    );
    const advisorStart = pageSource.indexOf(
      'aria-hidden={analysisInspectorSection !== "advisor"}'
    );
    const statsStart = pageSource.indexOf(
      'aria-hidden={analysisInspectorSection !== "statistics"}'
    );
    const inferenceSlice =
      inferenceStart >= 0 && advisorStart > inferenceStart
        ? pageSource.slice(inferenceStart, advisorStart)
        : "";
    const statsSlice =
      statsStart >= 0 && inferenceStart > statsStart
        ? pageSource.slice(statsStart, inferenceStart)
        : "";
    return (
      inferenceSlice.includes("Mostrar t-test") &&
      inferenceSlice.includes("Mostrar ANOVA") &&
      inferenceSlice.includes("Mostrar pruebas no paramétricas") &&
      inferenceSlice.includes("Mostrar comparaciones múltiples") &&
      inferenceSlice.includes("Mostrar Effect Size") &&
      !statsSlice.includes("Mostrar t-test") &&
      !statsSlice.includes("Mostrar ANOVA") &&
      statsSlice.includes("Mostrar correlación") &&
      statsSlice.includes('value="pearson"') &&
      statsSlice.includes('value="spearman"')
    );
  })(),
  "t-test/ANOVA live in Inferencia; Pearson/Spearman stay in Descripción y relación"
);

assertCase(
  "r6.analizar.explicit-continuity",
  pageSource.includes('label: "Ver gráfico / Resultados →"') &&
    analizarBodySlice.includes('openProductScreen("results")') &&
    analizarBodySlice.includes('label: "Ir a Importar →"') &&
    analizarBodySlice.includes('openProductScreen("importar")') &&
    !analizarBodySlice.includes("openLegacyDatosSurface") &&
    !analizarBodySlice.includes('label: "← Datos"') &&
    pageSource.includes(
      'if (templateId === "compare-groups" && screen === "analizar")'
    ) &&
    analizarBodySlice.includes("GuidedWorkflowPanel"),
  "Analizar continuity uses openProductScreen; compare-groups does not auto-open Analizar; method panel stays on Analizar"
);

assertCase(
  "r6.analizar.preguntar-context",
  pageSource.includes("isAnalizarShell") &&
    pageSource.includes("pantalla Analizar") &&
    pageSource.includes("Analizar distinto de Comparar y de Evaluar metodología") &&
    pageSource.includes("dominio científico") &&
    pageSource.includes("correlación inactiva") &&
    pageSource.includes("productScreen={productScreen}") &&
    !pageSource.includes("Asistente científico") &&
    !pageSource.includes("Asistente de Análisis"),
  "Preguntar on Analizar receives productScreen analizar observation"
);

assertCase(
  "r6.analizar.science-unmodified",
  pageSource.includes("const [correlationMethod, setCorrelationMethod]") &&
    pageSource.includes('value="pearson"') &&
    pageSource.includes('value="spearman"') &&
    pageSource.includes("const [showTTest, setShowTTest]") &&
    pageSource.includes("const [showAnova, setShowAnova]") &&
    pageSource.includes("const [analysisInspectorSection, setAnalysisInspectorSection]") &&
    (pageSource.match(/const \[correlationMethod, setCorrelationMethod\]/g) ?? [])
      .length === 1 &&
    !pageSource.includes("createAnalysisStore") &&
    !pageSource.includes("p-value/n"),
  "Pearson/Spearman/t-test/ANOVA state and inspector IDs unchanged"
);

const intentRulesSource = readFileSync(
  join(repoRoot, "src/lib/smart-start/intent-rules.ts"),
  "utf8"
);
const methodologyBuildSource = readFileSync(
  join(repoRoot, "src/lib/scientific/methodology/readiness/build.ts"),
  "utf8"
);

assertCase(
  "r7.evaluar.own-screen",
  CARD_OPTION_TO_PRODUCT_SCREEN["evaluate-publication"] ===
    "evaluar-metodologia" &&
    productScreenToPathname("evaluar-metodologia") ===
      "/evaluar-metodologia" &&
    pathnameToProductScreen("/evaluar-metodologia") ===
      "evaluar-metodologia" &&
    pageSource.includes("const isEvaluarShell") &&
    pageSource.includes('productScreen === "evaluar-metodologia"') &&
    evaluarSurfaceSlice.includes('data-product-surface="evaluar-metodologia"') &&
    evaluarSurfaceSlice.includes("data-evaluar-surface") &&
    evaluarSurfaceSlice.includes("{evaluarMethodologyBody}") &&
    !evaluarSurfaceSlice.includes('role="tabpanel"') &&
    !evaluarSurfaceSlice.includes('workspaceTabId("analysis")'),
  "Card Evaluar → ProductScreenId(evaluar-metodologia) owns Evaluar surface"
);

assertCase(
  "r7.evaluar.not-analysis-tab-owner",
  pageSource.includes("!isAnalizarShell") &&
    pageSource.includes("!isEvaluarShell") &&
    pageSource.includes("showLegacyAnalysisPanel = isAnalysisShell") &&
    !evaluarSurfaceSlice.includes('workspacePanelId("analysis")') &&
    analysisPanelSlice.includes("showLegacyAnalysisPanel") &&
    !analysisPanelSlice.includes("data-evaluar-surface") &&
    evaluarSurfaceSlice.includes("data-evaluar-surface"),
  "Evaluar Face is not workspace-panel-analysis"
);

assertCase(
  "r7.evaluar.sci-controls",
  evaluarBodySlice.includes('COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-50"]') &&
    evaluarBodySlice.includes('COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-51"]') &&
    evaluarBodySlice.includes('COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-52"]') &&
    evaluarBodySlice.includes('COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-53"]') &&
    evaluarBodySlice.includes('COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-54"]') &&
    evaluarBodySlice.includes('COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-55"]') &&
    evaluarBodySlice.includes('COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-56"]') &&
    evaluarBodySlice.includes('COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-60"]') &&
    evaluarBodySlice.includes("setShowConsistencyEngine") &&
    evaluarBodySlice.includes("setShowMethodologicalDashboard") &&
    evaluarBodySlice.includes("setShowPublicationDashboard") &&
    !analizarBodySlice.includes(
      'COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-50"]'
    ) &&
    !analizarBodySlice.includes(
      'COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-56"]'
    ) &&
    !analizarBodySlice.includes(
      'COMPOSITE_METHODOLOGY_PRIMARY_LABELS["SCI-60"]'
    ) &&
    (pageSource.match(/setShowConsistencyEngine\(e\.target\.checked\)/g) ?? [])
      .length === 1,
  "SCI-50→55 and SCI-56/60 controls live once on Evaluar"
);

assertCase(
  "r7.evaluar.does-not-absorb-methods",
  analizarBodySlice.includes('value="pearson"') &&
    analizarBodySlice.includes('value="spearman"') &&
    analizarBodySlice.includes("Mostrar t-test") &&
    analizarBodySlice.includes("Mostrar ANOVA") &&
    analizarBodySlice.includes("Mostrar Forest Plot") &&
    !evaluarBodySlice.includes('value="pearson"') &&
    !evaluarBodySlice.includes('value="spearman"') &&
    !evaluarBodySlice.includes("Mostrar t-test") &&
    !evaluarBodySlice.includes("Mostrar ANOVA") &&
    !evaluarBodySlice.includes("Mostrar Forest Plot"),
  "Pearson/Spearman/t-test/ANOVA/Forest remain Analizar"
);

assertCase(
  "r7.evaluar.preguntar-context",
  pageSource.includes("isEvaluarShell") &&
    pageSource.includes("pantalla Evaluar metodología") &&
    pageSource.includes("productScreen evaluar-metodologia") &&
    pageSource.includes("methodologyActive={productScreen === \"evaluar-metodologia\"}") &&
    pageSource.includes("workflow evaluate-publication activo en Evaluar") &&
    !pageSource.includes("Asistente metodológico") &&
    !pageSource.includes("Asistente científico"),
  "Preguntar on Evaluar receives evaluar-metodologia observation"
);

assertCase(
  "r7.evaluar.science-unmodified",
  methodologyBuildSource.includes("?? 50") &&
    pageSource.includes("buildConsistencyEngineAnalysis") &&
    pageSource.includes("buildPublicationDashboardAnalysis") &&
    (pageSource.match(/const \[showConsistencyEngine, setShowConsistencyEngine\]/g) ?? [])
      .length === 1 &&
    (pageSource.match(/function ScientificConsistencyEngine\(/g) ?? [])
      .length === 1 &&
    (pageSource.match(/function ScientificMethodologicalDashboard\(/g) ?? [])
      .length === 1 &&
    !pageSource.includes("createEvaluarStore"),
  "SCI builders, thresholds, and engine UI functions remain single copies"
);

assertCase(
  "r7.evaluar.explicit-continuity",
  evaluarBodySlice.includes('openProductScreen("results")') &&
    evaluarBodySlice.includes('openProductScreen("importar")') &&
    evaluarBodySlice.includes('stepLabel="Ahora · Evaluar"') &&
    !evaluarBodySlice.includes("openLegacyDatosSurface") &&
    !evaluarBodySlice.includes('openProductScreen("analizar")') &&
    intentRulesSource.includes(
      "Evaluar metodología (indicadores SCI-50→60; no publica figura VGB)"
    ) &&
    !intentRulesSource.includes(
      "Análisis → Estadística / indicadores SCI-50→60"
    ),
  "Evaluar continuity uses openProductScreen; intent copy points to Evaluar"
);

assertCase(
  "r7.evaluar.no-sci58",
  analizarBodySlice.includes("Mostrar Multi-Dataset Comparison Dashboard") &&
    !evaluarBodySlice.includes("Mostrar Multi-Dataset Comparison Dashboard") &&
    !evaluarBodySlice.includes("showMultiDatasetComparison"),
  "SCI-58 comparison dashboard toggle stays outside Evaluar"
);

assertCase(
  "r7.evaluar.no-sci57",
  analizarBodySlice.includes("Mostrar Effect Size") &&
    !evaluarBodySlice.includes("Mostrar Effect Size") &&
    !evaluarBodySlice.includes("showEffectSizePower"),
  "SCI-57 Effect Size remains in Analizar Inferencia"
);

assertCase(
  "r7.evaluar.workflow-host",
  evaluarBodySlice.includes('templateId === "evaluate-publication"') &&
    evaluarBodySlice.includes("GuidedWorkflowPanel") &&
    evaluarBodySlice.includes("<PublicationEntryBanner") &&
    analizarBodySlice.includes(
      'guidedWorkflowSession.templateId !== "evaluate-publication"'
    ) &&
    analizarBodySlice.includes("GuidedWorkflowPanel") &&
    !analizarBodySlice.includes("<PublicationEntryBanner"),
  "evaluate-publication host and PublicationEntryBanner live on Evaluar"
);

assertCase(
  "r7.evaluar.no-dashboard-duplication",
  (pageSource.match(/function ScientificConsistencyEngine\(/g) ?? []).length ===
    1 &&
    (pageSource.match(/function ScientificMethodologicalDashboard\(/g) ?? [])
      .length === 1 &&
    (pageSource.match(/<ScientificPublicationDashboard/g) ?? []).length === 1 &&
    !evaluarBodySlice.includes("<ScientificConsistencyEngine") &&
    !evaluarBodySlice.includes("<ScientificMethodologicalDashboard") &&
    !evaluarBodySlice.includes("<ScientificPublicationDashboard"),
  "SCI dashboards remain a single Results tree; Evaluar has controls only"
);

assertCase(
  "r9.reports.own-screen",
  productScreenToPathname("reports") === "/reportes" &&
    pathnameToProductScreen("/reportes") === "reports" &&
    pageSource.includes("const isReportsShell") &&
    pageSource.includes('productScreen === "reports"') &&
    reportsSurfaceSlice.includes('data-product-surface="reports"') &&
    reportsSurfaceSlice.includes("data-reports-surface") &&
    reportsSurfaceSlice.includes("{reportsOutputBody}") &&
    !reportsSurfaceSlice.includes('role="tabpanel"') &&
    !reportsSurfaceSlice.includes('workspaceTabId("reports")'),
  "ProductScreenId(reports) owns Reports surface at /reportes"
);

assertCase(
  "r9.reports.not-tabpanel-owner",
  pageSource.includes("showLegacyReportsPanel") &&
    pageSource.includes("!isReportsShell") &&
    !reportsSurfaceSlice.includes('workspacePanelId("reports")') &&
    reportsPanelSlice.includes("showLegacyReportsPanel") &&
    reportsPanelSlice.includes("showLegacyReportsPanel ? reportsOutputBody") &&
    !reportsPanelSlice.includes("data-reports-surface") &&
    reportsSurfaceSlice.includes("data-reports-surface"),
  "Reports Face is not workspace-panel-reports"
);

assertCase(
  "r9.reports.no-home-card",
  !Object.values(CARD_OPTION_TO_PRODUCT_SCREEN).includes("reports") &&
    !Object.values(CARD_OPTION_TO_PRODUCT_SCREEN).includes("results") &&
    Object.keys(CARD_OPTION_TO_PRODUCT_SCREEN).length === 6,
  "No Card Reports and no Card Results"
);

assertCase(
  "r9.reports.explicit-continuity",
  pageSource.includes('label: "Ir a Reportes"') &&
    pageSource.includes('openProductScreen("reports")') &&
    reportsBodySlice.includes('label: "← Resultados"') &&
    reportsBodySlice.includes('openProductScreen("results")') &&
    !reportsBodySlice.includes("openLegacyDatosSurface") &&
    !reportsBodySlice.includes("scrollIntoView"),
  "Results ↔ Reports continuity uses openProductScreen"
);

assertCase(
  "r9.reports.reuses-implementation",
  (pageSource.match(/const reportsOutputBody =/g) ?? []).length === 1 &&
    (pageSource.match(/const generateScientificReport =/g) ?? []).length === 1 &&
    (pageSource.match(/const scientificReport = useMemo\(/g) ?? []).length ===
      1 &&
    reportsBodySlice.includes("downloadPublicationPackLite") &&
    reportsBodySlice.includes("handleExportScientificReportPdf") &&
    reportsBodySlice.includes("handleCopyScientificReport") &&
    reportsBodySlice.includes("Reporte científico") &&
    reportsBodySlice.includes("Exportaciones") &&
    pageSource.includes("{reportsOutputBody}") &&
    pageSource.includes("showLegacyReportsPanel ? reportsOutputBody"),
  "Single reportsOutputBody reuses existing report/export implementation"
);

assertCase(
  "r9.reports.not-results-tree",
  !reportsBodySlice.includes('title="Gráfico principal"') &&
    !reportsBodySlice.includes("<ScientificConsistencyEngine") &&
    !reportsBodySlice.includes("<ScientificMethodologicalDashboard") &&
    !reportsBodySlice.includes('value="pearson"') &&
    !reportsBodySlice.includes("Mostrar t-test") &&
    !reportsBodySlice.includes("comparisonSlots") &&
    reportsBodySlice.includes("PUBLICATION_PACK_LITE"),
  "Reports does not absorb Results review or analysis controls"
);

assertCase(
  "r9.reports.preguntar-context",
  pageSource.includes("isReportsShell") &&
    pageSource.includes("pantalla Reportes") &&
    pageSource.includes("productScreen reports") &&
    pageSource.includes("reporte científico disponible") &&
    pageSource.includes("Pack Lite y PDF disponibles desde el reporte existente") &&
    !pageSource.includes("Asistente de reportes") &&
    !pageSource.includes("AI Report Assistant"),
  "Preguntar on Reports receives reports observation"
);

assertCase(
  "r9.reports.science-unmodified",
  methodologyBuildSource.includes("?? 50") &&
    pageSource.includes("generateScientificReport") &&
    pageSource.includes("downloadPublicationPackLite") &&
    !pageSource.includes("createReportsStore") &&
    (pageSource.match(/const \[showScientificReport, setShowScientificReport\]/g) ??
      []).length === 1,
  "Report assembly and scientific builders remain single copies"
);

const hookHasWorkflowScrollRouter = /startGuidedWorkflow[\s\S]{0,400}scrollIntoView/.test(
  hookSource
);
const pageWorkflowStartSlice = sliceBetween(
  pageSource,
  "const startGuidedWorkflow =",
  "const {"
);

assertCase(
  "r10.workflow.not-a-product-screen",
  PRODUCT_SCREEN_IDS.join(",") ===
    "home,importar,comparar,graph,vgb,analizar,evaluar-metodologia,results,reports" &&
    !PRODUCT_SCREEN_IDS.includes(
      "workflow" as (typeof PRODUCT_SCREEN_IDS)[number]
    ) &&
    !PRODUCT_SCREEN_IDS.includes(
      "guided-workflow" as (typeof PRODUCT_SCREEN_IDS)[number]
    ) &&
    !Object.values(PRODUCT_SCREEN_PATHNAME).includes("/workflow") &&
    !pageSource.includes('ProductScreenId("workflow")'),
  "Guided Workflow is not a ProductScreen"
);

assertCase(
  "r10.workflow.no-home-card",
  Object.keys(CARD_OPTION_TO_PRODUCT_SCREEN).length === 6 &&
    !Object.keys(CARD_OPTION_TO_PRODUCT_SCREEN).includes("workflow") &&
    !Object.keys(CARD_OPTION_TO_PRODUCT_SCREEN).includes("guided-workflow") &&
    !Object.values(CARD_OPTION_TO_PRODUCT_SCREEN).includes(
      "workflow" as (typeof PRODUCT_SCREEN_IDS)[number]
    ) &&
    SMART_START_OPTIONS.length === 6,
  "No workflow Card; six Home Cards unchanged"
);

assertCase(
  "r10.workflow.state-distinct-from-product-screen",
  pageSource.includes("const [guidedWorkflowSession, setGuidedWorkflowSession]") &&
    pageSource.includes("useProductScreen") &&
    !pageSource.includes("createWorkflowStore") &&
    !pageSource.includes("setProductScreen(guidedWorkflowSession") &&
    pageSource.includes("guidedWorkflowHostMatchesProductScreen"),
  "workflow session stays distinct from ProductScreenId"
);

assertCase(
  "r10.workflow.host-is-product-face-not-tab",
  guidedWorkflowHostMatchesProductScreen(
    "analysis",
    "compare-groups",
    "analizar"
  ) &&
    !guidedWorkflowHostMatchesProductScreen(
      "analysis",
      "compare-groups",
      "comparar"
    ) &&
    guidedWorkflowHostMatchesProductScreen(
      "analysis",
      "evaluate-publication",
      "evaluar-metodologia"
    ) &&
    guidedWorkflowHostMatchesProductScreen("results", "compare-groups", "results") &&
    guidedWorkflowHostMatchesProductScreen("reports", "compare-groups", "reports") &&
    !guidedWorkflowHostMatchesProductScreen("data", "compare-groups", "comparar") &&
    guidedWorkflowHostProductScreenLabel("analysis", "compare-groups") ===
      "Analizar" &&
    guidedWorkflowHostProductScreenLabel("analysis", "evaluate-publication") ===
      "Evaluar metodología" &&
    pageSource.includes("guidedWorkflowHostMatchesProductScreen(") &&
    !pageSource.includes("activeWorkspaceSection === guidedWorkflowHostTab"),
  "workflow panel hosts on ProductScreen, not workspace section"
);

assertCase(
  "r10.workflow.compare-groups-prerequisites-and-no-auto-analizar",
  hookSource.includes('startGuidedWorkflow("compare-groups")') &&
    hookSource.includes("if (comparePlan)") &&
    pageSource.includes(
      'if (templateId === "compare-groups" && screen === "analizar")'
    ) &&
    compararSurfaceSlice.includes('label: "Continuar a Análisis →"') &&
    compararSurfaceSlice.includes('openProductScreen("analizar")') &&
    !compararSurfaceSlice.includes("openScreenFromWorkflowTab") &&
    !compararSurfaceSlice.includes("GuidedWorkflowPanel") &&
    pageWorkflowStartSlice.includes("buildGuidedWorkflowPlan") &&
    pageWorkflowStartSlice.includes("if (!plan)") &&
    pageWorkflowStartSlice.includes("return;"),
  "compare-groups starts in place; empty/invalid plan stays; Analizar is explicit"
);

assertCase(
  "r10.workflow.transitions-openProductScreen-not-tabs-or-scroll",
  pageSource.includes("openScreenFromWorkflowTab(firstStep.workspaceTab") &&
    (pageSource.match(/openScreenFromWorkflowTab\(/g) ?? []).length === 2 &&
    pageSource.includes("openProductScreen(screen)") &&
    !pageSource.includes("setActiveWorkspaceSection(step.workspaceTab") &&
    !pageWorkflowStartSlice.includes("scrollIntoView") &&
    !hookHasWorkflowScrollRouter &&
    pageSource.includes("workspaceTab is host metadata, not a Product Face router") &&
    compararSurfaceSlice.includes('openProductScreen("analizar")') &&
    compararSurfaceSlice.includes('openProductScreen("results")') &&
    reportsBodySlice.includes('openProductScreen("results")') &&
    pageSource.includes('label: "Ir a Reportes"') &&
    pageSource.includes('openProductScreen("reports")'),
  "workflow Face transitions use openProductScreen; no Tab/scroll router; no auto step jump"
);

assertCase(
  "r10.workflow.preguntar-context-unique-identity",
  pageSource.includes("guidedWorkflowPreguntarObservation") &&
    pageSource.includes("Preguntar no inicia ni avanza el workflow") &&
    pageSource.includes("workflow ${templateId} ${guidedWorkflowSession.status}") &&
    pageSource.includes("workflowTemplate={guidedWorkflowSession.templateId}") &&
    pageSource.includes(
      "workflow compare-groups activo en Comparar; no auto-navega a Analizar"
    ) &&
    !pageSource.includes("Workflow Assistant") &&
    !pageSource.includes("Workflow Coach") &&
    !pageSource.includes("Scientific Wizard AI") &&
    !pageSource.includes("Asistente de workflow"),
  "Preguntar receives workflow context and remains the only conversational identity"
);

assertCase(
  "r10.workflow.templates-semantically-intact",
  templatesSource.includes('id: "descriptive"') &&
    templatesSource.includes('id: "compare-groups"') === false &&
    catalogSource.includes('id: "compare-groups"') &&
    catalogSource.includes('id: "explore-structure"') &&
    catalogSource.includes('id: "evaluate-publication"') &&
    planSource.includes("ctx.seriesCount < 2 || ctx.totalObservations === 0") &&
    templatesSource.includes('workspaceTab: "analysis"') &&
    templatesSource.includes('workspaceTab: "results"') &&
    templatesSource.includes('workspaceTab: "reports"'),
  "existing workflow templates, IDs and prerequisites remain"
);

const applyHydrateSource = readFileSync(
  join(repoRoot, "src/lib/project/apply-hydrate-project-v2-patch.ts"),
  "utf8"
);
const graphEditorPersistSource = readFileSync(
  join(repoRoot, "src/app/graphEditorProjectIntegration.ts"),
  "utf8"
);
const typesV2Source = readFileSync(
  join(repoRoot, "src/lib/project/domain/types-v2.ts"),
  "utf8"
);
const collectV2Source = readFileSync(
  join(repoRoot, "src/lib/project/collect-project-snapshot-v2.ts"),
  "utf8"
);

assertCase(
  "r11.persist.additive-productScreen-not-schema-v3",
  typesV2Source.includes("productScreen?: ProductScreenId") &&
    typesV2Source.includes("workspace: ProjectWorkspaceV2") &&
    !typesV2Source.includes("DOMAIN_SCHEMA_VERSION_V3") &&
    graphEditorPersistSource.includes("productScreen: input.productScreen") &&
    pageSource.includes("setProductScreen: openProductScreen"),
  "additive workspace.productScreen; schema remains v2"
);

assertCase(
  "r11.persist.restore-openProductScreen-not-dom-host",
  applyHydrateSource.includes("resolvePersistedProductScreen(") &&
    applyHydrateSource.includes("apply.setProductScreen(") &&
    !applyHydrateSource.includes(
      "apply.setActiveWorkspaceSection(project.workspace.activeSection)"
    ) &&
    !applyHydrateSource.includes("workspace-panel-results") &&
    !applyHydrateSource.includes("workspace-panel-reports") &&
    !collectV2Source.includes("workspace-panel-") &&
    !graphEditorPersistSource.includes("workspace-panel-") &&
    pageSource.includes("setProductScreen: openProductScreen"),
  "restore lands via setProductScreen → openProductScreen; no DOM host persist"
);

assertCase(
  "r11.persist.exact-screen-beats-lossy-section",
  resolvePersistedProductScreen({
    productScreen: "comparar",
    activeSection: "data",
    controlPanelTab: "data",
  }) === "comparar" &&
    resolvePersistedProductScreen({
      productScreen: "vgb",
      activeSection: "data",
    }) === "vgb" &&
    resolvePersistedProductScreen({
      productScreen: "evaluar-metodologia",
      activeSection: "analysis",
    }) === "evaluar-metodologia" &&
    resolvePersistedProductScreen({
      productScreen: "graph",
      activeSection: "data",
      controlPanelTab: "data",
    }) === "graph" &&
    resolvePersistedProductScreen({
      productScreen: "home",
      activeSection: "data",
    }) === "home" &&
    resolvePersistedProductScreen({
      productScreen: "results",
      activeSection: "results",
    }) === "results" &&
    resolvePersistedProductScreen({
      productScreen: "reports",
      activeSection: "reports",
    }) === "reports"
);

assertCase(
  "r11.persist.legacy-fallback-documented",
  resolvePersistedProductScreen({ activeSection: "data" }) === "importar" &&
    resolvePersistedProductScreen({
      activeSection: "data",
      controlPanelTab: "graph",
    }) === "graph" &&
    resolvePersistedProductScreen({ activeSection: "analysis" }) === "analizar" &&
    resolvePersistedProductScreen({ activeSection: "results" }) === "results" &&
    resolvePersistedProductScreen({ activeSection: "reports" }) === "reports" &&
    resolvePersistedProductScreen({ activeSection: "home" }) === "home" &&
    resolvePersistedProductScreen({
      productScreen: "not-a-screen",
      activeSection: "data",
    }) === "importar"
);

assertCase(
  "r11.persist.catalog-and-cards-unchanged",
  PRODUCT_SCREEN_IDS.join(",") ===
    "home,importar,comparar,graph,vgb,analizar,evaluar-metodologia,results,reports" &&
    SMART_START_OPTIONS.length === 6
);

const conversationSurfaceSource = readFileSync(
  join(repoRoot, "src/components/conversation/ScientificConversationSurface.tsx"),
  "utf8"
);

assertCase(
  "r12.face.routing-authoritative",
  pageSource.includes("const openProductScreen = (screen: ProductScreenId)") &&
    pageSource.includes("syncProductScreen(screen)") &&
    pageSource.includes("legacyWorkspaceSectionFromScreen(productScreen)") &&
    pageSource.includes("activeWorkspaceSection is DERIVED") &&
    !pageSource.includes("setProductScreen(activeWorkspaceSection") &&
    PRODUCT_SCREEN_IDS.every(
      (screen) => pathnameToProductScreen(productScreenToPathname(screen)) === screen
    ),
  "ProductScreenId → openProductScreen → URL remains the Face router"
);

assertCase(
  "r12.face.no-tab-router",
  !pageSource.includes("onSelect={selectWorkspaceSection}") &&
    pageSource.includes("onSelect={() => undefined}") &&
    pageSource.includes("Not a Product Face router.") &&
    homeSurfaceSlice.includes('data-product-surface="home"') &&
    !homeSurfaceSlice.includes('role="tabpanel"') &&
    !importarSurfaceSlice.includes('role="tabpanel"') &&
    !resultsSurfaceSlice.includes('role="tabpanel"') &&
    !reportsSurfaceSlice.includes('role="tabpanel"'),
  "Product Face surfaces are not workspace tabpanels"
);

assertCase(
  "r12.face.no-scroll-router",
  !/handleSmartStartSelect[\s\S]*scrollIntoView/.test(hookSource) &&
    !pageSource.includes("dataImportSectionRef.current?.scrollIntoView") &&
    pageSource.includes("if (productScreen !== \"results\") return") &&
    !pageSource.includes("if (activeWorkspaceSection !== \"results\") return") &&
    !resultsBodySlice.includes("scrollIntoView") &&
    !reportsBodySlice.includes("scrollIntoView"),
  "Face navigation does not scroll-to-panel; intra-Results focus is Face-gated"
);

assertCase(
  "r12.face.no-overlay-router",
  !pageSource.includes("openLegacyDatosSurface") &&
    pageSource.includes("setLegacyDatosSurfaceActive(false)") &&
    pageSource.includes("productScreen === \"reports\" && !isReportsModuleEnabled") &&
    pageSource.includes("setLegacyDatosSurfaceActive(true)") &&
    !homeSurfaceSlice.includes("openLegacyDatosSurface") &&
    !importarSurfaceSlice.includes("Continuar a Datos") &&
    !resultsSurfaceSlice.includes("setLegacyDatosSurfaceActive(true)") &&
    !reportsSurfaceSlice.includes("openLegacyDatosSurface"),
  "Face does not route through overlays; reports-disabled overlay is compatibility only"
);

assertCase(
  "r12.face.no-dom-panel-router",
  applyHydrateSource.includes("apply.setProductScreen(") &&
    applyHydrateSource.includes("resolvePersistedProductScreen(") &&
    !applyHydrateSource.includes("workspace-panel-results") &&
    !applyHydrateSource.includes("scrollIntoView") &&
    resultsSurfaceSlice.includes("data-product-surface=\"results\"") &&
    !resultsSurfaceSlice.includes('workspacePanelId("results")'),
  "Restore and Results Face do not route via DOM panel ids"
);

assertCase(
  "r12.results.own-screen",
  productScreenToPathname("results") === "/resultados" &&
    pathnameToProductScreen("/resultados") === "results" &&
    pageSource.includes("const isResultsShell") &&
    pageSource.includes('productScreen === "results"') &&
    resultsSurfaceSlice.includes('data-product-surface="results"') &&
    resultsSurfaceSlice.includes("data-results-surface") &&
    resultsSurfaceSlice.includes("{resultsReviewBody}") &&
    !resultsSurfaceSlice.includes('role="tabpanel"') &&
    !resultsSurfaceSlice.includes('workspaceTabId("results")'),
  "ProductScreenId(results) owns Results surface at /resultados"
);

assertCase(
  "r12.results.not-tabpanel-owner",
  pageSource.includes("showLegacyResultsPanel") &&
    pageSource.includes("!isResultsShell") &&
    !resultsSurfaceSlice.includes('workspacePanelId("results")') &&
    resultsPanelSlice.includes("showLegacyResultsPanel") &&
    resultsPanelSlice.includes("showLegacyResultsPanel ? resultsReviewBody") &&
    !resultsPanelSlice.includes("data-results-surface") &&
    resultsSurfaceSlice.includes("data-results-surface"),
  "Results Face is not workspace-panel-results"
);

assertCase(
  "r12.reports.own-screen-preserved",
  productScreenToPathname("reports") === "/reportes" &&
    reportsSurfaceSlice.includes('data-product-surface="reports"') &&
    reportsSurfaceSlice.includes("data-reports-surface") &&
    reportsSurfaceSlice.includes("{reportsOutputBody}") &&
    !reportsSurfaceSlice.includes('role="tabpanel"') &&
    !reportsSurfaceSlice.includes('data-product-surface="results"'),
  "Reports Face ownership unchanged"
);

assertCase(
  "r12.results-reports.boundary",
  resultsBodySlice.includes('title="Gráfico principal"') &&
    resultsBodySlice.includes("<ScientificConsistencyEngine") &&
    resultsBodySlice.includes("<ScientificMethodologicalDashboard") &&
    resultsBodySlice.includes("Ir a Reportes") &&
    resultsBodySlice.includes('openProductScreen("reports")') &&
    !resultsBodySlice.includes("downloadPublicationPackLite") &&
    !resultsBodySlice.includes("PUBLICATION_PACK_LITE") &&
    reportsBodySlice.includes("downloadPublicationPackLite") &&
    reportsBodySlice.includes("Reporte científico") &&
    reportsBodySlice.includes('label: "← Resultados"') &&
    reportsBodySlice.includes('openProductScreen("results")') &&
    !reportsBodySlice.includes('title="Gráfico principal"') &&
    !reportsBodySlice.includes("<ScientificConsistencyEngine"),
  "Results owns scientific review; Reports owns assembly/export"
);

assertCase(
  "r12.results.reuses-implementation",
  (pageSource.match(/const resultsReviewBody =/g) ?? []).length === 1 &&
    (pageSource.match(/<ScientificConsistencyEngine/g) ?? []).length === 1 &&
    (pageSource.match(/function ScientificMethodologicalDashboard\(/g) ?? [])
      .length === 1 &&
    resultsBodySlice.includes("📈 Resultados") &&
    resultsBodySlice.includes("Revisión e interpretación") &&
    resultsBodySlice.includes('openProductScreen("vgb")') &&
    !resultsBodySlice.includes('openDataView("visual-builder")') &&
    pageSource.includes("{resultsReviewBody}") &&
    pageSource.includes("showLegacyResultsPanel ? resultsReviewBody"),
  "Single resultsReviewBody reuses existing Results implementation"
);

assertCase(
  "r12.home.six-cards-no-new-screens",
  SMART_START_OPTIONS.length === 6 &&
    Object.keys(CARD_OPTION_TO_PRODUCT_SCREEN).length === 6 &&
    !Object.values(CARD_OPTION_TO_PRODUCT_SCREEN).includes("results") &&
    !Object.values(CARD_OPTION_TO_PRODUCT_SCREEN).includes("reports") &&
    PRODUCT_SCREEN_IDS.join(",") ===
      "home,importar,comparar,graph,vgb,analizar,evaluar-metodologia,results,reports" &&
    homeSurfaceSlice.includes("data-product-surface=\"home\"") &&
    homeSurfaceSlice.includes("<SmartStartScreen") &&
    !homeSurfaceSlice.includes('role="tabpanel"') &&
    !homeCardTitles.includes("Resultados") &&
    !homeCardTitles.includes("Reportes") &&
    !homeCardTitles.includes("Workflow") &&
    !homeCardTitles.includes("Avanzado"),
  "Six Home Cards and nine ProductScreens unchanged; Home is a Face surface"
);

assertCase(
  "r12.persist.v2-productScreen-and-activeSection",
  typesV2Source.includes("productScreen?: ProductScreenId") &&
    !typesV2Source.includes("DOMAIN_SCHEMA_VERSION_V3") &&
    applyHydrateSource.includes("resolvePersistedProductScreen(") &&
    applyHydrateSource.includes("apply.setProductScreen(") &&
    graphEditorPersistSource.includes("productScreen: input.productScreen") &&
    resolvePersistedProductScreen({
      productScreen: "results",
      activeSection: "data",
    }) === "results" &&
    resolvePersistedProductScreen({ activeSection: "results" }) === "results" &&
    pageSource.includes('activeWorkspaceSection === "results"') &&
    pageSource.includes('activeWorkspaceSection === "data"') &&
    pageSource.includes('activeWorkspaceSection === "analysis"') &&
    pageSource.includes('activeWorkspaceSection === "reports"'),
  "v2 productScreen restore is authoritative; activeSection remains compatibility"
);

assertCase(
  "r12.workflow.session-and-compare-groups",
  applyHydrateSource.includes("apply.setGuidedWorkflowSession({ ...project.workflow.session })") &&
    pageSource.includes("GUIDED_WORKFLOW_IDLE_SESSION") &&
    pageSource.includes('if (templateId === "compare-groups" && screen === "analizar")') &&
    catalogSource.includes('id: "compare-groups"') &&
    !PRODUCT_SCREEN_IDS.includes(
      "workflow" as (typeof PRODUCT_SCREEN_IDS)[number]
    ),
  "workflow.session and compare-groups stay journey state, not a Face router"
);

assertCase(
  "r12.preguntar.identity-and-results-context",
  conversationSurfaceSource.includes('"Preguntar"') &&
    pageSource.includes("<ConversationQueryBox") &&
    pageSource.includes("isResultsShell") &&
    pageSource.includes("pantalla Resultados") &&
    pageSource.includes("productScreen results") &&
    pageSource.includes("Resultados distinto de Reportes") &&
    !pageSource.includes("Scientific Copilot") &&
    !pageSource.includes("Workflow AI") &&
    !conversationSurfaceSource.includes("Asistente científico"),
  "Preguntar identity preserved with Results Face context"
);

assertCase(
  "r12.graph-editor.persistent-single-mount",
  layoutSource.includes("ProductWorkspaceShell") &&
    shellExport.includes("<ProductCompositionHost>") &&
    shellExport.includes("<GraphEditor />") &&
    (shellExport.match(/<GraphEditor/g) ?? []).length === 1 &&
    pageSource.includes("data-graph-editor-mounts") &&
    pageSource.includes("workspaceGraphEditorMounts += 1") &&
    !pageSource.includes("createProductNavigationStore"),
  "GraphEditor remains one persistent mount in the Product workspace shell"
);

assertCase(
  "r12.avanzado.outside-face-biblioteca-to-graph",
  !PRODUCT_SCREEN_IDS.includes(
    "avanzado" as (typeof PRODUCT_SCREEN_IDS)[number]
  ) &&
    pathnameToProductScreen("/avanzado") === "home" &&
    pageSource.includes('openProductScreen("graph")') &&
    pageSource.includes("Leftover Avanzado view") &&
    pageSource.includes('if (view === "advanced")') &&
    pageSource.includes("Must not open Graph") &&
    datosPanelSlice.includes('dataWorkspaceView === "advanced"') &&
    PRODUCT_SCREEN_IDS.includes("vgb") &&
    PRODUCT_SCREEN_IDS.includes("graph") &&
    vgbSurfaceSlice.includes('data-product-surface="vgb"') &&
    graphSurfaceSlice.includes('data-product-surface="graph"'),
  "Avanzado stays outside Face; Biblioteca → graph; VGB ≠ Graph"
);

assertCase(
  "r12.legacy.compat-adapters-retained",
  pageSource.includes("legacyRenderPlanForScreen(productScreen)") &&
    pageSource.includes("legacyWorkspaceSectionFromScreen(productScreen)") &&
    pageSource.includes("showLegacyDatosPanel") &&
    pageSource.includes("showLegacyAnalysisPanel") &&
    pageSource.includes("showLegacyReportsPanel") &&
    pageSource.includes("showLegacyResultsPanel") &&
    pageSource.includes("legacyDatosSurfaceActive") &&
    typeof legacyRenderPlanForScreen === "function" &&
    typeof persistedWorkspaceToProductScreen === "function" &&
    typeof resolvePersistedProductScreen === "function",
  "Compatibility adapters remain; they are not the Face router"
);

assertCase(
  "r12.science.unmodified-hosts",
  resultsBodySlice.includes('title="Gráfico principal"') &&
    resultsBodySlice.includes("El t-test asume independencia") &&
    resultsBodySlice.includes("🧪 ANOVA") &&
    resultsBodySlice.includes("<ScientificConsistencyEngine") &&
    !pageSource.includes("createResultsStore") &&
    methodologyBuildSource.includes("?? 50") &&
    (pageSource.match(/const generateScientificReport =/g) ?? []).length === 1,
  "Scientific review hosts remain; R12 did not add a Results store or change builders"
);

const panelSource = readFileSync(
  join(repoRoot, "src/components/workspace/panels/Panel.tsx"),
  "utf8"
);

assertCase(
  "r13.face.nine-surface-owners",
  [
    "home",
    "importar",
    "comparar",
    "graph",
    "vgb",
    "analizar",
    "evaluar-metodologia",
    "results",
    "reports",
  ].every((id) =>
    pageSource.includes(`data-product-surface="${id}"`)
  ) &&
    !pageSource.includes('data-product-surface="evaluar"') &&
    !pageSource.includes('data-product-surface="avanzado"') &&
    !pageSource.includes('data-product-surface="workflow"') &&
    PRODUCT_SCREEN_IDS.length === 9,
  "Each ProductScreenId has a Face owner; Evaluar uses evaluar-metodologia"
);

assertCase(
  "r13.home.cards-gated-to-home",
  homeSurfaceSlice.includes("{isHomeShell ? (") &&
    homeSurfaceSlice.includes("<SmartStartScreen") &&
    homeSurfaceSlice.includes(": null}"),
  "Home Cards mount only on the Home Product Surface"
);

assertCase(
  "r13.panels.collapsed-inert",
  panelSource.includes("aria-hidden={collapsed || undefined}") &&
    panelSource.includes("inert={collapsed || undefined}") &&
    panelSource.includes("aria-label={title}") &&
    panelSource.includes("Children always remain mounted"),
  "Collapsed Explorer/Inspector/Console stay mounted but inert on Face"
);

assertCase(
  "r13.legacy.tablist-and-leftover-panels-inert",
  pageSource.includes("Leftover IDE tablist") &&
    /<nav[\s\S]*?\binert\b[\s\S]*?role="tablist"[\s\S]*?aria-label="Workspace científico"/.test(
      pageSource
    ) &&
    pageSource.includes("inert={!showLegacyDatosPanel || undefined}") &&
    pageSource.includes("inert={!showLegacyAnalysisPanel || undefined}") &&
    pageSource.includes("inert={!showLegacyResultsPanel || undefined}") &&
    pageSource.includes("inert={!showLegacyReportsPanel || undefined}"),
  "Leftover workspace tablist and tabpanels are inert when not Face owners"
);

assertCase(
  "r13.analizar.domain-tabs-subordinate",
  analizarBodySlice.includes("Dominios científicos de Analizar") &&
    analizarBodySlice.includes("No son pestañas del producto") &&
    pageSource.includes('aria-label="Dominios científicos del análisis"') &&
    analizarSurfaceSlice.includes("{analizarAnalysisBody}") &&
    !analizarSurfaceSlice.includes('role="tabpanel"'),
  "Analizar domain tabs remain scientific, not Product Face navigation"
);

assertCase(
  "r13.cards.frozen-six-no-explosion",
  SMART_START_OPTIONS.length === 6 &&
    Object.keys(CARD_OPTION_TO_PRODUCT_SCREEN).length === 6 &&
    homeCardTitles.join("|") ===
      "Importar datos|Comparar datos|Gráfico y=f(x)|Constructor Visual|Analizar|Evaluar metodología" &&
    !homeCardTitles.includes("Resultados") &&
    !homeCardTitles.includes("Reportes") &&
    !homeCardTitles.includes("Avanzado") &&
    !homeCardTitles.includes("Herramientas") &&
    !homeCardTitles.includes("Más") &&
    !homeCardTitles.includes("Otros"),
  "Six functional Cards unchanged; no convenience split or merge"
);

assertCase(
  "r13.preguntar.single-identity",
  conversationSurfaceSource.includes('"Preguntar"') &&
    homeScreenSource.includes("Preguntar orienta") &&
    pageSource.includes("<ConversationQueryBox") &&
    !pageSource.includes("Scientific Copilot") &&
    !pageSource.includes("Workflow AI") &&
    !conversationSurfaceSource.includes("Asistente científico") &&
    !homeScreenSource.includes("Copilot") &&
    !homeScreenSource.includes("Advisor"),
  "Preguntar remains the one conversational identity"
);

assertCase(
  "r13.inspector.contextual-stays-in-page",
  /Inspector contextual/.test(pageSource) &&
    /ANALYSIS_INSPECTOR_CATEGORIES/.test(pageSource) &&
    /getAnalysisInspectorPanelClass/.test(pageSource) &&
    /Dominios científicos del análisis/.test(pageSource) &&
    /<Inspector[\s\S]*?\bvisible=\{false\}/.test(pageSource),
  "Analysis Inspector stays in Analizar; empty dock remains visible={false}"
);

assertCase(
  "r13.graph-editor.single-mount-unchanged",
  layoutSource.includes("ProductWorkspaceShell") &&
    (shellExport.match(/<GraphEditor/g) ?? []).length === 1 &&
    pageSource.includes("data-graph-editor-mounts") &&
    !pageSource.includes("createProductNavigationStore"),
  "GraphEditor remains one persistent mount"
);

assertCase(
  "r13.reports.empty-state-analizar-not-tab",
  reportsBodySlice.includes(
    "Active reporte, interpretación o informe heurístico en Analizar"
  ) &&
    !reportsBodySlice.includes("pestaña") &&
    !reportsBodySlice.includes("pestaña Análisis"),
  "Reports empty state points to Analizar Product Screen, not a workspace tab"
);

assertCase(
  "r13.vgb.inherited-freeze-untouched",
  existsSync(
    join(repoRoot, "src/lib/visualGraphBuilder/__tests__/scatter.cases.ts")
  ) &&
    readFileSync(
      join(repoRoot, "src/lib/visualGraphBuilder/__tests__/scatter.cases.ts"),
      "utf8"
    ).includes("scatter.amend.api-freeze-prerequisite"),
  "Inherited VGB freeze case is not deleted, weakened, or retargeted"
);

const summary = {
  phase: "product-navigation-unit",
  pass: results.every((item) => item.pass),
  caseCount: results.length,
  cases: results,
};
console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
