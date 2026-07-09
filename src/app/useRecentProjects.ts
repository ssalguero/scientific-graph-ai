"use client";

import { useCallback, useState } from "react";

import { listRecentProjects } from "@/lib/project/application/persistence";

type RecentProjectsRepo = Parameters<typeof listRecentProjects>[0];
type RecentProjectItem = Awaited<ReturnType<typeof listRecentProjects>>[number];

export function useRecentProjects(repo: RecentProjectsRepo) {
  const [projects, setProjects] = useState<RecentProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const list = await listRecentProjects(repo);
      setProjects(list);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los proyectos recientes."
      );
    } finally {
      setIsLoading(false);
    }
  }, [repo]);

  return {
    projects,
    isLoading,
    loadError,
    refresh,
  };
}
