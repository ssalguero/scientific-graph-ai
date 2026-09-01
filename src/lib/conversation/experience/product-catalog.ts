import type { GroundingFact } from "./types";

/**
 * Verifiable product capabilities. Never invent beyond this catalog.
 * .xls remains supported but environmentally unverified — not a defect.
 */
export const PRODUCT_FACTS: readonly GroundingFact[] = [
  {
    id: "product.identity",
    kind: "product",
    title: "Scientific Graph AI",
    statement:
      "Scientific Graph AI es un producto científico para importar, graficar, analizar, comparar, evaluar, interpretar y reportar. La IA conversa, orienta, aconseja, explica e interpreta. Las Cards ejecutan. El usuario decide.",
  },
  {
    id: "product.journey",
    kind: "product",
    title: "Recorrido",
    statement:
      "El recorrido del producto es Inicio, las Cards, las Product Screens, Resultados y Reportes. Las Cards ejecutan. Resultados revisa. Reportes es la salida documental. Las Tabs no gobiernan el producto.",
  },
  {
    id: "product.cards",
    kind: "product",
    title: "Cards de Inicio",
    statement:
      "Desde Inicio podés empezar con las Cards: Importar datos, Comparar datos, Gráfico y=f(x), Constructor Visual, Analizar y Evaluar metodología. La IA puede recomendar una Card; no la pulsa por vos.",
  },
  {
    id: "product.import",
    kind: "product",
    title: "Importar",
    statement:
      "Los datos experimentales se incorporan por archivo desde Importar. Formatos actuales: CSV (con o sin encabezado), TXT de pares numéricos, XLSX, ODS y proyecto .sgproj.",
    caveat:
      "Un TXT con encabezado de texto no está soportado por el contrato actual. .xls está soportado pero ambientalmente no verificado en este entorno.",
  },
  {
    id: "product.no-manual-entry",
    kind: "absence",
    title: "Ingreso manual",
    statement:
      "No hay ingreso manual de celdas ni escritura de datos a mano. Para incorporar datos hay que importar un archivo desde Importar.",
  },
  {
    id: "product.ge",
    kind: "product",
    title: "Constructor y=f(x)",
    statement:
      "El Constructor y=f(x) (GE) trabaja con expresiones matemáticas. La visualización se revisa en Resultados. No abre el Constructor Visual.",
  },
  {
    id: "product.vgb",
    kind: "product",
    title: "Constructor Visual",
    statement:
      "El Constructor Visual (VGB) arma una figura visual de trabajo. Es distinto de GE. VGB no alimenta Análisis automáticamente.",
  },
  {
    id: "product.compare",
    kind: "product",
    title: "Comparar",
    statement:
      "La comparación de grupos o datasets se prepara en Comparar y se revisa en Resultados. Un snapshot comparativo no se convierte solo en análisis vivo.",
  },
  {
    id: "product.analysis",
    kind: "product",
    title: "Análisis",
    statement:
      "Análisis configura y controla el cálculo: visualización, matemática, estadística, inferencia y advisor. El usuario activa métodos. La revisión está en Resultados.",
  },
  {
    id: "product.results",
    kind: "product",
    title: "Resultados",
    statement:
      "Resultados es el centro de revisión científica: gráfico, estadísticas calculadas y lecturas del sistema. Análisis permanece como control.",
  },
  {
    id: "product.reports",
    kind: "product",
    title: "Reportes",
    statement:
      "Reportes es la salida documental: reporte científico y Pack de publicación (Lite: PDF científico + figura companion PNG). No es un chatbot ni un paquete manuscrito completo.",
  },
  {
    id: "product.evaluate",
    kind: "product",
    title: "Evaluar metodología",
    statement:
      "Evaluar metodología usa indicadores SCI-50→60 de preparación metodológica. No publica una figura VGB y no reemplaza Reportes.",
  },
  {
    id: "product.library",
    kind: "product",
    title: "Biblioteca de funciones",
    statement:
      "La biblioteca de funciones pertenece al Constructor y=f(x). No es una Card ni una Product Screen propia.",
  },
  {
    id: "product.persistence",
    kind: "product",
    title: "Proyecto",
    statement:
      "Guardar y Abrir Proyecto recuperan el artefacto durable (.sgproj). También hay una biblioteca local de proyectos. Restaurar sesión de ventanas o contenido efímero no está disponible.",
  },
  {
    id: "product.auth",
    kind: "product",
    title: "Cuenta",
    statement:
      "Iniciar sesión es opcional para nube. El trabajo científico local no exige cuenta. La IA no gestiona autenticación por el usuario.",
  },
  {
    id: "product.non-autonomy",
    kind: "boundary",
    title: "No autonomía",
    statement:
      "La IA no navega, no ejecuta análisis, no pulsa Cards y no muta el workspace. Puede pensar con vos; no actúa por vos.",
  },
];

export const UNSUPPORTED_CAPABILITY_CUES: readonly {
  id: string;
  needles: readonly string[];
  factId: string;
}[] = [
  {
    id: "manual-entry",
    needles: [
      "tipear",
      "tipear los datos",
      "escribir los datos",
      "ingreso manual",
      "cargar a mano",
      "teclear",
      "pegar en una tabla vacia",
      "crear filas",
    ],
    factId: "product.no-manual-entry",
  },
];
