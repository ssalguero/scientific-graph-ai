# Scientific Graph AI — Design System v3 (CONGELADO)

> **Single Source of Truth para la identidad visual de Scientific Graph AI.**

Este documento define la arquitectura del Design System, sus principios y las reglas de gobierno.

La implementación oficial reside en:

- `src/styles.css`
- `components.json`
- `src/components/`
- `src/routes/__root.tsx`

Los documentos especializados contienen el detalle completo de cada área.

---

# Índice

1. Filosofía
2. Arquitectura del Design System
3. Foundations
4. Componentes
5. Temas
6. Gobernanza
7. Documentación relacionada

---

# 1. Filosofía

Scientific Graph AI adopta una estética de software científico profesional inspirada en herramientas como:

- MATLAB
- OriginPro
- Affinity
- VS Code

No sigue Material Design ni Bootstrap.

Principios fundamentales:

- Desktop First
- Alta densidad
- Bajo contraste
- Un único color de acento
- Movimiento mínimo
- Layout estable
- Consistencia antes que creatividad

El usuario debe percibir la interfaz como un instrumento científico y no como una aplicación web.

---

# 2. Arquitectura del Design System

El sistema se organiza en cuatro niveles.

```
Design System

│

├── Foundations
│
├── Components
│
├── Patterns
│
└── Governance
```

## Foundations

Las Foundations representan la identidad visual.

- Color Tokens
- Typography
- Spacing
- Border Radius
- Shadows
- Motion
- Layout
- Iconography
- Responsive
- Accessibility

Todos estos documentos poseen su propia especificación.

---

## Tokens

Toda decisión visual nace desde tokens CSS.

```
Primitive Tokens

↓

Semantic Tokens

↓

Utilities

↓

Components

↓

Screens
```

Está prohibido declarar:

- colores
- radios
- sombras
- espaciados
- iconos

directamente dentro de componentes.

Todo debe provenir de tokens.

---

# 3. Foundations

Cada Foundation posee documentación independiente.

## Color

Describe:

- Tokens
- Temas
- OKLCH
- Semántica
- Reglas

Documento:

> COLOR_TOKENS.md

---

## Typography

Describe:

- IBM Plex Sans
- JetBrains Mono
- Escalas
- Pesos
- Jerarquía

Documento:

> TYPOGRAPHY.md

---

## Spacing

Describe:

- Grid base
- Espaciados
- Densidad
- Layout spacing

Documento:

> SPACING.md

---

## Border Radius

Documento:

> BORDER_RADIUS.md

---

## Elevation

Documento:

> ELEVATION.md

---

## Shadows

Documento:

> SHADOWS.md

---

## Motion

Documento:

> MOTION.md

---

## Layout

Documento:

> LAYOUT.md

---

## Iconography

Documento:

> ICONOGRAPHY.md

---

## Responsive

Documento:

> RESPONSIVE.md

---

## Accessibility

Documento:

> ACCESSIBILITY.md

---

# 4. Components

Los componentes poseen inventario propio.

Incluye:

- Product Components
- UI Components
- Primitive Components
- shadcn/ui

Documento:

> COMPONENT_INVENTORY.md

---

# 5. Temas

Scientific Graph AI soporta cuatro variantes.

- Light
- Dark
- High Contrast Light
- High Contrast Dark

Los temas únicamente modifican tokens.

Nunca modifican:

- layout
- tamaños
- spacing
- estructura

---

# 6. Gobernanza

Toda modificación visual debe cumplir las siguientes reglas.

## Colores

Nunca utilizar colores hardcodeados.

Siempre usar tokens.

---

## Espaciados

Siempre utilizar spacing tokens.

---

## Radios

Siempre utilizar radius tokens.

---

## Iconos

Únicamente Lucide.

Tamaños oficiales:

- 12 px
- 14 px
- 16 px

---

## Motion

Duración oficial:

100 ms

No utilizar:

- bounce
- elastic
- spring
- overshoot

---

## Layout

El layout se considera congelado.

Las mejoras deben implementarse mediante:

- tokens
- estados
- componentes

Nunca modificando la arquitectura general del workspace.

---

# 7. Documentación relacionada

## Auditoría

- LOVABLE_FRONTEND_AUDIT.md

## Roadmap UX

- UX-3_MASTER_PLAN.md

## Gap Analysis

- SCIENTIFIC_GRAPH_AI_GAP_ANALYSIS.md

## Governance

- UI_GOVERNANCE_V3.md

## Foundations

- COLOR_TOKENS.md
- TYPOGRAPHY.md
- SPACING.md
- BORDER_RADIUS.md
- ELEVATION.md
- SHADOWS.md
- MOTION.md
- LAYOUT.md
- ICONOGRAPHY.md
- RESPONSIVE.md
- ACCESSIBILITY.md

## Components

- COMPONENT_INVENTORY.md

---

# Estado

**Versión:** Design System v3

**Estado:** CONGELADO

Toda modificación futura deberá realizarse actualizando primero la documentación correspondiente y posteriormente la implementación.