import {
  assessScientificSnapshotFreshness,
  projectCitableScientificSnapshot,
  type ScientificFreshnessAssessment,
  type ScientificProjectionSurface,
  type ScientificSemanticProjection,
} from "@/lib/scientific/contracts";
import { createScientificNumericExport } from "@/lib/scientific/export";
import { buildVisualGraphSemanticProjection } from "@/lib/scientific/projection/visual-graph";
import type { ScientificProvenanceDescriptor } from "@/lib/scientific/contracts";
import type { ProjectVisualGraphEntry } from "@/lib/visualGraphBuilder";
import type { VgbPublicationFigureArtifact } from "@/lib/scientific/contracts";

export const projectWorkingVgbFigure = (input: {
  entry: ProjectVisualGraphEntry;
  provenance: ScientificProvenanceDescriptor;
  surface?: Extract<ScientificProjectionSurface, "results" | "figure">;
}): ScientificSemanticProjection =>
  buildVisualGraphSemanticProjection({
    entry: input.entry,
    provenance: input.provenance,
    surface: input.surface,
  });

export const projectPublicationVgbFigure = (input: {
  artifact: VgbPublicationFigureArtifact;
  surface: ScientificProjectionSurface;
  currentProvenance?: ScientificProvenanceDescriptor | null;
}): ScientificSemanticProjection => {
  const freshness: ScientificFreshnessAssessment =
    assessScientificSnapshotFreshness({
      snapshot: input.artifact.snapshot,
      currentResultContractId: input.artifact.snapshot.resultContractId,
      currentProvenance: input.currentProvenance ?? input.artifact.snapshot.provenance,
      sourceAvailable: true,
    });
  return projectCitableScientificSnapshot(
    input.artifact.snapshot,
    input.surface,
    freshness
  );
};

export const createPublicationVgbFigureNumericExport = (
  artifact: VgbPublicationFigureArtifact
) =>
  createScientificNumericExport({
    projection: projectPublicationVgbFigure({
      artifact,
      surface: "numeric-export-foundation",
    }),
  });
