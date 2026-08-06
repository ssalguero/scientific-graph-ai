# UX-4.1 — Theme Runtime Host Integration

> **Architectural principle:** Integrate the certified runtime into the application without modifying certified runtime components.

**Épica:** UX-4 — Runtime Host Integration + Lovable App Shell  
**Microfase:** UX-4.1 — Theme Runtime Host Integration  
**Fecha:** 2026-08-02  
**Prerrequisitos:** UX-4.0 Roadmap FROZEN · UX-3.21 Runtime Certified  
**SSOT de serie:** [`UX-4.0-roadmap.md`](./UX-4.0-roadmap.md)

**Declaración:**

```text
UX-4.1 = Theme Runtime Host Integration
SCOPE = mount ThemeProvider · authorize @/ui · validate:ux-4.1
HOST = adapt app host · ThemeProvider UNCHANGED (UX-3 certified)
Policy = Adapt the host, not the Provider
NO ThemeProvider source edits · NO visual change · NO App Shell
NO chrome migration · NO persistence · NO <html> FOUC
NO RuntimeDiagnostics · NO DevTools
API FREEZE UX-3 = VIGENTE
Next: UX-4.2 App Shell Foundation
```

---

## 1. Purpose / Objetivo

Integrar el Theme Runtime certificado en el árbol de la aplicación mediante
`ThemeProvider`, respetando el contrato **host-scoped** de UX-3 y habilitando
el consumo público de `@/ui`, **sin modificar el comportamiento visible** de la
aplicación y **sin modificar el componente ThemeProvider certificado**.

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| Runtime UX-3 certificado + API Freeze | [`UX-3.21.md`](./UX-3.21.md) |
| `ThemeProvider` existe, no montado | `src/ui/providers/theme-provider.tsx` |
| UI producto = `UI_TOKENS` / `--app-*` | `src/lib/ui/tokens.ts` |
| Root layout sin provider | `src/app/layout.tsx` |
| Roadmap UX-4.0 FROZEN | [`UX-4.0-roadmap.md`](./UX-4.0-roadmap.md) |

---

## 3. In Scope / Out of Scope

**In**

- Montaje de `ThemeProvider` (byte-for-byte intacto)
- Wiring host-scoped vía `ThemeRuntimeHost`
- Exposición de `useTheme()` vía `@/ui` (disponible bajo el host; sin consumidores chrome)
- Habilitación del consumo de `@/ui` desde el host de app
- Convivencia temporal `--app-*` + `--color-*`
- Doc + `validate:ux-4.1`

**Out**

- Modificar `ThemeProvider` / props / API
- App Shell / layout Lovable / migración chrome
- Persistencia / FOUC en `<html>` / Diagnostics / DevTools
- Sync con `themeMode` de GraphEditor
- `useTheme()` en componentes de producto

---

## 4. Arquitectura

```text
html
 └─ body
     └─ ThemeRuntimeHost              ← "use client" (app-owned)
         └─ ThemeProvider (@/ui)      ← UNCHANGED · data-theme + --color-*
             └─ HostContents (app)    ← layout fill
                 └─ {children}        ← pages / GraphEditor (--app-*)
```

### Policy

```text
Adapt the host, not the Provider.
If ThemeProvider must ever change → document:
  "Additive API change — compatible with UX-3 API Freeze"
  (not authorized in UX-4.1)
```

### Imports

```text
src/app/theme-runtime-host.tsx  →  @/ui   (only authorized app import)
App / components                ✗  src/ui/theme/runtime/**
```

---

## 5. Riesgo — dual-stack false positive

```text
ThemeProvider montado y runtime funcional
        ↓
UI visualmente idéntica (sigue en --app-*)
        ↓
CORRECTO en UX-4.1 — no es un bug
```

La prueba de integración es el mount + gates + `data-theme` / vars en el host,
no un restyle de producto.

---

## 6. Rollback Strategy

Si `validate:ux-4.1` falla o hay regresión de layout:

1. Remover `ThemeRuntimeHost` de `layout.tsx`
2. Eliminar/desactivar `theme-runtime-host.tsx` y CSS app-owned asociado
3. `ThemeProvider` permanece sin montar (package intacto)
4. Runtime UX-3 permanece intacto

---

## 7. Archivos

| Archivo | Acción |
|---------|--------|
| `src/app/theme-runtime-host.tsx` | CREATE |
| `src/app/layout.tsx` | MODIFY — mount host |
| `src/app/globals.css` | MODIFY mínimo — stretch `body > [data-theme]` |
| `docs/UX/UX-4.1.md` | CREATE |
| `scripts/validate-ux-4.1.ts` | CREATE |
| `package.json` | `validate:ux-4.1` |
| `src/ui/docs/THEME.md` | Integration Contract COMPLETE |
| `src/ui/README.md` | Authorize host consumption |
| `docs/UX/UX-4.0-roadmap.md` | Status UX-4.1 COMPLETE |

**Protegidos:** `theme-provider.tsx`, `src/ui/theme/runtime/**`, `page.tsx`, chrome, `UI_TOKENS`.

---

## 8. Acceptance (CA-UX-4.1)

- [x] CA-UX-4.1.1 `ThemeProvider` montado bajo `body` vía `ThemeRuntimeHost`
- [x] CA-UX-4.1.2 Import desde `@/ui` (no path interno runtime)
- [x] CA-UX-4.1.3 Host-scoped: sin `documentElement` / `localStorage` / listeners globales en el host
- [x] CA-UX-4.1.4 `theme-provider.tsx` sin modificaciones
- [x] CA-UX-4.1.5 ThemeProvider sin Diagnostics / Pipeline / Reporter wiring
- [x] CA-UX-4.1.6 Sin cambios visuales intencionales; dual-stack documentado
- [x] CA-UX-4.1.7 Único archivo app que importa `@/ui`: `theme-runtime-host.tsx`
- [x] CA-UX-4.1.8 No AppShell / no StatusBar nuevo / no migración chrome
- [x] CA-UX-4.1.9 `npx tsc --noEmit` PASS
- [x] CA-UX-4.1.10 `npm run validate:ux-4.1` PASS (UX-3.21 freeze re-verified inline; `validate:ux-3.21` script retained)

---

## 9. Gate

```text
npm run validate:ux-4.1
```

Blocks: `hostMount` · `providerIntact` · `hostContract` · `importFence` ·
`noShell` · `apiFreeze` · `priorGate` (UX-3.21 freeze inline) · `tscCompile`

Note: `priorGate` re-verifies RuntimeReporter / Diagnostics / Pipeline freeze
in-process. Full nested `validate:ux-3.21` is retained as a standalone command
(`npm run validate:ux-3.21`) but is not spawned from UX-4.1 (recursive prior
gates + tsc hang on Windows).

---

## 10. Definition of Done

- [x] Montaje según arquitectura; ThemeProvider intacto
- [x] `docs/UX/UX-4.1.md` completo
- [x] `validate:ux-4.1` + CA en PASS
- [x] THEME.md / README actualizados
- [x] Roadmap: UX-4.1 = COMPLETE; Next = UX-4.2
- [x] Rollback verificable
- [x] Sin deuda bloqueante para App Shell Foundation

---

## 11. Next

**Next:** UX-4.2 — App Shell Foundation  
`The App Shell becomes the only composition root for application chrome.`

---

## Related

- [`UX-4.0-roadmap.md`](./UX-4.0-roadmap.md)
- [`UX-3.21.md`](./UX-3.21.md)
- [`src/ui/docs/THEME.md`](../../src/ui/docs/THEME.md)
- [`src/app/theme-runtime-host.tsx`](../../src/app/theme-runtime-host.tsx)
- [`scripts/validate-ux-4.1.ts`](../../scripts/validate-ux-4.1.ts)
