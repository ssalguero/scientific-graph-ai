import type { DomainScientificProjectFile } from "../../domain/scientific-project";
import { isRecord, isString } from "../../domain/guards";

/**
 * Minimal JSON patch for rename — updates project.metadata.name and updatedAt
 * without running collect/serialize pipeline.
 */
export const patchEnvelopeMetadataName = (
  envelopeJson: string,
  newName: string,
  updatedAt: string
): { json: string; file: DomainScientificProjectFile } => {
  const parsed: unknown = JSON.parse(envelopeJson);
  if (!isRecord(parsed) || !isRecord(parsed.project)) {
    throw new Error("Invalid envelope shape for metadata patch");
  }
  const project = parsed.project;
  const metadata = isRecord(project.metadata) ? { ...project.metadata } : {};
  metadata.name = newName;
  metadata.updatedAt = updatedAt;
  project.metadata = metadata;
  parsed.exportedAt = updatedAt;
  const json = JSON.stringify(parsed);
  return { json, file: parsed as DomainScientificProjectFile };
};

export const patchEnvelopeProjectId = (
  envelopeJson: string,
  newProjectId: string,
  newName: string,
  createdAt: string,
  updatedAt: string
): { json: string; file: DomainScientificProjectFile } => {
  const parsed: unknown = JSON.parse(envelopeJson);
  if (!isRecord(parsed) || !isRecord(parsed.project)) {
    throw new Error("Invalid envelope shape for id patch");
  }
  const project = parsed.project;
  const metadata = isRecord(project.metadata) ? { ...project.metadata } : {};
  metadata.id = newProjectId;
  metadata.name = newName;
  metadata.createdAt = createdAt;
  metadata.updatedAt = updatedAt;
  delete metadata.revisionHistory;
  delete metadata.cloudRef;
  project.metadata = metadata;
  parsed.exportedAt = updatedAt;
  const json = JSON.stringify(parsed);
  return { json, file: parsed as DomainScientificProjectFile };
};
