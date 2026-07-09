import {
  InMemoryLocalProjectRepository,
  listLocalProjects,
  openLocalProject,
  saveLocalProject,
} from "@/lib/project/application/local-project";
import { buildLocalProjectCollectContext } from "@/lib/project/__tests__/indexeddb-local-project-helpers";
import {
  listRecentProjects,
  type RecentProjectsQuery,
} from "@/lib/project/application/persistence";

import {
  createAssertCase,
  type CaseResult,
} from "./run-assertions";

const projectId = (index: number): string =>
  `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`;

const seedProjects = async (
  repo: InMemoryLocalProjectRepository,
  count: number
): Promise<void> => {
  for (let index = 0; index < count; index += 1) {
    const id = projectId(index);
    const name = `Project ${index}`;
    const ctx = buildLocalProjectCollectContext(id, name);
    ctx.metadata.updatedAt = `2026-07-08T10:00:${String(index).padStart(2, "0")}.000Z`;
    const saved = await saveLocalProject({ repo, ctx, projectName: name });
    if (!saved.ok) {
      throw new Error(`Failed to seed project ${name}`);
    }
  }
};

const touchOpenOrder = async (
  repo: InMemoryLocalProjectRepository,
  ids: string[]
): Promise<void> => {
  for (const id of ids) {
    const opened = await openLocalProject({ repo, id });
    if (!opened.ok) {
      throw new Error(`Failed to open project ${id}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 2));
  }
};

/** Async entry for validate script. */
export const runPersistenceCaseSuite = async (): Promise<CaseResult[]> => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);

  const emptyRepo = new InMemoryLocalProjectRepository();
  const emptyList = await listRecentProjects(emptyRepo);
  assertCase("recent.empty", emptyList.length === 0);

  const defaultRepo = new InMemoryLocalProjectRepository();
  await seedProjects(defaultRepo, 12);
  const defaultLimit = await listRecentProjects(defaultRepo);
  assertCase("recent.limit.default.count", defaultLimit.length === 10);
  assertCase(
    "recent.limit.default.first",
    defaultLimit[0]?.name === "Project 11"
  );
  assertCase(
    "recent.limit.default.tenth",
    defaultLimit[9]?.name === "Project 2"
  );

  const customRepo = new InMemoryLocalProjectRepository();
  await seedProjects(customRepo, 8);
  const customLimit = await listRecentProjects(customRepo, { limit: 3 });
  assertCase("recent.limit.custom.count", customLimit.length === 3);

  const overTotalRepo = new InMemoryLocalProjectRepository();
  await seedProjects(overTotalRepo, 5);
  const overTotal = await listRecentProjects(overTotalRepo, { limit: 100 });
  assertCase("recent.limit.overTotal.count", overTotal.length === 5);

  const coerceRepo = new InMemoryLocalProjectRepository();
  await seedProjects(coerceRepo, 12);
  const invalidLimits: RecentProjectsQuery[] = [
    { limit: 0 },
    { limit: -3 },
    { limit: Number.NaN },
    { limit: Number.POSITIVE_INFINITY },
  ];
  for (const query of invalidLimits) {
    const coerced = await listRecentProjects(coerceRepo, query);
    assertCase(
      `recent.limit.coerce.${String(query.limit)}.count`,
      coerced.length === 10
    );
  }

  const orderRepo = new InMemoryLocalProjectRepository();
  const orderIds = [projectId(0), projectId(1), projectId(2)];
  for (const [index, id] of orderIds.entries()) {
    const ctx = buildLocalProjectCollectContext(id, `Order ${index}`);
    ctx.metadata.updatedAt = `2026-07-08T11:00:0${index}.000Z`;
    const saved = await saveLocalProject({
      repo: orderRepo,
      ctx,
      projectName: `Order ${index}`,
    });
    if (!saved.ok) {
      throw new Error(`Failed to seed order project ${index}`);
    }
  }
  await touchOpenOrder(orderRepo, orderIds);
  const ordered = await listRecentProjects(orderRepo, { limit: 3 });
  assertCase(
    "recent.order.lastAccessedAt.first",
    ordered[0]?.name === "Order 2"
  );
  assertCase(
    "recent.order.lastAccessedAt.last",
    ordered[2]?.name === "Order 0"
  );

  const delegateRepo = new InMemoryLocalProjectRepository();
  await seedProjects(delegateRepo, 6);
  const fullList = await listLocalProjects(delegateRepo, "lastAccessedAt");
  const delegated = await listRecentProjects(delegateRepo, {
    limit: fullList.length + 5,
  });
  assertCase(
    "recent.delegate.matchesListLocalProjects",
    delegated.length === fullList.length &&
      delegated.every((item, index) => item.id === fullList[index]?.id)
  );

  const mutationRepo = new InMemoryLocalProjectRepository();
  await seedProjects(mutationRepo, 4);
  const beforeList = await listLocalProjects(mutationRepo, "lastAccessedAt");
  const beforeCount = beforeList.length;
  await listRecentProjects(mutationRepo, { limit: 2 });
  const afterList = await listLocalProjects(mutationRepo, "lastAccessedAt");
  assertCase("recent.noMutation.count", afterList.length === beforeCount);
  assertCase(
    "recent.noMutation.ids",
    afterList.every((item, index) => item.id === beforeList[index]?.id)
  );

  const deterministicRepo = new InMemoryLocalProjectRepository();
  await seedProjects(deterministicRepo, 7);
  const first = await listRecentProjects(deterministicRepo, { limit: 4 });
  const second = await listRecentProjects(deterministicRepo, { limit: 4 });
  assertCase(
    "recent.deterministic",
    JSON.stringify(first) === JSON.stringify(second)
  );

  return results;
};
