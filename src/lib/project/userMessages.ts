import { PROJECT_FILE_EXTENSION, PROJECT_KIND } from "./constants";
import type {
  PersistenceConflict,
  PersistenceConflictResolution,
} from "./domain/persistence-conflict";
import type {
  AutosaveIndicatorState,
  ProjectSizeAssessment,
  ProjectSizeWarningTier,
} from "./domain/persistence-status";
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
  "S-SIZE":
    "Advertencia: el proyecto supera el límite recomendado de 10 MB al serializar.",
  "P-SIZE":
    "Advertencia: el archivo supera el límite recomendado de 10 MB al abrir.",
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

const LOCAL_PROJECT_ERROR_MESSAGES: Record<string, string> = {
  NOT_FOUND: "No se encontró el proyecto en la biblioteca local.",
  QUOTA_EXCEEDED:
    "Espacio local agotado. Exporte el proyecto como .sgproj y libere espacio.",
  CORRUPT: "El proyecto local está dañado.",
  UNSUPPORTED_STORAGE_VERSION:
    "La biblioteca local requiere una versión más nueva de la aplicación.",
  STORAGE_UNAVAILABLE: "Almacenamiento local no disponible en este navegador.",
  INVALID_NAME: "El nombre del proyecto no es válido.",
  DUPLICATE_ID: "Ya existe un proyecto con ese identificador.",
  HYDRATE_FAILED: "No se pudo restaurar el proyecto local.",
  SERIALIZE_FAILED: "No se pudo serializar el proyecto para guardarlo localmente.",
  TRANSACTION_FAILED: "Falló la operación de almacenamiento local.",
};

export const formatLocalProjectError = (error: {
  code: string;
  message: string;
}): string => LOCAL_PROJECT_ERROR_MESSAGES[error.code] ?? error.message;

export const formatLocalProjectIntegrityWarning = (): string =>
  "Advertencia: la integridad del proyecto local no pudo verificarse. Los datos podrían estar dañados.";

export const formatLocalProjectRecoveryPrompt = (projectName: string): string =>
  `Hay un borrador más reciente de "${projectName}". ¿Desea recuperarlo?`;

const AUTOSAVE_INDICATOR_MESSAGES: Record<AutosaveIndicatorState, string> = {
  idle: "Autoguardado inactivo",
  pending: "Autoguardado pendiente…",
  saving: "Autoguardando localmente…",
  saved: "Autoguardado local",
  error: "Error de autoguardado local",
};

export const formatAutosaveIndicatorState = (
  state: AutosaveIndicatorState
): string => AUTOSAVE_INDICATOR_MESSAGES[state];

export const formatLocalProjectAutosaveStatus = (saved: boolean): string =>
  formatAutosaveIndicatorState(saved ? "saved" : "pending");

const SIZE_WARNING_APPROACHING_MESSAGE =
  "Advertencia: el proyecto se acerca al límite recomendado de 10 MB.";

const SIZE_WARNING_EXCEEDED_GENERIC_MESSAGE =
  "Advertencia: el proyecto supera el límite recomendado de 10 MB.";

export const getProjectSizeWarningFeedbackKind = (
  tier: ProjectSizeWarningTier
): ProjectFileFeedbackKind | null =>
  tier === "none" ? null : "warning";

export const formatProjectSizeWarning = (
  assessment: ProjectSizeAssessment
): string | null => {
  if (assessment.tier === "none") {
    return null;
  }
  if (assessment.tier === "approaching") {
    return SIZE_WARNING_APPROACHING_MESSAGE;
  }
  if (assessment.issueCodes.includes("P-SIZE")) {
    return CODE_MESSAGES["P-SIZE"];
  }
  if (assessment.issueCodes.includes("S-SIZE")) {
    return CODE_MESSAGES["S-SIZE"];
  }
  return SIZE_WARNING_EXCEEDED_GENERIC_MESSAGE;
};

const PERSISTENCE_CONFLICT_MESSAGES: Record<
  PersistenceConflict["kind"],
  string
> = {
  SESSION_DIRTY:
    "Hay cambios sin guardar en la sesión actual. Guarde, descarte los cambios o cancele antes de continuar.",
  INCOMING_NEWER:
    "El archivo seleccionado contiene una versión más reciente de este proyecto. ¿Desea cargarla?",
  INCOMING_OLDER_THAN_LOCAL:
    "El archivo seleccionado es anterior a la copia guardada en la biblioteca local. ¿Desea cargarlo de todos modos?",
  RECOVERABLE_DRAFT:
    "Hay un borrador autoguardado más reciente. ¿Desea recuperarlo?",
};

export type FormatPersistenceConflictPromptOptions = {
  projectName?: string;
};

export const formatPersistenceConflictPrompt = (
  conflict: PersistenceConflict,
  options?: FormatPersistenceConflictPromptOptions
): string => {
  if (conflict.kind === "RECOVERABLE_DRAFT" && options?.projectName) {
    return formatLocalProjectRecoveryPrompt(options.projectName);
  }
  return PERSISTENCE_CONFLICT_MESSAGES[conflict.kind];
};

const PERSISTENCE_CONFLICT_RESOLUTION_LABELS: Record<
  PersistenceConflictResolution,
  string
> = {
  KEEP_CURRENT: "Mantener versión actual",
  LOAD_INCOMING: "Cargar versión del archivo",
  DISCARD_AND_LOAD: "Descartar cambios y cargar",
  CANCEL: "Cancelar",
};

export const formatPersistenceConflictResolutionLabel = (
  resolution: PersistenceConflictResolution
): string => PERSISTENCE_CONFLICT_RESOLUTION_LABELS[resolution];
