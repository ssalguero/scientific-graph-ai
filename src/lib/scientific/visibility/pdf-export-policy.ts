import { getToggleRegistryEntry, VISIBILITY_TOGGLE_KEYS } from "./registry";
import { isVisible } from "./queries";
import type {
  PdfExportPolicy,
  VisibilityState,
  VisibilityToggleKey,
} from "./types";

export const resolvePdfExportPolicy = (
  key: VisibilityToggleKey
): PdfExportPolicy => getToggleRegistryEntry(key).pdfExportPolicy;

const shouldIncludePdfSection = (
  policy: PdfExportPolicy,
  visible: boolean
): boolean => {
  if (policy === "never") return false;
  if (policy === "always-include") return true;
  return visible;
};

export const resolvePdfSectionsForState = (
  state: VisibilityState
): string[] => {
  const sectionIds = new Set<string>();

  for (const key of VISIBILITY_TOGGLE_KEYS) {
    const entry = getToggleRegistryEntry(key);
    const visible = isVisible(state, key);

    if (!shouldIncludePdfSection(entry.pdfExportPolicy, visible)) {
      continue;
    }

    for (const sectionId of entry.pdfSectionIds ?? []) {
      sectionIds.add(sectionId);
    }
  }

  return [...sectionIds].sort();
};
