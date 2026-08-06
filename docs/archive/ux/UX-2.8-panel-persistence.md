# UX-2.8 — Panel Persistence Foundation

**Épica:** UX-2 — Screen Migration Foundation  
**Microfase:** UX-2.8 — BUILD (Panel Persistence Foundation)  
**Fase:** Build infraestructura de persistencia UX de paneles  
**Fecha:** 2026-07-30  
**Estado:** **UX-2.8 = COMPLETE (awaiting human review)**  
**Prerrequisitos:** [`docs/UX-2.0-roadmap.md`](UX-2.0-roadmap.md) · UX-2.7 COMPLETE · D48 SSOT  

**Declaración:**

```text
UX-2.8 = COMPLETE (panel persistence foundation)
SCOPE = persistence/ + PanelProvider hydrate/save only
STORAGE = localStorage key scientific-graph-ai.panels
SCHEMA = PersistedPanelState version 1 (nested)
LIVE STATE = PanelState flat (UX-2.7 unchanged)
API = serialize / deserialize / toJSON / fromJSON
DUAL CLAMP = serialize + toPanelState (PANEL_MIN_SIZE)
NO IndexedDB · NO debounce · NO new deps · NO UI changes
READY FOR HUMAN REVIEW
```

---

## 1. Purpose

Persist panel layout UX state (collapsed, size) across reloads without changing live `PanelState`, panel UI, docking, or floating windows. Leaves a clean layer for UX-2.9+ docking / reusable layouts.

---

## 2. Architecture

```text
Panel UI
      │
Panel State (flat PanelState — UX-2.7)
      │
Panel Persistence
      ├── load()  → fromJSON()
      └── save()  → toJSON()
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
     deserialize()          serialize()
         │                       │
 parse → validate → toPanelState │
                                 │
                         PersistedPanelState
                                 │
                           PanelStorage
                                 │
                           localStorage
```

| Module | Role |
|--------|------|
| [`PanelStorage.ts`](../src/components/workspace/panels/persistence/PanelStorage.ts) | `save` / `load` / `clear` — raw string I/O only |
| [`PanelSerializer.ts`](../src/components/workspace/panels/persistence/PanelSerializer.ts) | `serialize` / `toJSON` |
| [`PanelDeserializer.ts`](../src/components/workspace/panels/persistence/PanelDeserializer.ts) | `fromJSON` / `deserialize` (+ parse / validate / toPanelState) |
| [`PanelPersistence.ts`](../src/components/workspace/panels/persistence/PanelPersistence.ts) | Thin facade: save → toJSON; load → fromJSON |
| [`PanelProvider.tsx`](../src/components/workspace/panels/state/PanelProvider.tsx) | Mount restore + persist on every state change |

---

## 3. Storage

- **Backend:** `localStorage` only  
- **Key:** `scientific-graph-ai.panels` (`PANEL_STORAGE_KEY`)  
- **Guards:** `typeof window === "undefined"` → no-op / `null`; try/catch around get/set/remove  
- **No JSON** inside `PanelStorage`

---

## 4. Serializer (frozen public API)

| Function | Direction |
|----------|-----------|
| `serialize(state)` | `PanelState` → `PersistedPanelState` |
| `toJSON(state)` | `serialize` → `JSON.stringify` |
| `deserialize(input)` | `unknown` → `PanelState` (validate → toPanelState) |
| `fromJSON(raw)` | `string \| null` → parse → validate → toPanelState |

### Persisted schema (v1)

```ts
interface PersistedPanelEntry {
  id: "left" | "right" | "bottom";
  collapsed: boolean;
  size: number;
  visible: boolean;
}

interface PersistedPanelState {
  version: 1;
  left: PersistedPanelEntry;
  right: PersistedPanelEntry;
  bottom: PersistedPanelEntry;
  activePanel: "left" | "right" | "bottom" | null;
}
```

### Rules

- `visible` always serialized as `true`; ignored on restore  
- `activePanel` persisted (default `null`) but **not** applied to live React state  
- `id` must match side on validate  
- Dual clamp: `Math.max(PANEL_MIN_SIZE, size)` in `serialize` **and** `toPanelState`

---

## 5. Deserializer

`fromJSON` pipeline:

```text
raw
  → parse
  → validate (version === 1, keys, ids, coerce; reject IndexedDB-shaped)
  → toPanelState (clamp again)
  → PanelState
```

Invalid / missing → copy of `DEFAULT_PANEL_STATE`. Never invents React/content state.

---

## 6. Provider flow

```text
mount
  → load() → fromJSON → setState
  → hydrated = true

state change (after hydrated)
  → save() → toJSON → PanelStorage.save
```

- Initial state remains `DEFAULT_PANEL_STATE` (SSR-safe)  
- Hydration guard prevents writing defaults over stored data before restore  
- No debounce, dirty flags, or autosave scheduler  
- No direct `localStorage` in Provider  

---

## 7. Limitations

- No docking positions / panel order  
- No floating windows / tabs  
- No ResizeHandle / collapse chrome  
- `activePanel` / `visible` are schema-only for live state  
- UX-only localStorage — not session/project persistence  
- No IndexedDB  

---

## 8. Versioning & migration

- Current: `version: 1`  
- Wrong / missing version → discard → defaults  
- Future UX-2.9+: bump `version`, add migration branch in `validate` / `fromJSON` before mapping to live state  
- Live `PanelState` can stay flat while persisted schema grows  

---

## 9. Validation

```bash
npm run validate:ux-2.8
```

Also delegates: `validate:ux-2.7`, `npx tsc --noEmit`.

UX-2.7 gate amended: direct `localStorage` / `indexedDB` still banned under `panels/state`; Provider may use the persistence facade.

---

## 10. Acceptance criteria

| ID | Criterion | Result |
|----|-----------|--------|
| **CA-2.8.1** | `persistence/` + barrel + frozen API | PASS |
| **CA-2.8.2** | Provider load/save via facade only | PASS |
| **CA-2.8.3** | Key `scientific-graph-ai.panels`; version 1 | PASS |
| **CA-2.8.4** | Dual clamp; flat PanelState unchanged | PASS |
| **CA-2.8.5** | No IndexedDB; no new deps; frozen UI | PASS |
| **CA-2.8.6** | `npm run validate:ux-2.8` PASS | PASS |

---

## 11. STOP

```text
UX-2.8 = COMPLETE (awaiting human review)
Next: UX-2.9 Resize Handles / docking affordances — after certification.
Do NOT add IndexedDB, docking positions, or floating-window persistence here.
Do NOT reshape live PanelState.
```
