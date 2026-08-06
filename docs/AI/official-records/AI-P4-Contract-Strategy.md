# Official Record

# AI-P4 — Contract Strategy Foundation

**Domain:** AI — Scientific Assistant Platform (Intelligence Domain)  
**Phase:** AI-P4  
**Date:** 2026-08-06  
**Nature:** Contract strategy only — conceptual contracts; no concrete APIs, interfaces, DTOs, schemas, protocols, registries, providers, models, prompts, sessions, memory, tool calling, streaming, workflows, specialized assistants, classes, files, code, or repository mutations beyond this Official Record  
**Prerequisites:** AI-P0 **CERTIFIED** · AI-P1 **CERTIFIED** · AI-P2 **CERTIFIED** · AI-P3 **CERTIFIED** · ENGINE Domain **RELEASE CERTIFIED** · DATA Domain **RELEASE CERTIFIED** · Identity Freeze **INTACT** · Architecture Freeze **IN FORCE** · Functional Freeze **IN FORCE** · Inventory Freeze **IN FORCE**  
**Status:** **CERTIFIED**

**Authority Precedence (binding):**

1. Architectural Decisions (AD-001, AD-002, AD-003, AD-006)  
2. MASTER ROADMAP V2  
3. DOMAIN_BOUNDARIES  
4. DOMAIN_MATRIX  
5. ENGINE Domain (RELEASE CERTIFIED)  
6. DATA Domain (RELEASE CERTIFIED)  
7. AI-P0 Official Record (Vision & Scope Foundation — CERTIFIED) — `docs/AI/official-records/AI-P0-Vision-and-Scope.md`  
8. AI-P1 Official Record (Domain Architecture Foundation — CERTIFIED · Architecture Freeze IN FORCE) — `docs/AI/official-records/AI-P1-Domain-Architecture.md`  
9. AI-P2 Official Record (Domain Definition Foundation — CERTIFIED · Functional Freeze IN FORCE) — `docs/AI/official-records/AI-P2-Domain-Definition.md`  
10. AI-P3 Official Record (Component Inventory Foundation — CERTIFIED · Inventory Freeze IN FORCE) — `docs/AI/official-records/AI-P3-Component-Inventory.md`  
11. AI-P4 Planning (frozen)

**Conflict rule:** Architectural Decisions and previously certified Official Records prevail over every other source.

This Official Record materializes the approved AI-P4 Planning without introducing, reinterpreting, or modifying any previously approved decision.

---

## Series Opening Frame

### Inputs / Authority

| Authority | Role for AI-P4 |
|-----------|----------------|
| AD-001 Architecture First | Planning before implementation |
| AD-002 Domain-Oriented Architecture | Permanent domain organization |
| AD-003 Single Source of Truth | One authoritative owner per responsibility |
| AD-006 AI Consumes Scientific Knowledge | AI derives intelligence from DATA; DATA remains sole owner of scientific truth |
| MASTER ROADMAP V2 §17 AI Domain | Constitutional domain definition (cited; identity, architecture, functional definition, and inventory not redefined) |
| DOMAIN_BOUNDARIES | Permanent owns / does-not-own map |
| DOMAIN_MATRIX | Permanent domain responsibility matrix |
| ENGINE Domain RELEASE CERTIFIED | Frozen Application Layer; stable peer |
| DATA Domain RELEASE CERTIFIED | Frozen Scientific Knowledge Layer; stable peer |
| AI-P0 Official Record CERTIFIED | Identity constitution: dual naming, Motto, Golden Rule, Decision Authority, Scientific Principles, AI Optional, Evolution Statement, ownership quartet |
| AI-P1 Official Record CERTIFIED | Domain-architecture constitution: Position, Architectural Authority, Architectural Decision Flow, Ownership Model, Dependency Model, Integration Philosophy, Architectural Invariants, Architecture Freeze |
| AI-P2 Official Record CERTIFIED | Functional domain-definition constitution: Domain Definition, Core Capabilities, Capability Authority, Functional Scope, Functional Boundaries, Domain Vocabulary, Domain Concepts, Functional Invariants, Functional Freeze |
| AI-P3 Official Record CERTIFIED | Conceptual component-inventory constitution: Inventory Philosophy, Inventory Identity Rule, Component Authority, Classification Model, inventory elements, Inventory Invariants, Inventory Freeze |
| Architecture Freeze (AI-P1) | Binding over Domain Position, Ownership Model, Dependency Model, Integration Philosophy, Architectural Invariants, Architectural Authority, Architectural Decision Flow |
| Functional Freeze (AI-P2) | Binding over Domain Definition, Core Capabilities, Functional Scope, Functional Boundaries, Domain Vocabulary, Domain Concepts, Functional Invariants, Capability Authority |
| Inventory Freeze (AI-P3) | Binding over Conceptual Inventory, Component Classification Model, Component Responsibilities, Component Relationships, Component Boundaries, Inventory Invariants, Component Authority, Inventory Identity Rule |
| This Official Record | AI-P4 contract-strategy SSOT for the AI Planning Series |

### Baseline Freeze

| Item | Frozen value |
|------|----------------|
| ENGINE Domain | **RELEASE CERTIFIED** — immutable under AI Planning |
| DATA Domain | **RELEASE CERTIFIED** — immutable under AI Planning |
| AI-P0 Official Record | **CERTIFIED** — constitutional identity package immutable; cited, not modified |
| AI-P1 Official Record | **CERTIFIED** — domain-architecture package immutable; cited, not modified |
| AI-P2 Official Record | **CERTIFIED** — functional domain-definition package immutable; cited, not modified |
| AI-P3 Official Record | **CERTIFIED** — conceptual component-inventory package immutable; cited, not modified |
| Architecture Freeze | **IN FORCE** — architectural foundations immutable |
| Functional Freeze | **IN FORCE** — functional foundations immutable |
| Inventory Freeze | **IN FORCE** — inventory foundations immutable |
| AI Domain (product status) | **PLANNED** — Planning Series open at AI-P4 |
| AI Implementation Series (AI-I*) | **BLOCKED** until Planning Certification |
| ROADMAP.md / PROJECT_STATUS.md | **Unchanged** during AI-P* (synchronization reserved for post–Planning Certification) |
| Repo mutation for AI package | **Forbidden** during AI-P* (no `src/ai/`) |

### Freeze Matrix (normative ladder)

| Phase | Freeze |
|-------|--------|
| AI-P0 | Identity Freeze |
| AI-P1 | Architecture Freeze |
| AI-P2 | Functional Freeze |
| AI-P3 | Inventory Freeze |
| **AI-P4** | **Contract Freeze** |
| AI-P5 *(future)* | Lifecycle *(not opened by this Record)* |

Each Planning phase adds **one** normative layer. No phase redefines prior layers.

### AI-P0 Package Reaffirmed by Reference

AI-P4 cites and does not modify:

- Dual naming: Scientific Assistant Platform (Intelligence Domain)  
- Domain Motto  
- AI Golden Rule  
- Ownership quartet (AI produces intelligence · ENGINE owns execution · DATA owns scientific truth · UX owns presentation)  
- Decision Authority  
- AI Optional  
- Evolution Statement  
- Scientific Principles (Explainability First through Reproducibility Support)  
- AI derives intelligence from DATA; DATA remains sole owner of scientific truth  

### AI-P1 Package Reaffirmed by Reference

AI-P4 cites and does not modify:

- Architectural Position  
- Architectural Authority (exclusive over intelligence generation)  
- Architectural Decision Flow  
- Ownership Model  
- Dependency Model  
- Integration Philosophy  
- Architectural Invariants  
- Architecture Freeze  

### AI-P2 Package Reaffirmed by Reference

AI-P4 cites and does not modify:

- Domain Definition  
- Core Capabilities  
- Capability Authority  
- Functional Scope  
- Functional Boundaries  
- Domain Vocabulary  
- Domain Concepts  
- Functional Invariants  
- Functional Freeze  

### AI-P3 Package Reaffirmed by Reference

AI-P4 cites and does not modify:

- Inventory Philosophy  
- Inventory Identity Rule  
- Component Authority  
- Component Classification Model  
- Conceptual inventory (Identity · Core · Supporting · Governance · Extension · Infrastructure)  
- Component Responsibilities  
- Component Relationships  
- Component Boundaries  
- Inventory Invariants  
- Inventory Freeze  
- Intelligence Exposure Boundary  
- Coordination Boundary  

### Repository Status

| Check | Result |
|-------|--------|
| `src/ai/` | **ABSENT** |
| AI domain implementation code | **NONE** |
| ENGINE package | **PRESENT** · RELEASE CERTIFIED |
| DATA package | **PRESENT** · RELEASE CERTIFIED |
| AI-P0 Official Record | **REGISTERED** · CERTIFIED · unmodified |
| AI-P1 Official Record | **REGISTERED** · CERTIFIED · unmodified |
| AI-P2 Official Record | **REGISTERED** · CERTIFIED · unmodified |
| AI-P3 Official Record | **REGISTERED** · CERTIFIED · unmodified |
| Architecture Freeze | **IN FORCE** |
| Functional Freeze | **IN FORCE** |
| Inventory Freeze | **IN FORCE** |
| This Official Record | **REGISTERED** under `docs/AI/official-records/` |

### No-Code Compliance Checklist (entire AI-P* series)

Mandatory for AI-P0 … AI-P11:

- [x] No application source changes under `src/ai/` or equivalent AI package  
- [x] No new TypeScript interfaces, classes, functions, or tests for AI implementation  
- [x] No creation of AI package skeleton  
- [x] No validators / scripts `validate:ai*`  
- [x] No modification of ENGINE or DATA  
- [x] No ROADMAP.md or PROJECT_STATUS.md updates during AI-P*  
- [x] No implementation proposals executed  
- [x] No advance into AI-I*  
- [x] No scope creep into AI-P5+ lifecycle or implementation commitments inside AI-P4  
- [x] No modification of AI-P0 Official Record  
- [x] No modification of AI-P1 Official Record  
- [x] No modification of AI-P2 Official Record  
- [x] No modification of AI-P3 Official Record  
- [x] No violation of Architecture Freeze  
- [x] No violation of Functional Freeze  
- [x] No violation of Inventory Freeze  
- [x] No concrete APIs, interfaces, DTOs, schemas, protocols, or technical contracts  

---

## 1. Executive Summary

AI-P4 freezes the **contract strategy** of Artificial Intelligence within Scientific Graph AI: how the Intelligence Domain shall expose, consume, and preserve conceptual relationships with peer domains—Contract Philosophy, Classification Model, Responsibilities, Ownership, Authority, Contract Authority Hierarchy, Contract Identity Rule, Contract Minimalism Principle, Consumer Rules, Exposure Rules, Cross-Domain Contract Principles, Compatibility Principles and Compatibility Rule, Versioning Principles, Boundaries, Invariants, Evolution Rules, and Contract Freeze.

AI-P0 froze **why** the domain exists and **what** it is.

AI-P1 froze **where** it sits architecturally and **under what authority and dependency rules** it relates to peer domains.

AI-P2 froze **what constitutes AI functionally** as the Intelligence Domain of the product.

AI-P3 froze **what permanent conceptual elements form part of the domain**.

AI-P4 freezes **how domain relationships shall be structured**.

AI remains the **Scientific Assistant Platform (Intelligence Domain)**.

AI produces intelligence.

ENGINE owns execution.

DATA owns scientific truth.

UX owns presentation.

AI is the sole domain authorized to define, evolve, and retire conceptual contracts.

Consumers may use those contracts.

Consumers shall never redefine them.

Conceptual contracts express relationships.

Conceptual contracts never redefine domain identity, architectural foundations, functional foundations, or inventory foundations.

AI-P4 does not define concrete contracts, APIs, interfaces, DTOs, schemas, protocols, or implementation. Those remain deferred.

Architecture Freeze remains intact.

Functional Freeze remains intact.

Inventory Freeze remains intact.

---

## 2. Contract Philosophy

An AI conceptual contract is a **conceptual relationship agreement**.

It expresses what intelligence and capabilities may be exposed or obtained, under what ownership and authority, without fixing technical form.

Contract Philosophy is constitutional:

- Contracts are **conceptual**.  
- Contracts are **stable**.  
- Contracts are **independent of implementation**.  
- Contracts do **not** represent interfaces, APIs, classes, events, DTOs, schemas, formats, or protocols.  

The contract strategy answers a single question:

> How shall the relationships of the AI domain be structured?

The contract strategy does not answer how those relationships are implemented, serialized, versioned in concrete artifacts, or executed at runtime.

Conceptual contracts serve:

- Integration Philosophy (AI-P1);  
- Intelligence Exposure Boundary (AI-P3);  
- Coordination Boundary (AI-P3).  

Conceptual contracts never absorb peer ownership.

Conceptual contracts remain subject to the **Contract Minimalism Principle**.

Assistance never transfers ownership.

Consumption of conceptual contracts by peers never transfers Contract Authority to peers.

---

## 3. Contract Classification Model

Every conceptual contract is classified conceptually, without technical surface:

| Class | Meaning (conceptual) |
|-------|----------------------|
| **Internal** | Relationships among conceptual components of the AI inventory |
| **External** | Exposure of intelligence toward consumers outside the internal nucleus |
| **Cross-Domain** | Relationships with ENGINE, DATA, UX (and future peers) |
| **Extension** | Relationships that enable Extension components / future capabilities |
| **Governance** | Relationships that express Capability Authority, Component Authority, Optionality, and Non-Authoritative rules |

Classification is conceptual.

Classification does not imply technical interfaces.

Classification is not a protocol catalog.

Classification is not an implementation topology.

---

## 4. Contract Responsibilities

At contract-strategy level, conceptual contracts hold the following permanent responsibilities. They do not constitute technical interface assignments.

| Area | Responsibility |
|------|----------------|
| **Relationship expression** | Express conceptual relationships among AI inventory elements and with peer domains without fixing technical form. |
| **Exposure structuring** | Structure outward exposure of intelligence under Contract Minimalism and Exposure Rules. |
| **Authority preservation** | Preserve Architectural Authority, Capability Authority, Component Authority, and Contract Authority Hierarchy. |
| **Ownership protection** | Never transfer Ownership; never expose peer-owned concerns as AI ownership. |
| **Integration service** | Serve Integration Philosophy, Intelligence Exposure Boundary, and Coordination Boundary without absorbing peer ownership. |
| **Compatibility preservation** | Preserve Identity Freeze, Architecture Freeze, Functional Freeze, and Inventory Freeze under every contractual evolution. |
| **Optionality preservation** | Never introduce contractual dependence that breaks AI Optional. |
| **Non-authoritative posture** | Express intelligence relationships as non-authoritative; never as scientific verdicts or execution commands. |

Authority alignment: MASTER ROADMAP V2 §17; DOMAIN_BOUNDARIES; DOMAIN_MATRIX; AD-006; AI-P0 Official Record; AI-P1 Official Record; AI-P2 Official Record; AI-P3 Official Record.

---

## 5. Contract Ownership

| Owns | Never owns |
|------|------------|
| All AI conceptual contracts | Scientific truth (DATA) |
| Definition, evolution, and retirement of AI conceptual contracts | Workflow execution (ENGINE) |
| Contractual identity of AI relationships | Presentation (UX) |
| | Persistence engines |
| | Peer-domain contractual redefinition |
| | Concrete APIs, interfaces, DTOs, schemas, protocols |

Constitutional ownership rule:

> AI owns all AI conceptual contracts.

Assistance never transfers Contract Ownership.

Consumption of AI conceptual contracts by peers never transfers Contract Ownership to peers.

AI Golden Rule (constitutional; reaffirmed):

> **AI may assist every domain. AI owns none of them.**

---

## 6. Contract Authority

Contract Authority is distinct from Architectural Authority, Capability Authority, and Component Authority.

**Architectural Authority** (AI-P1) defines exclusive architectural authority over intelligence generation.

**Capability Authority** (AI-P2) defines exclusive functional authority over the definition, evolution, and governance of intelligence capabilities.

**Component Authority** (AI-P3) defines exclusive inventory authority over the definition, evolution, classification, and retirement of conceptual components.

**Contract Authority** defines exclusive contractual authority over the definition, evolution, and retirement of conceptual contracts.

Constitutional rule:

> AI is the sole domain authorized to define, evolve, and retire conceptual contracts.  
> Consumers may use them.  
> Consumers shall never redefine them.

No Contract Authority is granted over scientific truth, workflow execution, presentation, persistence, or peer domains.

Assistance never transfers Contract Authority.

Use of conceptual contracts by peers never transfers Contract Authority to peers.

---

## 7. Contract Authority Hierarchy

> Contract Authority operates under:  
> - Architectural Authority  
> - Capability Authority  
> - Component Authority  
>  
> Conceptual contracts shall never redefine architectural, functional or inventory decisions.  
> Contracts express relationships.  
> They never redefine domain identity.

The Contract Authority Hierarchy is constitutional.

Ordered normative hierarchy:

1. Architectural Authority (AI-P1)  
2. Capability Authority (AI-P2)  
3. Component Authority (AI-P3)  
4. Contract Authority (AI-P4)  

Architectural, functional, and inventory authorities prevail over contractual strategy.

Conceptual contracts shall never invert this hierarchy.

Conceptual contracts shall never redefine Core Identity, Domain Definition, or conceptual inventory identities.

---

## 8. Contract Identity Rule

> Contract identity is permanent.  
> Implementations may evolve.  
> Contractual identity remains stable.

The Contract Identity Rule is constitutional.

It protects contractual identity against future technological refactorization.

Implementation change shall never redefine contractual identity.

Contractual identity remains stable across Planning and Implementation Series.

The Contract Identity Rule complements the Inventory Identity Rule (AI-P3). Inventory identities and contractual identities remain distinct; neither redefines the other.

---

## 9. Contract Minimalism Principle

> Every conceptual contract shall expose only the minimum relationship required.  
> No contract shall expose ownership, implementation details, or peer-domain internals.

The Contract Minimalism Principle is constitutional.

It protects future exposure surfaces against uncontrolled growth.

No conceptual contract shall enlarge exposure beyond the minimum relationship required for intelligence assistance under proper coordination.

No conceptual contract shall expose:

- ownership;  
- implementation details;  
- peer-domain internals.  

Contract Minimalism binds External, Cross-Domain, Extension, and Governance classifications alike.

---

## 10. Consumer Rules

| Consumer | Rule |
|----------|------|
| **ENGINE** | Primary coordinator and consumer of intelligence; retains execution decision; may consume conceptual contracts; shall never redefine them. |
| **UX** | Presentation consumer only; determines how intelligence is experienced; may consume conceptual contracts; shall never redefine them; never a source of scientific grounding. |
| **DATA** | Source of scientific truth for derivation; **not** a consumer of AI intelligence for scientific correctness; never redefined by AI contracts. |
| **Future peers** | May consume under the AI Golden Rule; shall never redefine conceptual contracts; never receive Ownership, Architectural Authority, Capability Authority, Component Authority, or Contract Authority. |

Consumer Rules never transfer Ownership or any Authority.

AI Optional binds all consumers: scientific correctness never depends on consumption of AI conceptual contracts.

---

## 11. Exposure Rules

### May expose (conceptual)

Minimum necessary conceptual exposures only:

- intelligence results;  
- recommendations;  
- explanations;  
- guidance;  
- capability catalog references.  

All exposures remain conceptual.

All exposures remain non-authoritative.

All exposures remain subject to Contract Minimalism.

### Never expose

Conceptual contracts shall never expose:

- ownership;  
- implementation details;  
- peer-domain internals;  
- DATA mutation rights;  
- execution authority;  
- UX ownership;  
- persistence engines;  
- anything that breaks AI Optional;  
- anything that breaks Contract Minimalism.  

Exposure Rules never invert Decision Authority.

Exposure Rules never invert Architectural Decision Flow.

---

## 12. Cross-Domain Contract Principles

### Relation to DATA

AI may hold conceptual **derivation** relationships: derive intelligence from DATA.

AI shall never hold ownership or mutation contracts over scientific truth.

AD-006 remains binding:

- AI never owns persistent scientific knowledge;  
- AI never mutates scientific meaning;  
- AI never redefines the scientific model;  
- AI never certifies scientific correctness in place of DATA or the User.  

DATA remains source of truth.

DATA is not a consumer of AI intelligence for scientific correctness.

### Relation to ENGINE

AI may hold conceptual **intelligence supply** and **guidance** relationships.

ENGINE retains execution decision.

AI shall never own workflow execution contracts.

AI never executes workflows.

AI never bypasses ENGINE coordination.

ENGINE may consume conceptual contracts.

ENGINE shall never redefine them.

### Relation to UX

AI may hold conceptual **presentation feedstock** relationships.

UX owns presentation.

AI shall never own UI contracts.

UX may consume conceptual contracts.

UX shall never redefine them.

AI does not depend on UX for scientific grounding or domain logic.

### Relation to future peers

Under the AI Golden Rule, without transferring Ownership or any Authority:

- COLLABORATION — future consumption;  
- PLUGINS — future consumption.  

Peers may consume.

Peers shall never redefine.

Contract Authority, Component Authority, and Capability Authority remain exclusively with AI.

---

## 13. Compatibility Principles

Compatibility Principles bind every contractual evolution.

### Compatibility Rule

Every contractual evolution shall preserve:

- Identity Freeze (AI-P0)  
- Architecture Freeze (AI-P1)  
- Functional Freeze (AI-P2)  
- Inventory Freeze (AI-P3)  

No contract may invalidate prior constitutional decisions.

The Compatibility Rule is constitutional.

### Stability

Stability of the contract strategy means preservation of:

- freezes AI-P0 through AI-P3;  
- Decision Authority;  
- AI Optional;  
- AI Golden Rule;  
- Contract Minimalism Principle;  
- Contract Authority Hierarchy;  
- Contract Identity Rule.  

No conceptual contract may invalidate Decision Authority.

No conceptual contract may invalidate AI Optional.

No conceptual contract may invalidate the AI Golden Rule.

---

## 14. Versioning Principles

Versioning at AI-P4 is conceptual only.

- Conceptual versioning rules only.  
- No concrete version numbers.  
- No concrete schemas.  
- No concrete protocol revisions.  

Additive evolution is preferred.

Breaking conceptual contracts, if ever authorized, requires AI Contract Authority.

Breaking conceptual contracts shall never violate the Compatibility Rule.

Breaking conceptual contracts shall never violate the Contract Authority Hierarchy.

Breaking conceptual contracts shall never redefine Identity Freeze, Architecture Freeze, Functional Freeze, or Inventory Freeze foundations.

Implementation versioning artifacts remain deferred beyond AI-P4.

---

## 15. Contract Boundaries

Contract Boundary is defined by the conjunction of:

- Contract Philosophy;  
- Contract Classification Model;  
- Contract Ownership;  
- Contract Authority;  
- Contract Authority Hierarchy;  
- Contract Identity Rule;  
- Contract Minimalism Principle;  
- Consumer Rules;  
- Exposure Rules;  
- Compatibility Rule;  
- Architectural Authority (AI-P1);  
- Capability Authority (AI-P2);  
- Component Authority (AI-P3);  
- Inventory Identity Rule (AI-P3);  
- Decision Authority (AI-P0);  
- Optionality (AI Optional);  
- Architecture Freeze;  
- Functional Freeze;  
- Inventory Freeze.  

| In contract-strategy scope | Never in contract-strategy scope |
|----------------------------|----------------------------------|
| Conceptual relationship agreements | Concrete APIs, interfaces, DTOs, schemas, protocols |
| Classification of conceptual contracts | Technical interface catalogs |
| Contract Authority under Authority Hierarchy | Peer redefinition of conceptual contracts |
| Minimum necessary intelligence exposures | Ownership exposure; implementation details; peer internals |
| Cross-domain derivation / supply / feedstock relationships | DATA mutation; workflow execution; UI ownership |
| Compatibility with freezes P0–P3 | Invalidation of prior constitutional decisions |
| Conceptual versioning principles | Concrete version numbers / schemas |

Within these boundaries:

- AI produces intelligence.  
- AI does not control product flow.  
- ENGINE decides use of intelligence.  
- DATA owns scientific truth.  
- UX owns presentation.  
- Consumers may use conceptual contracts; consumers shall never redefine them.  
- Contracts express relationships; they never redefine domain identity.  
- Chatbot identity is not contractual identity.  

AI does not sit on the critical path of scientific correctness.

AI does not sit on the critical path of workflow execution.

---

## 16. Contract Invariants

The following contract invariants must remain true in every future Planning and Implementation phase. They complement Architectural Invariants (AI-P1), Functional Invariants (AI-P2), and Inventory Invariants (AI-P3) at contract-strategy level:

- AI is the Scientific Assistant Platform (Intelligence Domain).  
- AI produces intelligence.  
- ENGINE owns execution.  
- DATA owns scientific truth.  
- UX owns presentation.  
- User retains final scientific decision authority.  
- AI may assist every domain; AI owns none of them.  
- Contracts are conceptual, stable, and independent of implementation.  
- Contracts never represent interfaces, APIs, classes, events, DTOs, schemas, formats, or protocols.  
- AI owns all AI conceptual contracts.  
- AI is the sole domain authorized to define, evolve, and retire conceptual contracts.  
- Consumers may use conceptual contracts; consumers shall never redefine them.  
- Contract Authority operates under Architectural Authority, Capability Authority, and Component Authority.  
- Conceptual contracts shall never redefine architectural, functional, or inventory decisions.  
- Contracts express relationships; they never redefine domain identity.  
- Contract identity is permanent; implementations may evolve; contractual identity remains stable.  
- Every conceptual contract shall expose only the minimum relationship required.  
- No contract shall expose ownership, implementation details, or peer-domain internals.  
- ENGINE is the primary coordinator and consumer of intelligence.  
- UX is a presentation consumer only.  
- DATA is source of truth, not a consumer of AI intelligence for correctness.  
- AI may hold derivation relationships with DATA; never ownership or mutation contracts over scientific truth.  
- AI may hold intelligence supply and guidance relationships with ENGINE; never workflow execution contracts.  
- AI may hold presentation feedstock relationships with UX; never UI contracts.  
- Every contractual evolution shall preserve Identity Freeze, Architecture Freeze, Functional Freeze, and Inventory Freeze.  
- No contract may invalidate prior constitutional decisions.  
- AI Optional holds as a contract invariant.  
- Capability Authority, Component Authority, and Contract Authority remain exclusively with AI.  
- AI evolves by adding capabilities, never by absorbing ownership from existing domains.  
- ENGINE and DATA remain immutable under AI Planning and Implementation.  
- AI-P0 identity package remains immutable.  
- AI-P1 architectural foundations remain immutable under Architecture Freeze.  
- AI-P2 functional foundations remain immutable under Functional Freeze.  
- AI-P3 inventory foundations remain immutable under Inventory Freeze.  
- Upon AI-P4 certification, Contract Freeze binds Philosophy, Classification, Responsibilities, Ownership, Authority, Authority Hierarchy, Boundaries, Invariants, Compatibility Principles, Versioning Principles, Contract Minimalism, and Contract Identity Rule.  
- Specialized assistants never redefine Core Identity, Architectural Authority, Capability Authority, Component Authority, or Contract Authority.  
- Subsequent Planning phases may define concrete contracts but shall not redefine the contract strategy.  

These are contract-strategy invariants—not concrete contracts or implementation design.

---

## 17. Evolution Rules

Evolution Statement (constitutional; reaffirmed from AI-P0):

> AI evolves by adding capabilities.  
> Never by absorbing ownership from existing domains.

Strategic evolution rules for contract strategy:

- Add capabilities; never absorb ownership.  
- Contractual evolution shall remain additive by preference.  
- Breaking conceptual contracts requires Contract Authority and shall obey Compatibility Rule and Contract Authority Hierarchy.  
- Growth preserves AI-P0 identity, AI-P1 foundations under Architecture Freeze, AI-P2 foundations under Functional Freeze, AI-P3 foundations under Inventory Freeze, and AI-P4 foundations under Contract Freeze.  
- Extension shall preserve Core Identity, Motto, Decision Authority, Golden Rule, Scientific Principles, AI Optional, Architectural Authority, Capability Authority, Component Authority, Contract Authority, Contract Authority Hierarchy, Contract Identity Rule, Contract Minimalism Principle, Compatibility Rule, Architectural Decision Flow, Ownership Model, Dependency Model, Integration Philosophy, Domain Definition, Core Capabilities, Functional Scope, Functional Boundaries, Domain Vocabulary, Domain Concepts, conceptual inventory, and contract strategy.  
- Peers never redefine contracts, components, or capabilities (Contract Authority + Component Authority + Capability Authority).  
- Contract retirement, if ever authorized, remains exclusively under Contract Authority and shall not transfer ownership to peers.  
- Later phases may define concrete contracts; later phases shall never redefine the strategy.  
- Detailed AI-I* roadmap remains deferred to later Planning.  
- No ownership absorption from ENGINE, DATA, UX, Platform, COLLABORATION, PLUGINS, or PERFORMANCE.  

---

## 18. Risks

| Risk | Control |
|------|---------|
| Chatbot drift into contractual identity | Dual naming + Contract Philosophy + Contract Boundaries |
| Ownership bleed into DATA / ENGINE / UX | Contract Ownership + Exposure Rules + Golden Rule + Decision Authority |
| Peer redefinition of conceptual contracts | Contract Authority |
| Peer redefinition of inventory or capabilities | Component Authority (AI-P3) + Capability Authority (AI-P2) |
| Contracts redefining architecture / function / inventory | Contract Authority Hierarchy |
| Treating contracts as APIs, interfaces, or DTOs | Contract Philosophy + Contract Identity Rule + Nature of AI-P4 |
| Uncontrolled exposure growth | Contract Minimalism Principle + Exposure Rules |
| Breaking prior freezes through contractual evolution | Compatibility Rule |
| Opaque or ownership-transferring cross-domain relationships | Cross-Domain Contract Principles + Non-authoritative invariants |
| AI becoming required for scientific correctness | AI Optional + Consumer Rules (DATA not consumer for correctness) |
| Premature concrete contracts / protocols | Nature of AI-P4 + Out of Scope + Contract Freeze |
| Premature specialized-assistant productization | Evolution Rules + Out of Scope |
| Reinterpretation of AD-006 as pipeline ownership | Cross-Domain Contract Principles (DATA) + “AI derives intelligence from DATA” language |
| Redefinition of P0/P1/P2/P3 foundations | Architecture Freeze + Functional Freeze + Inventory Freeze + Conflict rule |
| Redefinition of P4 foundations in later Planning | Contract Freeze |

Detailed validation, governance, and hardening frameworks remain deferred to later Planning phases.

---

## 19. Exit Criteria

| Criterion | Met? |
|-----------|------|
| Contract Philosophy recorded | Yes |
| Contract Classification Model frozen | Yes |
| Contract Responsibilities recorded | Yes |
| Contract Ownership frozen | Yes |
| Contract Authority frozen | Yes |
| Contract Authority Hierarchy frozen | Yes |
| Contract Identity Rule frozen | Yes |
| Contract Minimalism Principle frozen | Yes |
| Consumer Rules recorded | Yes |
| Exposure Rules recorded | Yes |
| Cross-Domain Contract Principles recorded | Yes |
| Compatibility Principles recorded | Yes |
| Compatibility Rule frozen | Yes |
| Versioning Principles recorded | Yes |
| Contract Boundaries recorded | Yes |
| Contract Invariants recorded | Yes |
| Evolution Rules recorded | Yes |
| Evolution Statement reaffirmed | Yes |
| Risks recorded | Yes |
| Contract Freeze declared upon certification | Yes |
| Architecture Freeze intact | Yes |
| Functional Freeze intact | Yes |
| Inventory Freeze intact | Yes |
| AI-P0 constitutional package unmodified | Yes |
| AI-P1 architectural package unmodified | Yes |
| AI-P2 functional package unmodified | Yes |
| AI-P3 inventory package unmodified | Yes |
| No AI-P5+ lifecycle/impl content committed | Yes |
| No concrete APIs / interfaces / DTOs / schemas / protocols | Yes |
| ENGINE and DATA unmodified | Yes |
| No AI implementation code | Yes |
| AI-P5 not opened | Yes |

---

## 20. AI-P4 Certification Status

| Field | Value |
|-------|--------|
| **AI-P4 Status** | **CERTIFIED** |
| **Official Record** | **RELEASE READY** |
| **Repository (ENGINE / DATA / AI package)** | **UNCHANGED** (Official Record registration only) |
| **AI-P0** | **CERTIFIED** · unmodified |
| **AI-P1** | **CERTIFIED** · unmodified |
| **AI-P2** | **CERTIFIED** · unmodified |
| **AI-P3** | **CERTIFIED** · unmodified |
| **Architecture Freeze** | **IN FORCE** · intact |
| **Functional Freeze** | **IN FORCE** · intact |
| **Inventory Freeze** | **IN FORCE** · intact |
| **Contract Freeze** | **IN FORCE** |
| **Lifecycle** | **NOT STARTED** |
| **Implementation** | **BLOCKED** |
| **AI-I\*** | **BLOCKED** |
| **Next Phase** | **AI-P5 — Lifecycle** (not opened by this Record) |

No documentary blockers remain for contract strategy. AI-P5 is **not** opened by this Official Record.

---

## 21. Contract Freeze

Upon certification of AI-P4, the following are frozen:

- Contract Philosophy  
- Contract Classification Model  
- Contract Responsibilities  
- Contract Ownership  
- Contract Authority  
- Contract Authority Hierarchy  
- Contract Boundaries  
- Contract Invariants  
- Compatibility Principles  
- Versioning Principles  
- Contract Minimalism Principle  
- Contract Identity Rule  

Subsequent Planning phases may define concrete contracts and implementation planning but shall not redefine the contract strategy.

Contract Freeze is binding for the remainder of the AI Planning Series and for all AI Implementation Series authorized thereafter.

Architecture Freeze remains intact and is not modified by this Record.

Functional Freeze remains intact and is not modified by this Record.

Inventory Freeze remains intact and is not modified by this Record.

---

## 22. Registration Note

This Official Record is registered as the permanent contract-strategy constitution of the AI Domain for Scientific Graph AI.

Registration path:

`docs/AI/official-records/AI-P4-Contract-Strategy.md`

This Record is the authoritative materialization of approved AI-P4 Planning.

Subsequent AI Planning phases shall cite this Record and shall not modify it.

AI-P0 Official Record remains the authoritative identity constitution and is not modified by this Record.

AI-P1 Official Record remains the authoritative domain-architecture constitution and is not modified by this Record.

AI-P2 Official Record remains the authoritative functional domain-definition constitution and is not modified by this Record.

AI-P3 Official Record remains the authoritative conceptual component-inventory constitution and is not modified by this Record.

Architecture Freeze remains in force and is not modified by this Record.

Functional Freeze remains in force and is not modified by this Record.

Inventory Freeze remains in force and is not modified by this Record.

Synchronization of ROADMAP.md and PROJECT_STATUS.md remains deferred until Planning Certification authorizes a single documentary synchronization event.

---

## 23. Out of Scope Confirmed (AI-P4)

| Theme | Status |
|-------|--------|
| Lifecycle | Deferred to AI-P5 |
| Master Implementation Roadmap | Deferred to AI-P6 |
| Execution Governance | Deferred to AI-P7 |
| Validation Strategy | Deferred to AI-P8 |
| Implementation Strategy | Deferred to AI-P9 |
| Hardening Strategy | Deferred to AI-P10 |
| Planning Certification | Deferred to AI-P11 |
| Concrete contracts / APIs / interfaces / DTOs / schemas / protocols | Deferred |
| Specialized assistants (design) | Deferred |
| Registries / providers / models | Deferred |
| Sessions / prompts / tool calling / streaming / memory | Deferred |
| Classes / files / folders | Forbidden in AI-P4 |
| Workflows (ownership / execution) | Forbidden to AI; owned by ENGINE |
| AI-I* implementation | Blocked until Planning Certification |
| Modification of ENGINE or DATA | Forbidden |
| Modification of AI-P0 Official Record | Forbidden |
| Modification of AI-P1 Official Record | Forbidden |
| Modification of AI-P2 Official Record | Forbidden |
| Modification of AI-P3 Official Record | Forbidden |
| Violation of Architecture Freeze | Forbidden |
| Violation of Functional Freeze | Forbidden |
| Violation of Inventory Freeze | Forbidden |
| Creation of `src/ai/` | Forbidden during AI-P* |
| ROADMAP / PROJECT_STATUS updates | Deferred to post–Planning Certification synchronization |
| Opening of AI-P5 by this Record | Not opened |

---

**End of Official Record — AI-P4 Contract Strategy Foundation**
