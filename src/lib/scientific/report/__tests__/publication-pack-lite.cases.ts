import type { AssertCase } from "../../comparison/__tests__/run-assertions";
import {
  PUBLICATION_PACK_LITE_MESSAGES,
  PUBLICATION_PACK_LITE_SEMANTICS,
  PUBLICATION_PACK_LITE_TITLE,
  publicationPackLiteStatusMessage,
  resolvePublicationPackLiteStatus,
} from "../publication-pack-lite";

export const runPublicationPackLiteCases = (assertCase: AssertCase): void => {
  assertCase(
    "spe12.pack.title",
    PUBLICATION_PACK_LITE_TITLE.includes("Pack") &&
      PUBLICATION_PACK_LITE_TITLE.includes("Lite")
  );

  assertCase(
    "spe12.pack.semanticsNoZip",
    PUBLICATION_PACK_LITE_SEMANTICS.toLowerCase().includes("pdf") &&
      PUBLICATION_PACK_LITE_SEMANTICS.toLowerCase().includes("png") &&
      PUBLICATION_PACK_LITE_SEMANTICS.toLowerCase().includes("no incluye zip")
  );

  assertCase(
    "spe12.pack.status.ready",
    resolvePublicationPackLiteStatus({
      hasScientificReport: true,
      hasChartContent: true,
    }) === "ready"
  );

  assertCase(
    "spe12.pack.status.pdfOnly",
    resolvePublicationPackLiteStatus({
      hasScientificReport: true,
      hasChartContent: false,
    }) === "pdf-only"
  );

  assertCase(
    "spe12.pack.status.blocked",
    resolvePublicationPackLiteStatus({
      hasScientificReport: false,
      hasChartContent: true,
    }) === "blocked-no-report" &&
      resolvePublicationPackLiteStatus({
        hasScientificReport: false,
        hasChartContent: false,
      }) === "blocked-no-report"
  );
  assertCase(
    "spe12.pack.status.blocked-unapproved",
    resolvePublicationPackLiteStatus({
      hasScientificReport: true,
      hasChartContent: true,
      reviewExportAllowed: false,
    }) === "blocked-unapproved-content"
  );

  assertCase(
    "spe12.pack.message.ready",
    publicationPackLiteStatusMessage("ready") ===
      PUBLICATION_PACK_LITE_MESSAGES.success
  );

  assertCase(
    "spe12.pack.message.pdfOnly",
    publicationPackLiteStatusMessage("pdf-only") ===
      PUBLICATION_PACK_LITE_MESSAGES.pdfOnly
  );

  assertCase(
    "spe12.pack.message.blocked",
    publicationPackLiteStatusMessage("blocked-no-report") ===
      PUBLICATION_PACK_LITE_MESSAGES.blocked
  );
  assertCase(
    "spe12.pack.message.blocked-unapproved",
    publicationPackLiteStatusMessage("blocked-unapproved-content") ===
      PUBLICATION_PACK_LITE_MESSAGES.blockedUnapproved
  );
};
