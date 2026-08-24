import {
  freezeVgbFigureLifecycleStore,
  freezeVgbPublicationFigureArtifact,
  isVgbFigureLifecycleStore,
  isVgbPublicationFigureArtifact,
  isVgbWorkingFigureRecord,
  reviveCitableScientificSnapshot,
  SCIENTIFIC_VGB_FIGURE_LIFECYCLE_STORE_SCHEMA,
  type VgbFigureLifecycleStore,
  type VgbPublicationFigureArtifact,
  type VgbWorkingFigureRecord,
} from "@/lib/scientific/contracts";

export const VGB_FIGURE_LIFECYCLE_PROJECT_EXTENSION_KEY =
  "scientific-graph-ai.vgb-figure-lifecycle/v1" as const;

type ProjectWithExtensions = {
  extensions?: Record<string, unknown>;
};

const emptyStore = (): VgbFigureLifecycleStore =>
  freezeVgbFigureLifecycleStore({
    schema: SCIENTIFIC_VGB_FIGURE_LIFECYCLE_STORE_SCHEMA,
    working: [],
    publications: [],
  });

const revivePublication = (
  value: unknown
): VgbPublicationFigureArtifact | null => {
  if (!isVgbPublicationFigureArtifact(value)) {
    return null;
  }
  const snapshot = reviveCitableScientificSnapshot(value.snapshot);
  if (!snapshot) {
    return null;
  }
  return freezeVgbPublicationFigureArtifact({ ...value, snapshot });
};

export const reviveVgbFigureLifecycleStore = (
  value: unknown
): VgbFigureLifecycleStore | null => {
  if (!isVgbFigureLifecycleStore(value)) {
    return null;
  }
  const publications = value.publications
    .map((artifact) => revivePublication(artifact))
    .filter((artifact): artifact is VgbPublicationFigureArtifact => artifact !== null);
  if (publications.length !== value.publications.length) {
    return null;
  }
  const working = value.working.filter(isVgbWorkingFigureRecord);
  if (working.length !== value.working.length) {
    return null;
  }
  return freezeVgbFigureLifecycleStore({
    schema: SCIENTIFIC_VGB_FIGURE_LIFECYCLE_STORE_SCHEMA,
    working,
    publications,
  });
};

export const getVgbFigureLifecycleStoreFromExtensions = (
  extensions: Record<string, unknown> | undefined
): VgbFigureLifecycleStore => {
  if (!extensions) {
    return emptyStore();
  }
  const raw = extensions[VGB_FIGURE_LIFECYCLE_PROJECT_EXTENSION_KEY];
  return reviveVgbFigureLifecycleStore(raw) ?? emptyStore();
};

export const setVgbFigureLifecycleStoreOnExtensions = (
  extensions: Record<string, unknown> | undefined,
  store: VgbFigureLifecycleStore
): Record<string, unknown> => {
  if (!isVgbFigureLifecycleStore(store)) {
    throw new Error("Cannot persist a malformed VGB figure lifecycle store.");
  }
  return {
    ...(extensions ?? {}),
    [VGB_FIGURE_LIFECYCLE_PROJECT_EXTENSION_KEY]: freezeVgbFigureLifecycleStore(store),
  };
};

export const upsertWorkingVgbFigureRecord = (
  store: VgbFigureLifecycleStore,
  record: VgbWorkingFigureRecord
): VgbFigureLifecycleStore => {
  const without = store.working.filter((item) => item.figureId !== record.figureId);
  return freezeVgbFigureLifecycleStore({
    ...store,
    working: [...without, record],
  });
};

export const appendVgbPublicationFigure = (
  store: VgbFigureLifecycleStore,
  artifact: VgbPublicationFigureArtifact
): VgbFigureLifecycleStore => {
  if (store.publications.some((item) => item.publicationId === artifact.publicationId)) {
    throw new Error("Publication figure identity must remain unique.");
  }
  return freezeVgbFigureLifecycleStore({
    ...store,
    publications: [...store.publications, artifact],
  });
};

export const getVgbFigureLifecycleStoreFromProject = (
  project: ProjectWithExtensions
): VgbFigureLifecycleStore =>
  getVgbFigureLifecycleStoreFromExtensions(project.extensions);

export const setVgbFigureLifecycleStoreOnProject = <T extends ProjectWithExtensions>(
  project: T,
  store: VgbFigureLifecycleStore
): T => ({
  ...project,
  extensions: setVgbFigureLifecycleStoreOnExtensions(project.extensions, store),
});
