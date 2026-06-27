import {
  CURRENT_SCHEMA_VERSION,
  PROJECT_KIND,
  SCHEMA_VERSION_V1,
  SCHEMA_VERSION_V2,
} from "../../constants";
import {
  isDomainProjectFileV1,
  isDomainProjectFileV2,
  type DomainScientificProjectFile,
} from "../../domain";
import type {
  ProjectSchemaVersion,
  ScientificProjectFile,
  ScientificProjectFileV1,
  ScientificProjectFileV2,
} from "../../types";

export const isScientificProjectFileV1 = (
  file: ScientificProjectFile
): file is ScientificProjectFileV1 => file.schemaVersion === SCHEMA_VERSION_V1;

export const isScientificProjectFileV2 = (
  file: ScientificProjectFile
): file is ScientificProjectFileV2 => file.schemaVersion === SCHEMA_VERSION_V2;

export const toDomainScientificProjectFile = (
  file: ScientificProjectFile
): DomainScientificProjectFile => file as DomainScientificProjectFile;

export const fromDomainScientificProjectFile = (
  file: DomainScientificProjectFile
): ScientificProjectFile => file as ScientificProjectFile;

export const buildSgprojEnvelope = (input: {
  schemaVersion: ProjectSchemaVersion;
  appVersion: string;
  exportedAt: string;
  project: ScientificProjectFile["project"];
}): ScientificProjectFile =>
  ({
    kind: PROJECT_KIND,
    schemaVersion: input.schemaVersion,
    appVersion: input.appVersion,
    exportedAt: input.exportedAt,
    project: input.project,
  }) as ScientificProjectFile;

export const assertDomainFileShape = (
  file: DomainScientificProjectFile
): boolean => {
  if (file.schemaVersion === SCHEMA_VERSION_V1) {
    return isDomainProjectFileV1(file);
  }
  if (file.schemaVersion === SCHEMA_VERSION_V2) {
    return isDomainProjectFileV2(file);
  }
  return false;
};

export const CURRENT_SGPROJ_SCHEMA_VERSION = CURRENT_SCHEMA_VERSION;
