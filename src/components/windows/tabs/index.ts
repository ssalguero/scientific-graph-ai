/**
 * D61–D62 — Window Tabs Foundation · public barrel (LOCKED D62.9).
 * Authority: docs/D61.0-tabs-discovery.md · docs/D62.0-tabs-ui-discovery.md.
 * Hard Rules: HR-tabs-barrel-only · HR-no-windows-barrel-leak.
 * Sole public export path for tabs/**. Not re-exported from windows/index.ts.
 * Deep imports into tabs/Tab*.ts from outside tabs/ are prohibited.
 */

/* —— D61 · Identity / Types / Registry / Selection / Bridges —— */

export type { TabId } from "./TabId";
export { createTabId, isTabId } from "./TabId";

export type {
  TabDefinition,
  TabState,
  TabReference,
  TabEntry,
} from "./TabTypes";

export type { TabRegistry, TabRegistryCatalog } from "./TabRegistryTypes";

export type { TabRegistryStore } from "./TabRegistryStore";
export { createTabRegistryStore } from "./TabRegistryStore";

export { createTabRegistry } from "./TabRegistry";

export type { ActiveTab, TabSelectionStore } from "./TabSelectionTypes";

export { createTabSelectionStore } from "./TabSelectionStore";

export type { TabSelectionBridge } from "./TabSelectionBridge";
export { createTabSelectionBridge } from "./TabSelectionBridge";

export type { WindowId, WindowTabsBridge } from "./WindowTabsBridge";
export { createWindowTabsBridge } from "./WindowTabsBridge";

/* —— D62 · Selection Policy —— */

export type {
  TabSelectionPolicy,
  TabSelectionPolicyAfterUnregisterArgs,
  TabSelectionPolicyEnsureActiveArgs,
} from "./TabSelectionPolicyTypes";
export { createTabSelectionPolicy } from "./TabSelectionPolicy";

/* —— D62 · Document Switch —— */

export type {
  OpaqueContentHandle,
  TabDocumentSlot,
  TabDocumentSlots,
  TabDocumentSwitch,
  TabDocumentSwitchResolveArgs,
  TabDocumentSwitchResolveResult,
} from "./TabDocumentSwitchTypes";
export { createTabDocumentSwitch } from "./TabDocumentSwitch";
