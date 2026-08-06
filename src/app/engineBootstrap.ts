/**
 * App-side ENGINE composition bootstrap (ENGINE-9).
 * Injects the shared IndexedDB local-project repository into `composeEngine`
 * so public `@/engine` facades share persistence with GraphEditor UI state.
 */

import { configureEngine, initializeApplication } from "@/engine";

import { getLocalProjectRepository } from "./localProjectRepository";

let configured = false;
let lifecycleStarted = false;

/**
 * Ensure default ENGINE composition uses the app IndexedDB project repository.
 * Safe to call repeatedly; composition is configured once per page load.
 */
export function ensureAppEngineConfigured(): void {
  if (configured) return;
  configureEngine({
    projectRepository: getLocalProjectRepository(),
  });
  configured = true;

  if (!lifecycleStarted) {
    lifecycleStarted = true;
    void initializeApplication({}).catch(() => {
      // No-op ports / already-initialized — presentation continues.
    });
  }
}
