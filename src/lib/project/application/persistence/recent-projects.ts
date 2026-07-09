import type {
  LocalProjectRepository,
  LocalProjectSummary,
} from "../../domain/local-project";
import { listLocalProjects } from "../local-project";

import type { RecentProjectsQuery } from "./types";

const DEFAULT_RECENT_PROJECTS_LIMIT = 10;

const resolveLimit = (limit: number | undefined): number => {
  if (limit === undefined) {
    return DEFAULT_RECENT_PROJECTS_LIMIT;
  }
  if (!Number.isFinite(limit)) {
    return DEFAULT_RECENT_PROJECTS_LIMIT;
  }
  const truncated = Math.trunc(limit);
  if (truncated < 1) {
    return DEFAULT_RECENT_PROJECTS_LIMIT;
  }
  return truncated;
};

export const listRecentProjects = async (
  repo: LocalProjectRepository,
  query?: RecentProjectsQuery
): Promise<LocalProjectSummary[]> => {
  const orderBy = query?.orderBy ?? "lastAccessedAt";
  const limit = resolveLimit(query?.limit);
  const all = await listLocalProjects(repo, orderBy);
  return all.slice(0, limit);
};
