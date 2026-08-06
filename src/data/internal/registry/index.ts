/**
 * DATA Domain — Internal registry barrel (DATA-I2).
 *
 * DATA-internal only. Never import from UX / ENGINE consumers.
 *
 * @packageDocumentation
 */

export {
  DataRegistryRole,
  DataEntityClass,
  DataOwnerComponent,
  type DataRegistryRole as DataRegistryRoleId,
  type DataEntityClass as DataEntityClassId,
  type DataOwnerComponent as DataOwnerComponentId,
} from "./roles";

export {
  type DataEntityIdentity,
  mintIdentityId,
  resetIdentityMintCounter,
} from "./identity";

export {
  DATA_OWNERSHIP_STRATEGY,
  DATA_AUTHORITATIVE_OWNER_BY_CLASS,
  authoritativeOwnerFor,
  type OwnershipRecord,
} from "./ownership";

export {
  OwnershipEscalationError,
  escalateOwnershipConflict,
} from "./escalation";

export { AuthoritativeRegistry } from "./authoritative-registry";
export {
  SupportingRegistry,
  type SupportingAssociation,
  type AuthoritativeIdentityResolver,
} from "./supporting-registry";

export { RegistryAuthority } from "./authority";

export {
  DATA_REGISTRY_INTERACTION_RULES,
  assertDatasetMayReferenceModel,
  assertMetadataMayBind,
  assertNonIdentityComponent,
} from "./interaction";

export { asTransientView, type TransientView } from "./transient-view";
