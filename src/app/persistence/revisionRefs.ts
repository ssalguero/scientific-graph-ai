import type { DetectPersistenceConflictInput } from "@/lib/project/application/persistence-conflict";
import type { LocalProjectSummary } from "@/lib/project/domain/local-project";
import type { ProjectMetadataV1 } from "@/lib/project";
import { isScientificProjectFileV2 } from "@/lib/project/adapters/sgproj/envelope";
import { migrateProjectJson } from "@/lib/project/migrate";

export const buildSessionRevisionRef = (
  metadata: ProjectMetadataV1
): NonNullable<DetectPersistenceConflictInput["sessionRevision"]> => ({
  projectId: metadata.id,
  updatedAt: metadata.updatedAt,
  source: "session",
});

export const buildLocalCommittedRevisionRef = (
  summary: LocalProjectSummary
): NonNullable<DetectPersistenceConflictInput["localCommittedRevision"]> => ({
  projectId: summary.id,
  updatedAt: summary.updatedAt,
  source: "local-committed",
});

export const buildIncomingRevisionFromSgprojText = (
  text: string
):
  | {
      ok: true;
      revision: DetectPersistenceConflictInput["incomingRevision"];
      metadata: ProjectMetadataV1;
    }
  | { ok: false } => {
  const migrated = migrateProjectJson(text);
  if (!migrated.ok || !isScientificProjectFileV2(migrated.file)) {
    return { ok: false };
  }

  const metadata = migrated.file.project.metadata;
  return {
    ok: true,
    metadata,
    revision: {
      projectId: metadata.id,
      updatedAt: metadata.updatedAt,
      exportedAt: migrated.file.exportedAt,
      source: "sgproj-file",
    },
  };
};
