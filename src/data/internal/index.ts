/**
 * DATA Domain — Internal package barrel.
 *
 * DATA-internal only. Never imported from outside `src/data/**`.
 *
 * @packageDocumentation
 */

export {
  composeDataRegistries,
  type DataRegistryComposition,
} from "./compose-registries";

export {
  composeDataDomain,
  type DataDomainComposition,
} from "./compose-domain";

export * from "./registry";
export * from "./lifecycle";
