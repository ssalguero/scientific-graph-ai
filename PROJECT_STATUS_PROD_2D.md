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
D1 ✓ → D4 ✓ → D5 ✓ → D6 → D7 → D8 → D2 → D3 → D9 …
```

| Microfase | Épica | Objetivo | Prerequisito |
|-----------|-------|----------|--------------|
| **D6** (siguiente) | ARCH-6.3 | Calc vs viz badge vía `queries.ts` | D5 CLOSED |
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

**D4 — CLOSED.** Siguiente microfase planificada: **D6** (calc vs viz) — ver §D5 handoff.

**Secuencia congelada** ([`PROJECT_PLAN_PROD_2D.md`](./PROJECT_PLAN_PROD_2D.md)):

```text
D1 ✓ → D4 ✓ → D5 ✓ → D6 → D7 → D8 → D2 → D3 → D9 …
```

| Microfase | Épica | Objetivo | Prerequisito |
|-----------|-------|----------|--------------|
| **D6** (siguiente) | ARCH-6.3 | Calc vs viz badge vía `queries.ts` | D5 CLOSED |
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

**D5 — CLOSED.** QA-1 §10.1 **cerrada**. Siguiente microfase planificada: **D6** (ARCH-6.3) — **no iniciada** en esta ventana.

**Secuencia congelada:**

```text
D1 ✓ → D4 ✓ → D5 ✓ → D6 → D7 → D8 → D2 → D3 → D9 …
```

| Microfase | Épica | Objetivo | Prerequisito |
|-----------|-------|----------|--------------|
| **D6** (siguiente) | ARCH-6.3 | Aviso cálculo ≠ visualización (QA-1 §10.3) | D5 CLOSED |
| **D7** (pendiente) | ARCH-6.4 | Revert toggles al cancelar workflow | D6 |
| **D8** (pendiente) | ARCH-6.5 | PDF wont-fix + cierre ARCH-6 | D7 |

**Preparación D6 (sin implementar):** consumir `src/lib/scientific/visibility/queries.ts` + componentes en `src/components/analysis/`; badge/tooltip en toggles metodológicos; **no** detener `useMemo` motores; scores Dataset5/6 inalterados.

**ARCH-6 progreso post-D5:** 1/4 observaciones QA-1 §10 cerradas (10.1 ✓ · 10.2 D8 · 10.3 D6 · 10.4 D7).

---

*Acta D1 certificada 2026-07-01 · Acta D4 certificada 2026-07-01 · Acta D5 certificada 2026-07-01. Épica PROD-2D permanece abierta hasta D23.*
