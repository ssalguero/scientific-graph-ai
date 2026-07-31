Auditoría Arquitectónica del Frontend de Lovable
Base visual de referencia para Scientific Graph AI (UX-3)

Versión: 1.0
Estado: Documento de Arquitectura
Objetivo: Extraer principios de diseño, composición y UX, sin reutilizar código, para convertir el frontend exportado de Lovable en la referencia visual oficial de Scientific Graph AI.

1. Objetivo de la auditoría

Esta auditoría no busca copiar el proyecto de Lovable.

Su objetivo es identificar:

principios de arquitectura visual;
sistema de composición;
organización del Design System;
jerarquía visual;
patrones UX repetibles;
tokens implícitos;
consistencia entre componentes.

Todo deberá traducirse posteriormente a componentes propios de Scientific Graph AI respetando la arquitectura ya consolidada (Workspace, Surface, Navigation, Density, Layout, etc.).

2. Impresión general

La mayor fortaleza del frontend exportado no está en sus componentes individuales, sino en la extraordinaria consistencia del sistema completo.

El proyecto presenta una filosofía muy clara:

Cada pantalla parece construida mediante la composición de pocas primitivas muy bien definidas.

No existen componentes "especiales".

Todo deriva de:

Card
Stack
Surface
Typography
Spacing
Flex
Border
Radius
Tokens

Esto reduce enormemente la complejidad visual.

3. Filosofía de composición

Uno de los hallazgos más importantes.

El frontend evita componentes gigantes.

En su lugar utiliza una jerarquía muy simple:

Page

    ↓

Section

    ↓

Surface

    ↓

Header

Body

Footer

    ↓

Rows

Columns

Stacks

    ↓

Primitive Components

Todo se construye desde esta gramática.

Scientific Graph AI ya comenzó esta dirección durante UX-2 mediante:

Surface
PanelLayout
Navigation
Density

Lo que falta es completar la gramática visual.

4. Organización del Design System

El proyecto posee una separación bastante limpia.

Puede resumirse como:

Design Tokens

↓

Base UI

↓

Composite Components

↓

Feature Components

↓

Pages

Nunca ocurre al revés.

No aparecen componentes de negocio reutilizados como primitivas.

Eso mantiene el sistema escalable.

5. Tokens

El sistema está claramente tokenizado.

Se observan categorías consistentes:

Colores

No existen colores hardcodeados.

Todo deriva de variables.

Ejemplo conceptual:

Background

Foreground

Muted

Border

Primary

Secondary

Accent

Success

Warning

Danger
Radius

Hay muy pocos radios.

Algo equivalente a:

sm

md

lg

Nunca aparecen radios arbitrarios.

Border

Muy consistente.

Generalmente:

1px

border-subtle

Los bordes funcionan como separadores suaves.

Shadows

Muy pocas.

Generalmente:

pequeña
media

Nunca exageradas.

Espaciados

Extremadamente consistentes.

Se reutilizan constantemente.

No aparecen márgenes aleatorios.

6. Sistema de Layout

Muy interesante.

Todo parece construirse mediante:

Stack

↓

Flex

↓

Grid (muy poco)

Grid solo donde realmente aporta valor.

El resto es Flex.

Eso hace que:

sea responsive
sea predecible
sea fácil de extender.
7. Jerarquía visual

Uno de los mejores aspectos.

Cada pantalla sigue siempre el mismo orden:

Page Title

↓

Description

↓

Toolbar

↓

Content

↓

Cards

↓

Actions

Nunca cambia.

El usuario aprende el patrón rápidamente.

8. Surface

Probablemente el componente más importante.

Todas las áreas utilizan una misma superficie.

Siempre existe:

Background

Border

Radius

Padding

Header

Body

Scientific Graph AI ya implementó gran parte mediante:

Surface

PanelLayout

Header

Body

Footer

pero aún puede simplificarse.

9. Header

Los headers siguen una estructura muy clara.

Icon

↓

Title

↓

Description

↓

Actions

Siempre alineados.

Nunca existen posiciones arbitrarias.

10. Toolbar

La toolbar es extremadamente consistente.

Características:

altura uniforme

iconografía homogénea

espaciado constante

acciones agrupadas

acciones secundarias separadas

No existen botones "flotando".

11. Botones

Se observa una escala clara.

Primary

Secondary

Ghost

Outline

Link

Todos comparten:

altura

padding

tipografía

radio

animaciones

No hay excepciones.

12. Inputs

Todos los inputs respetan:

altura

padding

focus

border

radius

placeholder

Esto genera mucha coherencia.

13. Cards

Las cards son muy simples.

No intentan ser protagonistas.

Son únicamente contenedores.

Características:

padding consistente

border suave

background uniforme

header opcional

acciones alineadas

14. Listas

Patrón repetido:

Header

↓

Rows

↓

Divider

↓

Hover

Las filas nunca poseen demasiada información.

Muy buena densidad visual.

15. Tablas

Aunque el proyecto no posee tablas extremadamente complejas, el patrón es consistente:

cabecera limpia

tipografía pequeña

alineaciones correctas

espaciados constantes

hover muy sutil

16. Navegación

Muy buena separación.

Generalmente:

Sidebar

↓

Breadcrumb

↓

Title

↓

Content

Nunca se mezclan.

17. Sidebar

Características:

ancho constante

iconografía consistente

agrupación lógica

espaciado uniforme

Muy pocas variantes.

18. Tipografía

Muy buena disciplina.

Escala reducida.

No aparecen decenas de tamaños.

Normalmente:

Title

Subtitle

Body

Caption

Label

Eso mejora muchísimo la consistencia.

19. Iconografía

Muy uniforme.

Mismo peso.

Mismo tamaño.

Nunca se mezclan estilos.

20. Espaciado

Uno de los puntos más fuertes.

Todo parece alinearse a una escala pequeña de spacing.

No existen valores arbitrarios.

Esto hace que todo "respire" correctamente.

21. Color

El color se utiliza con mucha moderación.

El énfasis se logra mediante:

espacio

tipografía

peso

jerarquía

No mediante colores intensos.

22. Animaciones

Muy discretas.

Generalmente:

hover

focus

opacity

transform pequeño

No existen animaciones distractoras.

23. Responsive

El layout parece responder mediante:

Stack

↓

Collapse

↓

Flex

Más que mediante layouts completamente distintos.

Muy buena decisión arquitectónica.

24. Organización de componentes

Se distingue claramente:

Primitive

↓

Composed

↓

Feature

↓

Application

Esta separación debería mantenerse en Scientific Graph AI.

25. Consistencia

Quizás el aspecto más destacable.

No sobresalen componentes individuales.

Sobresale la repetición.

Eso transmite sensación de producto profesional.

26. Debilidades detectadas

Aunque el resultado visual es muy sólido, también se observan limitaciones relevantes desde el punto de vista de una aplicación profesional compleja como Scientific Graph AI.

Dependencia fuerte de shadcn/ui

La arquitectura de composición está claramente influenciada por shadcn/ui.

Esto aporta velocidad de desarrollo, pero introduce un acoplamiento conceptual que no conviene trasladar a Scientific Graph AI, donde ya existe un sistema propio de componentes y gobernanza.

Diseño orientado a aplicaciones CRUD

El frontend está optimizado para dashboards administrativos y aplicaciones de gestión.

Scientific Graph AI necesita soportar:

múltiples paneles acoplables;
canvas científico;
inspector avanzado;
ventanas flotantes;
sesiones de trabajo;
visualizaciones complejas.

Esto exige una gramática de layout más rica.

Escasa parametrización semántica

Muchos patrones visuales dependen de clases utilitarias más que de primitivas semánticas explícitas.

En Scientific Graph AI conviene mantener la estrategia actual de componentes semánticos (Surface, PanelLayout, Navigation, etc.) para preservar la independencia tecnológica.

Densidad fija

El sistema utiliza una densidad visual bastante uniforme.

Scientific Graph AI ya introdujo un sistema de Density que puede convertirse en una ventaja competitiva al permitir espacios de trabajo compactos o cómodos sin romper la consistencia.

27. Correspondencia con Scientific Graph AI

La auditoría muestra que una parte importante de la infraestructura necesaria ya fue construida durante UX-2.

Lovable	Scientific Graph AI
Surface	✅ Surface
Header	✅ PanelLayout Header
Body	✅ PanelLayout Body
Footer	✅ PanelLayout Footer
Navigation	✅ Navigation
Density	✅ Density
Layout Regions	✅ Layout
Workspace	✅ Workspace Foundation

La diferencia principal ya no es estructural, sino de refinamiento visual y de consolidación de primitivas reutilizables.

28. Principios que deben adoptarse
Composición antes que componentes grandes.
Tokens como única fuente de verdad visual.
Escala tipográfica reducida y consistente.
Escala de espaciado estricta.
Uso moderado del color como elemento de énfasis.
Superficies homogéneas para todos los paneles.
Headers con estructura uniforme.
Acciones agrupadas y jerarquizadas.
Separación clara entre primitivas, compuestos y componentes de negocio.
Repetición deliberada de patrones para favorecer el aprendizaje del usuario.
29. Principios que NO deben migrarse
Dependencia conceptual de shadcn/ui.
Clases utilitarias como mecanismo principal de composición.
Componentes acoplados a casos CRUD.
Densidad única para todas las vistas.
Mezcla de responsabilidades entre presentación y lógica de negocio.
30. Roadmap propuesto para UX-3

La migración visual debería abordarse como una evolución del sistema existente, no como un reemplazo.

Fase A — Primitivas visuales
Consolidar la gramática visual sobre Surface, PanelLayout, Navigation y Density.
Incorporar primitivas de Stack, Inline, Cluster y Spacer con tokens compartidos.
Fase B — Sistema de tipografía y espaciado
Definir escalas tipográficas oficiales.
Unificar padding, gaps y radios mediante tokens semánticos.
Eliminar valores ad hoc.
Fase C — Componentes compuestos
Toolbar.
Action Groups.
Cards especializadas.
Headers enriquecidos.
Listas y tablas con comportamiento uniforme.
Fase D — Refinamiento de Workspace
Aplicar la nueva gramática a Explorer, Inspector, Console, Canvas y futuras ventanas.
Verificar consistencia entre paneles acoplados y flotantes.
Fase E — Auditoría de consistencia
Incorporar validadores de gobernanza visual (similares a los existentes en UX-2) para detectar desviaciones de tokens, espaciado y composición.
Conclusión

El frontend de Lovable destaca por la solidez de su lenguaje visual, no por la complejidad de sus componentes. Su mayor aporte para Scientific Graph AI es demostrar que un conjunto reducido de primitivas, tokens y reglas de composición puede producir una experiencia altamente coherente y profesional.

Scientific Graph AI ya dispone, tras UX-2, de una base arquitectónica compatible. La estrategia recomendada para UX-3 no es replicar implementaciones, sino completar esa infraestructura con una gramática visual propia, inspirada en los principios observados, reforzando la separación entre primitivas, componentes compuestos y funcionalidades científicas. Esta aproximación preserva la identidad del proyecto, mantiene la gobernanza existente y permite evolucionar hacia una interfaz de nivel profesional sin introducir dependencias innecesarias.