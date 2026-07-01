import type { DomainScientificProjectFile } from "../../domain/scientific-project";
import {
  toPrimaryDatasetId,
  toSequencedDatasetId,
  parseSequencedDatasetId,
  isPrimaryMigratedDatasetId,
} from "../../domain/dataset-id-policy";
import type { ScientificProjectV2 } from "../../domain/types-v2";

const remapDatasetIdsForNewProject = (
  project: ScientificProjectV2,
  oldProjectId: string,
  newProjectId: string
): ScientificProjectV2 => {
  const idMap = new Map<string, string>();
  let sequence = 1;
  for (const dataset of project.datasets) {
    let newId: string;
    if (isPrimaryMigratedDatasetId(dataset.id, oldProjectId)) {
      newId = toPrimaryDatasetId(newProjectId);
    } else {
      const sequenced = parseSequencedDatasetId(dataset.id);
      if (sequenced && sequenced.projectMetadataId === oldProjectId) {
        newId = toSequencedDatasetId(newProjectId, sequenced.sequence);
      } else {
        sequence += 1;
        newId = toSequencedDatasetId(newProjectId, sequence);
      }
    }
    idMap.set(dataset.id, newId);
  }

  const remapId = (id: string | null | undefined): string | null | undefined => {
    if (id == null) return id;
    return idMap.get(id) ?? id;
  };

  const activeDatasetId =
    remapId(project.activeDatasetId) ?? toPrimaryDatasetId(newProjectId);

  return {
    ...project,
    metadata: {
      ...project.metadata,
      id: newProjectId,
    },
    datasets: project.datasets.map((dataset) => ({
      ...dataset,
      id: idMap.get(dataset.id) ?? dataset.id,
    })),
    activeDatasetId: activeDatasetId as string,
    comparison: {
      slots: {
        A: {
          ...project.comparison.slots.A,
          sourceDatasetId: remapId(project.comparison.slots.A.sourceDatasetId) ?? null,
        },
        B: {
          ...project.comparison.slots.B,
          sourceDatasetId: remapId(project.comparison.slots.B.sourceDatasetId) ?? null,
        },
      },
    },
    visualGraphs: project.visualGraphs?.map((entry) => ({
      ...entry,
      sourceDatasetId:
        (remapId(entry.sourceDatasetId) as string) ?? entry.sourceDatasetId,
    })),
  };
};

export const duplicateEnvelopeForNewProject = (
  sourceFile: DomainScientificProjectFile,
  _sourceJson: string,
  newProjectId: string,
  newName: string,
  createdAt: string,
  updatedAt: string
): { file: DomainScientificProjectFile; json: string } => {
  const oldProjectId = sourceFile.project.metadata.id;
  const remappedProject = remapDatasetIdsForNewProject(
    sourceFile.project as ScientificProjectV2,
    oldProjectId,
    newProjectId
  );
  remappedProject.metadata = {
    ...remappedProject.metadata,
    id: newProjectId,
    name: newName,
    createdAt,
    updatedAt,
    revisionHistory: undefined,
    cloudRef: undefined,
  };
  const file: DomainScientificProjectFile = {
    ...sourceFile,
    exportedAt: updatedAt,
    project: remappedProject,
  };
  return {
    file,
    json: JSON.stringify(file),
  };
};
