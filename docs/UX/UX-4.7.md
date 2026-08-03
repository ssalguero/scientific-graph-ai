# UX-4.7 — Status Bar Integration

> **Architectural principles:**
> - AppShell remains the only composition root for application chrome.
> - Status Bar Integration in UX-4.7 consists of introducing the permanent
>   application chrome container. Product status, runtime telemetry and feature
>   indicators remain out of scope.
> - StatusBar is the permanent default chrome of the AppShell. Placeholder mode
>   ends in UX-4.7.
> - StatusBar is a chrome component, not a feature component.
> - No runtime bindings. No application state. No telemetry.
> - The StatusBar public API is intentionally minimal. Additional props require
>   a future additive API change.
> - Create once. Reuse afterwards.

**Épica:** UX-4 — Runtime Host Integration + Lovable App Shell  
**Microfase:** UX-4.7 — Status Bar Integration  
**Fecha:** 2026-08-03  
**Prerrequisitos:** UX-4.6 Inspector Integration COMPLETE  
**SSOT de serie:** [`UX-4.0-roadmap.md`](./UX-4.0-roadmap.md)  
**Estado:** FROZEN · COMPLETE

**Declaración:**

```text
UX-4.7 = Status Bar Integration
SCOPE = introduce permanent StatusBar chrome · replace Status Region placeholder
AppShell = only composition root for application chrome
StatusBar = permanent default chrome of AppShell
Placeholder mode ends in UX-4.7
StatusBar = chrome component (NOT a feature component)
Public API = children? · className? (intentionally minimal)
NO StatusBarV2 · NO StatusContext · NO StatusProvider
NO Runtime bindings · NO application state · NO telemetry
NO indicators · NO coordinates · NO zoom · NO AI status · NO notifications
NO Responsive · NO Docking · NO useTheme() · NO Chrome Runtime Migration
ThemeRuntimeHost / Runtime UX-3 = intact
page.tsx / WorkspaceLayout / Toolbar / Sidebar / Workspace / Inspector = protected
API FREEZE UX-3 = VIGENTE
Next: UX-4.8 Responsive + Docking Integration
```

---

## 1. Purpose / Objetivo

Introducir el `StatusBar` definitivo como componente permanente del chrome del
AppShell, sustituyendo el placeholder de la Status Bar Region introducido en
UX-4.2, **sin** lógica de producto, **sin** estado de aplicación y **sin**
integración con el Runtime.

```text
StatusBar is created once as permanent chrome.
Product indicators arrive later (UX-5) without changing shell architecture.
```

A diferencia de Toolbar / Workspace / Inspector, UX-4.7 **no** migra un
componente existente: crea el chrome permanente de la quinta región LAYOUT.md.

---

## 2. Estado de partida

| Hecho | Evidencia |
|-------|-----------|
| UX-4.6 COMPLETE | [`UX-4.6.md`](./UX-4.6.md) · Inspector integrado |
| AppShell Status Region | placeholder (`AppShellRegionPlaceholder` · label Status Bar) |
| StatusBar | no existía como componente permanente |
| ThemeRuntimeHost / Runtime UX-3 | intactos |

---

## 3. Ownership (FROZEN)

| Concern | Owner |
|---------|--------|
| Visual structure / layout / empty zones | StatusBar |
| Status Region / position | AppShell |
| Runtime | ninguna relación |

```text
StatusBar is the permanent default chrome of the AppShell.
Placeholder mode ends in UX-4.7.

StatusBar owns visual structure and layout.
AppShell owns region and position.
Runtime has no relationship.
```

**UX-4 size / content ownership symmetry:**

| Region | Size / content owner | AppShell owns |
|--------|----------------------|---------------|
| Sidebar | Sidebar | position / region bounds |
| Toolbar | Toolbar | position / region bounds |
| Workspace | Workspace | position / region bounds |
| Inspector | Inspector (width + visibility) | position / region bounds |
| Status Bar | StatusBar (visual structure) | position / region bounds |

---

## 4. Public API (FROZEN)

```ts
type StatusBarProps = {
  children?: ReactNode;
  className?: string;
};
```

```text
The StatusBar public API is intentionally minimal.
Additional props require a future additive API change.
```

---

## 5. In Scope / Out of Scope

**In**

- Crear `StatusBar` · `StatusBarLayout` · barrel
- Integrar StatusBar como default permanente en AppShell Status Region
- Eliminar placeholder de Status Bar
- Doc + `validate:ux-4.7`

**Out**

- Indicadores reales / coordenadas / zoom / AI status / notificaciones
- Estado de sesión / telemetría / progreso / sincronización
- Hooks / providers / stores / `StatusContext` / `StatusProvider` / `StatusBarV2`
- RuntimeReporter / RuntimeDiagnostics / Runtime Pipeline / `useTheme()`
- Responsive · Docking · Chrome Runtime Migration (UX-4.8 / UX-4.9)
- Todo contenido funcional → UX-5

---

## 6. Arquitectura

```text
Antes:
AppShell → Status Region → AppShellRegionPlaceholder ("Status Bar")

Después:
AppShell
  │
Status Region (AppShellRegion · APP_SHELL_REGIONS.statusBar)
  │
statusBar ?? <StatusBar />
  │
StatusBarLayout (presentational · empty start/center/end zones)
```

Composición permanente en AppShell:

```tsx
<AppShellRegion
  region={APP_SHELL_REGIONS.statusBar}
  className="min-w-0"
>
  {statusBar ?? <StatusBar />}
</AppShellRegion>
```

---

## 7. Rollback

1. Restaurar `AppShellRegionPlaceholder` en Status Region.
2. Eliminar `src/components/status-bar/`.
3. Revertir únicamente composición / doc / validator.
4. Conservar UX-4.1–UX-4.6 y Runtime UX-3 intactos.

---

## 8. Archivos

| Archivo | Acción |
|---------|--------|
| `src/components/status-bar/StatusBar.tsx` | CREATE |
| `src/components/status-bar/StatusBarLayout.tsx` | CREATE |
| `src/components/status-bar/index.ts` | CREATE |
| `src/components/app-shell/AppShell.tsx` | MODIFY — Status Region → StatusBar default |
| `docs/UX/UX-4.7.md` | CREATE |
| `scripts/validate-ux-4.7.ts` | CREATE |
| `package.json` | `validate:ux-4.7` |
| `docs/UX/UX-4.0-roadmap.md` | UX-4.7 COMPLETE · Next UX-4.8 |

**Protegidos:** `page.tsx`, WorkspaceLayout / WorkspaceContent / Workspace,
WindowManager, ThemeRuntimeHost, Runtime, providers, `src/lib/ui/**`,
Toolbar, Sidebar, Inspector.

---

## 9. Acceptance (CA-UX-4.7)

- [x] CA-UX-4.7.1 Existe StatusBar
- [x] CA-UX-4.7.2 Status Region contiene StatusBar
- [x] CA-UX-4.7.3 Placeholder eliminado
- [x] CA-UX-4.7.4 Sin estado interno
- [x] CA-UX-4.7.5 Sin Runtime
- [x] CA-UX-4.7.6 Sin hooks ni providers
- [x] CA-UX-4.7.7 AppShell continúa siendo el único composition root
- [x] CA-UX-4.7.8 Toolbar, Sidebar, Workspace e Inspector permanecen intactos
- [x] CA-UX-4.7.9 ThemeRuntimeHost y Runtime UX-3 intactos
- [x] CA-UX-4.7.10 Sin nuevas funcionalidades
- [x] CA-UX-4.7.11 `npx tsc --noEmit` PASS
- [x] CA-UX-4.7.12 `npm run validate:ux-4.7` PASS

---

## 10. Gate

```text
npm run validate:ux-4.7
```

Blocks: `statusBarExists` · `statusRegion` · `placeholderRemoved` ·
`layoutOnly` · `runtimeIsolation` · `noStatusContext` · `appShellRoot` ·
`priorGate` · `tscCompile`

---

## 11. Definition of Done

- [x] Existe componente StatusBar (chrome permanente)
- [x] Placeholder de Status Bar desapareció
- [x] Sin lógica / sin estado / sin Runtime
- [x] API pública mínima (`children?`, `className?`)
- [x] AppShell = único composition root; cinco regiones LAYOUT.md completas
- [x] Toolbar / Sidebar / Workspace / Inspector / ThemeRuntimeHost / Runtime intactos
- [x] Gates PASS · Roadmap Next = UX-4.8

---

## 12. Next

**Next:** UX-4.8 — Responsive + Docking Integration  
Consolidar el comportamiento responsive del AppShell.
Integrar las reglas de colapso y adaptación definidas en RESPONSIVE.md.
Reutilizar la infraestructura de docking existente sin introducir nuevas
funcionalidades.

---

## Related

- [`UX-4.0-roadmap.md`](./UX-4.0-roadmap.md)
- [`UX-4.6.md`](./UX-4.6.md)
- [`UX-4.5.md`](./UX-4.5.md)
- [`UX-4.4.md`](./UX-4.4.md)
- [`UX-4.3.md`](./UX-4.3.md)
- [`UX-4.2.md`](./UX-4.2.md)
- [`ux/docs/LAYOUT.md`](../../ux/docs/LAYOUT.md)
- [`scripts/validate-ux-4.7.ts`](../../scripts/validate-ux-4.7.ts)
