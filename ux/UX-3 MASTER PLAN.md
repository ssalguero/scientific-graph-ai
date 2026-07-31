UX-3 MASTER PLAN
1 Executive Summary

Explicar en una página:

Lovable será la referencia visual.
Cursor mantiene la arquitectura.
No se copia código.
Se migra únicamente diseño y UX.
Todo componente debe cumplir la gobernanza existente.
2 Objectives

Objetivos principales:

UI Production Ready
Pixel consistency
Token consistency
Responsive
Accesibilidad
Dark mode
Animaciones
Componentización
3 Scope

Qué entra.

Por ejemplo

✅

Layout

Spacing

Cards

Dialogs

Tables

Toolbar

Sidebar

Panels

Forms

Typography

Buttons

Charts UI

Icons

Loading

Empty states

Hover

Focus

Transitions

No entra:

motor matemático

persistencia

supabase

autosave

sessions

graph engine

4 Non Goals

Muy importante.

No modificar:

API

Stores

Context

Business Logic

Persistence

Graph Engine

Window Engine

Session Engine

5 Current Architecture

Resumen de lo existente.

NextJS

src/

app/

components/

workspace/

windows/

layout/

session/

...


Mencionar:

Design Tokens v2
Window System
Session System
Inspector
Toolbar
Sidebar
Layout Engine
6 Target Architecture

Mostrar la arquitectura final.

Ejemplo

UI

↓

Design Tokens

↓

Primitives

↓

Layout

↓

Workspace

↓

Scientific Components

↓

Application
7 Migration Strategy

Esta es la parte más importante.

Explicar:

Nunca copiar código.

Cada componente:

Lovable

↓

Auditoría

↓

Gap Analysis

↓

Diseño

↓

Implementación limpia

↓

Tests

↓

Validación
8 Execution Phases

Aquí listar todas las etapas UX-3.

Por ejemplo.

UX-3.1

Token Audit

UX-3.2

Primitive Audit

UX-3.3

Layout Audit

UX-3.4

Navigation

UX-3.5

Workspace

UX-3.6

Panels

UX-3.7

Cards

UX-3.8

Dialogs

UX-3.9

Tables

UX-3.10

Forms

UX-3.11

Charts Visual

UX-3.12

Animations

UX-3.13

Accessibility

UX-3.14

Responsive

UX-3.15

Production Polish

9 Dependencies

Relacionar con:

SCIENTIFIC_GRAPH_AI_GAP_ANALYSIS.md

UI_GOVERNANCE_V3.md

Design Tokens

Component Library

Architecture Freeze

10 Risks

Ejemplo

Duplicación de componentes

Inconsistencia de tokens

CSS específico

Tailwind utility leaks

Inline styles

Dependencias ocultas

11 Validation Gates

Cada etapa debe aprobar:

✓

TypeScript

ESLint

Validators

API Freeze

Token Freeze

No Inline Styles

No Logic Changes

Visual QA

Responsive QA

Accessibility QA

12 Completion Criteria

UX-3 termina únicamente cuando:

100% de componentes auditados

100% migrados

100% documentados

100% validados

0 deuda visual

0 inline style

0 tokens duplicados

13 Deliverables

Lista final.

UX-3_MASTER_PLAN.md
SCIENTIFIC_GRAPH_AI_GAP_ANALYSIS.md
UI_GOVERNANCE_V3.md
Component Audit
Token Audit
Migration Checklist
Visual QA Report
Final UX Certification
Relación con los otros documentos

Los tres documentos se complementan así:

Documento	Propósito
UX-3_MASTER_PLAN.md	Define la estrategia, alcance, fases y criterios de éxito de toda la migración UX.
SCIENTIFIC_GRAPH_AI_GAP_ANALYSIS.md	Inventario detallado de diferencias entre el frontend exportado de Lovable y la implementación actual en Cursor, con prioridades y acciones.
UI_GOVERNANCE_V3.md	Reglas permanentes de diseño e implementación: design tokens, composición de componentes, nomenclatura, accesibilidad, responsive, animaciones y criterios de validación.

Esta separación mantiene un único documento de planificación (qué y cuándo), uno de diagnóstico (qué falta) y uno normativo (cómo debe implementarse), evitando duplicación de contenido y facilitando el mantenimiento a largo plazo.