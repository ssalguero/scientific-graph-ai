import type { ReactNode } from "react";

import { SURFACE_TOKENS } from "./SurfaceTokens";

/** UX-2.16 — Frozen metadata API (children only). */
export type PanelMetadataProps = {
  children: ReactNode;
};

/**
 * UX-2.16 — Secondary presentational text.
 * Style resolved exclusively via SURFACE_TOKENS.
 */
export function PanelMetadata({ children }: PanelMetadataProps) {
  return <span className={SURFACE_TOKENS.metadata.root}>{children}</span>;
}
