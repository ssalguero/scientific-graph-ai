import {
  SCIENTIFIC_NUMERIC_EXPORT_MEDIA_TYPE,
  serializeScientificNumericExport,
  type ScientificNumericExport,
} from "@/lib/scientific/export";

export type ScientificNumericExportDownloadDescriptor = {
  fileName: string;
  content: string;
  mediaType: typeof SCIENTIFIC_NUMERIC_EXPORT_MEDIA_TYPE;
};

export type ScientificNumericExportBrowserPort = {
  createBlob: (content: string, mediaType: string) => Blob;
  createObjectUrl: (blob: Blob) => string;
  clickDownload: (url: string, fileName: string) => void;
  revokeObjectUrl: (url: string) => void;
};

const sanitizeFileStem = (value: string): string => {
  const sanitized = value
    .trim()
    .replace(/\.json$/i, "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "")
    .slice(0, 120);
  return sanitized || "scientific-numeric-export";
};

export const prepareScientificNumericExportDownload = (
  artifact: ScientificNumericExport,
  requestedFileName?: string,
): ScientificNumericExportDownloadDescriptor => ({
  fileName: `${sanitizeFileStem(
    requestedFileName ?? artifact.exportIdentity.exportId,
  )}.json`,
  content: serializeScientificNumericExport(artifact),
  mediaType: SCIENTIFIC_NUMERIC_EXPORT_MEDIA_TYPE,
});

const browserPort = (): ScientificNumericExportBrowserPort => ({
  createBlob: (content, mediaType) =>
    new Blob([content], { type: mediaType }),
  createObjectUrl: (blob) => URL.createObjectURL(blob),
  clickDownload: (url, fileName) => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
  },
  revokeObjectUrl: (url) => URL.revokeObjectURL(url),
});

export const downloadScientificNumericExport = (
  artifact: ScientificNumericExport,
  options: {
    fileName?: string;
    port?: ScientificNumericExportBrowserPort;
  } = {},
): ScientificNumericExportDownloadDescriptor => {
  const descriptor = prepareScientificNumericExportDownload(
    artifact,
    options.fileName,
  );
  const port = options.port ?? browserPort();
  const blob = port.createBlob(descriptor.content, descriptor.mediaType);
  const url = port.createObjectUrl(blob);
  try {
    port.clickDownload(url, descriptor.fileName);
  } finally {
    port.revokeObjectUrl(url);
  }
  return descriptor;
};

export const downloadNumericScientificExport =
  downloadScientificNumericExport;
