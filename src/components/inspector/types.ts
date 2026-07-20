import type { ReactNode } from "react";

/** Frozen public API — D50.1 Inspector API Freeze. No breaking changes during D50. */
export type InspectorProps = {
  visible: boolean;
  width: number;
  children?: ReactNode;
};

/** Frozen public API — D50.1 Inspector API Freeze. No breaking changes during D50. */
export type InspectorPanelProps = {
  children?: ReactNode;
};

/** Frozen public API — D50.1 Inspector API Freeze. No breaking changes during D50. */
export type InspectorSectionProps = {
  title: string;
  children?: ReactNode;
};

/**
 * Reserved for future selection context — D50.1.
 * No provider. No implementation. Interfaces only.
 */
export type InspectorContext = {
  selectedObject: unknown;
  selectionType: string;
  reserved: unknown;
};
