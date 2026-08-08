/**
 * PERFORMANCE-I3 — Budget / SLO registry (C-BUD).
 *
 * Starts empty. No product budgets are invented or preloaded.
 */

import type {
  BudgetCoreResult,
  BudgetDefinition,
  BudgetRegistrySnapshot,
} from "./types";
import { validateBudgetDefinition } from "./validate";

export type BudgetRegistry = {
  register(definition: BudgetDefinition): BudgetCoreResult<BudgetDefinition>;
  get(budgetId: string): BudgetDefinition | undefined;
  list(): readonly BudgetDefinition[];
  remove(budgetId: string): boolean;
  clear(): void;
  snapshot(): BudgetRegistrySnapshot;
  size(): number;
};

export function createBudgetRegistry(): BudgetRegistry {
  const store = new Map<string, BudgetDefinition>();

  return {
    register(definition) {
      const validated = validateBudgetDefinition(definition);
      if (!validated.ok) return validated;
      if (store.has(validated.value.budgetId)) {
        return {
          ok: false,
          error: `duplicate budgetId: ${validated.value.budgetId}`,
        };
      }
      store.set(validated.value.budgetId, validated.value);
      return { ok: true, value: validated.value };
    },

    get(budgetId) {
      return store.get(budgetId);
    },

    list() {
      return [...store.values()].sort((a, b) =>
        a.budgetId < b.budgetId ? -1 : a.budgetId > b.budgetId ? 1 : 0,
      );
    },

    remove(budgetId) {
      return store.delete(budgetId);
    },

    clear() {
      store.clear();
    },

    snapshot() {
      return { budgets: this.list() };
    },

    size() {
      return store.size;
    },
  };
}
