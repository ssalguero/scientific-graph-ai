/**
 * UX-9.6 — Command Palette Bridge.
 *
 * Owns the local product catalog (Product Catalog Isolation Freeze) and
 * overlay snapshot { open, query, selectedIndex } (Overlay State Freeze).
 *
 * Search Purity Freeze: query → search(index, query) → results only.
 * Never dispatch · never feedback · never mutate registry.
 *
 * Never builds InteractionCommand envelopes (Command Envelope Canonical).
 * Never calls dispatcher.dispatch() (Dispatcher Authority).
 */

import {
  asCommandId,
  createCommandDefinition,
  createCommandRegistry,
  type CommandId,
} from "@/ui/commands";
import {
  createCommandPaletteCatalog,
  createCommandPaletteIndex,
  search,
  type CommandPaletteIndex,
} from "@/ui/palette";

export type ProductCommandDefinition = Readonly<{
  id: CommandId;
  label: string;
}>;

/** Product-only demo catalog — never mutates global commandRegistry. */
export const PRODUCT_COMMAND_DEFINITIONS: readonly ProductCommandDefinition[] =
  Object.freeze([
    Object.freeze({
      id: asCommandId("product.open-clipboard"),
      label: "Abrir portapapeles",
    }),
    Object.freeze({
      id: asCommandId("product.show-diagnostics"),
      label: "Mostrar diagnósticos",
    }),
    Object.freeze({
      id: asCommandId("product.focus-workspace"),
      label: "Enfocar Workspace",
    }),
  ]);

export type OverlayState = Readonly<{
  open: boolean;
  query: string;
  selectedIndex: number;
}>;

const INITIAL_OVERLAY: OverlayState = Object.freeze({
  open: false,
  query: "",
  selectedIndex: 0,
});

let overlaySnapshot: OverlayState = INITIAL_OVERLAY;
const overlayListeners = new Set<() => void>();

function notifyOverlayListeners(): void {
  for (const listener of overlayListeners) {
    listener();
  }
}

function setOverlay(next: OverlayState): void {
  overlaySnapshot = Object.freeze(next);
  notifyOverlayListeners();
}

export function subscribeOverlayState(listener: () => void): () => void {
  overlayListeners.add(listener);
  return () => {
    overlayListeners.delete(listener);
  };
}

export function getOverlayState(): OverlayState {
  return overlaySnapshot;
}

export type CommandPaletteBridge = Readonly<{
  getIndex(): CommandPaletteIndex;
  getLabel(commandId: CommandId): string;
  search(query: string): readonly CommandId[];
  open(): void;
  close(): void;
  setQuery(query: string): void;
  setSelectedIndex(index: number): void;
  moveSelection(delta: number, resultCount: number): void;
}>;

export function createCommandPaletteBridge(
  productDefinitions: readonly ProductCommandDefinition[] = PRODUCT_COMMAND_DEFINITIONS,
): CommandPaletteBridge {
  const registry = createCommandRegistry(
    productDefinitions.map((def) => createCommandDefinition({ id: def.id })),
  );
  const catalog = createCommandPaletteCatalog(registry);
  const index = createCommandPaletteIndex(catalog);
  const labels = new Map(
    productDefinitions.map((def) => [def.id, def.label] as const),
  );

  return Object.freeze({
    getIndex(): CommandPaletteIndex {
      return index;
    },
    getLabel(commandId: CommandId): string {
      return labels.get(commandId) ?? String(commandId);
    },
    search(query: string): readonly CommandId[] {
      return search(index, query);
    },
    open(): void {
      setOverlay(
        Object.freeze({
          open: true,
          query: "",
          selectedIndex: 0,
        }),
      );
    },
    close(): void {
      setOverlay(INITIAL_OVERLAY);
    },
    setQuery(query: string): void {
      setOverlay(
        Object.freeze({
          open: overlaySnapshot.open,
          query,
          selectedIndex: 0,
        }),
      );
    },
    setSelectedIndex(selectedIndex: number): void {
      setOverlay(
        Object.freeze({
          open: overlaySnapshot.open,
          query: overlaySnapshot.query,
          selectedIndex,
        }),
      );
    },
    moveSelection(delta: number, resultCount: number): void {
      if (resultCount <= 0) {
        return;
      }
      const next =
        (overlaySnapshot.selectedIndex + delta + resultCount) % resultCount;
      setOverlay(
        Object.freeze({
          open: overlaySnapshot.open,
          query: overlaySnapshot.query,
          selectedIndex: next,
        }),
      );
    },
  });
}

export const commandPaletteBridge: CommandPaletteBridge =
  createCommandPaletteBridge();
