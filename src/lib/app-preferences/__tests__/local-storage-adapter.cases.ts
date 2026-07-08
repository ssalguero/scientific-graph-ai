import {
  USER_PREFERENCES_STORAGE_KEYS,
  clearUserPreferences,
  createDefaultUserPreferences,
  readUserPreferences,
  writeUserPreferences,
} from "@/lib/app-preferences";

import {
  createAssertCase,
  type AssertCase,
  type CaseResult,
} from "./run-assertions";

type MockStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const createMockStorage = (initial: Record<string, string> = {}): MockStorage => {
  const store = new Map(Object.entries(initial));

  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
};

const createFailingStorage = (): MockStorage => ({
  getItem: () => {
    throw new Error("storage read failed");
  },
  setItem: () => {
    throw new Error("storage write failed");
  },
  removeItem: () => {
    throw new Error("storage remove failed");
  },
});

export const runLocalStorageAdapterCases = (assertCase: AssertCase): void => {
  const darkStorage = createMockStorage({
    [USER_PREFERENCES_STORAGE_KEYS.theme]: "dark",
    [USER_PREFERENCES_STORAGE_KEYS.showContextualHints]: "false",
  });
  const darkPrefs = readUserPreferences(darkStorage);
  assertCase(
    "adapter.read.themeDark",
    darkPrefs.theme === "dark" && darkPrefs.showContextualHints === false
  );

  const defaultStorage = createMockStorage();
  const defaultPrefs = readUserPreferences(defaultStorage);
  assertCase(
    "adapter.read.themeDefault",
    defaultPrefs.theme === "light" && defaultPrefs.showContextualHints === true
  );

  const writeStorage = createMockStorage();
  writeUserPreferences(
    { theme: "dark", showContextualHints: false },
    writeStorage
  );
  assertCase(
    "adapter.write.preferences",
    writeStorage.getItem(USER_PREFERENCES_STORAGE_KEYS.theme) === "dark" &&
      writeStorage.getItem(USER_PREFERENCES_STORAGE_KEYS.showContextualHints) ===
        "false"
  );

  const clearStorage = createMockStorage({
    [USER_PREFERENCES_STORAGE_KEYS.theme]: "dark",
    [USER_PREFERENCES_STORAGE_KEYS.showContextualHints]: "true",
  });
  clearUserPreferences(clearStorage);
  assertCase(
    "adapter.clear.preferences",
    clearStorage.getItem(USER_PREFERENCES_STORAGE_KEYS.theme) === null &&
      clearStorage.getItem(USER_PREFERENCES_STORAGE_KEYS.showContextualHints) ===
        null
  );

  const failingRead = readUserPreferences(createFailingStorage());
  assertCase(
    "adapter.read.storageFailureFallback",
    failingRead.theme === createDefaultUserPreferences().theme &&
      failingRead.showContextualHints ===
        createDefaultUserPreferences().showContextualHints
  );

  let writeThrew = false;
  try {
    writeUserPreferences(
      { theme: "light", showContextualHints: true },
      createFailingStorage()
    );
  } catch {
    writeThrew = true;
  }
  assertCase("adapter.write.storageFailureNoThrow", writeThrew === false);

  const injectedStorage = createMockStorage({
    [USER_PREFERENCES_STORAGE_KEYS.theme]: "light",
    [USER_PREFERENCES_STORAGE_KEYS.showContextualHints]: "true",
  });
  const injectedPrefs = readUserPreferences(injectedStorage);
  assertCase(
    "adapter.read.injectedStorage",
    injectedPrefs.theme === "light" && injectedPrefs.showContextualHints === true
  );
};

export const runLocalStorageAdapterCaseSuite = (): CaseResult[] => {
  const results: CaseResult[] = [];
  const assertCase = createAssertCase(results);
  runLocalStorageAdapterCases(assertCase);
  return results;
};
