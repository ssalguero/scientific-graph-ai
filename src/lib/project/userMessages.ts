import { PROJECT_FILE_EXTENSION, PROJECT_KIND } from "./constants";
import type { ProjectValidationIssue } from "./types";

export type ProjectFileFeedbackKind = "success" | "error" | "warning" | "info";

export type SniffedJsonFileKind =
  | "sgproj"
  | "graph-json"
  | "invalid-json"
  | "unknown-json";

const CODE_MESSAGES: Record<string, string> = {
  "P-JSON": "El archivo no contiene JSON válido.",
  "P-ROOT": "El archivo no tiene la estructura de un proyecto científico.",
  "P-KIND": `El archivo no es un proyecto científico (${PROJECT_FILE_EXTENSION}). Use Guardar proyecto para exportar.`,
  "P-SCHEMA": "Falta o es inválida la versión del esquema del proyecto.",
  "P-APP": "Falta la versión de la aplicación en el archivo.",
  "P-EXPORTED": "Falta la fecha de exportación en el archivo.",
  "P-PROJECT": "El bloque principal del proyecto está ausente o es inválido.",
  "M-UNSUPPORTED":
    "Este proyecto fue creado con una versión más nueva de la aplicación. Actualice Scientific Graph AI e intente de nuevo.",
  "M-MISSING": "No se puede migrar este proyecto a la versión actual.",
  "V-META-NAME": "El nombre del proyecto en el archivo no es válido.",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const sniffJsonFileKind = (text: string): SniffedJsonFileKind => {
  const trimmed = text.trim();
  if (!trimmed) return "invalid-json";

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return "invalid-json";
  }

  if (!isRecord(parsed)) return "unknown-json";

  if (parsed.kind === PROJECT_KIND) {
    return "sgproj";
  }

  if (
    typeof parsed.expression === "string" ||
    typeof parsed.min_x === "number" ||
    (Array.isArray(parsed.curves) &&
      parsed.curves.some(
        (curve) => isRecord(curve) && typeof curve.expression === "string"
      ))
  ) {
    return "graph-json";
  }

  return "unknown-json";
};

export const validateProjectFileSelection = (
  fileName: string
): ProjectValidationIssue | null => {
  const lower = fileName.trim().toLowerCase();
  if (!lower) {
    return {
      code: "U-EMPTY-NAME",
      path: "file",
      message: "No se seleccionó ningún archivo.",
      severity: "error",
    };
  }
  if (!lower.endsWith(PROJECT_FILE_EXTENSION)) {
    return {
      code: "U-EXTENSION",
      path: "file",
      message: `Seleccione un archivo ${PROJECT_FILE_EXTENSION}.`,
      severity: "error",
    };
  }
  return null;
};

export const formatProjectValidationIssue = (
  issueItem: ProjectValidationIssue
): string => CODE_MESSAGES[issueItem.code] ?? issueItem.message;

export const formatProjectOpenError = (
  errors: ProjectValidationIssue[],
  options?: { fileText?: string }
): string => {
  if (options?.fileText !== undefined) {
    const sniffed = sniffJsonFileKind(options.fileText);
    if (sniffed === "graph-json") {
      return "Este archivo parece un gráfico JSON, no un proyecto científico. Use Importar gráfico (JSON) en el constructor de curvas.";
    }
    if (sniffed === "invalid-json") {
      return "El archivo está vacío o no contiene JSON válido.";
    }
    if (sniffed === "unknown-json") {
      return `El archivo no es un proyecto científico válido (${PROJECT_FILE_EXTENSION}).`;
    }
  }

  const primary = errors.find((item) => item.severity === "error") ?? errors[0];
  if (!primary) {
    return "No se pudo abrir el proyecto.";
  }
  return formatProjectValidationIssue(primary);
};

export const formatProjectSaveError = (
  errors: ProjectValidationIssue[]
): string => {
  const primary = errors.find((item) => item.severity === "error") ?? errors[0];
  if (!primary) return "No se pudo guardar el proyecto.";
  return formatProjectValidationIssue(primary);
};

export const formatProjectWarningCount = (count: number): string =>
  count === 1 ? " (1 advertencia)" : ` (${count} advertencias)`;
