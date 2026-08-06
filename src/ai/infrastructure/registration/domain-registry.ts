/**
 * AI-I1 — Domain registration infrastructure.
 * Registers package structural slots only. No capability registration. No runtime.
 */

import { AI_IMPLEMENTATION_NAMESPACES } from "../namespaces";
import type { AiImplementationNamespace } from "../namespaces";

export type AiDomainSlotRegistration = {
  readonly namespace: AiImplementationNamespace;
  readonly role:
    | "active"
    | "reserved"
    | "infrastructure"
    | "integration"
    | "package-private"
    | "public-aggregate";
  readonly intelligence: false;
};

const SLOT_ROLES: Record<AiImplementationNamespace, AiDomainSlotRegistration["role"]> = {
  foundation: "active",
  identity: "reserved",
  core: "active",
  supporting: "active",
  governance: "active",
  extension: "active",
  infrastructure: "infrastructure",
  integration: "integration",
  public: "public-aggregate",
  internal: "package-private",
};

/** Static structural registry — never registers intelligence capabilities. */
export const AI_DOMAIN_SLOT_REGISTRY: readonly AiDomainSlotRegistration[] =
  AI_IMPLEMENTATION_NAMESPACES.map((namespace) => ({
    namespace,
    role: SLOT_ROLES[namespace],
    intelligence: false as const,
  }));

export function listRegisteredNamespaces(): readonly AiImplementationNamespace[] {
  return AI_IMPLEMENTATION_NAMESPACES;
}
