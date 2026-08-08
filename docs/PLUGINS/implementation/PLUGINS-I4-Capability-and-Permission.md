# PLUGINS-I4 — Capability & Permission System Implementation

**Status:** **IMPLEMENTED** · Capability & Permission System **COMPLETE**  
**Date:** 2026-08-07  
**Authority:** PLUGINS-P0…P11 · PLUGINS-P3 C6/C7 · PLUGINS-P6 I4 · PLUGINS-I0…I3 · Charter  
**Constraints:** Capability-Based Access · Least Privilege · Never Inferred · Registry SSOT · Planning Finality  

---

## Official declaration

**PLUGINS-I4 — CAPABILITY & PERMISSION SYSTEM IMPLEMENTED**

---

## Principle (non-negotiable)

> **Capabilities evaluate. Registration admits. Registry stores. Lifecycle governs execution.**

```
Discovery → Registration → Registry → Capabilities → Lifecycle (I6)
```

| Guardrail | Held |
|-----------|------|
| Registration never evaluates capabilities | Yes |
| Capabilities never register plugins | Yes |
| Capabilities never mutate Registry | Yes |
| Registry never evaluates capabilities/permissions | Yes |
| Capability results advisory until Lifecycle (I6) | Yes |
| No activation / execution | Yes |

---

## Purpose

| Subsystem | Responsibility |
|-----------|----------------|
| **Capabilities (C6)** | Evaluate declared capabilities · classify availability · structural diagnostics |
| **Permissions (C7)** | Evaluate declared permission intent · least privilege · structural diagnostics |
| **Registry read view** | Read-only access to SSOT for evaluators |

---

## Delivered

| Artifact | Path |
|----------|------|
| Capabilities subsystem | `src/plugins/capabilities/` |
| Permissions subsystem | `src/plugins/permissions/` |
| Capability layer aggregate | `src/plugins/capability/` |
| Registry read view | `src/plugins/registry/read-view.ts` |
| Validator | `scripts/validate-plugins-capability.ts` |
| Implementation record | this file |

### Capability API (package-internal)

- `evaluateRegisteredCapabilities(state)` — all declared capabilities on registered plugins
- `evaluateCapabilityQuery(state, id, plugin?)` — query; undeclared → `Undeclared` (never inferred)

### Permission API (package-internal)

- `evaluatePermissionIntents(state, intents)` — explicit intents only; undeclared capability → `Denied` (least privilege)

---

## Acceptance flags

| Flag | Value |
|------|-------|
| `capabilitiesImplemented` | `true` |
| `permissionsImplemented` | `true` |
| `capabilitiesReadOnly` | `true` |
| `permissionsReadOnly` | `true` |
| `registryMutationOnlyViaRegistry` | `true` |
| `activationImplemented` | `false` |
| `lifecycleImplemented` | `false` |
| `pluginExecutionImplemented` | `false` |

---

## Explicitly not delivered

Lifecycle Engine (I6) · Compatibility/Validation engines (I7) · Activation · Execution · Dynamic/runtime loading · SDK · Marketplace

---

## Validation

```bash
npm run validate:plugins-foundation
npm run validate:plugins-framework
npm run validate:plugins-registry
npm run validate:plugins-admission
npm run validate:plugins-capability
```

---

## Architectural compliance summary

| Rule | Status |
|------|--------|
| Read-only Registry integration | **Held** |
| Capabilities never mutate Registry | **Held** |
| Permissions never mutate Registry | **Held** |
| No Lifecycle coupling | **Held** |
| Results advisory | **Held** |
| Public barrel status markers only | **Held** |
| I0–I3 validators remain green | **Required** |

---

## Official Declarations

- **PLUGINS-I4 — CAPABILITY & PERMISSION SYSTEM IMPLEMENTED**
- Capabilities: **OPERATIONAL** (advisory evaluation)
- Permissions: **OPERATIONAL** (least-privilege advisory)
- Activation / execution / lifecycle: **NONE**
