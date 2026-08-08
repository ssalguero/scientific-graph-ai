/**
 * PLUGINS-I9 — Peer integration adapters barrel.
 * No peer package imports. No peer internals.
 */

export { PLUGINS_ENGINE_INTEGRATION_ADAPTER } from "./engine";
export { PLUGINS_DATA_INTEGRATION_ADAPTER } from "./data";
export { PLUGINS_AI_INTEGRATION_ADAPTER } from "./ai";
export { PLUGINS_UX_INTEGRATION_ADAPTER } from "./ux";
export { PLUGINS_COLLAB_INTEGRATION_ADAPTER } from "./collab";

import { PLUGINS_AI_INTEGRATION_ADAPTER } from "./ai";
import { PLUGINS_COLLAB_INTEGRATION_ADAPTER } from "./collab";
import { PLUGINS_DATA_INTEGRATION_ADAPTER } from "./data";
import { PLUGINS_ENGINE_INTEGRATION_ADAPTER } from "./engine";
import { PLUGINS_UX_INTEGRATION_ADAPTER } from "./ux";
import type { IntegrationAdapterDescriptor } from "../descriptors";

export const PLUGINS_ALL_INTEGRATION_ADAPTERS: readonly IntegrationAdapterDescriptor[] =
  [
    PLUGINS_ENGINE_INTEGRATION_ADAPTER,
    PLUGINS_DATA_INTEGRATION_ADAPTER,
    PLUGINS_AI_INTEGRATION_ADAPTER,
    PLUGINS_UX_INTEGRATION_ADAPTER,
    PLUGINS_COLLAB_INTEGRATION_ADAPTER,
  ] as const;
