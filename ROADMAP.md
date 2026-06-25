# Scientific Graph AI — Roadmap

**Actualizado:** 2026-06-24 (cierre Sprint QA-1)

---

## Estado actual

| Bloque | Estado |
|--------|--------|
| Núcleo científico SCI-1 → SCI-60 | **Validado** (QA-1 + gates automatizados) |
| ARCH-5 Fases 1–4 | **COMPLETED** |
| PROD-1A / PROD-2A | **COMPLETED** |
| DATA-3A / HOTFIX-DATA-3A | **COMPLETED** |
| UX-1A.1 LITE | **COMPLETED** |
| Sprint QA-1 (Validación Manual) | **CERRADO** |

Referencia de estado detallado: [`PROJECT_STATUS_SCI_56.md`](./PROJECT_STATUS_SCI_56.md)

---

## Sprint QA-1 — CERRADO

Validación manual end-to-end completada sobre la arquitectura actual (progressive disclosure, toggles default OFF, workflow SCI-59). Gate `npm run validate:full` — **PASS**.

Protocolo: [`QA-1_MANUAL_VALIDATION_PROTOCOL.md`](./QA-1_MANUAL_VALIDATION_PROTOCOL.md)

---

## Próxima etapa

### SCI-58 v2 — Comparación científica ampliada

**Estado:** Planificado — **no implementado**

Bloque principal evolutivo tras el cierre de QA-1. Parte de la base cerrada de SCI-58 v1 (ARCH-5 F4: dominio `comparison/`, dashboard `components/comparison/`, slots A/B, perfiles read-only).

**Alcance previsto (candidato, sujeto a diseño):**

- Comparación ampliada más allá de dos slots (N>2)
- Integración con reporte científico / PDF multi-dataset
- Persistencia extendida de perfiles comparativos entre sesiones
- Comparación de series completas o dimensiones adicionales

**Fuera de alcance inmediato:** no modificar motores SCI-50→60 ni recalcular scores en la capa de comparación (principio read-only heredado de v1).

---

## Candidatos posteriores (sin priorización)

| Candidato | Descripción |
|-----------|-------------|
| **PROD-1B** | Validación avanzada de importación + reportes completos |
| **ARCH-5 Fase 4+** | Metodología SCI-50→56 en módulos, reporting, PDF |
| **ARCH-6** | Mejoras UX: estado persistente Constructor Visual por dataset; refinamiento progressive disclosure |
| **PROD-1 v1.1** | Multi-serie side-by-side (RW-04) |
| **SCI-59 v1.1** | Branching condicional avanzado, persistencia workflow |

---

## Histórico de hitos cerrados

SCI-55 → SCI-60 · SCI-58 v1 · SCI-59 · ARCH-5 F1–F4 · PROD-1A · PROD-2A · HOTFIX-SCI-EXPERIMENTAL-VIEWPORT-1 · UX-1A.1 LITE · DATA-3A · **QA-1**
