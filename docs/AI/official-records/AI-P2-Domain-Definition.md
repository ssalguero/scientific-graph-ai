# Official Record

# AI-P2 — Domain Definition Foundation

**Domain:** AI — Scientific Assistant Platform (Intelligence Domain)  
**Phase:** AI-P2  
**Date:** 2026-08-06  
**Nature:** Domain definition only — no internal components, layers, modules, APIs, contracts, registries, providers, models, prompts, sessions, memory, tool calling, streaming, workflows, specialized assistants, code, or repository mutations beyond this Official Record  
**Prerequisites:** AI-P0 **CERTIFIED** · AI-P1 **CERTIFIED** · ENGINE Domain **RELEASE CERTIFIED** · DATA Domain **RELEASE CERTIFIED** · Architecture Freeze **IN FORCE**  
**Status:** **CERTIFIED**

**Authority Precedence (binding):**

1. Architectural Decisions (AD-001, AD-002, AD-003, AD-006)  
2. AI-P0 Official Record (Vision & Scope Foundation — CERTIFIED)  
3. AI-P1 Official Record (Domain Architecture Foundation — CERTIFIED · Architecture Freeze IN FORCE)  
4. MASTER ROADMAP V2  
5. DOMAIN_BOUNDARIES  
6. DOMAIN_MATRIX  
7. ENGINE Domain (RELEASE CERTIFIED)  
8. DATA Domain (RELEASE CERTIFIED)  
9. AI-P2 Planning (frozen)

**Conflict rule:** Architectural Decisions, AI-P0, and AI-P1 prevail over any other source.

This Official Record materializes the approved AI-P2 Planning without introducing, reinterpreting, or modifying any previously approved decision.

---

## Series Opening Frame

### Inputs / Authority

| Authority | Role for AI-P2 |
|-----------|----------------|
| AD-001 Architecture First | Planning before implementation |
| AD-002 Domain-Oriented Architecture | Permanent domain organization |
| AD-003 Single Source of Truth | One authoritative owner per responsibility |
| AD-006 AI Consumes Scientific Knowledge | AI derives intelligence from DATA; DATA remains sole owner of scientific truth |
| MASTER ROADMAP V2 §17 AI Domain | Constitutional domain definition (cited; identity and architecture not redefined) |
| DOMAIN_BOUNDARIES | Permanent owns / does-not-own map |
| DOMAIN_MATRIX | Permanent domain responsibility matrix |
| ENGINE Domain RELEASE CERTIFIED | Frozen Application Layer; stable peer |
| DATA Domain RELEASE CERTIFIED | Frozen Scientific Knowledge Layer; stable peer |
| AI-P0 Official Record CERTIFIED | Identity constitution: dual naming, Motto, Golden Rule, Decision Authority, Scientific Principles, AI Optional, Evolution Statement, ownership quartet |
| AI-P1 Official Record CERTIFIED | Domain-architecture constitution: Position, Architectural Authority, Architectural Decision Flow, Ownership Model, Dependency Model, Integration Philosophy, Architectural Invariants, Architecture Freeze |
| Architecture Freeze (AI-P1) | Binding over Domain Position, Ownership Model, Dependency Model, Integration Philosophy, Architectural Invariants, Architectural Authority, Architectural Decision Flow |
| This Official Record | AI-P2 functional domain-definition SSOT for the AI Planning Series |

### Baseline Freeze

| Item | Frozen value |
|------|----------------|
| ENGINE Domain | **RELEASE CERTIFIED** — immutable under AI Planning |
| DATA Domain | **RELEASE CERTIFIED** — immutable under AI Planning |
| AI-P0 Official Record | **CERTIFIED** — constitutional identity package immutable; cited, not modified |
| AI-P1 Official Record | **CERTIFIED** — domain-architecture package immutable; cited, not modified |
| Architecture Freeze | **IN FORCE** — architectural foundations immutable |
| AI Domain (product status) | **PLANNED** — Planning Series open at AI-P2 |
| AI Implementation Series (AI-I*) | **BLOCKED** until Planning Certification |
| ROADMAP.md / PROJECT_STATUS.md | **Unchanged** during AI-P* (synchronization reserved for post–Planning Certification) |
| Repo mutation for AI package | **Forbidden** during AI-P* (no `src/ai/`) |

### AI-P0 Package Reaffirmed by Reference

AI-P2 cites and does not modify:

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

AI-P2 cites and does not modify:

- Architectural Position  
- Architectural Authority (exclusive over intelligence generation)  
- Architectural Decision Flow  
- Ownership Model  
- Dependency Model  
- Integration Philosophy  
- Architectural Invariants  
- Architecture Freeze  

### Repository Status

| Check | Result |
|-------|--------|
| `src/ai/` | **ABSENT** |
| AI domain implementation code | **NONE** |
| ENGINE package | **PRESENT** · RELEASE CERTIFIED |
| DATA package | **PRESENT** · RELEASE CERTIFIED |
| AI-P0 Official Record | **REGISTERED** · CERTIFIED · unmodified |
| AI-P1 Official Record | **REGISTERED** · CERTIFIED · unmodified |
| Architecture Freeze | **IN FORCE** |
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
- [x] No scope creep into AI-P3+ conceptual inventory, contracts, lifecycle, or implementation commitments inside AI-P2  
- [x] No modification of AI-P0 Official Record  
- [x] No modification of AI-P1 Official Record  
- [x] No violation of Architecture Freeze  

---

## 1. Executive Summary

AI-P2 freezes the **functional domain definition** of Artificial Intelligence within Scientific Graph AI: what constitutes AI functionally, core capabilities, Capability Authority, functional responsibilities, functional scope and boundaries, domain vocabulary, domain concepts, functional invariants, evolution categories, peer relationships at functional level, and Functional Freeze.

AI-P0 froze **why** the domain exists and **what** it is.

AI-P1 froze **where** it sits architecturally and **under what authority and dependency rules** it relates to peer domains.

AI-P2 freezes **what constitutes AI functionally** as the Intelligence Domain of the product.

AI remains the **Scientific Assistant Platform (Intelligence Domain)**.

AI produces intelligence.

ENGINE owns execution.

DATA owns scientific truth.

UX owns presentation.

AI is the sole domain responsible for defining, evolving, and governing intelligence capabilities.

Peer domains may consume those capabilities.

Peer domains shall never redefine them.

AI-P2 does not design internal structure, components, contracts, or implementation. Those remain deferred.

Architecture Freeze remains intact.

---

## 2. Domain Definition

AI is functionally defined as follows:

> **Scientific Assistant Platform (Intelligence Domain)** — produces intelligence; never owns scientific truth, execution, or presentation.

This definition is constitutional at functional level. It binds product identity, architectural role, and ownership exclusions in a single canonical statement.

AI produces non-authoritative intelligence in support of scientific work.

AI never owns scientific truth.

AI never owns workflow execution.

AI never owns presentation.

---

## 3. Domain Purpose

The functional purpose of AI is to amplify scientific reasoning without replacing scientific judgment.

This purpose is the functional emphasis of the Domain Motto frozen in AI-P0:

> **Amplify scientific reasoning without replacing scientific judgment.**

At functional level, the domain exists so that Scientific Graph AI possesses a permanent owner of intelligence generation and contextual scientific assistance—grounded in DATA-owned scientific truth, coordinated through ENGINE, presented through UX, and always subordinate to User Agency.

Domain Purpose is distinct from Domain Mission (AI-P0) and Architectural Position (AI-P1) only by emphasis: Mission states why AI exists; Position states where AI sits; Purpose states what the domain functionally does in the product.

---

## 4. Core Capabilities

The following core capability categories constitute the functional nucleus of AI. They are conceptual categories—not modules, components, classes, or implementation surfaces.

| # | Core Capability | Functional meaning |
|---|-----------------|-------------------|
| 1 | **Contextual scientific assistance** | Assist users using available scientific and product context without owning that context. |
| 2 | **Intelligence generation** | Produce non-authoritative intelligence in support of scientific work. |
| 3 | **Recommendations** | Provide suggestive recommendations that never become commands or scientific verdicts. |
| 4 | **Explainable guidance** | Provide explainable accounts of why intelligence was produced. |
| 5 | **Workflow-oriented assistance** | Guide users through complex operations without owning or executing Product Flows; execution remains ENGINE. |
| 6 | **Analytical interpretation support** | Support interpretation of scientific information without certifying scientific correctness. |
| 7 | **Transparent and reviewable intelligent automation suggestions** | Suggest intelligent automation transparently and reviewably; never own automation engines or Product Flows. |

Specialized assistants are future extensions of the platform under the Evolution Statement. They do not form part of AI-P2 core capability design and shall never redefine Core Identity, Architectural Authority, or Capability Authority.

---

## 5. Capability Authority

Capability Authority is distinct from Architectural Authority.

**Architectural Authority** (AI-P1) defines exclusive architectural authority over intelligence generation.

**Capability Authority** defines exclusive functional authority over the definition, evolution, and governance of intelligence capabilities.

Constitutional rule:

> AI is the sole domain responsible for defining, evolving and governing intelligence capabilities.  
> Peer domains may consume those capabilities.  
> Peer domains shall never redefine them.

Capability Authority prevents ENGINE, UX, or any peer from inventing or redefining AI capabilities under the guise of consumption or presentation.

Assistance never transfers Capability Authority.

Consumption of AI capabilities by peers never transfers Capability Authority to peers.

Capability Authority complements Architectural Authority. Together they bind:

- architectural authority over intelligence generation;  
- functional authority over the catalog and definition of intelligence capabilities.  

No Capability Authority is granted over scientific truth, workflow execution, presentation, persistence, or peer domains.

---

## 6. Domain Responsibilities

When the AI Domain exists, it shall fulfill the following functional responsibilities:

| Area | Responsibility |
|------|----------------|
| **Intelligence generation** | Produce non-authoritative intelligence grounded in scientific context available through proper domain boundaries. |
| **Explainability** | Produce intelligence that is explainable by design, consistent with Scientific Principles. |
| **Non-authoritative posture** | Ensure intelligence remains suggestive and subordinate to User Agency and Decision Authority. |
| **Contextual scientific assistance** | Assist using available scientific and product context without owning that context. |
| **Recommendations and guidance** | Provide recommendations and explainable guidance without commands or scientific verdicts. |
| **Workflow-oriented assistance** | Guide without owning or executing Product Flows. |
| **Analytical interpretation support** | Support interpretation without certifying scientific correctness. |
| **Capability Authority** | Define, evolve, and govern intelligence capabilities; never permit peer redefinition. |
| **Constitutional compliance** | Respect AI Golden Rule, AI Optional, Decision Authority, Architecture Freeze, and Scientific Principles. |

AI holds neither Ownership nor Architectural Authority nor Capability Authority over scientific truth, workflow execution, or presentation.

Authority alignment: MASTER ROADMAP V2 §17; DOMAIN_BOUNDARIES; DOMAIN_MATRIX; AD-006; AI-P0 Official Record; AI-P1 Official Record.

---

## 7. Functional Scope

AI owns every functional responsibility related to intelligence generation and contextual scientific assistance as domain definition.

In functional scope:

- intelligence generation;  
- contextual scientific assistance;  
- recommendations;  
- explainable guidance;  
- workflow-oriented assistance as guidance only;  
- analytical interpretation support as non-authoritative assistance;  
- transparent and reviewable intelligent automation suggestions;  
- derivation of intelligence from scientific knowledge owned by DATA;  
- definition, evolution, and governance of intelligence capabilities under Capability Authority.  

Out of this phase’s detail (structure only deferred):

| Theme | Status |
|-------|--------|
| Conceptual component inventory | Deferred to AI-P3 |
| Contract strategy | Deferred to AI-P4 |
| Lifecycle model | Deferred to AI-P5 |
| Master Implementation Roadmap (AI-I*) | Deferred to AI-P6 |
| Execution Governance | Deferred to AI-P7 |
| Validation Strategy | Deferred to AI-P8 |
| Implementation Strategy | Deferred to AI-P9 |
| Hardening Strategy | Deferred to AI-P10 |
| Planning Certification | Deferred to AI-P11 |
| Specialized assistants (design) | Deferred to future Planning/Implementation under Evolution Statement |
| Concrete APIs, contracts, providers, models, prompts, sessions, memory, tool calling, streaming | Deferred beyond AI-P2; never part of functional domain definition |

---

## 8. Functional Boundaries

| In functional scope | Never in functional scope |
|---------------------|---------------------------|
| Intelligence generation | Scientific truth ownership (DATA) |
| Assistance and recommendations | Workflow execution (ENGINE) |
| Explanations / guidance | Presentation ownership (UX) |
| Deriving from scientific context | Persistence |
| Augmenting user judgment | Peer-domain ownership |
| Defining / evolving / governing intelligence capabilities | Certifying scientific correctness |
| | Peer redefinition of AI capabilities |

Functional Boundary is defined by the conjunction of:

- Functional Scope;  
- Capability Authority;  
- Ownership (AI-P0 / AI-P1);  
- Architectural Authority (AI-P1);  
- Decision Authority (AI-P0);  
- Optionality (AI Optional);  
- Architecture Freeze.  

Within these boundaries:

- AI produces intelligence.  
- AI does not control product flow.  
- ENGINE decides use of intelligence.  
- DATA owns scientific truth.  
- UX owns presentation.  
- Peer domains may consume intelligence capabilities; peers shall never redefine them.  
- Chatbot identity is not functional identity.  

AI does not sit on the critical path of scientific correctness.

AI does not sit on the critical path of workflow execution.

---

## 9. Domain Vocabulary

The following terms are the official constitutional vocabulary of the AI Domain at functional definition level. Implementation terms are excluded.

| Term | Meaning (frozen) |
|------|------------------|
| **Scientific Assistant Platform** | Product identity of AI |
| **Intelligence Domain** | Architectural role of AI |
| **Intelligence** | Non-authoritative output of AI |
| **Intelligence generation** | Sole architectural authority of AI; functional production of intelligence |
| **Capability Authority** | Sole functional authority to define, evolve, and govern intelligence capabilities |
| **Core Capability** | Fundamental functional capability category of the AI nucleus |
| **Scientific grounding** | Derivation from DATA-owned scientific truth |
| **Assistance** | Augmentation under User Agency |
| **Recommendation** | Suggestive intelligence; not a command |
| **Explanation** | Account of why intelligence was produced |
| **Explainable guidance** | Guidance accompanied by explainable account |
| **Workflow-oriented assistance** | Guidance related to workflows without ownership or execution of Product Flows |
| **Analytical interpretation support** | Non-authoritative support for interpreting scientific information |
| **Intelligent automation suggestion** | Transparent, reviewable suggestion; never ownership of automation engines |
| **AI Optional** | Product remains scientifically correct and operable without AI |
| **AI Golden Rule** | AI may assist every domain; AI owns none of them |
| **Architectural Authority** | Exclusive architectural authority over intelligence generation (AI-P1) |
| **Functional Freeze** | Freeze of functional identity foundations upon AI-P2 certification |
| **Architecture Freeze** | Freeze of architectural foundations upon AI-P1 certification |

No vocabulary entry may introduce prompts, providers, streams, session stores, tool calling, memory stores, registries, contracts, or other implementation constructs.

---

## 10. Domain Concepts

The following are conceptual entities of the AI Domain. They are not classes, schemas, APIs, or implementation types.

| Concept | Conceptual meaning |
|---------|--------------------|
| **Intelligence Request** | Conceptual request for intelligence under proper coordination |
| **Intelligence Result** | Conceptual non-authoritative intelligence output |
| **Assistance Context** | Conceptual context spanning product, scientific, and user dimensions available through proper domain boundaries |
| **Recommendation** | Conceptual suggestive intelligence artifact |
| **Explanation** | Conceptual account of why intelligence was produced, including assumptions where appropriate |
| **Confidence / assumptions** | Conceptual indicators accompanying intelligence; never scientific certification |
| **Intelligence Capability** | Conceptual governed unit under Capability Authority |

These concepts define the functional conceptual surface of the domain. They do not constitute an inventory of permanent internal elements. Complete conceptual component inventory remains deferred to AI-P3.

---

## 11. Domain Invariants

The following functional invariants must remain true in every future Planning and Implementation phase. They complement Architectural Invariants (AI-P1) at functional level:

- AI is the Scientific Assistant Platform (Intelligence Domain).  
- AI produces intelligence.  
- ENGINE owns execution.  
- DATA owns scientific truth.  
- UX owns presentation.  
- User retains final scientific decision authority.  
- AI may assist every domain; AI owns none of them.  
- Intelligence is non-authoritative.  
- Explainability is expected of intelligence produced by AI.  
- Human Validation remains binding.  
- AI Optional holds as a functional invariant.  
- AI derives intelligence from DATA; AI never owns or mutates scientific truth.  
- AI never owns or executes Product Flows.  
- AI never becomes a runtime dependency for scientific correctness.  
- AI is the sole domain responsible for defining, evolving, and governing intelligence capabilities.  
- Peer domains may consume intelligence capabilities; peer domains shall never redefine them.  
- Core capability categories remain under Capability Authority.  
- AI evolves by adding capabilities, never by absorbing ownership from existing domains.  
- ENGINE and DATA remain immutable under AI Planning and Implementation.  
- AI-P0 identity package remains immutable.  
- AI-P1 architectural foundations remain immutable under Architecture Freeze.  
- Upon AI-P2 certification, Functional Freeze binds Domain Definition, Core Capabilities, Functional Scope, Functional Boundaries, Domain Vocabulary, Domain Concepts, Functional Invariants, and Capability Authority.  
- Specialized assistants never redefine Core Identity, Architectural Authority, or Capability Authority.  
- Subsequent Planning phases may refine the domain but shall not redefine these functional foundations.  

These are functional invariants—not contracts or implementation design.

---

## 12. Domain Evolution Categories

| Stable (frozen foundations) | May grow (capabilities only) |
|----------------------------|------------------------------|
| AI-P0 identity + Scientific Principles | Specialized assistants (future) |
| AI-P1 Position, Ownership, Dependency, Integration, Invariants, Architectural Authority, Decision Flow | Broader assistance surfaces under Golden Rule |
| Core capability categories, vocabulary, Capability Authority | Discipline-specific assistance, richer explanations |
| Architecture Freeze + Functional Freeze sets | New capability categories **without** ownership absorption; only AI governs capability definition |

Evolution Statement (constitutional; reaffirmed from AI-P0):

> AI evolves by adding capabilities.  
> Never by absorbing ownership from existing domains.

Strategic evolution rules for domain definition:

- Add capabilities; never absorb ownership.  
- Growth preserves AI-P0 identity, AI-P1 foundations under Architecture Freeze, and AI-P2 foundations under Functional Freeze.  
- Common platform identity and core capability categories first; specialized assistants later as capabilities — never ownership transfer.  
- Extension shall preserve Core Identity, Motto, Decision Authority, Golden Rule, Scientific Principles, AI Optional, Architectural Authority, Capability Authority, Architectural Decision Flow, Ownership Model, Dependency Model, Integration Philosophy, Domain Definition, Core Capabilities, Functional Scope, Functional Boundaries, Domain Vocabulary, and Domain Concepts.  
- New capability categories may be introduced only under Capability Authority and without ownership absorption.  
- Detailed AI-I* roadmap remains deferred to later Planning.  
- No ownership absorption from ENGINE, DATA, UX, Platform, COLLABORATION, PLUGINS, or PERFORMANCE.  

---

## 13. Relationship with ENGINE

AI produces intelligence.

ENGINE owns execution.

ENGINE may request intelligence and decides whether to use it within Product Flows.

ENGINE may consume intelligence capabilities.

ENGINE shall never redefine intelligence capabilities.

AI may provide workflow-oriented assistance as guidance only.

AI never owns Product Flows.

AI never executes workflows.

AI never bypasses ENGINE coordination.

Capability Authority remains exclusively with AI.

---

## 14. Relationship with DATA

AI derives intelligence from DATA.

DATA remains the sole owner of scientific truth.

AD-006 remains binding:

- AI never owns persistent scientific knowledge;  
- AI never mutates scientific meaning;  
- AI never redefines the scientific model;  
- AI never certifies scientific correctness in place of DATA or the User.  

Scientific grounding is mandatory for functional domain definition.

DATA does not redefine intelligence capabilities.

Capability Authority remains exclusively with AI.

---

## 15. Relationship with UX

AI produces intelligence.

UX owns presentation.

UX determines how intelligence is experienced.

UX may consume intelligence capabilities.

UX shall never redefine intelligence capabilities.

AI determines what intelligence is produced, within AI ownership, Architectural Authority, and Capability Authority.

AI never owns UI, interaction, navigation, or visual experience.

AI does not depend on UX for scientific grounding or domain logic.

Capability Authority remains exclusively with AI.

---

## 16. Relationship with Future Domains

Under the AI Golden Rule, without transferring ownership, Architectural Authority, or Capability Authority:

- COLLABORATION — future assistance;  
- PLUGINS — future assistance.  

Future domains may consume intelligence capabilities.

Future domains shall never redefine intelligence capabilities.

AI owns none of them.

AI Optional binds all of the above.

The following must remain scientifically and architecturally valid without AI:

- DATA — scientific truth and scientific correctness;  
- ENGINE — workflow execution and product coordination;  
- UX — presentation and interaction;  
- Platform / Sessions — persistence;  
- PERFORMANCE — optimization and diagnostics;  
- the product’s scientific correctness path.  

---

## 17. Risks

| Risk | Control |
|------|---------|
| Chatbot drift into functional identity | Dual naming + Domain Definition + Vocabulary + Functional Boundaries |
| Ownership bleed into DATA / ENGINE / UX | Functional Boundaries + Golden Rule + Decision Authority |
| Peer redefinition of AI capabilities | Capability Authority |
| Confusion between Architectural Authority and Capability Authority | Explicit Capability Authority freeze complementary to AI-P1 |
| Opaque or ownership-transferring assistance | Scientific Principles + non-authoritative invariants |
| AI becoming required for scientific correctness | AI Optional |
| Premature internal design (components, APIs, contracts) | Nature of AI-P2 + Out of Scope + Functional Freeze |
| Premature specialized-assistant productization | Evolution Categories + Out of Scope |
| Reinterpretation of AD-006 as pipeline ownership | “AI derives intelligence from DATA” language |
| Redefinition of P0/P1 foundations | Architecture Freeze + Conflict rule |
| Redefinition of P2 foundations in later Planning | Functional Freeze |

Detailed validation, governance, and hardening frameworks remain deferred to later Planning phases.

---

## 18. Exit Criteria

| Criterion | Met? |
|-----------|------|
| Domain Definition frozen | Yes |
| Domain Purpose recorded | Yes |
| Core Capabilities frozen | Yes |
| Capability Authority frozen | Yes |
| Domain Responsibilities recorded | Yes |
| Functional Scope frozen | Yes |
| Functional Boundaries frozen | Yes |
| Domain Vocabulary frozen | Yes |
| Domain Concepts recorded | Yes |
| Domain Invariants (functional) recorded | Yes |
| Domain Evolution Categories recorded | Yes |
| Evolution Statement reaffirmed | Yes |
| Relationship with ENGINE recorded | Yes |
| Relationship with DATA recorded | Yes |
| Relationship with UX recorded | Yes |
| Relationship with Future Domains recorded | Yes |
| Risks recorded | Yes |
| Functional Freeze declared upon certification | Yes |
| Architecture Freeze intact | Yes |
| AI-P0 constitutional package unmodified | Yes |
| AI-P1 architectural package unmodified | Yes |
| No AI-P3+ inventory/contracts/lifecycle/impl content committed | Yes |
| ENGINE and DATA unmodified | Yes |
| No AI implementation code | Yes |
| AI-P3 not opened | Yes |

---

## 19. AI-P2 Certification Status

| Field | Value |
|-------|--------|
| **AI-P2 Status** | **CERTIFIED** |
| **Official Record** | **RELEASE READY** |
| **Repository (ENGINE / DATA / AI package)** | **UNCHANGED** (Official Record registration only) |
| **AI-P0** | **CERTIFIED** · unmodified |
| **AI-P1** | **CERTIFIED** · unmodified |
| **Architecture Freeze** | **IN FORCE** · intact |
| **Functional Freeze** | **IN FORCE** |
| **Conceptual Component Inventory** | **NOT STARTED** |
| **Implementation** | **BLOCKED** |
| **AI-I\*** | **BLOCKED** |
| **Next Phase** | **AI-P3 — Conceptual Component Inventory** (not opened by this Record) |

No documentary blockers remain for functional domain definition. AI-P3 is **not** opened by this Official Record.

---

## 20. Functional Freeze

Upon certification of AI-P2, the following are frozen:

- Domain Definition  
- Core Capabilities  
- Functional Scope  
- Functional Boundaries  
- Domain Vocabulary  
- Domain Concepts  
- Functional Invariants  
- Capability Authority  

Subsequent Planning phases may refine implementation planning but shall not redefine the functional identity of the domain.

Functional Freeze is binding for the remainder of the AI Planning Series and for all AI Implementation Series authorized thereafter.

Architecture Freeze remains intact and is not modified by this Record.

---

## 21. Registration Note

This Official Record is registered as the permanent functional domain-definition constitution of the AI Domain for Scientific Graph AI.

Registration path:

`docs/AI/official-records/AI-P2-Domain-Definition.md`

This Record is the authoritative materialization of approved AI-P2 Planning.

Subsequent AI Planning phases shall cite this Record and shall not modify it.

AI-P0 Official Record remains the authoritative identity constitution and is not modified by this Record.

AI-P1 Official Record remains the authoritative domain-architecture constitution and is not modified by this Record.

Architecture Freeze remains in force and is not modified by this Record.

Synchronization of ROADMAP.md and PROJECT_STATUS.md remains deferred until Planning Certification authorizes a single documentary synchronization event.

---

## 22. Out of Scope Confirmed (AI-P2)

| Theme | Status |
|-------|--------|
| Conceptual Component Inventory | Deferred to AI-P3 |
| Contract Strategy | Deferred to AI-P4 |
| Lifecycle | Deferred to AI-P5 |
| Master Implementation Roadmap | Deferred to AI-P6 |
| Execution Governance | Deferred to AI-P7 |
| Validation Strategy | Deferred to AI-P8 |
| Implementation Strategy | Deferred to AI-P9 |
| Hardening Strategy | Deferred to AI-P10 |
| Planning Certification | Deferred to AI-P11 |
| Permanent internal components / layers / modules | Deferred |
| Specialized assistants (design) | Deferred |
| APIs / contracts / registries / providers / models | Deferred |
| Sessions / prompts / tool calling / streaming / memory | Deferred |
| Workflows (ownership / execution) | Forbidden to AI; owned by ENGINE |
| AI-I* implementation | Blocked until Planning Certification |
| Modification of ENGINE or DATA | Forbidden |
| Modification of AI-P0 Official Record | Forbidden |
| Modification of AI-P1 Official Record | Forbidden |
| Violation of Architecture Freeze | Forbidden |
| Creation of `src/ai/` | Forbidden during AI-P* |
| ROADMAP / PROJECT_STATUS updates | Deferred to post–Planning Certification synchronization |
| Opening of AI-P3 by this Record | Not opened |

---

**End of Official Record — AI-P2 Domain Definition Foundation**
