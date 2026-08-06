/**
 * DATA Domain — Integration Layer package entry (DATA-I7).
 *
 * DATA-internal composition for outward facades. Consumers must use `@/data`
 * public exports — never import this folder from ENGINE/UX.
 *
 * @packageDocumentation
 */

export {
  IntegrationLayer,
  getIntegrationLayer,
  resetIntegrationLayer,
} from "./IntegrationLayer";
export {
  IntegrationDiagnostics,
  type IntegrationDiagnosticRecord,
} from "./diagnostics";
export { createDataPublicApi } from "./public-api-factory";
