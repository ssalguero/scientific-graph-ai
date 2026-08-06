/**
 * ENGINE Domain — Public composition bootstrap.
 * OWNERSHIP: Application API — thin entry to configure the default composition root.
 * ENGINE-9: App injects IndexedDB (or other) project repository before certified flows run.
 *
 * Repository is opaque here — no `@/lib/project` import on the public surface.
 */

import {
  composeEngine,
  setDefaultComposition,
  type ComposeEngineOptions,
} from "../internal/compose";

export type ConfigureEngineOptions = {
  /**
   * Project persistence repository (e.g. IndexedDB singleton from the app).
   * When omitted, composition uses the in-memory default (tests / early boot).
   */
  readonly projectRepository?: NonNullable<
    NonNullable<ComposeEngineOptions["adapterOptions"]>["repo"]
  >;
};

/**
 * Configure the default ENGINE composition used by public Workflow / Lifecycle / Command facades.
 * Call once at app bootstrap before certified Product Flow entry points.
 */
export function configureEngine(options: ConfigureEngineOptions = {}): void {
  setDefaultComposition(
    composeEngine({
      adapterOptions: options.projectRepository
        ? { repo: options.projectRepository }
        : undefined,
    }),
  );
}
