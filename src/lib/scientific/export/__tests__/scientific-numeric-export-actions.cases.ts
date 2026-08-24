import {
  downloadScientificNumericExport,
  prepareScientificNumericExportDownload,
  type ScientificNumericExportBrowserPort,
} from "../../../../app/scientificNumericExportActions";
import { SCIENTIFIC_NUMERIC_EXPORT_MEDIA_TYPE } from "..";

import {
  createScientificNumericExportFixture,
  type ScientificExportAssertCase,
} from "./numeric-scientific-export.cases";

export const runScientificNumericExportActionCases = (
  assertCase: ScientificExportAssertCase,
) => {
  const artifact = createScientificNumericExportFixture();
  const prepared = prepareScientificNumericExportDownload(
    artifact,
    '  Results: "Welch" / 2026.json  ',
  );
  assertCase(
    "numeric-export.action.prepares-json",
    prepared.fileName === "Results-Welch-2026.json" &&
      prepared.mediaType === SCIENTIFIC_NUMERIC_EXPORT_MEDIA_TYPE &&
      prepared.content.includes('"scientific-numeric-export/v1"'),
  );

  const events: string[] = [];
  const port: ScientificNumericExportBrowserPort = {
    createBlob: (content, mediaType) => {
      events.push(`blob:${mediaType}:${content.length}`);
      return new Blob([content], { type: mediaType });
    },
    createObjectUrl: () => {
      events.push("url:create");
      return "blob:scientific-export";
    },
    clickDownload: (url, fileName) => {
      events.push(`click:${url}:${fileName}`);
    },
    revokeObjectUrl: (url) => {
      events.push(`url:revoke:${url}`);
    },
  };
  const downloaded = downloadScientificNumericExport(artifact, {
    fileName: "result",
    port,
  });
  assertCase(
    "numeric-export.action.thin-browser-download",
    downloaded.fileName === "result.json" &&
      events[0]?.startsWith(
        `blob:${SCIENTIFIC_NUMERIC_EXPORT_MEDIA_TYPE}:`,
      ) === true &&
      events[1] === "url:create" &&
      events[2] === "click:blob:scientific-export:result.json" &&
      events[3] === "url:revoke:blob:scientific-export",
  );

  let revokedAfterFailure = false;
  const failingPort: ScientificNumericExportBrowserPort = {
    createBlob: (content, mediaType) =>
      new Blob([content], { type: mediaType }),
    createObjectUrl: () => "blob:failure",
    clickDownload: () => {
      throw new Error("Fixture click failure.");
    },
    revokeObjectUrl: () => {
      revokedAfterFailure = true;
    },
  };
  try {
    downloadScientificNumericExport(artifact, { port: failingPort });
  } catch {
    // The browser error remains visible to the caller; cleanup still runs.
  }
  assertCase(
    "numeric-export.action.revokes-url-on-failure",
    revokedAfterFailure,
  );
};
