# Official Record

# PLUGINS-P4 — Public Contracts

**Domain:** PLUGINS — Extensibility Layer  
**Phase:** PLUGINS-P4  
**Date:** 2026-08-07  
**Nature:** Public Plugin Contract strategy only — conceptual contract philosophy, ownership, categories, compatibility, evolution, and boundaries; no APIs, interfaces, method signatures, schemas, DTOs, protocols, SDK, loaders, runtime, code, or repository mutations beyond this Official Record  
**Prerequisites:** PLUGINS-P0 **CERTIFIED** · PLUGINS-P1 **CERTIFIED** · PLUGINS-P2 **CERTIFIED** · PLUGINS-P3 **CERTIFIED** · PLUGINS Planning Charter **RELEASE CERTIFIED** · ENGINE, DATA, AI, UX, COLLAB — all **RELEASE CERTIFIED**  
**Status:** **CERTIFIED**

**Planning Authority:** [`docs/PLUGINS/PLUGINS-Planning-Charter.md`](../PLUGINS-Planning-Charter.md) (**RELEASE CERTIFIED**; cite only; SHALL NOT rewrite)

**Prior Freezes:** [`P0 Identity`](./PLUGINS-P0-Executive-Planning-Foundation.md) · [`P1 Architecture`](./PLUGINS-P1-Domain-Architecture.md) · [`P2 Functional`](./PLUGINS-P2-Functional-Model.md) · [`P3 Inventory`](./PLUGINS-P3-Component-Inventory.md) — all **CERTIFIED**; cite only; SHALL NOT reopen

This Official Record materializes the Public Plugin Contract Strategy for PLUGINS. It specifies interaction boundaries and ownership only — not technical interfaces.

**Authority Precedence (immutable):**

```
Project Governance → Certified Architecture → Charter → P0 → P1 → P2 → P3 → P4
```

### Planning Rule — No New Constitutional Principles

PLUGINS-P4 SHALL NOT introduce new constitutional principles beyond the Public Contracts Constitutional Freeze declared herein as the Contract Freeze materialization of Charter Public Contracts Only / API Freeze. SHALL NOT modify prior Freezes or Charter principles. Constitutional change requires an explicit Charter revision.

### Public Contracts Constitutional Freeze

> **Only explicitly designated Public Plugin Contracts are extensible.**
>
> Internal classes, services, registries, contexts, implementations, modules, and private APIs are constitutionally non-extensible.
>
> Public contracts evolve only through explicit versioning and documented governance.
>
> Plugins may interact with the platform exclusively through Public Plugin Contracts.
>
> No implementation detail shall ever become part of the public extensibility surface unless explicitly certified as a Public Plugin Contract.

### Baseline Freeze

| Item | Frozen value |
|------|----------------|
| Charter / P0–P3 | **CERTIFIED** — cited; not modified |
| Peers ENGINE / DATA / AI / UX / COLLAB | **RELEASE CERTIFIED** |
| PLUGINS Domain (product status) | **PLANNED** — open at PLUGINS-P4 |
| PLUGINS-I\* | **BLOCKED** until Planning Certification |
| ROADMAP.md / PROJECT_STATUS.md | **Unchanged** during PLUGINS-P\* |
| `src/plugins/` | **Forbidden** during PLUGINS-P\* |

### No-Code Compliance Checklist (PLUGINS-P4)

- [x] No APIs, interfaces, method signatures, schemas, DTOs, or protocols  
- [x] No SDK, loaders, runtime, marketplace, or implementation  
- [x] No modification of Charter, P0–P3, or peer domains  
- [x] No ROADMAP.md / PROJECT_STATUS.md updates  
- [x] No `src/plugins/`  
- [x] No V1 contract category selection as delivery commitment  

---

## 1. Executive Summary

PLUGINS-P4 freezes **how** plugins may interact with Scientific Graph AI: the Public Plugin Contract is the only constitutionally valid interaction boundary between plugins and the platform.

Prior Freezes remain immutable. This Record establishes the **Contract Freeze**. Lifecycle and concrete technical contracts remain deferred.

Conceptual contract ≠ API ≠ interface ≠ schema ≠ protocol ≠ SDK.

---

## 2. Public Contract Vision

Public Plugin Contracts make extensibility durable: peers expose extension points and domain contracts they own; PLUGINS governs plugin participation, registration, capability validation, and compatibility; plugins never reach internals; the public surface evolves only by explicit versioning under governance.

Without this Freeze, informal “extension” paths would erode Architecture First, SSOT, and peer ownership.

---

## 3. Contract Philosophy

A **Public Plugin Contract** is:

- the exclusive constitutionally valid interaction boundary between plugins and the platform;  
- an explicitly designated, versioned, governed public surface;  
- the only extensible surface for plugin participation;  
- independent of any internal class, service, registry, context, module, or private API.

**Everything else is internal.**

Internal surfaces may change without becoming extension points. Accidental exposure never creates a Public Plugin Contract. Certification as a Public Plugin Contract is required before any surface is extensible.

**Cite Charter / P2:** Public Contracts Only · No Core Access · API Freeze.

---

## 4. Ownership Model

No ownership transfer.

| Owner | Owns (contract view) |
|-------|----------------------|
| **Peer domains** | Extension Points; public domain contracts; execution semantics of peer logic |
| **PLUGINS** | Plugin interaction governance contracts; compatibility validation rules (conceptual); registration rules (conceptual); capability validation rules (conceptual) |
| **Platform** | Infrastructure contracts (consumed, never owned by plugins) |

| Actor | Never owns |
|-------|------------|
| Plugin | Peer domains, Extension Points, public domain contracts, execution semantics |
| PLUGINS | Peer Extension Points; peer execution semantics; peer public domain contract ownership |
| Peer | Plugin lifecycle ownership; PLUGINS registration/compatibility governance SSOT |

**Cite Charter** — Extension Point Ownership Freeze:

> Peer domains exclusively own their extension points.  
> PLUGINS owns only the governance of plugin interaction with those extension points through public contracts.

---

## 5. Public Surface Strategy

Clear constitutional distinction:

| Surface class | Extensible? | Meaning |
|---------------|-------------|---------|
| **Public Plugin Contracts** | **Yes** (only these) | Explicitly designated extensibility surfaces |
| **Internal Services** | No | Conceptual/service internals (cite P3) — non-extensible |
| **Private Components** | No | Implementation units — non-extensible |
| **Internal Registries** | No | Registry facets/storage/runtime — non-extensible as plugin surfaces |
| **Private Implementations** | No | Code, modules, private APIs — non-extensible |

**Rule:** Only Public Plugin Contracts are extensible. Everything else is constitutionally non-extensible.

Discovery of an internal symbol, type, or registry never confers extension rights.

---

## 6. Contract Categories

Conceptual classification only. **No V1 selection. No implementation.**

| Category | Conceptual purpose | Primary stewardship |
|----------|-------------------|---------------------|
| **Extension Point Contracts** | Govern interaction at peer-owned Extension Points | Peer owns EP contract; PLUGINS governs plugin participation |
| **Capability Contracts** | Govern declared Capability interaction semantics | PLUGINS (C6) + peer EP binding |
| **Registration Contracts** | Govern Registration / Discovery admission | PLUGINS (C4, C2, C3) |
| **Validation Contracts** | Govern Validation / Authorization intent | PLUGINS (C7, C8) |
| **Diagnostics Contracts** | Govern Diagnostics signal exchange | PLUGINS (C9) |
| **Compatibility Contracts** | Govern Compatibility assessments and eligibility | PLUGINS (C8) |
| **Future SDK Contracts** | Future developer-facing contract bundle | C12 boundary; delivery deferred |

Categories prepare the contract taxonomy. **Which categories ship in V1 is not decided in PLUGINS-P4.** Selection remains deferred to later authorized Planning / Implementation under this strategy (aligned with Category Taxonomy Prepared; V1 Selection Deferred from Charter / P0).

---

## 7. Contract Principles

| Principle | Rule |
|-----------|------|
| Public Contracts Only | Plugins interact exclusively through Public Plugin Contracts |
| Stable Public Surface | Designated contracts remain the stable extensibility surface |
| Backward Compatibility | Evolution prefers non-breaking change; breaking change requires explicit versioning |
| Explicit Versioning | Every Public Plugin Contract evolves through explicit versions |
| Least Privilege | Contracts expose minimum Capability / Permission surface required |
| No Core Access | No path to Core / internals via contracts |
| No Internal Leakage | Internals never become public by accident or convenience |
| Deterministic Validation | Validation outcomes are conceptually deterministic for given declared intent |
| Architecture First | Contracts follow Architecture Freeze; never redesign peers |
| Governance First | Contract designation and evolution require documented governance |
| Validator Inheritance | Contract validation participates in certified Validator Gates; no bypass |

---

## 8. Compatibility Strategy

Conceptual dimensions only. **No algorithms. No implementation.** Aligns with P2 Compatibility Model.

| Dimension | Conceptual meaning |
|-----------|-------------------|
| **Platform Compatibility** | Plugin Version eligibility against platform under Version Compatibility governance |
| **Contract Compatibility** | Plugin interaction aligns with designated Public Plugin Contract versions |
| **Capability Compatibility** | Declared Capabilities remain eligible with Permissions and available Extension Points |
| **Version Compatibility** | Coherent eligibility across Plugin Version, Public Plugin Contract versions, and peer EP versions (peers own EP versioning) |
| **Deprecation Strategy** | Obsolete contract versions are explicitly deprecated, documented, and time-bounded; never silently removed |

**Rule:** Compatibility Before Execution (cite P2). Incompatible participation is not Execution-eligible.

---

## 9. Contract Evolution

How Public Plugin Contracts evolve (principles only; implementation deferred):

| Principle | Statement |
|-----------|-----------|
| Versioned evolution | Changes ship as new contract versions, not silent mutation of existing versions |
| Explicit deprecation | Retirement is declared, documented, and governed |
| Predictable migration | Migration expectations are documented for contract consumers |
| No silent breaking changes | Breaking changes without version bump are forbidden |
| Public review before extension | New Public Plugin Contracts or material extensions require documented governance review before designation |
| Peer EP evolution | Peers version their Extension Point contracts; PLUGINS does not silently rewrite peer EP contracts |

Marketplace / remote / SDK delivery remain outside evolution of this Freeze until authorized phases open them.

---

## 10. Validation Strategy

Conceptual validation only. **No validator implementation.**

| Validation concern | Conceptual meaning | Inventory alignment |
|--------------------|--------------------|---------------------|
| **Contract validation** | Participation claims a designated Public Plugin Contract version | C4 / C8 |
| **Capability validation** | Capabilities are declared and eligible | C6 |
| **Permission validation** | Authorization / Least Privilege intent | C7 |
| **Compatibility validation** | Platform / contract / version / capability eligibility | C8 |
| **Validator inheritance** | Validation participates in project Validator Gates / Governance | Charter / P0 / P1 |

**Rules (cite P2):** Validation Before Activation · Compatibility Before Execution · Capabilities Never Inferred.

---

## 11. Cross-Domain Contracts

Each peer owns its public contracts. PLUGINS governs plugin participation. No ownership transfer.

### 11.1 PLUGINS ↔ ENGINE

| Aspect | Boundary |
|--------|----------|
| Peer owns | ENGINE public contracts; ENGINE Extension Points; workflow execution semantics |
| PLUGINS owns | Plugin participation governance toward ENGINE EPs |
| Plugins may | Extend workflows only through ENGINE-owned Extension Point Contracts + Public Plugin Contracts |
| Plugins never | Own orchestration, Product Flows, or ENGINE Session |

### 11.2 PLUGINS ↔ DATA

| Aspect | Boundary |
|--------|----------|
| Peer owns | DATA public contracts; DATA Extension Points; scientific truth / processing semantics |
| PLUGINS owns | Plugin participation governance toward DATA EPs |
| Plugins may | Contribute importers/exporters/processors only via DATA-owned EP contracts |
| Plugins never | Own scientific truth or mutate meaning outside DATA authority |

### 11.3 PLUGINS ↔ AI

| Aspect | Boundary |
|--------|----------|
| Peer owns | AI public contracts; AI Extension Points; reasoning semantics |
| PLUGINS owns | Plugin participation governance toward AI EPs |
| Plugins may | Contribute providers/modules only via AI-owned EP contracts |
| Plugins never | Own intelligence generation or AI Decision Authority |

### 11.4 PLUGINS ↔ UX

| Aspect | Boundary |
|--------|----------|
| Peer owns | UX public contracts; UX Extension Points; presentation / Design System |
| PLUGINS owns | Plugin participation governance toward UX EPs |
| Plugins may | Contribute UI surfaces only via UX-owned EP contracts |
| Plugins never | Own presentation or Design System |

### 11.5 PLUGINS ↔ COLLAB

| Aspect | Boundary |
|--------|----------|
| Peer owns | COLLAB public contracts; COLLAB Extension Points; collaboration metadata |
| PLUGINS owns | Plugin participation governance toward COLLAB EPs |
| Plugins may | Extend collaborative surfaces only via COLLAB-owned EP contracts |
| Plugins never | Own collaboration metadata |

Allowed dependency edges remain as frozen in P1 (PLUGINS → ENGINE, DATA, AI; UX/COLLAB via peer-owned EPs). This Record does not alter DEPENDENCY_MATRIX.

---

## 12. Architectural Boundaries

Frozen separation — **no layer mixing**:

| Layer | Contract role |
|-------|---------------|
| **Contracts** | Public Plugin Contracts + peer public domain / EP contracts |
| **Components** | Conceptual inventory C1–C12 (P3) — not extensible surfaces |
| **Implementation** | Deferred — never public unless certified as Public Plugin Contract |
| **Runtime** | Deferred — not a public extensibility surface |
| **Infrastructure** | Platform-owned — consumed via documented public services; not plugin-owned |
| **Internal services** | Non-extensible (Public Surface Strategy) |

Contracts do not become components. Components do not become contracts by presence. Runtime does not invent public surfaces.

---

## 13. Security Principles

Conceptual only. **No runtime details.**

| Principle | Statement |
|-----------|-----------|
| Explicit permissions | Permission intent is declared; not ambient |
| Capability isolation | Capabilities are bounded units; no ambient core reach-in |
| Least Privilege | Minimum required Capability / Permission surface |
| Public contract enforcement | Interaction outside Public Plugin Contracts is forbidden |
| No internal access | Internals remain non-extensible and non-accessible to plugins |
| Isolation & Sandbox Philosophy | Cite Charter — architectural intent; mechanisms deferred |

---

## 14. Risks

| Risk | Architectural mitigation |
|------|--------------------------|
| API drift | Explicit Versioning; Stable Public Surface; governance review |
| Contract proliferation | Category taxonomy + deferred V1 selection; designate only needed Public Plugin Contracts |
| Breaking compatibility | No silent breaking changes; Deprecation Strategy; Backward Compatibility |
| Hidden dependencies | Public Contracts Only; No Internal Leakage; Explicit Dependencies (P3) |
| Internal leakage | Public Contracts Constitutional Freeze; non-extensible internals |
| Version fragmentation | Explicit Versioning; Compatibility Contracts; peer owns EP versions |
| Contract ambiguity | Deterministic Validation; clear ownership model; categories without premature V1 lock |

Hardening detail deferred to PLUGINS-P10.

---

## 15. Deferred Decisions

| Deferred theme | Deferred to |
|----------------|-------------|
| Lifecycle (when contracts apply across states) | PLUGINS-P5 |
| Implementation roadmap (I\*) | PLUGINS-P6 |
| SDK / Future SDK Contracts delivery | Later authorized phase |
| API definitions / interface signatures / schemas | Later authorized Implementation |
| Loaders / dependency resolver / package management | Later authorized phase |
| Runtime / marketplace | Later / Future Evolution |
| V1 contract category selection | Later authorized Planning / Implementation under this strategy |
| Concrete permission matrices | Later under Validation / Implementation |
| Code / `src/plugins/` | Blocked until Planning Certification / I\* |

---

## 16. Contract Freeze

Frozen as contract authority for the remainder of the PLUGINS Planning Series (inherit by reference; SHALL NOT reopen):

- Public Contracts Constitutional Freeze  
- Contract Philosophy (Public Plugin Contract as exclusive interaction boundary)  
- Ownership Model (peers own EPs / domain contracts / execution; PLUGINS owns interaction governance)  
- Public Surface Strategy (only Public Plugin Contracts extensible)  
- Contract Categories taxonomy (prepared; no V1 selection)  
- Contract Principles  
- Compatibility Strategy (conceptual)  
- Contract Evolution principles  
- Validation Strategy (conceptual)  
- Cross-domain contract boundaries  
- Architectural Boundaries (contracts vs components vs implementation vs runtime)  
- Security Principles (conceptual)  

---

## 17. Evidence

| Evidence | Status |
|----------|--------|
| Charter · P0–P3 | CERTIFIED — cited |
| DEPENDENCY_MATRIX · SYSTEM_INTERACTIONS | Cited via P1 |
| P2 Public Plugin Contract vocabulary | Cited |
| P3 inventory (C1–C12) | Cited for stewardship alignment |
| Peer domains | RELEASE CERTIFIED |
| This Official Record | Registered under `docs/PLUGINS/official-records/` |
| `src/plugins/` | ABSENT (compliant) |

---

## 18. Exit Criteria

- [x] Public Contract Vision and Philosophy frozen  
- [x] Ownership Model frozen (no ownership transfer)  
- [x] Public Surface Strategy frozen (only Public Plugin Contracts extensible)  
- [x] Contract Categories prepared without V1 selection  
- [x] Compatibility, Evolution, Validation strategies stated without algorithms/APIs  
- [x] Cross-domain contracts for ENGINE, DATA, AI, UX, COLLAB  
- [x] Architectural Boundaries and Security Principles stated  
- [x] Risks and Deferred Decisions explicit  
- [x] Public Contracts Constitutional Freeze declared  
- [x] No APIs, interfaces, signatures, schemas, SDK, loaders, runtime, or code  
- [x] Prior Freezes not reopened  
- [x] Certification Status = CERTIFIED  

---

## 19. Certification Status

**CERTIFIED** — 2026-08-07

| Field | Value |
|-------|--------|
| **PLUGINS-P4 Status** | **CERTIFIED** |
| **Contract Freeze** | **IN FORCE** |
| **Planning Charter / P0–P3** | Unmodified · in force |
| **Repository** | **UNCHANGED** (Official Record registration only) |
| **Lifecycle** | **NOT STARTED** (deferred to PLUGINS-P5) |
| **Implementation** | **BLOCKED** |
| **PLUGINS-I\*** | **BLOCKED** |
| **Next Phase** | **PLUGINS-P5 — Lifecycle** (not opened by this Record) |

PLUGINS-P4 Contract Freeze is complete. PLUGINS-P5 may proceed under the PLUGINS Planning Charter.

---

## 20. Registration Note

Registration path:

`docs/PLUGINS/official-records/PLUGINS-P4-Public-Contracts.md`

Subsequent PLUGINS Planning phases shall cite this Record and prior authorities and shall not modify them.

---

**End of Official Record — PLUGINS-P4 Public Contracts**
