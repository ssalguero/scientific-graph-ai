1. Purpose

Define que este documento es la única fuente de verdad del frontend.

Nada puede agregarse si viola este documento.

2. Design Philosophy

Debe explicar ideas como:

Minimalismo científico
Alta densidad sin caos
Información primero
Espacios consistentes
Contraste suficiente
Cero decoración gratuita
3. Token Governance

Reglas como:

NO hardcoded colors

NO hardcoded spacing

NO hardcoded radius

NO font-size inline

NO box-shadow inline

Everything must use tokens.
4. Color System

Definir:

Primary

Secondary

Success

Danger

Warning

Neutral

Surface

Border

Canvas

Background

Elevation

Nunca colores arbitrarios.

5. Typography

Debe congelar:

Display

H1

H2

H3

Body

Small

Caption

Mono

Line heights

Letter spacing

Weights

Nada inline.

6. Spacing

Escala oficial.

Ejemplo:

0
2
4
8
12
16
20
24
32
40
48
64
80
96

No márgenes aleatorios.

7. Radius

Por ejemplo

2
4
6
8
12
16
24
pill

No radios distintos.

8. Shadows

Una escala única.

shadow-xs

shadow-sm

shadow-md

shadow-lg

shadow-xl
9. Motion

Duraciones

100

150

200

250

300

Curvas

ease-out

ease-in-out


Nada superior a 300ms salvo excepciones.

10. Iconography

Un único set.

Mismo tamaño.

Mismo stroke.

Mismo padding.

11. Layout Rules

Aquí debe vivir todo lo relacionado con:

Grid

Containers

Paneles

Inspector

Toolbar

Sidebar

Workspace

Dock

Padding

Gap

Alineaciones

12. Component Rules

Cada componente debe tener:

Estados

Hover

Focus

Disabled

Selected

Loading

Error

13. Accessibility

AA mínimo.

Focus visible.

Contraste.

Keyboard navigation.

ARIA.

14. Interaction Rules

Hover consistente.

Cursor.

Animaciones.

Click areas.

No sorpresas.

15. Responsive

Desktop primero.

Breakpoints oficiales.

No media queries arbitrarias.

16. Window System

Congelar reglas del sistema de ventanas.

Header

Tabs

Resize

Snap

Dock

Floating

Z-index

Elevation

17. Charts

Muy importante para Scientific Graph.

Debe incluir:

Grid

Axis

Legend

Tooltip

Selection

Colors

Series

Density

Spacing

Crosshair

Markers

18. Empty States

Debe definir:

Ilustración

Título

Descripción

CTA

Nunca pantallas vacías.

19. Loading

Skeleton

Spinner

Progress

Placeholder

20. Error

Mensajes

Recovery

Retry

Severity

21. Data Density

Debe documentar la filosofía de densidad.

Compact

Comfortable

Presentation

Todo mediante tokens.

22. Scientific Rules

Esta sección es exclusiva del proyecto.

Ejemplos:

No gradientes decorativos.

No glassmorphism.

No neumorphism.

No sombras exageradas.

No colores saturados.

No animaciones llamativas.

El gráfico siempre tiene prioridad visual.

Los datos nunca quedan ocultos por decoración.

23. Code Rules

Muy importante.

Ejemplos:

No inline styles

No magic numbers

No duplicated tokens

No duplicated components

Composition first

Accessibility mandatory

Design token only

Strict typing

No UI state leaks

Reusable primitives
24. Review Checklist

Lista obligatoria antes de aprobar un PR.

Ejemplo:

✓ Uses tokens

✓ Responsive

✓ Accessible

✓ No duplicated styles

✓ Hover

✓ Focus

✓ Loading

✓ Empty

✓ Error

✓ Dark mode

✓ Density compatible

✓ Motion compliant
25. Future Evolution

Explicar cómo puede evolucionar el sistema.

Toda nueva regla debe:

ser documentada,
mantener compatibilidad con el Design System,
no romper componentes existentes,
pasar auditoría visual antes de incorporarse.
Resultado esperado

Al finalizar UX-3, estos tres documentos tendrán responsabilidades claramente separadas:

Documento	Responsabilidad
SCIENTIFIC_GRAPH_AI_GAP_ANALYSIS.md	Identifica y prioriza las diferencias entre el frontend actual y la referencia visual exportada desde Lovable.
UX-3_MASTER_PLAN.md	Define la estrategia, fases, orden de ejecución y criterios de certificación para la migración visual.
UI_GOVERNANCE_V3.md	Establece las normas permanentes del sistema visual y de componentes; actúa como la constitución del frontend para evitar regresiones futuras.