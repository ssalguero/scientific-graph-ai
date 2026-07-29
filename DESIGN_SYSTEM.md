# Scientific Graph AI — Design System v3 (CONGELADO)

Identidad visual oficial. Fuente única de verdad: `src/styles.css`.
Ningún componente debe declarar colores, radios, sombras o tamaños de icono fuera de los tokens.

Índice
1. Principios
2. Design Tokens / Variables CSS
3. Colores
4. Tipografía
5. Espaciados y retícula
6. Border radius
7. Shadows / elevación
8. Animaciones y estados
9. Layout
10. Iconografía
11. Inventario de componentes UI
12. Utilidades propias
13. Temas y conmutación
14. Reglas de uso

---

## 1. Principios

- Estética de **software científico de escritorio** (MATLAB, OriginPro, Affinity, VS Code). No Bootstrap, no Material Design.
- **Densidad alta**, filas de 24/28/32 px, sin aire decorativo.
- **Bajo contraste en dark**, grises cálidos en light, sin blancos puros.
- **Un solo acento** por tema (cian pastel). El color es información, no decoración.
- Movimiento mínimo: 100 ms, solo color/opacidad. Sin easing expresivo.
- Layout **congelado**: el sistema evoluciona en tokens, no en estructura.

---

## 2. Design Tokens / Variables CSS

Tres capas:

| Capa | Dónde | Ejemplo |
|---|---|---|
| Tokens primitivos de tema | `:root`, `.dark`, `.hc`, `.dark.hc` | `--panel`, `--accent-primary` |
| Tokens semánticos Tailwind | `@theme inline` | `--color-panel: var(--panel)` |
| Utilidades | `@utility` | `num`, `rail-label`, `focus-ring` |

Mapeo semántico completo (`@theme inline`):

```
--color-background        → --background
--color-foreground        → --foreground
--color-workspace         → --workspace
--color-panel             → --panel
--color-surface           → --surface
--color-hover             → --hover
--color-card              → --panel
--color-card-foreground   → --foreground
--color-popover           → --surface
--color-popover-foreground→ --foreground
--color-primary           → --accent-primary
--color-primary-foreground→ --accent-foreground
--color-secondary         → --surface
--color-muted             → --surface
--color-muted-foreground  → --muted-foreground
--color-accent            → --accent-primary
--color-accent-secondary  → --accent-secondary
--color-destructive       → --destructive
--color-ok                → --ok
--color-warn              → --warn
--color-dim               → --dim
--color-border            → --border
--color-border-strong     → --border-strong
--color-input             → --border
--color-ring              → --accent-primary
--color-grid              → --grid
--color-chart-1..5        → accent-primary, accent-secondary, ok, warn, muted-foreground
```

Clases Tailwind resultantes: `bg-panel`, `bg-surface`, `bg-workspace`, `bg-hover`, `text-dim`, `text-ok`, `text-warn`, `border-border-strong`, `stroke-grid`, etc.

---

## 3. Colores

Todos en **oklch**. Cuatro variantes de tema.

### Light (gris cálido de laboratorio, h ≈ 84.57)

| Token | Valor | Uso |
|---|---|---|
| `--workspace` | `oklch(0.9391 0.0043 84.57)` | Fondo del área de trabajo / app |
| `--panel` | `oklch(0.9617 0.0038 84.57)` | Barras, sidebar, inspector |
| `--surface` | `oklch(0.9805 0.0031 84.57)` | Popovers, flotantes, controles activos |
| `--hover` | `oklch(0.9028 0.0068 84.57)` | Hover de filas y botones |
| `--border` | `oklch(0.8834 0.0059 84.57)` | Hairlines |
| `--border-strong` | `oklch(0.8092 0.0075 84.57)` | Bordes de énfasis, scrollbar |
| `--foreground` | `oklch(0.3221 0.0107 264.36)` | Texto principal |
| `--muted-foreground` | `oklch(0.4938 0.0121 264.36)` | Texto secundario |
| `--dim` | `oklch(0.6169 0.0121 264.36)` | Etiquetas, unidades |
| `--accent-primary` | `oklch(0.5316 0.0838 224.61)` | Acento cian |
| `--accent-secondary` | `oklch(0.5507 0.0803 264.05)` | Serie secundaria |
| `--ok` | `oklch(0.5471 0.0898 159.67)` | Estado correcto |
| `--warn` | `oklch(0.6112 0.1027 74.88)` | Advertencia |
| `--destructive` | `oklch(0.5462 0.1289 26.31)` | Error / destructivo |
| `--accent-foreground` | `oklch(0.9805 0.0031 84.57)` | Texto sobre acento |
| `--grid` | `oklch(0.7645 0.0084 84.57)` | Retícula del gráfico |

### Dark (grafito pastel, por defecto)

| Token | Valor |
|---|---|
| `--workspace` | `oklch(0.2421 0.017 259.76)` |
| `--panel` | `oklch(0.2795 0.0204 260.61)` |
| `--surface` | `oklch(0.3191 0.022 259.38)` |
| `--hover` | `oklch(0.3762 0.0253 257.52)` |
| `--border` | `oklch(0.3409 0.0266 255.11)` |
| `--border-strong` | `oklch(0.4433 0.0293 259.77)` |
| `--foreground` | `oklch(0.9285 0.0115 252.09)` |
| `--muted-foreground` | `oklch(0.7656 0.0265 255.59)` |
| `--dim` | `oklch(0.6195 0.0293 257.06)` |
| `--accent-primary` | `oklch(0.7969 0.0626 218.62)` (≈ #8FC7D8) |
| `--accent-secondary` | `oklch(0.828 0.0292 246.53)` |
| `--ok` | `oklch(0.8064 0.0452 156.49)` |
| `--warn` | `oklch(0.8344 0.0774 80.7)` |
| `--destructive` | `oklch(0.7922 0.0755 26.05)` |
| `--accent-foreground` | `oklch(0.2421 0.017 259.76)` |
| `--grid` | `oklch(0.4433 0.0293 259.77)` |

### High Contrast (`.hc` y `.dark.hc`)

Misma estructura de tokens, mayor separación de luminancia, bordes definidos y acentos saturados. No altera layout ni retícula. Pensado para proyección en aula/laboratorio.

- `.hc` (light HC): `--surface: oklch(1 0 0)`, `--border: oklch(0.6402 0.0092 84.57)`, `--foreground: oklch(0.1698 0.0092 264.36)`, `--accent-primary: oklch(0.4402 0.129 231.62)`.
- `.dark.hc`: `--workspace: oklch(0.1584 0.0139 259.76)`, `--border: oklch(0.4899 0.0303 255.11)`, `--foreground: oklch(0.9924 0.0025 252.09)`, `--accent-primary: oklch(0.8756 0.1349 202.62)`.

### Tokens de sombra/tinte

`--shadow-tint`, `--shadow-hairline-tint`, `--sheen` cambian por tema; nunca se usan directamente en componentes, solo dentro de la escala de sombras.

---

## 4. Tipografía

| Familia | Token | Uso |
|---|---|---|
| **IBM Plex Sans** | `--font-sans`, `--font-display` | Toda la UI, menús, texto |
| **JetBrains Mono** | `--font-mono` | Datos, coordenadas, métricas, atajos |

Carga vía `<link>` en `src/routes/__root.tsx` (nunca `@import` remoto en CSS).
Pesos: 400 / 500 / 600 / 700 (Plex), 400 / 500 (Mono).

Escala tipográfica real del producto (densidad de escritorio):

| Rol | Tamaño | Peso | Notas |
|---|---|---|---|
| Marca / título de app | 13 px | 700 | `.ui-title`, tracking −0.008em |
| Menú de barra superior | 12 px | 500 | |
| Texto de panel / etiquetas | 11 px | 400–500 | |
| Micro-datos, status bar | 10 px | 400 | `.num` tabular |
| Rail label (secciones) | 10 px | 600 | uppercase, tracking 0.09em |
| Badges/atajos | 9–10 px | 500 | mono |

Reglas: `h1–h4` usan `--font-display` con tracking −0.008em; todo número usa `.num` (tabular-nums + mono) para evitar salto de dígitos.

---

## 5. Espaciados y retícula

Base **4 px**. Tokens de retícula:

```
--spacing-row:       24px   /* fila densa (listas, capas) */
--spacing-row-md:    28px   /* fila estándar */
--spacing-row-lg:    32px   /* fila cómoda / cabeceras */
--spacing-rail:      44px   /* raíl de actividad izquierdo */
--spacing-inspector: 288px  /* ancho del inspector derecho */
```

Alturas fijas del chrome: TopBar 48 px · cabecera de panel 36 px · cabecera de sección plegable 32 px · barra de título flotante 28 px · StatusBar 24 px · controles 24 px (h-6) / 28 px (h-7).

Paddings canónicos: 12 px en cuerpos de panel, 10 px en barras densas, 6 px en filas de lista, 2 px en contenedores segmentados.
Separación entre grupos de barra: `group-sep` (1 px, margen vertical 6 px).

---

## 6. Border radius

Base `--radius: 6px`.

| Token | Valor | Uso |
|---|---|---|
| `--radius-xs` | 2 px | Píldoras internas, swatches, kbd |
| `--radius-sm` | 4 px | Botones, inputs, filas |
| `--radius-md` | 6 px | Paneles flotantes, tarjetas |
| `--radius-lg` | 8 px | Contenedores mayores |
| `--radius-xl` | 12 px | Diálogos / paleta de comandos |

Nada supera 12 px: los redondeos grandes leen como web, no como instrumento.

---

## 7. Shadows / elevación

Escala congelada, tintada por tema:

```
--shadow-hairline: 0 1px 0 0 var(--shadow-hairline-tint);
--shadow-panel:    0 12px 28px -20px var(--shadow-tint);
--shadow-float:    0 16px 34px -18px var(--shadow-tint), 0 1px 0 0 var(--sheen) inset;
--shadow-raised:   0 1px 2px 0 var(--shadow-tint), 0 1px 0 0 var(--sheen) inset;
--shadow-inset:    inset 0 1px 0 0 var(--sheen);
```

| Nivel | Sombra | Aplicación |
|---|---|---|
| 0 | ninguna | Workspace, cuerpos de panel |
| 1 | `hairline` | TopBar, separadores estructurales |
| 2 | `raised` | Botón activo, segmento seleccionado |
| 3 | `panel` | Paneles acoplados desprendidos |
| 4 | `float` | Ventanas flotantes, paleta de comandos, popovers |

Uso: `shadow-[var(--shadow-float)]` o la utilidad `surface-raised`.

---

## 8. Animaciones y estados

- **Duración única:** 100 ms. Propiedades permitidas: `color`, `background-color`, `border-color`, `opacity`. Nada de transform ni easing expresivo.
- **Hover:** `bg-hover` (o `bg-hover/40–60` en superficies densas) + subida de texto de `text-dim` a `text-foreground`.
- **Active/seleccionado:** `bg-surface` + `text-primary` + `shadow-raised`; en tabs, indicador superior de 2 px en `--accent-primary`.
- **Focus:** utilidad `focus-ring` — anillo interior nítido de 1 px + halo de 2 px al 30 %, sin glow web. Solo `:focus-visible`.
- **Disabled:** opacidad 50 %, sin cambio de color.
- **Arrastre:** `cursor-grab` → `active:cursor-grabbing` en barras de ventana flotante.
- `tw-animate-css` está disponible para diálogos shadcn (fade/zoom cortos); no usar en el chrome del workspace.

---

## 9. Layout

```
┌──────────────────────────────────────────────────────────────┐
│ TopBar 48px  · marca · menús · buscador ⌘K · alertas · tema  │
├────┬────────────────────────────────┬────────────────────────┤
│Rail│ Workspace                      │ Inspector 288px        │
│44px│  · tabs de figura              │  · secciones plegables │
│    │  · PlotCanvas (SVG)            │  · campos numéricos    │
│ ── │  · FloatingPanel(s) absolutos  │  · segmentados         │
│Obj.│                                │  · resultados de ajuste│
│Expl│                                │  · sugerencia IA       │
│Caps│                                │                        │
├────┴────────────────────────────────┴────────────────────────┤
│ StatusBar 24px · motor · X/Y · filas/R² · CPU/MEM · versión  │
└──────────────────────────────────────────────────────────────┘
```

Reglas: columnas laterales `shrink-0`, workspace `flex-1 min-w-0`, scroll solo en cuerpos de panel (`overflow-y-auto`), ventanas flotantes en `absolute z-30` dentro del workspace, paleta de comandos en overlay superior. **Layout congelado.**

---

## 10. Iconografía

- Librería única: **Lucide** (`iconLibrary: "lucide"` en `components.json`).
- `stroke-width: 1.5`, `linecap`/`linejoin` round, sin relleno — forzado en `@layer base` sobre `svg.lucide`.
- Tamaños: **12 px** (`size-3`) micro/status · **14 px** (`size-3.5`) barras densas · **16 px** (`size-4`) acciones principales. Nunca mayores en el chrome.
- Color: heredado (`currentColor`); estados vía `text-dim` / `text-muted-foreground` / `text-foreground` / `text-primary`.
- Set en uso: `Search`, `Command`, `Bell`, `Sun`, `Moon`, `Contrast`, `GripHorizontal`, `Minus`, `X`, `Cpu`, `Activity`, `Save`, `Sparkles`.

---

## 11. Inventario de componentes UI

### Componentes de producto (`src/components/workstation/`)

| Componente | Rol | Props clave |
|---|---|---|
| `TopBar` | Marca, menús, buscador ⌘K, notificaciones, tema | `theme`, `onToggleTheme`, `onOpenPalette`, `notifications`, `highContrast`, `onToggleContrast` |
| `ThemeSwitch` | Segmentado Light/Dark + botón HC | `theme`, `onToggle`, `highContrast`, `onToggleContrast` |
| `LeftRail` | Raíl de actividad, Object Explorer, Layers (visibilidad/bloqueo) | — |
| `PlotCanvas` | Gráfico SVG: ejes, retícula, dispersión con barras de error, curva de ajuste | interacción de cursor |
| `Inspector` | Propiedades de figura: secciones plegables, campos numéricos, segmentados, resultados de regresión, sugerencia IA | — |
| `FloatingPanel` | Ventana flotante arrastrable, colapsable y cerrable | `title`, `initial {x,y}`, `children` |
| `CommandPalette` | Buscador de comandos ⌘K con navegación por teclado | `open`, `onClose` |
| `StatusBar` | Telemetría: motor, X/Y, filas, R², CPU, MEM, guardado, versión | `cursor` |

Subcomponentes internos del Inspector: `Section` (plegable), `Field` (label + control), `NumInput` (mono, alineado a la derecha), `Segmented` (grupo de opciones exclusivas).

### Primitivas shadcn/ui disponibles (`src/components/ui/`)

accordion · alert · alert-dialog · aspect-ratio · avatar · badge · breadcrumb · button · calendar · card · carousel · chart · checkbox · collapsible · command · context-menu · dialog · drawer · dropdown-menu · form · hover-card · input · input-otp · label · menubar · navigation-menu · pagination · popover · progress · radio-group · resizable · scroll-area · select · separator · sheet · skeleton · slider · sonner · switch · table · tabs · textarea · toggle · toggle-group · tooltip

Estilo shadcn: `new-york`, `baseColor: slate`, CSS variables activas, sin prefijo. Alias: `@/components`, `@/components/ui`, `@/lib`, `@/hooks`.

---

## 12. Utilidades propias (`@utility`)

| Utilidad | Definición | Uso |
|---|---|---|
| `num` | mono + `tabular-nums` + tracking −0.01em | Todo dato numérico |
| `rail-label` | Plex 10 px / 600 / uppercase / tracking 0.09em / `--dim` | Títulos de sección y raíl |
| `ui-title` | Plex 600, tracking −0.008em | Marca y títulos de ventana |
| `focus-ring` | Anillo interior 1 px + halo 2 px al 30 % en `:focus-visible` | Todo elemento focalizable |
| `group-sep` | Línea 1 px, `align-self: stretch`, margen vertical 6 px | Separación de grupos en barras |
| `surface-raised` | `surface` + borde + radio base + `shadow-float` | Flotantes, menús, paleta |

---

## 13. Temas y conmutación

- Clases sobre `<html>`: `dark` (tema oscuro) y `hc` (alto contraste), combinables → `dark hc`.
- **Tema por defecto: Dark.** Light se recomienda para presentación, impresión y exportación de figuras.
- HC es un modificador ortogonal: reescribe tokens, no layout.
- Variante Tailwind: `@custom-variant dark (&:is(.dark *))`.

---

## 14. Reglas de uso

1. Prohibido color literal en componentes (`text-white`, `bg-black`, `bg-[#...]`). Solo clases semánticas de token.
2. Nuevo color, sombra o radio ⇒ primero token en `src/styles.css`, luego uso.
3. Todo token nuevo debe existir en las cuatro variantes: light, dark, `.hc`, `.dark.hc`.
4. Iconos siempre Lucide, stroke 1.5, 12/14/16 px.
5. Números siempre con `.num`.
6. Transiciones siempre 100 ms y solo de color/opacidad.
7. El layout está congelado: los cambios viven en tokens y estados, no en la estructura de paneles.

---

**Fuentes canónicas:** `src/styles.css` (tokens y utilidades) · `src/routes/__root.tsx` (fuentes y metadatos) · `src/components/workstation/*` (componentes de producto) · `components.json` (configuración shadcn).
