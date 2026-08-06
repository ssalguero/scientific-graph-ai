/**
 * DATA Domain — Integration Layer (DATA-P2 / DATA-I7).
 *
 * Outward coordination only: composes the DATA domain kernel and exposes
 * frozen Capability Group facades. Never owns scientific knowledge.
 * Never creates identity outside Authoritative Registries.
 * Never modifies Lifecycle/Metadata/Repository semantics beyond public ops.
 *
 * @packageDocumentation
 */

import {
  composeDataDomain,
  type DataDomainComposition,
} from "../internal/compose-domain";
import type { DataPublicApi } from "../public/types";
import { IntegrationDiagnostics } from "./diagnostics";
import { createDataPublicApi } from "./public-api-factory";

export class IntegrationLayer {
  readonly diagnostics = new IntegrationDiagnostics();
  private domain: DataDomainComposition | null = null;
  private api: DataPublicApi | null = null;

  /** Compose domain kernel once (idempotent). */
  configure(): DataPublicApi {
    if (this.api && this.domain) {
      this.diagnostics.record({
        at: Date.now(),
        action: "configure",
        ok: true,
        detail: "already-configured",
      });
      return this.api;
    }
    this.domain = composeDataDomain();
    this.api = createDataPublicApi(this.domain, this.diagnostics);
    this.diagnostics.record({
      at: Date.now(),
      action: "configure",
      ok: true,
      detail: "composed",
    });
    return this.api;
  }

  getApi(): DataPublicApi {
    if (!this.api) {
      return this.configure();
    }
    return this.api;
  }

  /** Test / diagnostics only — never export domain to consumers. */
  getDomainForDiagnostics(): DataDomainComposition | null {
    return this.domain;
  }
}

/** Process-local Integration Layer singleton for public facades. */
let defaultIntegration: IntegrationLayer | null = null;

export function getIntegrationLayer(): IntegrationLayer {
  if (!defaultIntegration) {
    defaultIntegration = new IntegrationLayer();
  }
  return defaultIntegration;
}

/** Reset composition — tests only. */
export function resetIntegrationLayer(): void {
  defaultIntegration = null;
}
