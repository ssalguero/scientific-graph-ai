import type { DomainScientificProjectFile } from "../../domain/scientific-project";
import type { LocalProjectRecord } from "../../domain/local-project";
import { DEFAULT_LOCAL_PROFILE_ID } from "../../application/local-project/constants";
import type { LocalProjectWireRecord } from "./types";

export const recordToWire = (record: LocalProjectRecord): LocalProjectWireRecord => ({
  projectId: record.summary.id,
  summary: record.summary,
  metadata: record.metadata,
  envelopeJson: record.envelope.json,
  storageMeta: {
    ...record.storageMeta,
    profileId: record.storageMeta.profileId ?? DEFAULT_LOCAL_PROFILE_ID,
  },
});

export const wireToRecord = (wire: LocalProjectWireRecord): LocalProjectRecord => {
  const parsed = JSON.parse(wire.envelopeJson) as DomainScientificProjectFile;
  return {
    summary: wire.summary,
    metadata: wire.metadata,
    envelope: {
      file: parsed,
      json: wire.envelopeJson,
    },
    storageMeta: wire.storageMeta,
  };
};

export const enrichSummaryWithDraftFlag = (
  summary: LocalProjectWireRecord["summary"],
  hasDraft: boolean
) => ({
  ...summary,
  hasAutosaveDraft: hasDraft,
});
