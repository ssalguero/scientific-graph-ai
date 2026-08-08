/**
 * PLUGINS-I0 — Internal barrel.
 * Boundary policy only. Do not import from outside `@/plugins`.
 */

export {
  PLUGINS_PUBLIC_IMPORT_PREFIXES,
  PLUGINS_INTERNAL_FOLDER_SEGMENTS,
  PLUGINS_FORBIDDEN_CONSUMER_IMPORT_PREFIXES,
} from "./boundary-policy";

export { PLUGINS_RESERVED_STATUS } from "./reserved";
export type { PluginsReservedStatus } from "./reserved";
