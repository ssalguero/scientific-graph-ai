/**
 * PLUGINS-I8 — Diagnostic bundle / health models (read-only).
 */

import type { DiagnosticEntry, DiagnosticSubsystem } from "./descriptors";

export type ComponentHealth = {
  readonly __kind: "ComponentHealth";
  readonly subsystem: DiagnosticSubsystem;
  readonly status: "Healthy" | "Degraded" | "Unknown" | "Unhealthy";
  readonly entryCount: number;
};

export type DiagnosticBundle = {
  readonly __kind: "DiagnosticBundle";
  readonly __readOnly: true;
  readonly __mutatesState: false;
  readonly entries: readonly DiagnosticEntry[];
  readonly entryCount: number;
  readonly bySubsystem: readonly ComponentHealth[];
};

export function createEmptyDiagnosticBundle(): DiagnosticBundle {
  return {
    __kind: "DiagnosticBundle",
    __readOnly: true,
    __mutatesState: false,
    entries: [],
    entryCount: 0,
    bySubsystem: [],
  };
}

export function summarizeBySubsystem(
  entries: readonly DiagnosticEntry[],
): readonly ComponentHealth[] {
  const map = new Map<DiagnosticSubsystem, DiagnosticEntry[]>();
  for (const e of entries) {
    const list = map.get(e.subsystem) ?? [];
    list.push(e);
    map.set(e.subsystem, list);
  }
  return [...map.entries()].map(([subsystem, list]) => {
    const hasError = list.some((x) => x.severity === "Error");
    const hasWarning = list.some((x) => x.severity === "Warning");
    return {
      __kind: "ComponentHealth" as const,
      subsystem,
      status: hasError
        ? ("Unhealthy" as const)
        : hasWarning
          ? ("Degraded" as const)
          : list.length > 0
            ? ("Healthy" as const)
            : ("Unknown" as const),
      entryCount: list.length,
    };
  });
}
