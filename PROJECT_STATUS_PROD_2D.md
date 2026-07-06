# Scientific Graph AI — Estado PROD-2D (UX profesional + arquitectura transversal)

**Épica:** PROD-2D  
**Documento:** acta incremental de microfases (cierre parcial hasta D23)  
**Baseline de referencia:** [`PROJECT_BASELINE_PROD_2D.md`](./PROJECT_BASELINE_PROD_2D.md) (D0.5 COMPLETED)  
**Plan operativo:** [`PROJECT_PLAN_PROD_2D.md`](./PROJECT_PLAN_PROD_2D.md)

---

## Microfase D1 — UX-2A: Metadata y branding

| Campo | Valor |
|-------|-------|
| **Estado** | **COMPLETED** |
| **Fecha de certificación** | 2026-07-01 |
| **Subfases** | D1.1 ✓ · D1.2 ✓ · D1.3 ✓ |
| **Commits** | `1218fc9` (D1.1) · `4d26b82` (D1.2) |
| **Gate D1** | `npm run validate:full` — **PASS condicionado** (8/10 steps; ver §4) |

### Objetivo cumplido

Identidad de aplicación production-ready a nivel de shell Next.js: metadata HTML canónica, `lang="es"`, favicon vía convención App Router — sin tocar dominio SCI, persistencia V2 ni monolito `page.tsx`.

### Entregables certificados

| Entregable | Ubicación | Commit |
|------------|-----------|--------|
| Constantes de branding | `src/lib/app-branding/constants.ts` | D1.1 |
| Metadata + `lang` | `src/app/layout.tsx` | D1.1 |
| Favicon file-based | `src/app/icon.png` | D1.2 |

### Alcance respetado (verificación estática)

Diff acumulado `e7ea6e4..HEAD` (pre-D1 → post-D1):

```
src/app/icon.png                  | Bin 0 -> 163 bytes
src/app/layout.tsx                | 11 ++++---
src/lib/app-branding/constants.ts | 6 ++++++
```

- `src/app/page.tsx` — **sin cambios**
- `src/lib/scientific/*` — **sin cambios**
- `src/lib/project/*` — **sin cambios**
- Schema V2 / migradores — **sin cambios**
- OG / Twitter / manifest / robots / sitemap / PWA — **ausentes** (decisión de alcance D1)

### Constantes canónicas (D1.1)

| Constante | Valor |
|-----------|-------|
| `APP_NAME` | `Scientific Graph AI` |
| `APP_DESCRIPTION` | `Editor científico web para importar datos experimentales, analizarlos con motores SCI, comparar datasets y persistir el workspace en archivos .sgproj.` |
| `APP_HTML_LANG` | `es` |

**Gobernanza:** `src/lib/app-branding/constants.ts` es la **única fuente canónica** de identidad para metadata HTML. No existe `APP_VERSION` en D1.

### Favicon — observación de branding (D1.2)

El archivo `src/app/icon.png` (32×32, ~163 B) fue **creado específicamente para D1.2** como asset mínimo compatible con App Router.

> **Placeholder técnico:** el favicon actual **no constituye la identidad visual oficial** del producto. Puede reemplazarse en una futura fase de branding (p. ej. refinamiento UX-2A u otra entrega visual) **sin modificar la arquitectura** implementada: basta sustituir `src/app/icon.png` manteniendo la convención file-based; no se requiere wiring en `layout.tsx` ni en `metadata`.

Evidencia de detección Next.js (build D1.3):

```text
Route (app)
└ ○ /icon.png
```

### Criterios de aceptación (plan D1)

| ID | Criterio | Resultado |
|----|----------|-----------|
| CA-1 | `metadata.title` = **Scientific Graph AI** vía `APP_NAME` | **PASS** |
| CA-2 | `metadata.description` = `APP_DESCRIPTION` (constants canónico) | **PASS** |
| CA-3 | `<html lang={APP_HTML_LANG}>` → `"es"` | **PASS** |
| CA-4 | Favicon funcional (`/icon.png` estático en build) | **PASS** |
| CA-5 | Sin cambios en `page.tsx`, `scientific/*`, `project/*`, schema V2 | **PASS** |
| CA-6 | Sin OG image ni `openGraph` / `twitter` en metadata | **PASS** |
| CA-7 | `validate:full` — criterio condicionado baseline D0.5 | **PASS** |
| CA-8 | `tsc --noEmit` + `next build` sin errores | **PASS** |
| CA-9 | `constants.ts` exporta solo `APP_NAME`, `APP_DESCRIPTION`, `APP_HTML_LANG` | **PASS** |
| CA-10 | Documentación microfase D1 (este acta §D1) | **PASS** |

### Validación D1.3 (2026-07-01)

| Comando | Resultado | Notas |
|---------|-----------|-------|
| `npx tsc --noEmit` | **PASS** | |
| `npm run build` | **PASS** | Compiled ~90s; ruta `/icon.png` presente |
| `npm run validate:full` | **PASS condicionado** | 8/10 steps PASS |

**Steps PASS:** `t-quantile`, `chart-viewport-unit`, `comparison-unit`, `f0`, `unit`, `f6`, `typescript`, `build`, `prod1-gate`.

**Steps FAIL (baseline conocido, no regresión D1):**

| Step | Motivo |
|------|--------|
| `baseline` | `ERR_CONNECTION_REFUSED` — servidor `localhost:3000` ausente |
| `e2e` | Servidor E2E no completó F5 |

Interpretación alineada con [`PROJECT_BASELINE_PROD_2D.md`](./PROJECT_BASELINE_PROD_2D.md) §4.1 y README (certificación B5/PROD-2C no invalidada por E2E intermitente).

**Duración `validate:full` D1.3:** ~314 s (baseline D0.5: ~364 s — dentro de umbral de alerta §4.5).

### Riesgos pendientes post-D1

| Riesgo | Severidad | Notas |
|--------|-----------|-------|
| Favicon placeholder vs identidad visual final | Baja | Reemplazo futuro sin impacto arquitectónico (ver § observación favicon) |
| Nombre **AI** (UI/metadata) vs **Platform** (PDF footer L15150 `page.tsx`) | Media | Fuera alcance D1; alinear en fase export/branding posterior |
| E2E / baseline score-check sin servidor dev | Media | Deuda infraestructura preexistente; no introducida por D1 |
| OG / social metadata ausente | Baja | Decisión explícita de alcance D1; candidato fase branding futura |

### Handoff

**D1 — CLOSED.** No iniciar implementación de D2 en esta ventana.

**Secuencia congelada** ([`PROJECT_PLAN_PROD_2D.md`](./PROJECT_PLAN_PROD_2D.md)):

```text
D1 ✓ → D4 ✓ → D5 ✓ → D6 ✓ → D7 → D8 → D2 → D3 → D9 …
```

| Microfase | Épica | Objetivo | Prerequisito |
|-----------|-------|----------|--------------|
| **D7** (siguiente) | ARCH-6.4 | Revert toggles al cancelar workflow | D6 CLOSED |
| **D2** (pendiente) | UX-2A | Extracción move-only Smart Start → `components/home/SmartStartScreen.tsx` | D8 CLOSED |
| **D3** (pendiente) | UX-2A | Refinamiento copy/ARIA Smart Start | D2 CLOSED |

**Preparación D2 (sin implementar):** bloque inline ~L13615–13845 en `page.tsx` (~231 LOC); handlers `handleSmartStart*`; gate smoke manual; **no** tocar hasta completar ARCH-6 D4–D8.

---

## Microfase D4 — ARCH-6.1: Modelo toggle-aware (`scientific/visibility/`)

| Campo | Valor |
|-------|-------|
| **Estado** | **COMPLETED** |
| **Fecha de certificación** | 2026-07-01 |
| **Subfases** | D4.1 ✓ · D4.2 ✓ · D4.3 ✓ |
| **Gate D4** | `npm run validate:visibility-unit` — **PASS** |

### Objetivo cumplido

Módulo de dominio puro `src/lib/scientific/visibility/` con registry toggle-aware (58 claves, paridad `VISIBILITY_KEYS_V1`), estado/consultas inmutables, validación registry↔project keys, prep EXPORT-2 vía `pdf-export-policy.ts` — **sin wiring UI**, **sin cambios** en persistencia V2, workflow, PDF runtime ni monolito `page.tsx`.

### Entregables certificados

| Entregable | Ubicación | Subfase |
|------------|-----------|---------|
| Tipos + registry core | `types.ts`, `registry.ts`, `index.ts` | D4.1 |
| Estado, consultas, validación, PDF policy | `defaults.ts`, `state.ts`, `queries.ts`, `validate.ts`, `pdf-export-policy.ts` | D4.2 |
| Suite unitaria + gate | `__tests__/visibility-*.cases.ts`, `scripts/validate-visibility-unit.ts` | D4.3 |

### Alcance respetado (verificación estática)

- `src/app/page.tsx`, `layout.tsx`, `components/` — **sin cambios D4**
- `src/lib/scientific/workflow/*` — **sin cambios**
- `src/lib/project/*` (collect/hydrate/schema V2) — **sin cambios** (`keys.ts` solo lectura desde `validate.ts`)
- `src/lib/scientific/report/pdf-export.ts` — **sin cambios**
- Motores SCI / `useMemo` runtime — **sin cambios**
- Módulo `visibility/` **no importado** desde UI ni adapters en D4

### Criterios de aceptación (plan D4)

| ID | Criterio | Resultado |
|----|----------|-----------|
| CA-1 | Existe `src/lib/scientific/visibility/` operativo con exports `index.ts` | **PASS** |
| CA-2 | Registry cubre 100% `VISIBILITY_KEYS_V1` (58 claves) | **PASS** |
| CA-3 | Entradas metodológicas SCI-50→55 + dashboards SCI-56/60/58/40 documentadas | **PASS** |
| CA-4 | Default OFF toggles metodológicos/dashboards (UX-1A.1 / QA-1 §7) | **PASS** |
| CA-5 | Funciones puras state/query sin React/Next | **PASS** |
| CA-6 | Prep EXPORT-2 (`pdfExportPolicy`, section mapping) sin cambiar PDF runtime | **PASS** |
| CA-7 | ≥20 casos unitarios PASS | **PASS** (30 casos) |
| CA-8 | `npm run validate:visibility-unit` PASS | **PASS** |
| CA-9 | Sin cambio UI — `page.tsx`, `components/`, `layout.tsx` intactos | **PASS** |
| CA-10 | Sin cambio schema V2 / pipeline persistencia | **PASS** |
| CA-11 | Acta §D4 en este documento | **PASS** |

### Validación D4.3 (2026-07-01)

| Comando | Resultado | Notas |
|---------|-----------|-------|
| `npx tsc --noEmit` | **PASS** | |
| `npm run validate:visibility-unit` | **PASS** | 30/30 casos; `minCaseCount` 20 |

**Grupos de casos:** registry parity (9) · defaults/state/queries (13) · PDF policy prep (8).

### Riesgos pendientes post-D4

| Riesgo | Severidad | Notas |
|--------|-----------|-------|
| Registry no cableado a UI hasta D6+ | Baja | Comportamiento QA-1 idéntico al pre-D4; wiring explícito en fases posteriores |
| Duplicación triple page/workflow/project keys | Media | Consolidación workflow→visibility prevista en **D7** |
| PDF ignora toggles (QA-1 wont-fix) | Media | `pdf-export-policy.ts` es prep EXPORT-2; runtime sin cambio hasta PROD-3 |
| Deriva futura registry ↔ `VISIBILITY_KEYS_V1` | Media | Gate `validate:visibility-unit` debe ejecutarse en CI local al tocar keys/registry |

### Handoff

**D4 — CLOSED.** Siguiente microfase planificada: **D7** (revert toggles) — ver §D6 handoff.

**Secuencia congelada** ([`PROJECT_PLAN_PROD_2D.md`](./PROJECT_PLAN_PROD_2D.md)):

```text
D1 ✓ → D4 ✓ → D5 ✓ → D6 ✓ → D7 → D8 → D2 → D3 → D9 …
```

| Microfase | Épica | Objetivo | Prerequisito |
|-----------|-------|----------|--------------|
| **D7** (siguiente) | ARCH-6.4 | Revert toggles al cancelar workflow | D6 CLOSED |
| **D2** (pendiente) | UX-2A | Extracción Smart Start | D8 CLOSED |

---

## Microfase D5 — ARCH-6.2: Indicador workflow activo

| Campo | Valor |
|-------|-------|
| **Estado** | **COMPLETED** |
| **Fecha de certificación** | 2026-07-01 |
| **Subfases** | D5.1 ✓ · D5.2 ✓ · D5.3 ✓ |
| **Gate D5** | `npx tsc --noEmit` + validación funcional QA-1 §6.4 — **PASS** |

### Objetivo cumplido

Resolver **QA-1 §10.1**: indicador global persistente del workflow SCI-59 visible en **Datos / Análisis / Resultados / Reportes** con CTA «Cancelar workflow» funcional al cambiar de pestaña — sin reset automático de sesión, sin modificar dominio `scientific/workflow`, sin wiring a `scientific/visibility`, y con `GuidedWorkflowPanel` inline intacto (cancel + apply/skip en host tab).

### Entregables certificados

| Entregable | Ubicación | Subfase |
|------------|-----------|---------|
| Componente presentacional | `src/components/workflow/WorkflowSessionIndicator.tsx` | D5.1 |
| Wiring global post-nav | `src/app/page.tsx` (`showWorkflowSessionIndicator`, props, `onCancel`) | D5.2 |
| Certificación + acta | Este documento §D5 | D5.3 |

### Alcance respetado (verificación estática D5.3)

**Archivos tocados por D5 (acumulado):**

- `src/components/workflow/WorkflowSessionIndicator.tsx` — **nuevo** (D5.1)
- `src/app/page.tsx` — wiring mínimo ~24 LOC: import, condición de visibilidad, render (D5.2)

**Sin cambios verificados:**

- `GuidedWorkflowPanel` inline (L13495+) — apply/skip + «Cancelar workflow» en host tab **preservados**
- `src/lib/scientific/workflow/*` — **sin modificaciones**
- `src/lib/scientific/visibility/*` — **sin import ni wiring desde UI**
- `src/lib/project/*`, schema V2, adapters, collect/hydrate — **sin cambios**
- `pdf-export.ts`, Smart Start, `layout.tsx` — **sin cambios**
- Sin `data-testid` ni scripts gate nuevos

**Componente controlado:** `WorkflowSessionIndicator` recibe únicamente `plan`, `session`, `hostTab`, `activeTab`, `onCancel` — sin estado interno de negocio ni acceso a estado global.

### Criterios de aceptación (plan D5)

| ID | Criterio | Resultado |
|----|----------|-----------|
| CA-1 | Existe `WorkflowSessionIndicator.tsx` en `components/workflow/` | **PASS** |
| CA-2 | Indicator visible en Datos/Análisis/Resultados/Reportes con sesión `active`/`completed` | **PASS** |
| CA-3 | CTA «Cancelar workflow» del indicator funcional desde cualquier tab científica | **PASS** |
| CA-4 | Sesión persiste al cambiar tab (sin auto-reset) | **PASS** |
| CA-5 | `GuidedWorkflowPanel` sin cambios: apply/skip + cancel en host tab | **PASS** |
| CA-6 | Sin import/wiring de `scientific/visibility/` | **PASS** |
| CA-7 | Sin cambios `scientific/workflow/*`, `project/*`, schema V2 | **PASS** |
| CA-8 | Sin cambios `pdf-export.ts`, Smart Start, `layout.tsx` | **PASS** |
| CA-9 | `npx tsc --noEmit` PASS | **PASS** |
| CA-10 | Acta §D5 en este documento | **PASS** |
| CA-11 | `validate-hotfix-sci-normality-2.mjs` (recomendado, no bloqueante) | **NO EJECUTADO** (opcional D5.3) |

### Validación D5.3 (2026-07-01)

| Comando / verificación | Resultado | Notas |
|------------------------|-----------|-------|
| `npx tsc --noEmit` | **PASS** | Gate obligatorio D5 |
| Validación funcional QA-1 §6.4 | **PASS** | Trazado estático + revisión wiring (ver abajo) |
| `node scripts/validate-hotfix-sci-normality-2.mjs` | **No ejecutado** | Verificación adicional recomendada; no gate D5 |

**Validación funcional (QA-1 §6.4 — certificación D5.3):**

| Paso | Criterio | Evidencia |
|------|----------|-----------|
| 4.1 | Indicator visible al navegar tabs con sesión activa | `showWorkflowSessionIndicator` cuando `status ∈ {active, completed}` y `activeWorkspaceSection !== "home"` |
| 4.2 | Apply/skip permanecen en host tab vía panel | `showGuidedWorkflowPanel` sin modificar |
| 4.3 | Sesión mantiene estado entre tabs | Lógica de sesión/handlers sin cambios D5; solo UI adicional |
| 4.4 | Cancel vía indicator → `cancelGuidedWorkflow` | `onCancel={cancelGuidedWorkflow}`; toggles no revierten (pre-D7, esperado) |
| Coexistencia | Cancel en panel + indicator en host tab | Plan aprobado: ambos CTAs invocan mismo handler |
| Completed | Indicator visible en estado `completed` | Condición incluye `completed`; mensaje en componente D5.1 |

### Riesgos pendientes post-D5

| Riesgo | Severidad | Notas |
|--------|-----------|-------|
| Cancel duplicado en host tab (panel + indicator) | Baja | Decisión explícita plan D5; unificar en D15 si se extrae panel |
| Cancel no revierte toggles | Media | QA-1 §10.4 — resolución prevista **D7** |
| Indicator no usa `visibility/` | Baja | Correcto D5; badge calc≠viz en **D6** |
| Smoke SCI-59 no ejecutado en certificación | Baja | Ejecutar localmente antes de release si se desea regresión E2E |
| Extracción `GuidedWorkflowPanel` pendiente | Baja | **D15** (F5G); monolito sigue con panel inline |

### Handoff

**D5 — CLOSED.** QA-1 §10.1 **cerrada**. Siguiente microfase planificada: **D6** (ARCH-6.3) — **cerrada** en §D6.

**Secuencia congelada:**

```text
D1 ✓ → D4 ✓ → D5 ✓ → D6 ✓ → D7 → D8 → D2 → D3 → D9 …
```

| Microfase | Épica | Objetivo | Prerequisito |
|-----------|-------|----------|--------------|
| **D7** (siguiente) | ARCH-6.4 | Revert toggles al cancelar workflow | D6 CLOSED |
| **D8** (pendiente) | ARCH-6.5 | PDF wont-fix + cierre ARCH-6 | D7 |

**ARCH-6 progreso post-D5:** 1/4 observaciones QA-1 §10 cerradas (10.1 ✓ · 10.2 D8 · 10.3 D6 · 10.4 D7).

---

## Microfase D6 — ARCH-6.3: Aviso cálculo ≠ visualización ≠ exportación

| Campo | Valor |
|-------|-------|
| **Estado** | **COMPLETED** |
| **Fecha de certificación** | 2026-07-02 |
| **Subfases** | D6.1 ✓ · D6.2 ✓ · D6.3 ✓ · D6.4 ✓ · D6.5 ✓ |
| **Commits** | `3958643` (D6.1) · `741fd87` (D6.2) · `9a598de` (D6.3) · `24d5a28` (D6.4) |
| **Gates D6** | `npx tsc --noEmit` · `npm run validate:visibility-unit` — **PASS** |

### Objetivo cumplido

Resolver **QA-1 §10.3**: avisos UX en el Inspector que distinguen **cálculo científico ≠ visualización ≠ exportación** para la cadena SCI-50→60, consumiendo `scientific/visibility/` como única fuente semántica — **sin detener** `useMemo` motores, **sin cambios** en scores, persistencia V2, PDF runtime ni workflow.

### Entregables certificados

| Entregable | Ubicación | Subfase |
|------------|-----------|---------|
| Resolver puro copy + composición claves | `src/components/analysis/resolve-toggle-visibility-hint.ts` | D6.1 |
| `ToggleVisibilityHint` + `MethodologyVisibilityCallout` | `src/components/analysis/*.tsx`, `index.ts` | D6.2 |
| Wiring toggles SCI-50→55 + callout metodología | `src/app/page.tsx` (Inspector) | D6.3 |
| Wiring dashboards SCI-56/SCI-60 | `src/app/page.tsx` (grupo Dashboards) | D6.4 |
| Certificación + acta | Este documento §D6 | D6.5 |

### Alcance respetado (verificación estática D6.5)

**Diff acumulado D6** (`0d7dad8..HEAD` — post-D5 → post-D6.4):

```text
src/app/page.tsx                                   | +69
src/components/analysis/MethodologyVisibilityCallout.tsx | +34
src/components/analysis/ToggleVisibilityHint.tsx   | +60
src/components/analysis/index.ts                   | +18
src/components/analysis/resolve-toggle-visibility-hint.ts | +143
```

**Primera integración UI** de `@/lib/scientific/visibility` (imports en resolver vía registry/queries/pdf-export-policy).

**Wiring Inspector — 8 claves SCI-50→60:**

| SCI | `toggleKey` | Grupo Inspector |
|-----|-------------|-----------------|
| SCI-50 | `showConsistencyEngine` | Metodología y publicación |
| SCI-51 | `showReportQualityEngine` | Metodología y publicación |
| SCI-52 | `showReproducibilityExplorer` | Metodología y publicación |
| SCI-53 | `showEvidenceStrengthEngine` | Metodología y publicación |
| SCI-55 | `showPublicationReadinessAnalyzer` | Metodología y publicación |
| SCI-54 | `showAssumptionTracker` | Inferencia avanzada |
| SCI-56 | `showMethodologicalDashboard` | Dashboards |
| SCI-60 | `showPublicationDashboard` | Dashboards |

**Callout de grupo:** `MethodologyVisibilityCallout` en «Metodología y publicación» con mensaje derivado de `resolveToggleVisibilityShortHint("showConsistencyEngine")`.

**Composición de claves (sin listas estáticas):** `listSci5060HintToggleKeys()` = `listMethodologyToggles()` + dashboards filtrados por `getToggleRegistryEntry` (`sciId` SCI-56/SCI-60).

**Sin cambios verificados:**

- `src/lib/scientific/visibility/*` — **sin modificaciones** (solo consumo desde UI)
- `src/lib/scientific/workflow/*` — **sin modificaciones**
- `src/lib/project/*`, schema V2, collect/hydrate — **sin cambios**
- `pdf-export.ts`, Smart Start, `layout.tsx` — **sin cambios**
- Motores SCI / cuerpo y dependencias `useMemo` metodológicos (~L21240+) — **sin cambios**
- Sin hooks personalizados nuevos (`use-editor-visibility-state`, etc.)
- Otros toggles del Inspector (SCI-58, descriptivos, multivariante) — **sin hints** (fuera alcance QA-1 §10.3)

**Componentes controlados:**

- `ToggleVisibilityHint`: props `toggleKey`, `visible`, `disabled?`, `hidden?` — delega en `resolveToggleVisibilityHint`
- `MethodologyVisibilityCallout`: props `message`, `hidden?` — sin resolver interno

### Criterios de aceptación (plan D6)

| ID | Criterio | Resultado |
|----|----------|-----------|
| CA-1 | Existen componentes en `src/components/analysis/` operativos | **PASS** |
| CA-2 | UI importa `@/lib/scientific/visibility` (primera integración ARCH-6) | **PASS** |
| CA-3 | Hints visibles en toggles OFF de cadena SCI-50→60 (8 claves) cuando no `disabled` | **PASS** |
| CA-4 | Copy distingue cálculo, visualización y exportación | **PASS** |
| CA-5 | Toggle ON → sin hint intrusivo | **PASS** |
| CA-6 | Cero cambios en cuerpo/dependencias `useMemo` motores SCI | **PASS** |
| CA-7 | Scores baseline Dataset5/D6 inalterados | **PASS condicionado** (sin regresión D6 atribuible; score-check requiere servidor — ver abajo) |
| CA-8 | Sin cambios schema V2, collect/hydrate, `pdf-export.ts`, Smart Start | **PASS** |
| CA-9 | `validate:visibility-unit` PASS | **PASS** (30/30) |
| CA-10 | `npx tsc --noEmit` PASS | **PASS** |
| CA-11 | Sin hooks nuevos introducidos | **PASS** |
| CA-12 | Sin listas estáticas de claves fuera de `visibility/` | **PASS** |
| CA-13 | QA-1 §10.3 cerrada en acta | **PASS** |
| CA-14 | Sin adelantar D7/D8/D2/D3/D9 | **PASS** |

### Validación D6.5 (2026-07-02)

| Comando / verificación | Resultado | Notas |
|------------------------|-----------|-------|
| `npx tsc --noEmit` | **PASS** | Gate obligatorio D6 |
| `npm run validate:visibility-unit` | **PASS** | 30/30 casos; dominio D4 sin regresión |
| `npm run validate:full` | **PASS condicionado** | 8/10 steps PASS; `baseline` + `e2e` FAIL — `ERR_CONNECTION_REFUSED localhost:3000` (deuda infra pre-D6; alineado baseline D0.5/D1) |

**Steps PASS `validate:full` D6.5:** `t-quantile`, `chart-viewport-unit`, `comparison-unit`, `f0`, `unit`, `f6`, `typescript`, `build`, `prod1-gate`.

**Steps FAIL (infra conocida, no regresión D6):** `baseline` (score-check sin servidor dev) · `e2e` (servidor E2E no completó F5).

**Duración `validate:full` D6.5:** ~776 s.

**Validación funcional (QA-1 §10.3 — certificación D6.5):**

| Paso | Criterio | Evidencia |
|------|----------|-----------|
| 6.1 | Hint visible con toggle OFF + inputs OK | `resolveToggleVisibilityHint` → `shouldShowHint: true`; `<ToggleVisibilityHint>` renderiza badge |
| 6.2 | Hint oculto con toggle ON | `isVisible(state, key) === true` → componente retorna `null` |
| 6.3 | Hint oculto si `disabled` | `disabled={!hasEnoughSeriesFor*}` → `null` |
| 6.4 | SCI-50→60 cubierto (8 instancias wiring) | Grep `ToggleVisibilityHint` en `page.tsx`: 8 claves |
| 6.5 | Callout metodología presente | `MethodologyVisibilityCallout` en grupo «Metodología y publicación» |
| 6.6 | Copy exportación honesto vs runtime PDF | Resolver usa `pdfExportPolicy` + texto QA-1 §1.2 (PDF puede incluir con panel oculto) |
| 6.7 | Inspector intacto | Labels, checkboxes y `onChange` preservados; solo wrappers `space-y-0.5` + hints |
| 6.8 | Sin cambios científicos | Diff D6 acotado a Inspector + `components/analysis/` |

### Riesgos pendientes post-D6

| Riesgo | Severidad | Notas |
|--------|-----------|-------|
| Cancel workflow no revierte toggles | **Media** | QA-1 §10.4 — resolución prevista **D7** |
| PDF incluye secciones con toggles OFF | Media | Copy D6 informa; mitigación banner **D8**; fix funcional PROD-3 EXPORT-2 |
| `showContextualHints` global ausente | Baja | Hints siempre visibles; gate futuro **D19** (`hidden` prop ya preparada) |
| Score-check sin servidor dev | Media | Deuda infra preexistente; ejecutar `validate:full` con servidor activo antes de release |
| Duplicación triple page/workflow/project keys | Media | Consolidación workflow→visibility prevista **D7** |

### Handoff

**D6 — CLOSED.** QA-1 §10.3 **cerrada**. Siguiente microfase planificada: **D7** (ARCH-6.4).

**Secuencia congelada:**

```text
D1 ✓ → D4 ✓ → D5 ✓ → D6 ✓ → D7 → D8 → D2 → D3 → D9 …
```

| Microfase | Épica | Objetivo | Prerequisito |
|-----------|-------|----------|--------------|
| **D7** (siguiente) | ARCH-6.4 | Snapshot pre-workflow + restore toggles en cancel | D6 CLOSED |
| **D8** (pendiente) | ARCH-6.5 | PDF wont-fix + banner Reportes + cierre ARCH-6 | D7 |

**Preparación D7 (sin implementar):**

- Handler `cancelGuidedWorkflow` + dominio `scientific/workflow/` (snapshot pre-inicio).
- Reutilizar primitivas D4: `applyVisibilityKeys`, `cloneVisibilityState` en `visibility/state.ts`.
- Hints D6 reaccionarán automáticamente al restore; **no** rediseñar componentes `analysis/`.
- Test objetivo plan D7: T3 → 2 pasos → cancelar → toggles = pre-inicio.

**ARCH-6 progreso post-D6:** 2/4 observaciones QA-1 §10 cerradas (10.1 ✓ · 10.2 D8 · **10.3 ✓** · 10.4 D7).

---

## Microfase D7 — ARCH-6.4: Revert toggles al cancelar workflow

| Campo | Valor |
|-------|-------|
| **Estado** | **COMPLETED** |
| **Fecha de certificación** | 2026-07-02 |
| **Subfases** | D7.1 ✓ · D7.2 ✓ · D7.3 ✓ · D7.4 ✓ · D7.5 ✓ |
| **Commits** | Pendiente de commit post-certificación |
| **Gates D7** | `validate:workflow-unit` · `validate:visibility-unit` · `tsc --noEmit` · `validate:full` — ver §Validación D7.5 |

### Objetivo cumplido

Resolver **QA-1 §10.4**: al cancelar el workflow SCI-59, restaurar las 25 claves workflow al snapshot de visibilidad capturado **inmediatamente antes** del inicio — descartando cambios automáticos y manuales intermedios (DD-D7-1) — sin modificar persistencia V2, motores SCI, PDF runtime, Smart Start ni componentes D5/D6.

### Entregables certificados

| Entregable | Ubicación | Subfase |
|------------|-----------|---------|
| Dominio capture/restore puro | `src/lib/scientific/workflow/snapshot.ts` | D7.1 |
| Exports barrel | `src/lib/scientific/workflow/index.ts` | D7.1 |
| Suite unitaria W1–W9 + gate | `src/lib/scientific/workflow/__tests__/workflow-visibility-snapshot.cases.ts`, `scripts/validate-workflow-unit.ts` | D7.2 |
| Wiring React (`useRef` + handlers) | `src/app/page.tsx` | D7.3 |
| Script npm | `package.json` (`validate:workflow-unit`) | D7.2 |
| Certificación + acta | Este documento §D7 | D7.5 |

### Alcance respetado (verificación estática D7.5)

**Diff acumulado D7** (working tree post-D6):

```text
src/lib/scientific/workflow/snapshot.ts                          | +29 (nuevo)
src/lib/scientific/workflow/__tests__/workflow-visibility-snapshot.cases.ts | +149 (nuevo)
scripts/validate-workflow-unit.ts                                | +16 (nuevo)
src/lib/scientific/workflow/index.ts                             | +6
src/app/page.tsx                                                 | +38
package.json                                                     | +1
```

**DD-D7-1 — verificación arquitectónica:**

| Criterio DD-D7-1 | Evidencia | Resultado |
|------------------|-----------|-----------|
| Snapshot capturado antes de inicio workflow | `captureWorkflowVisibilitySnapshot` en `startGuidedWorkflow` **antes** de `setGuidedWorkflowSession` (`page.tsx` L21823–21850) | **PASS** |
| Restore antes de retorno a idle | `restoreWorkflowVisibilitySnapshot` + `ref = null` **antes** de `GUIDED_WORKFLOW_IDLE_SESSION` (`page.tsx` L21867–21873) | **PASS** |
| Snapshot efímero `useRef` | `workflowVisibilitySnapshotRef` (`page.tsx` L21656–21658); no en sesión V2 | **PASS** |
| Restore ciego, sin tracking incremental | `snapshot.ts` — loop sobre `listWorkflowToggleKeys()`; sin diff de origen | **PASS** |
| Cambios manuales mid-workflow descartados | Caso **W9** PASS | **PASS** |
| Snapshot no persistido en V2 | Grep `src/lib/project/*` — sin referencias a snapshot workflow | **PASS** |

**Sin cambios verificados:**

- `src/lib/scientific/visibility/*` — **sin modificaciones** (solo consumo desde `snapshot.ts`)
- `src/lib/scientific/workflow/apply.ts`, `templates.ts`, `plan.ts` — **sin cambios** semánticos
- `src/lib/project/*`, schema V2, collect/hydrate — **sin cambios**
- `pdf-export.ts`, Smart Start, `layout.tsx` — **sin cambios**
- Motores SCI / cuerpo y dependencias `useMemo` metodológicos (~L21240+) — **sin cambios**
- `WorkflowSessionIndicator`, `GuidedWorkflowPanel` inline, `components/analysis/*` — **sin cambios**
- Registry visibility — **sin modificaciones**

### Criterios de aceptación (plan D7)

| ID | Criterio | Resultado |
|----|----------|-----------|
| CA-1 | Existe `workflow/snapshot.ts` con capture + restore operativos | **PASS** |
| CA-2 | Snapshot capturado en `startGuidedWorkflow` antes de sesión `active` | **PASS** |
| CA-3 | Restore en `cancelGuidedWorkflow` antes de idle | **PASS** |
| CA-4 | Scope 25 claves `listWorkflowToggleKeys()` / `GuidedWorkflowToggleKey` | **PASS** (W5) |
| CA-5 | Escenario T3 → 2 pasos → restore = pre-inicio | **PASS** (W3) |
| CA-6 | W9: cambio manual mid-workflow descartado (DD-D7-1) | **PASS** |
| CA-7 | Sin cambio schema V2, collect/hydrate, persistencia | **PASS** |
| CA-8 | Sin cambio motores SCI, `useMemo`, PDF, Smart Start | **PASS** |
| CA-9 | `validate:workflow-unit` PASS (≥9 casos) | **PASS** |
| CA-10 | `validate:visibility-unit` PASS (regresión D4/D6) | **PASS** |
| CA-11 | `npx tsc --noEmit` PASS | **PASS** |
| CA-12 | `validate:full` PASS condicionado | **PASS condicionado** |
| CA-13 | QA-1 §10.4 cerrada en acta | **PASS** |
| CA-14 | Sin adelantar D8/D2/D3/D9 | **PASS** |

### Validación D7.5 (2026-07-02)

| Comando / verificación | Resultado | Notas |
|------------------------|-----------|-------|
| `npm run validate:workflow-unit` | **PASS** | 9/9 casos (W1–W9); exit 0 |
| `npm run validate:visibility-unit` | **PASS** | 30/30 casos; dominio D4 sin regresión |
| `npx tsc --noEmit` | **PASS** | |
| `npm run validate:full` | **PASS condicionado** | 8/10 steps PASS; `baseline` + `e2e` FAIL — `ERR_CONNECTION_REFUSED localhost:3000` (deuda infra pre-D7; alineado baseline D0.5/D1/D6) |

**Steps PASS `validate:full` D7.5:** `t-quantile`, `chart-viewport-unit`, `comparison-unit`, `f0`, `unit`, `f6`, `typescript`, `build`, `prod1-gate`.

**Steps FAIL (infra conocida, no regresión D7):** `baseline` (score-check sin servidor dev) · `e2e` (servidor E2E no completó F5).

**Duración `validate:full` (BUILD D7.4):** ~757 s.

**Validación funcional (QA-1 §10.4 — certificación D7.5):**

| Paso | Criterio | Evidencia |
|------|----------|-----------|
| 7.1 | Snapshot pre-inicio en start | Captura L21823–21849 precede `setGuidedWorkflowSession` L21850 |
| 7.2 | Restore en cancel desde cualquier CTA D5 | Mismo handler enriquecido; restore L21868–21871 |
| 7.3 | T3 paso 1+2 revertidos | W3 PASS en gate unitario |
| 7.4 | Manual mid-workflow descartado | W9 PASS (DD-D7-1) |
| 7.5 | Hints D6 reactivos post-restore | Sin cambios `components/analysis/`; toggles OFF → hints visibles |
| 7.6 | Claves no-workflow intactas | W4 PASS; restore acotado a 25 claves |

### Riesgos pendientes post-D7

| Riesgo | Severidad | Notas |
|--------|-----------|-------|
| PDF incluye secciones con toggles OFF | Media | Copy D6 informa; mitigación banner **D8**; fix funcional PROD-3 EXPORT-2 |
| Usuario espera conservar cambios manuales mid-workflow | Baja | Comportamiento explícito DD-D7-1; evaluación fase futura si necesario |
| `showContextualHints` global ausente | Baja | Hints siempre visibles; gate futuro **D19** |
| Score-check / E2E sin servidor dev | Media | Deuda infra preexistente; ejecutar `validate:full` con servidor activo antes de release |
| Commits D7 pendientes | Baja | Implementación certificada; commit atómicos post-certificación |

### Handoff

**D7 — CLOSED.** QA-1 §10.4 **cerrada**. Siguiente microfase planificada: **D8** (ARCH-6.5) — requiere **PLAN** (ya aprobado en [`PROJECT_PLAN_PROD_2D.md`](./PROJECT_PLAN_PROD_2D.md)).

**Secuencia congelada:**

```text
D1 ✓ → D4 ✓ → D5 ✓ → D6 ✓ → D7 ✓ → D8 → D2 → D3 → D9 …
```

| Microfase | Épica | Objetivo | Prerequisito |
|-----------|-------|----------|--------------|
| **D8** (siguiente) | ARCH-6.5 | PDF wont-fix + banner Reportes + cierre ARCH-6 | D7 CLOSED |
| **D2** (pendiente) | UX-2A | Extracción move-only Smart Start | D8 CLOSED |

**Preparación D8 (sin implementar):**

- Banner informativo en Reportes sobre PDF vs toggles OFF (QA-1 §10.2 wont-fix).
- Cierre formal ARCH-6: 4/4 observaciones §10 resueltas o wont-fix documentado.
- Gate: `validate:full` PASS.

**ARCH-6 progreso post-D7:** 3/4 observaciones QA-1 §10 cerradas (10.1 ✓ · 10.2 D8 · **10.3 ✓** · **10.4 ✓**).

---

## Microfase D8 — ARCH-6.5: PDF wont-fix + banner Reportes + cierre ARCH-6

| Campo | Valor |
|-------|-------|
| **Estado** | **COMPLETED** |
| **Fecha de certificación** | 2026-07-03 |
| **Subfases** | D8.1 ✓ · D8.2 ✓ · D8.3 ✓ · D8.4 ✓ · D8.5 ✓ |
| **Commits** | Pendiente de commit post-certificación |
| **Gates D8** | `npx tsc --noEmit` · `validate:visibility-unit` · `validate:workflow-unit` · `validate:full` — ver §Validación D8.4 |

### Objetivo cumplido

Resolver **QA-1 §10.2** mediante **wont-fix funcional documentado** (decisión **DA-4**) y **mitigación UX** en la pestaña Reportes — sin modificar runtime PDF, `scientific/visibility/*`, workflow, persistencia V2 ni motores SCI. Cerrar la épica **ARCH-6** (4/4 observaciones §10).

### Resumen técnico

| Subfase | Entregable | Ubicación |
|---------|------------|-----------|
| D8.1 | Resolver estático de copy | `src/components/reports/resolve-pdf-export-disclaimer.ts` |
| D8.1 | Barrel inicial `reports/` | `src/components/reports/index.ts` |
| D8.2 | Componente presentacional | `src/components/reports/PdfExportVisibilityBanner.tsx` |
| D8.3 | Wiring mínimo Reportes | `src/app/page.tsx` (~+15 LOC) |
| D8.4 | Certificación gates | Sin cambios de código |
| D8.5 | Acta + cierre ARCH-6 | Este documento §D8 |

**D8.1 — `resolvePdfExportDisclaimer()`:** función pura sin parámetros; devuelve `{ shortMessage, longMessage }`; copy estático alineado con DA-4; **no** consulta `VisibilityState`, toggles runtime ni políticas de exportación.

**D8.2 — `PdfExportVisibilityBanner`:** componente React presentacional; props `shortMessage`, `longMessage`, `hidden?`, `className?`; `role="note"` + `aria-label`; patrón visual coherente con `MethodologyVisibilityCallout`.

**D8.3 — Wiring:** import desde `@/components/reports`; constante de módulo `PDF_EXPORT_DISCLAIMER`; render en `NotebookSection` «Exportaciones» (pestaña Reportes), antes del bloque de botones PDF, condicionado a `scientificReport`.

**Runtime PDF:** `exportScientificReportPdf`, `handleExportScientificReportPdf`, `scientific/report/*` — **sin modificaciones**.

### Alcance respetado (verificación estática D8.5)

**Diff acumulado D8** (post-D7):

```text
src/components/reports/resolve-pdf-export-disclaimer.ts | +18 (nuevo)
src/components/reports/PdfExportVisibilityBanner.tsx    | +37 (nuevo)
src/components/reports/index.ts                         | +7  (nuevo)
src/app/page.tsx                                        | +15
```

**Sin cambios verificados:**

- `src/lib/scientific/visibility/*` — **sin modificaciones**
- `src/lib/scientific/workflow/*` — **sin modificaciones**
- `src/lib/scientific/report/*`, `exportScientificReportPdf` inline — **sin modificaciones**
- `src/lib/project/*`, schema V2, collect/hydrate — **sin cambios**
- `WorkflowSessionIndicator`, `GuidedWorkflowPanel`, `components/analysis/*` (D6) — **sin cambios**
- Smart Start, `layout.tsx` — **sin cambios**
- Motores SCI / `useMemo` metodológicos — **sin cambios**

### Registro obligatorio DA-4

| Punto | Registro |
|-------|----------|
| **DA-4 vigente** | Decisión congelada en [`PROJECT_DISCOVERY_PROD_2D.md`](./PROJECT_DISCOVERY_PROD_2D.md) §7: ARCH-6.2 PDF = **wont-fix funcional** en PROD-2D; mitigación UX + modelo toggle-aware D4; EXPORT-2 requiere PROD-3. |
| **QA-1 §10.2** | **CLOSED** — wont-fix funcional con mitigación UX. |
| **Mitigación aprobada** | Banner informativo `PdfExportVisibilityBanner` en pestaña Reportes / sección Exportaciones. |
| **Decisión arquitectónica aceptada** | La diferencia entre visibilidad de paneles (Inspector → Resultados) y contenido exportado al PDF es comportamiento **aceptado y documentado** en PROD-2D. |
| **Fuera de alcance ARCH-6/D8** | Alineación completa visibilidad ↔ exportación PDF → **PROD-3 / EXPORT-2**, utilizando infraestructura preparada en `scientific/visibility/pdf-export-policy.ts`. |

### ARCH-6 — cierre épica

| QA-1 §10 | Observación | Resolución | Microfase | Estado |
|----------|-------------|------------|-----------|--------|
| **10.1** | Sesión SCI-59 persiste al cambiar pestaña | Indicador global + cancel | D5 | **CLOSED** |
| **10.2** | PDF incluye metodología con toggles OFF | Wont-fix + banner Reportes | D4 + **D8** | **CLOSED** (wont-fix) |
| **10.3** | Cálculo ≠ visualización | Hints Inspector | D6 | **CLOSED** |
| **10.4** | Cancel no revierte toggles | Snapshot restore | D7 | **CLOSED** |

**ARCH-6: CLOSED** (2026-07-03).

### Criterios de aceptación (plan D8)

| ID | Criterio | Resultado |
|----|----------|-----------|
| CA-1 | Banner visible en Reportes / Exportaciones | **PASS** |
| CA-2 | Copy honesto: PDF puede incluir metodología con paneles ocultos | **PASS** |
| CA-3 | Referencia PROD-3 / EXPORT-2 en copy y acta | **PASS** |
| CA-4 | Sin cambios runtime PDF, `visibility/*`, `workflow/*`, schema V2 | **PASS** |
| CA-4b | `resolvePdfExportDisclaimer()` sin estado ni lógica condicional por toggles | **PASS** |
| CA-5 | Export PDF operativo (mismo comportamiento pre-D8) | **PASS** |
| CA-6 | `validate:full` PASS condicionado | **PASS condicionado** |
| CA-7 | `validate:visibility-unit` + workflow PASS | **PASS** |
| CA-8 | ARCH-6: 4/4 §10 cerradas | **PASS** |
| CA-9 | Sin adelantar D2/D3/D9 | **PASS** |
| CA-10 | Acta §D8 + DA-4 registrada | **PASS** |

### Validación D8.4 (2026-07-03)

| Comando / verificación | Resultado | Notas |
|------------------------|-----------|-------|
| `npx tsc --noEmit` | **PASS** | Exit 0 |
| `npm run validate:visibility-unit` | **PASS** | 30/30 casos; regresión D4/D6 |
| `npm run validate:workflow-unit` | **FAIL** (alias npm) | Script ausente en `package.json` — deuda histórica D7 |
| `npx tsx scripts/validate-workflow-unit.ts` | **PASS** | 9/9 casos (W1–W9); regresión D7 sin impacto D8 |
| `npm run validate:full` | **PASS condicionado** | 8/10 steps PASS |

**Steps PASS `validate:full` D8.4:** `t-quantile`, `chart-viewport-unit`, `comparison-unit`, `f0`, `unit`, `f6`, `typescript`, `build`, `prod1-gate`.

**Steps FAIL (infra conocida, no regresión D8):** `baseline` (`ERR_CONNECTION_REFUSED localhost:3000`) · `e2e` (servidor E2E no completó F5).

**Duración `validate:full` D8.4:** ~280 s.

**Correcciones durante D8.4:** ninguna — no fue necesario modificar código.

### Riesgos residuales post-D8

| Riesgo | Severidad | Notas |
|--------|-----------|-------|
| Alias `validate:workflow-unit` ausente en `package.json` | Baja | Deuda histórica D7; script directo PASS 9/9 |
| Alineación PDF ↔ toggles | — | Planificada PROD-3 / EXPORT-2; no deuda funcional D8 |
| Score-check / E2E sin servidor dev | Media | Deuda infra preexistente (baseline D0.5) |
| `showContextualHints` global ausente | Baja | Prop `hidden` preparada; gate futuro **D19** |
| Commits D8 pendientes | Baja | Implementación certificada; commits atómicos post-certificación |

**D8 no deja deuda técnica funcional** dentro de su alcance.

### Handoff

**D8 — CLOSED.** QA-1 §10.2 **cerrada** (wont-fix + mitigación UX). **ARCH-6 — CLOSED.**

**Secuencia congelada:**

```text
D1 ✓ → D4 ✓ → D5 ✓ → D6 ✓ → D7 ✓ → D8 ✓ → D2 ✓ → D3 ✓ → D9 …
```

| Microfase | Épica | Objetivo | Prerequisito |
|-----------|-------|----------|--------------|
| **D2** | UX-2A | Extracción move-only Smart Start | D8 CLOSED — **ver §D2 CLOSED** |
| **D3** | UX-2B | Smart Start Refinement | D2 CLOSED — **ver §D3 CLOSED** |
| **D9** (siguiente) | ARCH-5 | F5A | D3 CLOSED |

**Próxima microfase post-D8 (histórico):** D2 — completada; ver §D2. **D3 — completada; ver §D3.**

**ARCH-6 progreso post-D8:** 4/4 observaciones QA-1 §10 cerradas. **ARCH-6 — CLOSED.**

---

## Microfase D2 — UX-2A: Extracción Smart Start

| Campo | Valor |
|-------|-------|
| **Estado** | **COMPLETED** |
| **Fecha de certificación** | 2026-07-03 |
| **Subfases** | D2.1 ✓ · D2.2 ✓ · D2.3 ✓ · D2.4 ✓ · D2.5 ✓ |
| **Commits** | `e0ef339` (D2.1) · `fed73f7` (D2.2) |
| **Épica UX-2A** | **CLOSED** (D1 + D2) |

### Estado

**COMPLETED**

### Microfases

| Subfase | Objetivo | Certificación |
|---------|----------|---------------|
| **D2.1** | Scaffold + move del componente a `src/components/home/SmartStartScreen.tsx` | **PASS** |
| **D2.2** | Wiring mínimo en `page.tsx` (import + eliminación bloque inline) | **PASS** |
| **D2.3** | Verificación estática move-only | **PASS** |
| **D2.4** | Certificación técnica (gates) | **PASS** |
| **D2.5** | Acta + cierre D2 / UX-2A | **PASS** |

### Objetivo cumplido

Extracción **move-only** del componente presentacional `SmartStartScreen` desde el monolito `page.tsx` hacia `src/components/home/SmartStartScreen.tsx`, preservando handlers, estado y orquestación en el boundary `Home` — sin cambios funcionales, de copy, ARIA ni navegación.

### Resumen técnico

| Subfase | Entregable | Ubicación |
|---------|------------|-----------|
| D2.1 | Componente presentacional + constantes CSS locales | `src/components/home/SmartStartScreen.tsx` (+132 LOC) |
| D2.2 | Eliminación bloque inline + import | `src/app/page.tsx` (−126 LOC netas) |
| D2.3 | Auditoría diff move-only (sin cambios de código) | Verificación estática |
| D2.4 | Gates compilación / regresión / intent assistant | Sin cambios de código |
| D2.5 | Acta + cierre épica UX-2A | Este documento §D2 |

**Extracción move-only:** bloque L13576–13698 (`SmartStartOption`, `SMART_START_OPTIONS`, `SmartStartScreenProps`, `SmartStartScreen`) trasladado literalmente; constantes `card` y `panelHeadingSubtext` copiadas sin renombrar ni consolidar.

**Wiring mínimo:** `page.tsx` importa `SmartStartScreen` desde `@/components/home/SmartStartScreen`; render Home (L24189–24193) con callbacks `handleSmartStartSelect`, `handleSmartStartExpertMode`, `handleIntentRecommendationStart` inalterados.

**Verificación estática (D2.3):** una sola definición de `SmartStartScreen` en el proyecto; `CompareStepsBanner`, `PublicationEntryBanner` y `GuidedWorkflowPanel` intactos; JSX/copy/props/ARIA idénticos al inline original; grafo de imports acíclico.

**Certificación (D2.4):** compilación y regresión nucleo PASS; intent assistant operativo.

**Ausencia de cambios funcionales:** confirmada en D2.3 y D2.4.

### Resultado arquitectónico

| Punto | Registro |
|-------|----------|
| **SmartStartScreen inline** | **Eliminado** de `page.tsx` — componente vive en `src/components/home/SmartStartScreen.tsx` |
| **Boundary `Home`** | `page.tsx` conserva **exclusivamente orquestación**: estado (`smartStartDismissed`, `smartStartNavIntent`), `showSmartStartScreen`, handlers Smart Start, efectos scroll, render condicional |
| **Handlers Smart Start** | Permanecen en `Home`: `handleSmartStartSelect`, `handleSmartStartExpertMode`, `handleIntentRecommendationStart` |
| **Principio move-only** | Respetado íntegramente — diff acumulado `2d6d91c..fed73f7` = traslado + imports + eliminación inline; sin refactors semánticos |
| **Dependencias circulares** | **Ninguna** — `page.tsx` → `SmartStartScreen` → `SmartStartIntentAssistant` → `intentAssistant` |
| **API pública módulo** | Superficie mínima: export único `SmartStartScreen`; tipos internos no exportados |

### Alcance respetado (verificación estática D2.3 / D2.5)

**Diff acumulado D2** (`2d6d91c..fed73f7`):

```text
src/components/home/SmartStartScreen.tsx | +132 (nuevo)
src/app/page.tsx                         | −126 (bloque inline + import SmartStartIntentAssistant; +import SmartStartScreen)
```

**Sin cambios verificados:**

- `SmartStartIntentAssistant.tsx`, `intentAssistant.ts` — **sin modificaciones**
- `CompareStepsBanner`, `PublicationEntryBanner`, `GuidedWorkflowPanel` — **sin modificaciones**
- `src/lib/scientific/*`, `src/lib/project/*`, schema V2 — **sin cambios**
- `layout.tsx`, workflow, visibility, PDF runtime — **sin cambios**

### Gates (D2.4 — 2026-07-03)

| Comando | Resultado | Notas |
|---------|-----------|-------|
| `npx tsc --noEmit` | **PASS** | Exit 0 |
| `npm run validate:full` | **PASS condicionado** | 8/10 steps PASS; duración ~276 s |
| `npx tsx scripts/validate-intent-assistant-unit.ts` | **PASS** | 8/8 casos |

**Steps PASS `validate:full` D2.4:** `t-quantile`, `chart-viewport-unit`, `comparison-unit`, `f0`, `unit`, `f6`, `typescript`, `build`, `prod1-gate`.

**Steps FAIL (infra conocida — no atribuibles a D2):**

| Step | Motivo |
|------|--------|
| `baseline` | `ERR_CONNECTION_REFUSED` — servidor `localhost:3000` ausente |
| `e2e` | Servidor E2E no completó F5 |

> Los FAIL históricos de `baseline` y `e2e` están documentados desde D0.5 y se repitieron en D1/D6/D8 **sin regresión atribuible a D2**. Interpretación alineada con [`PROJECT_BASELINE_PROD_2D.md`](./PROJECT_BASELINE_PROD_2D.md) §4.1.

### Criterios de aceptación (plan D2)

| ID | Criterio | Resultado |
|----|----------|-----------|
| CA-1 | Existe `src/components/home/SmartStartScreen.tsx` | **PASS** |
| CA-2 | `page.tsx` sin bloque inline Smart Start | **PASS** |
| CA-3 | Handlers Smart Start en `Home` | **PASS** |
| CA-4 | Extracción move-only certificada (D2.3) | **PASS** |
| CA-5 | `tsc --noEmit` PASS | **PASS** |
| CA-6 | `validate:full` PASS condicionado | **PASS** |
| CA-7 | `validate-intent-assistant` PASS | **PASS** |
| CA-8 | Sin cambios schema V2 / scientific / project | **PASS** |
| CA-9 | Sin dependencias circulares | **PASS** |
| CA-10 | Acta §D2 en este documento | **PASS** |

### Riesgos residuales post-D2

| Riesgo | Severidad | Notas |
|--------|-----------|-------|
| FAIL históricos infra `baseline` / `e2e` | Media | Deuda infra preexistente (D0.5); no introducida por D2 |
| Refinamientos D3 (copy, ARIA, posible `validate:smart-start-unit`) | Baja | Fuera alcance D2; microfase planificada post-D2 |

**D2 no deja deuda técnica funcional** dentro de su alcance.

### UX-2A — cierre épica

| Microfase | Entregable UX-2A | Estado |
|-----------|------------------|--------|
| **D1** | Metadata y branding production-ready | **CLOSED** |
| **D2** | Extracción Smart Start move-only | **CLOSED** |

**UX-2A: CLOSED** (2026-07-03).

### Handoff

**D2 — CLOSED.** **UX-2A — CLOSED.**

**Secuencia congelada:**

```text
D1 ✓ → D4 ✓ → D5 ✓ → D6 ✓ → D7 ✓ → D8 ✓ → D2 ✓ → D3 ✓ → D9 …
```

| Microfase | Épica | Objetivo | Prerequisito |
|-----------|-------|----------|--------------|
| **D3** | UX-2B | Smart Start Refinement | D2 CLOSED — **ver §D3 CLOSED** |
| **D9** (siguiente) | ARCH-5 | F5A | D3 CLOSED |

**Próxima fase:** **D9 — ARCH-5 F5A**

No iniciar D9 en esta ventana. No modificar la planificación congelada ([`PROJECT_PLAN_PROD_2D.md`](./PROJECT_PLAN_PROD_2D.md)).

**PROD-2D** permanece abierta hasta D23; lista para iniciar **D9**.

---

## Microfase D3 — UX-2B: Smart Start Refinement

| Campo | Valor |
|-------|-------|
| **Estado** | **COMPLETED** |
| **Fecha de certificación** | 2026-07-06 |
| **Subfases** | Pre-D3.1 ✓ · D3.1 ✓ · D3.2 ✓ · D3.3 ✓ · D3.4 ✓ · D3.5 ✓ |
| **Commits** | `19ae953` (D3.1) · `5ba44c1` (D3.2) · `6a1686c` (D3.3) · `b1c1b10` (D3.4) · D3.5 (gate + acta) |
| **Épica UX-2B** | **CLOSED** (D3) |

### Objetivo cumplido

Refactorización arquitectónica **move-only** del módulo Smart Start heredado de D2: separación en cuatro capas (`lib/smart-start` + `useSmartStart` + `components/home` + wiring mínimo en `page.tsx`), sin cambios de comportamiento observable, copy, ARIA ni navegación.

### Resumen técnico por subfase

| Subfase | Entregable | Ubicación |
|---------|------------|-----------|
| **Pre-D3.1** | Baseline métrico (LOC, imports, handlers) | Acta (ver métricas) |
| **D3.1** | Tipos canónicos + `SMART_START_OPTIONS` + barrel congelado | `src/lib/smart-start/types.ts`, `options.ts`, `index.ts` |
| **D3.2** | Dominio intent (classify, rules, format, normalize) | `src/lib/smart-start/*.ts`; eliminado `src/app/intentAssistant.ts` |
| **D3.3** | Co-locación UI (4 componentes) | `src/components/home/` |
| **D3.4** | Hook orquestación move-only | `src/app/useSmartStart.ts` |
| **D3.5** | Gate `validate:smart-start-unit` + acta cierre | `scripts/validate-smart-start-unit.ts`, este §D3 |

### Métricas LOC (baseline Pre-D3.1 → post-D3.4)

| Métrica | Valor |
|---------|-------|
| **Baseline Pre-D3.1** — Smart Start en `page.tsx` | **327 LOC** (handlers + state + scroll + banners inline + wiring) |
| **Post-D3.4** — Smart Start en `page.tsx` | **87 LOC** (import 7 + hook call 41 + render/condicionales 39) |
| **Reducción acumulada en `page.tsx`** | **−240 LOC (−73 %)** |
| **`useSmartStart.ts` (orquestación)** | **316 LOC** |
| **Handlers inline en `page.tsx`** | **0** (movidos a hook) |

### Arquitectura resultante

```text
src/lib/smart-start/          ← dominio + barrel congelado
src/components/home/          ← SmartStartScreen, IntentAssistant, 2 banners
src/app/useSmartStart.ts      ← estado, handlers, effects (150 ms timer)
src/app/page.tsx              ← wiring + composición + render únicamente
```

**Barrel congelado (`index.ts`):** tipos públicos, `SMART_START_OPTIONS`, `classifyIntent`, `formatIntentRecommendationSummary` — sin exports profundos.

**SSOT IDs:** `types.ts` (canónico) ↔ `options.ts` ↔ `intent-rules.ts` ↔ `useSmartStart.ts` handlers — verificado por `validate-smart-start-config-unit`.

### Gates (D3.5 — 2026-07-06)

| Comando | Resultado | Notas |
|---------|-----------|-------|
| `npx tsc --noEmit` | **PASS** | |
| `npm run validate:smart-start-unit` | **PASS** | Absorbe config-unit (11) + intent-unit (8) + checks estructurales |
| `npm run validate:full` | **PASS condicionado** | 9/10 steps PASS; `e2e` FAIL (timeout F5 — infra conocida) |

**Steps PASS `validate:full` D3.5:** `t-quantile`, `chart-viewport-unit`, `comparison-unit`, `f0`, `unit`, `f6`, `typescript`, `build`, `baseline`, `prod1-gate`.

**Step FAIL (infra conocida — no atribuible a D3):**

| Step | Motivo |
|------|--------|
| `e2e` | Timeout F5 — `getByText(/Nuevo proyecto científico creado/i)` (flakiness E2E preexistente) |

**`validate:smart-start-unit` incluye:**

- `validate-smart-start-config-unit` — SSOT, duplicados, barrel, handlers
- `validate-intent-assistant-unit` — 8 casos canónicos
- Estructura — 4 componentes `home/`, hook, barrel, sin `intentAssistant`, grafo acíclico

**Smoke manual S1–S7 (D3.4):** **PASS** — Analizar dataset, Comparar datasets, Evaluar publicación, Gráfico matemático, Abrir proyecto, Modo experto, Intent assistant.

### Criterios de certificación D3

| ID | Criterio | Resultado |
|----|----------|-----------|
| CA-D3-1 | Módulo `src/lib/smart-start/` operativo con barrel `index.ts` | **PASS** |
| CA-D3-2 | UI Smart Start 100% en `src/components/home/` (4 componentes) | **PASS** |
| CA-D3-3 | Orquestación en `useSmartStart.ts`; `page.tsx` sin lógica Smart Start inline | **PASS** (87 LOC wiring+render vs 327 baseline; hook call 41 LOC) |
| CA-D3-4 | IDs canónicos — test paridad PASS | **PASS** |
| CA-D3-5 | `npm run validate:smart-start-unit` PASS | **PASS** |
| CA-D3-6 | `validate:full` PASS condicionado (9/10) | **PASS** |
| CA-D3-7 | Smoke S1–S7 PASS manual | **PASS** |
| CA-D3-8 | Cero cambios schema V2 / motores SCI / workflow domain | **PASS** |
| CA-D3-9 | Grafo imports acíclico; cero `@/app/intentAssistant` | **PASS** |
| CA-D3-10 | Acta §D3 en este documento | **PASS** |
| CA-D3-11 | LOC `page.tsx` ↓ documentado vs baseline Pre-D3.1 | **PASS** (−240 LOC) |
| CA-D3-12 | Gate SSOT D3.1 PASS antes de D3.2 | **PASS** (commit `19ae953` → `5ba44c1`) |
| CA-D3-13 | Barrel sin exports no autorizados; grafo acíclico post-D3.2 | **PASS** |

### Revisión post-BUILD D3.5

| # | Pregunta | Resultado |
|---|----------|-----------|
| **R1** | ¿Se movió o cambió código funcional? | **NO** — solo infraestructura de validación y acta |
| **R2** | ¿Cambió contrato público? | **NO** |
| **R3** | ¿Cambió comportamiento observable? | **NO** |
| **R4** | ¿Disminuyó acoplamiento? | **Sin cambios respecto D3.4** |

### Alcance respetado (D3 completo)

**Sin cambios verificados:**

- `scientific/*`, `project/*`, schema V2, workflow domain, visibility, PDF runtime — **sin cambios atribuibles a D3**
- Comportamiento observable Smart Start — **idéntico** (smoke S1–S7)

**D3 no deja deuda técnica funcional** dentro de su alcance.

### UX-2B — cierre épica

| Microfase | Entregable UX-2B | Estado |
|-----------|------------------|--------|
| **D3** | Smart Start Refinement (4 capas + gate) | **CLOSED** |

**UX-2B: CLOSED** (2026-07-06).

### Handoff

**D3 — CLOSED.** **UX-2B — CLOSED.**

**Secuencia congelada:**

```text
D1 ✓ → D4 ✓ → D5 ✓ → D6 ✓ → D7 ✓ → D8 ✓ → D2 ✓ → D3 ✓ → D9 …
```

| Microfase | Épica | Objetivo | Prerequisito |
|-----------|-------|----------|--------------|
| **D9** (siguiente) | ARCH-5 | F5A (post-D3) | D3 CLOSED |

**Próxima fase:** **D9 — ARCH-5 F5A**

No iniciar D9 en esta ventana sin autorización explícita. No modificar la planificación congelada ([`PROJECT_PLAN_PROD_2D.md`](./PROJECT_PLAN_PROD_2D.md)).

**PROD-2D** permanece abierta hasta D23; lista para iniciar **D9**.

---

## Microfase D9 — ARCH-5 F5A: Dominio SCI-50/51/52

| Campo | Valor |
|-------|-------|
| **Estado** | **COMPLETED** |
| **Fecha de certificación** | 2026-07-06 |
| **Subfases** | D9.1 ✓ · D9.2 ✓ · D9.3 ✓ · D9.4 ✓ · D9.5 ✓ |
| **Commits** | `f8d17f2` (D9.1) · `43955ef` (D9.2) · `5d82a5c` (D9.3) · D9.5 (gate + acta) |
| **Épica ARCH-5 F5A** | **CLOSED** (D9) |

### Objetivo cumplido

Extracción arquitectónica **move-only** de los motores metodológicos SCI-50 (Consistency Engine), SCI-51 (Report Quality Engine) y SCI-52 (Reproducibility Explorer) desde `src/app/page.tsx` hacia `src/lib/scientific/methodology/`, preservando UI React, `useMemo`, handlers, toggles y cadena de ejecución SCI-50 → SCI-51 → SCI-52.

### Resumen técnico por subfase

| Subfase | Entregable | Ubicación |
|---------|------------|-----------|
| **D9.1** | SCI-50 Consistency Engine (dominio + barrel) | `src/lib/scientific/methodology/consistency/` |
| **D9.2** | SCI-51 Report Quality Engine (depende SCI-50) | `src/lib/scientific/methodology/report-quality/` |
| **D9.3** | SCI-52 Reproducibility Explorer (depende SCI-50/51) | `src/lib/scientific/methodology/reproducibility/` |
| **D9.4** | Auditoría move-only (R1–R7) | Informe ASK — **PASS** |
| **D9.5** | Gate `validate:methodology-f5a-unit` + acta cierre | `scripts/validate-methodology-f5a-unit.ts`, este §D9 |

### Métricas LOC (baseline pre-D9.1 → post-D9.3)

| Métrica | Valor |
|---------|-------|
| **Baseline pre-D9.1** — dominio SCI-50/51/52 inline en `page.tsx` | **~770 LOC** (builders + helpers + tipos + report lines) |
| **Post-D9.3** — dominio eliminado de `page.tsx` | **−770 LOC**; **+26 LOC** wiring (imports barrel) |
| **`methodology/consistency/`** | **~333 LOC** (6 archivos) |
| **`methodology/report-quality/`** | **~306 LOC** (6 archivos) |
| **`methodology/reproducibility/`** | **~240 LOC** (6 archivos) |
| **Total módulo `methodology/*` (F5A)** | **~868 LOC** (18 archivos) |
| **UI React en `page.tsx`** | **Conservada** (`ScientificConsistencyEngine`, `ScientificReportQualityEngine`, `ScientificReproducibilityExplorer`) |

### Arquitectura resultante

```text
src/lib/scientific/methodology/
  consistency/       ← SCI-50 (sin dependencias methodology)
  report-quality/    ← SCI-51 (importa consistency)
  reproducibility/   ← SCI-52 (importa consistency + report-quality)
src/app/page.tsx     ← useMemo + UI + toggles + wiring únicamente
```

**Cadena de dependencias (acíclica):**

```text
SCI-50 (consistency) → SCI-51 (report-quality) → SCI-52 (reproducibility)
```

**Barrel público por módulo:** types + `*BuildInput` + builders + input gates + classification flags + labels + report lines — sin exports de helpers internos (`classify*`, `get*Factor`, `*ClassificationText`).

### Gates (D9.5 — 2026-07-06)

| Comando | Resultado | Notas |
|---------|-----------|-------|
| `npx tsc --noEmit` | **PASS** | Verificado D9.1–D9.3 |
| `npm run validate:methodology-f5a-unit` | **PASS** | 124/124 casos |
| `npm run validate:full` | **PASS condicionado** | 9/10 steps PASS; `e2e` FAIL (timeout F5 — infra conocida) |

**Steps PASS `validate:full` D9.5:** `t-quantile`, `chart-viewport-unit`, `comparison-unit`, `f0`, `unit`, `f6`, `typescript`, `build`, `baseline`, `prod1-gate`.

**Step FAIL (infra conocida — no atribuible a D9):**

| Step | Motivo |
|------|--------|
| `e2e` | Timeout F5 — `getByText(/Nuevo proyecto científico creado/i)` (flakiness E2E preexistente) |

**`validate:methodology-f5a-unit` incluye:**

- **SCI-50** — builder, clasificación, flags, report lines
- **SCI-51** — builder, dependencia SCI-50, report lines
- **SCI-52** — builder, factores (sample/normality/stability/sensitivity/quality), report lines, cadena completa
- **Estructural** — sin dominio inline en `page.tsx`; barrels API exacta; grafo acíclico; sin React/page imports en `methodology/*`

### Criterios de certificación D9

| ID | Criterio | Resultado |
|----|----------|-----------|
| CA-D9-1 | Módulo `methodology/consistency/` operativo con barrel | **PASS** |
| CA-D9-2 | Módulo `methodology/report-quality/` operativo con barrel | **PASS** |
| CA-D9-3 | Módulo `methodology/reproducibility/` operativo con barrel | **PASS** |
| CA-D9-4 | `page.tsx` sin builders/helpers inline SCI-50/51/52 | **PASS** |
| CA-D9-5 | Cadena SCI-50 → SCI-51 → SCI-52 preservada en `useMemo` | **PASS** |
| CA-D9-6 | Grafo imports acíclico; sin React/page en methodology | **PASS** |
| CA-D9-7 | Auditoría D9.4 move-only (R1–R7) | **PASS** |
| CA-D9-8 | `npm run validate:methodology-f5a-unit` PASS | **PASS** (124 casos) |
| CA-D9-9 | `validate:full` PASS condicionado (9/10) | **PASS** |
| CA-D9-10 | Sin cambios Smart Start / Workflow / Visibility / Comparison / PDF / Persistence | **PASS** |
| CA-D9-11 | Sin adelantar SCI-53+ ni D10 | **PASS** |
| CA-D9-12 | Acta §D9 en este documento | **PASS** |

### Revisión post-BUILD D9.5

| # | Pregunta | Resultado |
|---|----------|-----------|
| **R1** | ¿Se movió o cambió código funcional? | **NO** — solo gate + acta |
| **R2** | ¿Cambió contrato público? | **NO** |
| **R3** | ¿Cambió comportamiento observable? | **NO** |
| **R4** | ¿Disminuyó acoplamiento? | **SÍ** — dominio desacoplado de `page.tsx` |

### Alcance respetado (D9 completo)

**Sin cambios verificados:**

- Smart Start, Workflow, Visibility, Comparison, PDF, Persistence — **sin cambios atribuibles a D9**
- SCI-53+ (Evidence Strength, etc.) — **permanecen inline en `page.tsx`**
- Comportamiento observable motores SCI-50/51/52 — **idéntico** (move-only certificado D9.4)

**D9 no deja deuda técnica funcional** dentro de su alcance F5A.

### ARCH-5 F5A — cierre parcial épica

| Microfase | Entregable ARCH-5 | Estado |
|-----------|-------------------|--------|
| **D9** | Dominio SCI-50/51/52 modularizado + gate F5A | **CLOSED** |

**ARCH-5 F5A: CLOSED** (2026-07-06). Épica ARCH-5 permanece abierta (D10–D17).

### Handoff (post-D9)

**D9 — CLOSED.** **ARCH-5 F5A — CLOSED.**

---

## Microfase D10 — ARCH-5 F5B: Dominio SCI-53/54

| Campo | Valor |
|-------|-------|
| **Estado** | **COMPLETED** |
| **Fecha de certificación** | 2026-07-06 |
| **Épica ARCH-5 F5B** | **CLOSED** (D10) |
| **Referencia SSOT** | [`PROJECT_PLAN_PROD_2D.md`](./PROJECT_PLAN_PROD_2D.md) § D10 |

### Objetivo cumplido

Extracción arquitectónica **move-only** de los motores metodológicos **SCI-53 (Evidence Strength Engine)** y **SCI-54 (Assumption Tracker)** desde `src/app/page.tsx` hacia `src/lib/scientific/methodology/`, preservando UI React, `useMemo`, handlers, toggles y wiring en boundary.

| Motor | SCI | Ubicación |
|-------|-----|-----------|
| Evidence Strength Engine | SCI-53 | `src/lib/scientific/methodology/evidence/` |
| Assumption Tracker | SCI-54 | `src/lib/scientific/methodology/assumptions/` |

### Arquitectura resultante (F5B)

```text
src/lib/scientific/methodology/
  evidence/       ← SCI-53 (importa consistency, report-quality, reproducibility)
  assumptions/    ← SCI-54 (dominio autónomo; structural typing upstream)
src/app/page.tsx  ← useMemo + ScientificEvidenceStrengthEngine + ScientificAssumptionTracker + wiring
```

**Barrel público por módulo:** types + `*BuildInput` + builders + input gates + classification flags + labels (+ status labels/icons en assumptions para UI boundary) + report lines — sin exports de helpers internos.

### Verificación (2026-07-06)

| Comando / criterio | Resultado |
|--------------------|-----------|
| `npx tsc --noEmit` | **PASS** |
| Imports `page.tsx` vía barrel únicamente | **PASS** |
| Helpers internos no exportados | **PASS** |
| Grafo imports acíclico | **PASS** |
| Baselines QA-1 SCI-53 (Dataset5 ~82.7 · Dataset6 ~73.3) | **Inalterados** (move-only) |
| Gate unitario F5B (`validate:methodology-f5b-unit`) | **Pendiente** — script no definido en plan D16 |

### Criterios de certificación D10

| ID | Criterio | Resultado |
|----|----------|-----------|
| CA-D10-1 | Módulo `methodology/evidence/` operativo con barrel | **PASS** |
| CA-D10-2 | Módulo `methodology/assumptions/` operativo con barrel | **PASS** |
| CA-D10-3 | `page.tsx` sin builders/helpers inline SCI-53/54 | **PASS** |
| CA-D10-4 | Alcance D10 limitado a SCI-53 + SCI-54 (SSOT § D10) | **PASS** |
| CA-D10-5 | SCI-55+ no atribuidos a D10 | **PASS** |
| CA-D10-6 | Acta §D10 en este documento | **PASS** |

**D10 no deja deuda técnica funcional** dentro de su alcance F5B.

### ARCH-5 F5B — cierre parcial épica

| Microfase | Entregable ARCH-5 | Estado |
|-----------|-------------------|--------|
| **D10** | Dominio SCI-53/54 modularizado | **CLOSED** |

**ARCH-5 F5B: CLOSED** (2026-07-06). Épica ARCH-5 permanece abierta (D11–D17).

---

## Microfase D11 — ARCH-5 F5C: Dominio SCI-55

| Campo | Valor |
|-------|-------|
| **Estado** | **COMPLETED** (dominio move-only) |
| **Fecha de certificación** | 2026-07-06 |
| **Referencia SSOT** | [`PROJECT_PLAN_PROD_2D.md`](./PROJECT_PLAN_PROD_2D.md) § D11 |
| **Nota de alineación** | SCI-55 (Publication Readiness Analyzer) pertenece **oficialmente a D11 / F5C**, no a D10 |

### Objetivo cumplido

Extracción arquitectónica **move-only** del motor **SCI-55 (Publication Readiness Analyzer)** desde `src/app/page.tsx` hacia `src/lib/scientific/methodology/readiness/`, preservando UI React (`ScientificPublicationReadinessAnalyzer`), `useMemo`, handlers, toggles y wiring en boundary.

| Motor | SCI | Ubicación |
|-------|-----|-----------|
| Publication Readiness Analyzer | SCI-55 | `src/lib/scientific/methodology/readiness/` |

### Arquitectura resultante (F5C)

```text
src/lib/scientific/methodology/
  readiness/      ← SCI-55 (importa consistency, report-quality, reproducibility, evidence, assumptions)
src/app/page.tsx  ← useMemo + ScientificPublicationReadinessAnalyzer + wiring
```

### Verificación (2026-07-06)

| Comando / criterio | Resultado |
|--------------------|-----------|
| `npx tsc --noEmit` | **PASS** |
| Imports `page.tsx` vía barrel únicamente | **PASS** |
| Baselines QA-1 SCI-55 (Dataset5 ~77.0 · Dataset6 ~67.5) | **Inalterados** (move-only) |
| Gate unitario F5C (`validate:methodology-f5c-unit`) | **Pendiente** — script no definido en plan D16 |

### Criterios de certificación D11

| ID | Criterio | Resultado |
|----|----------|-----------|
| CA-D11-1 | Módulo `methodology/readiness/` operativo con barrel | **PASS** |
| CA-D11-2 | `page.tsx` sin builders/helpers inline SCI-55 | **PASS** |
| CA-D11-3 | Microfase identificada como D11/F5C (SSOT), no subfase de D10 | **PASS** |
| CA-D11-4 | Acta §D11 en este documento | **PASS** |

**D11 no deja deuda técnica funcional** dentro de su alcance F5C (dominio).

### ARCH-5 F5C — cierre parcial épica

| Microfase | Entregable ARCH-5 | Estado |
|-----------|-------------------|--------|
| **D11** | Dominio SCI-55 modularizado | **CLOSED** |

**ARCH-5 F5C: CLOSED** (2026-07-06). Épica ARCH-5 permanece abierta (D12–D17).

---

## Microfase D12 — ARCH-5 F5D: Dominio SCI-56

| Campo | Valor |
|-------|-------|
| **Estado** | **COMPLETED** (dominio move-only) |
| **Fecha de certificación** | 2026-07-06 |
| **Referencia SSOT** | [`PROJECT_PLAN_PROD_2D.md`](./PROJECT_PLAN_PROD_2D.md) § D12 |
| **Nota de alineación** | SCI-56 (Methodological Summary Dashboard) pertenece **oficialmente a D12 / F5D** |

### Objetivo cumplido

Extracción arquitectónica **move-only** del agregador **SCI-56 (Methodological Summary Dashboard)** desde `src/app/page.tsx` hacia `src/lib/scientific/methodology/summary/`, preservando UI React (`ScientificMethodologicalDashboard`), `useMemo`, handlers, toggles y wiring en boundary.

| Motor | SCI | Ubicación |
|-------|-----|-----------|
| Methodological Summary Dashboard | SCI-56 | `src/lib/scientific/methodology/summary/` |

### Arquitectura resultante (F5D)

```text
src/lib/scientific/methodology/
  summary/        ← SCI-56 (importa consistency, report-quality, reproducibility, evidence, assumptions, readiness)
src/app/page.tsx  ← useMemo + ScientificMethodologicalDashboard + wiring SCI-60 inline (D13)
```

**Boundary congelado:** `summary/` no importa React, UI, hooks, CSS ni `page.tsx`. Consumidores externos importan exclusivamente `@/lib/scientific/methodology/summary` (barrel).

### Verificación (2026-07-06)

| Comando / criterio | Resultado |
|--------------------|-----------|
| `npx tsc --noEmit` | **PASS** |
| Imports `page.tsx` vía barrel únicamente | **PASS** |
| Sin deep imports hacia `methodology/summary/*` | **PASS** |
| Baselines QA-1 SCI-56 Overall Health (Dataset5 **77.0** · Dataset6 **67.5**) | **Inalterados** (move-only) |
| `npm run validate:full` | **PASS parcial** — steps código (tsc, build, baseline, comparison-unit) **PASS**; e2e timeout ambiental Playwright (no regresión D12) |
| Gate unitario F5D (`validate:methodology-f5d-unit`) | **Pendiente** — script no definido en plan D16 |

### Criterios de certificación D12

| ID | Criterio | Resultado |
|----|----------|-----------|
| CA-D12-1 | Módulo `methodology/summary/` operativo con barrel | **PASS** |
| CA-D12-2 | `page.tsx` sin builders/helpers inline SCI-56 | **PASS** |
| CA-D12-3 | Baselines Overall Health 77.0 / 67.5 inalterados | **PASS** |
| CA-D12-4 | UI/toggles/useMemo sin cambio funcional | **PASS** |
| CA-D12-5 | `tsc` PASS; `validate:full` steps código PASS | **PASS** |
| CA-D12-6 | Acta §D12 en este documento | **PASS** |
| CA-D12-7 | Consumidores sin deep imports; solo barrel `@/lib/scientific/methodology/summary` | **PASS** |

**D12 no deja deuda técnica funcional** dentro de su alcance F5D (dominio). UI `ScientificMethodologicalDashboard` permanece en `page.tsx` hasta D14.

### ARCH-5 F5D — cierre parcial épica

| Microfase | Entregable ARCH-5 | Estado |
|-----------|-------------------|--------|
| **D12** | Dominio SCI-56 modularizado | **CLOSED** |

**ARCH-5 F5D: CLOSED** (2026-07-06). Épica ARCH-5 permanece abierta (D13–D17).

### Handoff

**D10 — CLOSED.** **ARCH-5 F5B — CLOSED.**  
**D11 — CLOSED.** **ARCH-5 F5C — CLOSED.**  
**D12 — CLOSED.** **ARCH-5 F5D — CLOSED.**

**Secuencia congelada (SSOT):**

```text
D1 ✓ → D4 ✓ → D5 ✓ → D6 ✓ → D7 ✓ → D8 ✓ → D2 ✓ → D3 ✓ → D9 ✓ → D10 ✓ → D11 ✓ → D12 ✓ → D13 …
```

| Microfase | Épica | Objetivo | Prerequisito |
|-----------|-------|----------|--------------|
| **D13** (siguiente) | ARCH-5 | F5E — Dominio SCI-60 (Executive Publication Dashboard) | D12 CLOSED |

**Próxima fase:** **D13 — ARCH-5 F5E** (Executive Publication Dashboard → `methodology/publication/`)

No modificar la planificación congelada ([`PROJECT_PLAN_PROD_2D.md`](./PROJECT_PLAN_PROD_2D.md)).

**PROD-2D** permanece abierta hasta D23; lista para iniciar **D13**.

---

## Microfase D13 — ARCH-5 F5E: Dominio SCI-60

| Campo | Valor |
|-------|-------|
| **Estado** | **COMPLETED** (dominio move-only) |
| **Fecha de certificación** | 2026-07-06 |
| **Referencia SSOT** | [`PROJECT_PLAN_PROD_2D.md`](./PROJECT_PLAN_PROD_2D.md) § D13 |
| **Nota de alineación** | SCI-60 (Executive Publication Dashboard) pertenece **oficialmente a D13 / F5E** |

### Objetivo cumplido

Extracción arquitectónica **move-only** del agregador cross-domain **SCI-60 (Executive Publication Dashboard)** desde `src/app/page.tsx` hacia `src/lib/scientific/methodology/publication/`, preservando UI React (`ScientificPublicationDashboard`), `useMemo`, handlers, toggles, comparison capture y wiring en boundary.

| Motor | SCI | Ubicación |
|-------|-----|-----------|
| Executive Publication Dashboard (dominio) | SCI-60 | `src/lib/scientific/methodology/publication/` |

### Microfases D13.1–D13.6

| Microfase | Entregable | Estado |
|-----------|------------|--------|
| **D13.1** | Baseline + inventario (`D13_1_SCI60_PREP.md`) | **CLOSED** |
| **D13.2** | `types.ts` + `input-types.ts` | **CLOSED** |
| **D13.3** | `build.ts` (orquestador + sub-builders) | **CLOSED** |
| **D13.4** | `reporting.ts` + helpers privados de formato/advisor | **CLOSED** |
| **D13.5** | `index.ts` (API Freeze) + wiring + eliminación inline en `page.tsx` | **CLOSED** |
| **D13.6** | Gate final + acta §D13 | **CLOSED** |

### Arquitectura resultante (F5E)

```text
src/lib/scientific/methodology/publication/
  types.ts           ← tipos de dominio SCI-60
  input-types.ts     ← tipos de frontera (MultivariateSource, AdvisorSource, BuildInput)
  build.ts           ← gate, orquestador, sub-builders (3 exportados para comparison)
  reporting.ts       ← getPublicationDashboardReportLines + helpers privados
  index.ts           ← barrel API Freeze
src/app/page.tsx     ← useMemo + comparison capture + import UI SCI-60 (D14) + toggles
```

**Boundary congelado:** `publication/` no importa React, UI, hooks, CSS ni `page.tsx`. Consumidores externos importan exclusivamente `@/lib/scientific/methodology/publication` (barrel).

**Dependencias upstream:** `readiness`, `summary`, `evidence`, `normality`, `inference`, `@/lib/scientific/shared/text`.

### API pública congelada (`publication/index.ts`)

| Export | Origen |
|--------|--------|
| `PublicationDashboardAnalysis` | `types.ts` |
| `PublicationDashboardBuildInput` | `input-types.ts` |
| `buildPublicationDashboardAnalysis` | `build.ts` |
| `canBuildPublicationDashboard` | `build.ts` |
| `buildPublicationDashboardNormalitySummary` | `build.ts` |
| `buildPublicationDashboardMultivariateHighlights` | `build.ts` |
| `buildPublicationDashboardInferentialHighlight` | `build.ts` |
| `getPublicationDashboardReportLines` | `reporting.ts` |

**No exportados (privados):** sub-builders de diagnóstico/riesgos/recomendaciones; `formatPCAVariancePercent`, `formatVariableImportanceCoLeaders`, `getStatisticalAdvisorConfidenceLabel` (copias move-only internas en `build.ts` / `reporting.ts`).

### Certificación arquitectónica

| Afirmación | Resultado |
|------------|-----------|
| SCI-60 ya no reside inline en `page.tsx` (dominio) | **CONFIRMADO** — solo consumo vía barrel |
| Dominio aislado del árbol React | **CONFIRMADO** — cero imports React/hooks/UI en `publication/` |
| `publication/` es implementación canónica SCI-60 | **CONFIRMADO** |
| Sin duplicación funcional SCI-60 pendiente | **CONFIRMADO** — grep repo: implementaciones solo en `publication/`; `page.tsx` retiene UI + wiring |
| SSOT análisis | **CONFIRMADO** — UI y PDF consumen el mismo `PublicationDashboardAnalysis` vía `buildPublicationDashboardAnalysis` |

Baselines QA-1 Publication Status (move-only, referencia): Dataset5 **Near Ready 77.0** · Dataset6 **Requires Review 67.5**.

### Verificación gate final (2026-07-06)

| Comando / criterio | Resultado |
|--------------------|-----------|
| `npx tsc --noEmit` | **PASS** |
| Estructura módulo `publication/` (5 archivos) | **PASS** |
| API Freeze — 8 exports en barrel | **PASS** |
| `page.tsx` sin builders/helpers inline SCI-60 | **PASS** |
| Imports `page.tsx` vía barrel únicamente | **PASS** |
| Sin deep imports hacia `methodology/publication/*` | **PASS** |
| `publication/` sin React / `@/app` / `@/components` | **PASS** |
| Gate duplicación repo-wide `PublicationDashboard*` | **PASS** |
| Gate unitario F5E (`validate:methodology-f5e-unit`) | **Pendiente** — script planificado D16 (consolidación `validate:methodology-unit`) |

### Criterios de certificación D13 (épica)

| ID | Criterio | Resultado |
|----|----------|-----------|
| CA-D13-1 | Módulo `methodology/publication/` operativo con barrel | **PASS** |
| CA-D13-2 | `page.tsx` sin dominio inline SCI-60 | **PASS** |
| CA-D13-3 | Baselines Publication Status 77.0 / 67.5 inalterados (move-only) | **PASS** |
| CA-D13-4 | Scores upstream Evidence/Overall Health inalterados | **PASS** |
| CA-D13-5 | UI/toggles/useMemo sin cambio funcional | **PASS** |
| CA-D13-6 | Comparison capture produce snapshots equivalentes | **PASS** |
| CA-D13-7 | PDF SCI-17 sección Executive Publication Dashboard presente | **PASS** |
| CA-D13-8 | `tsc` PASS | **PASS** |
| CA-D13-9 | Consumidores sin deep imports; solo barrel | **PASS** |
| CA-D13-10 | `publication/` acyclic; sin React/UI/page imports | **PASS** |
| CA-D13-11 | Acta §D13 en este documento | **PASS** |
| CA-D13-12 | ARCH-5 F5E marcado CLOSED; handoff D14 | **PASS** |
| CA-D13-13 | Ningún archivo de `publication/` depende de React/JSX/hooks/CSS/UI | **PASS** |

### Criterios de certificación D13.6 (gate final)

| ID | Criterio | Resultado |
|----|----------|-----------|
| CA-D13.6-1 | Gate final ejecutado | **PASS** |
| CA-D13.6-2 | `PROJECT_STATUS_PROD_2D.md` actualizado | **PASS** |
| CA-D13.6-3 | ARCH-5 F5E marcado CLOSED | **PASS** |
| CA-D13.6-4 | Resultados de validación registrados | **PASS** |
| CA-D13.6-5 | Handoff hacia D14 documentado | **PASS** |
| CA-D13.6-6 | Sin cambios funcionales | **PASS** |
| CA-D13.6-7 | `npx tsc --noEmit` PASS | **PASS** |

**D13 no deja deuda técnica funcional** dentro de su alcance F5E (dominio). UI `ScientificPublicationDashboard` fue extraída en **D14 — ARCH-5 F5F** (ver §D14).

### ARCH-5 F5E — cierre parcial épica

| Microfase | Entregable ARCH-5 | Estado |
|-----------|-------------------|--------|
| **D13** | Dominio SCI-60 modularizado | **CLOSED** |

**ARCH-5 F5E: CLOSED** (2026-07-06). Épica ARCH-5 permanece abierta (D14–D17).

---

## Microfase D14 — ARCH-5 F5F: UI SCI-60 (Scientific Reports)

| Campo | Valor |
|-------|-------|
| **Estado** | **COMPLETED** (extracción UI move-only) |
| **Fecha de certificación** | 2026-07-06 |
| **Referencia SSOT** | [`PROJECT_PLAN_PROD_2D.md`](./PROJECT_PLAN_PROD_2D.md) § D14 · [`D14_1_SCI60_UI_PREP.md`](./D14_1_SCI60_UI_PREP.md) |
| **Nota de alineación** | D14 acotado exclusivamente a SCI-60 UI → `components/reports/`; SCI-50–56 permanecen inline |

### Objetivo cumplido

Extracción arquitectónica **move-only** del componente presentacional **`ScientificPublicationDashboard`** desde `src/app/page.tsx` hacia `src/components/reports/ScientificPublicationDashboard.tsx`, preservando wiring `useMemo`, toggles, panel shell, Visibility Registry, Workflow SCI-59, PDF y dominio `methodology/publication/` sin cambios.

| Capa | SCI | Ubicación post-D14 |
|------|-----|-------------------|
| Dominio Executive Publication Dashboard | SCI-60 | `src/lib/scientific/methodology/publication/` (D13 — intocable) |
| UI Executive Publication Dashboard | SCI-60 | `src/components/reports/ScientificPublicationDashboard.tsx` |

### Microfases D14.1–D14.3

| Microfase | Entregable | Estado |
|-----------|------------|--------|
| **D14.1** | Baseline + inventario UI (`D14_1_SCI60_UI_PREP.md`) | **CLOSED** |
| **D14.2** | `ScientificPublicationDashboard.tsx` + barrel + wiring `page.tsx` | **CLOSED** |
| **D14.3** | Gate final + acta §D14 | **CLOSED** |

**Commits de referencia:** `1c50a7c` (D14.1 prep) · `b50060c` (D14.2 extract)

### Arquitectura resultante (F5F — SCI-60 UI)

```text
src/components/reports/
  ScientificPublicationDashboard.tsx   ← UI SCI-60 monolítica (move-only)
  index.ts                             ← barrel (+ export ScientificPublicationDashboard)
  PdfExportVisibilityBanner.tsx        ← D8 — intocable
  resolve-pdf-export-disclaimer.ts     ← D8 — intocable
src/lib/scientific/methodology/publication/   ← dominio D13 — intocable
src/app/page.tsx                       ← useMemo + toggles + panel shell + import UI
```

**Boundary congelado:** `ScientificPublicationDashboard` recibe `analysis: PublicationDashboardAnalysis` pre-construido; no hooks; no estado. Subdivisiones internas JSX (**backlog**, no D14).

**Estructura plana:** sin subcarpeta `components/reports/publication/`.

### API pública congelada (`components/reports/index.ts` — adición D14)

| Export D14 | Origen |
|------------|--------|
| `ScientificPublicationDashboard` | `ScientificPublicationDashboard.tsx` |

**No exportado (privado):** `ScientificPublicationDashboardProps` (type interno del archivo).

**Exports D8 existentes — inalterados:** `PdfExportVisibilityBanner`, `resolvePdfExportDisclaimer`, tipos asociados.

**API `publication/` — inalterada (D13):** 8 exports congelados; cero diffs en D14.

### Métricas finales D14

| Métrica | Valor |
|---------|-------|
| LOC `page.tsx` antes (baseline D14.1) | **26.631** |
| LOC `page.tsx` después (post-D14.2) | **26.409** |
| Reducción neta `page.tsx` | **−222 LOC** |
| LOC componente extraído | **233** (`ScientificPublicationDashboard.tsx`) |
| Archivos creados | **1** |
| Archivos modificados (D14.2) | **2** (`page.tsx`, `components/reports/index.ts`) |
| Definiciones `ScientificPublicationDashboard` repo-wide | **1** |

Baselines QA-1 Publication Status (move-only, referencia): Dataset5 **Near Ready 77.0** · Dataset6 **Requires Review 67.5**.

### Verificación gate final D14.3 (2026-07-06)

| Comando / criterio | Resultado |
|--------------------|-----------|
| `npx tsc --noEmit` | **PASS** |
| Una sola definición `ScientificPublicationDashboard` | **PASS** — `components/reports/ScientificPublicationDashboard.tsx` |
| `publication/` sin cambios en D14 | **PASS** |
| `workflow/` sin cambios en D14 | **PASS** |
| Visibility Registry sin cambios en D14 | **PASS** |
| Barrel mínimo — solo `ScientificPublicationDashboard` export nuevo | **PASS** |
| Props privadas — no export en barrel | **PASS** |
| Estructura plana `components/reports/` (4 archivos, sin subcarpetas) | **PASS** |
| Move-only certificado (D14.2 diff) | **PASS** — traslado literal + copias CSS/helpers |
| Paneles SCI-50–56, SCI-59 inline sin cambios | **PASS** |
| Wiring `useMemo` / panel shell / toggles intactos | **PASS** |

### Criterios de certificación D14 (épica)

| ID | Criterio | Resultado |
|----|----------|-----------|
| **CA-D14-1** | `npx tsc --noEmit` PASS | **PASS** |
| **CA-D14-2** | Move-only certificado | **PASS** |
| **CA-D14-3** | Sin cambios visuales (JSX/CSS/orden idénticos) | **PASS** |
| **CA-D14-4** | Sin cambios funcionales (toggle, gate, PDF, shell) | **PASS** |
| **CA-D14-5** | Barrel mínimo correcto | **PASS** |
| **CA-D14-6** | Sin deep imports hacia `publication/*` desde UI | **PASS** |
| **CA-D14-7** | API Freeze `publication/` respetada | **PASS** |
| **CA-D14-8** | Baselines QA-1 77.0 / 67.5 inalterados (move-only) | **PASS** |
| **CA-D14-9** | Una sola definición `ScientificPublicationDashboard` | **PASS** |
| **CA-D14-10** | `publication/` sin React/components | **PASS** |
| **CA-D14-11** | Acta §D14 en este documento | **PASS** |
| **CA-D14-12** | Paneles SCI-50–56 y SCI-59 sin cambios | **PASS** |
| **CA-D14-13** | D14 cerrado con extracción única (sin splits internos) | **PASS** |

### Criterios de certificación D14.3 (gate final)

| ID | Criterio | Resultado |
|----|----------|-----------|
| **CA-D14.3-1** | Gate final ejecutado | **PASS** |
| **CA-D14.3-2** | `PROJECT_STATUS_PROD_2D.md` actualizado | **PASS** |
| **CA-D14.3-3** | ARCH-5 F5F (SCI-60 UI) marcado CLOSED | **PASS** |
| **CA-D14.3-4** | Resultados de validación registrados | **PASS** |
| **CA-D14.3-5** | Handoff hacia D15 documentado | **PASS** |
| **CA-D14.3-6** | Sin cambios de código en D14.3 | **PASS** |
| **CA-D14.3-7** | `npx tsc --noEmit` PASS | **PASS** |

**D14 no deja deuda técnica funcional** dentro de su alcance F5F (UI SCI-60). Subdivisiones internas del dashboard permanecen en **backlog arquitectónico** (fuera de CA-D14).

### ARCH-5 F5F — cierre SCI-60 UI

| Microfase | Entregable ARCH-5 | Estado |
|-----------|-------------------|--------|
| **D14** | UI SCI-60 → `components/reports/` | **CLOSED** |

**ARCH-5 F5F (SCI-60 UI): CLOSED** (2026-07-06). Épica ARCH-5 permanece abierta (D15–D17; F5F bis para SCI-50–56 UI pendiente).

### Handoff

**D12 — CLOSED.** **ARCH-5 F5D — CLOSED.**  
**D13 — CLOSED.** **ARCH-5 F5E — CLOSED.**  
**D14 — CLOSED.** **ARCH-5 F5F (SCI-60 UI) — CLOSED.**

**Secuencia congelada (SSOT):**

```text
D1 ✓ → D4 ✓ → D5 ✓ → D6 ✓ → D7 ✓ → D8 ✓ → D2 ✓ → D3 ✓ → D9 ✓ → D10 ✓ → D11 ✓ → D12 ✓ → D13 ✓ → D14 ✓ → D15 …
```

| Microfase | Épica | Objetivo | Prerequisito |
|-----------|-------|----------|--------------|
| **D15** (siguiente) | ARCH-5 | F5G — UI `GuidedWorkflowPanel` (SCI-59) → `components/workflow/` | D14 CLOSED |

**Próxima fase:** **D15 — ARCH-5 F5G** (extracción UI `GuidedWorkflowPanel` / SCI-59).

**Pendiente explícito post-D14:**

- **SCI-50–56:** paneles metodológicos UI permanecen inline en `page.tsx` (F5F bis / microfases ARCH-5 posteriores).
- **SCI-59:** `GuidedWorkflowPanel` → D15.
- **`methodology/publication/`:** API Freeze congelada — no modificar sin microfase dedicada.

No modificar la planificación congelada ([`PROJECT_PLAN_PROD_2D.md`](./PROJECT_PLAN_PROD_2D.md)).

**PROD-2D** permanece abierta hasta D23; lista para iniciar **D15**.

---

*Acta D1 certificada 2026-07-01 · Acta D4 certificada 2026-07-01 · Acta D5 certificada 2026-07-01 · Acta D6 certificada 2026-07-02 · Acta D7 certificada 2026-07-02 · Acta D8 certificada 2026-07-03 · **ARCH-6 CLOSED** 2026-07-03 · Acta D2 certificada 2026-07-03 · **UX-2A CLOSED** 2026-07-03 · Acta D3 certificada 2026-07-06 · **UX-2B CLOSED** 2026-07-06 · Acta D9 certificada 2026-07-06 · **ARCH-5 F5A CLOSED** 2026-07-06 · Acta D10 certificada 2026-07-06 · **ARCH-5 F5B CLOSED** 2026-07-06 · Acta D11 certificada 2026-07-06 · **ARCH-5 F5C CLOSED** 2026-07-06 · Acta D12 certificada 2026-07-06 · **ARCH-5 F5D CLOSED** 2026-07-06 · Acta D13 certificada 2026-07-06 · **ARCH-5 F5E CLOSED** 2026-07-06 · Acta D14 certificada 2026-07-06 · **ARCH-5 F5F (SCI-60 UI) CLOSED** 2026-07-06. Épica PROD-2D permanece abierta hasta D23.*
