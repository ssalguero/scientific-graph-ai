import { PROJECT_KIND } from "../constants";

import {
  DOMAIN_SCHEMA_VERSION_V1,
  type ScientificProjectV1,
} from "./types-v1";
import {
  DOMAIN_SCHEMA_VERSION_V2,
  type ScientificProjectV2,
} from "./types-v2";

export type DomainSchemaVersion =
  | typeof DOMAIN_SCHEMA_VERSION_V1
  | typeof DOMAIN_SCHEMA_VERSION_V2;

export type ScientificProject = ScientificProjectV1 | ScientificProjectV2;

export type DomainScientificProjectFile = {
  kind: typeof PROJECT_KIND;
  schemaVersion: DomainSchemaVersion;
  appVersion: string;
  exportedAt: string;
  project: ScientificProject;
};

export const isScientificProjectV1 = (
  project: ScientificProject
): project is ScientificProjectV1 =>
  "dataset" in project && !("datasets" in project);

export const isScientificProjectV2 = (
  project: ScientificProject
): project is ScientificProjectV2 =>
  "datasets" in project && "activeDatasetId" in project;

export const isDomainProjectFileV1 = (
  file: DomainScientificProjectFile
): file is DomainScientificProjectFile & {
  schemaVersion: typeof DOMAIN_SCHEMA_VERSION_V1;
  project: ScientificProjectV1;
} =>
  file.schemaVersion === DOMAIN_SCHEMA_VERSION_V1 &&
  isScientificProjectV1(file.project);

export const isDomainProjectFileV2 = (
  file: DomainScientificProjectFile
): file is DomainScientificProjectFile & {
  schemaVersion: typeof DOMAIN_SCHEMA_VERSION_V2;
  project: ScientificProjectV2;
} =>
  file.schemaVersion === DOMAIN_SCHEMA_VERSION_V2 &&
  isScientificProjectV2(file.project);

export const getDomainSchemaVersion = (
  project: ScientificProject
): DomainSchemaVersion =>
  isScientificProjectV2(project)
    ? DOMAIN_SCHEMA_VERSION_V2
    : DOMAIN_SCHEMA_VERSION_V1;
