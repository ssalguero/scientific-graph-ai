/**
 * UX-3.8 — Immutable descriptive snapshot of ThemeRuntime (private).
 *
 * Scalars only. No Runtime references, nested token objects, or arrays.
 */

export type RuntimeSnapshot = {
  readonly fingerprint: string;
  readonly themeName: string;
  readonly version: string;
  readonly tokenCount: number;
  readonly colorCount: number;
  readonly typographyCount: number;
  readonly spacingCount: number;
  readonly radiusCount: number;
  readonly elevationCount: number;
};

export type SnapshotCompareResult = {
  readonly changed: boolean;
  readonly fingerprintChanged: boolean;
  readonly tokenCountChanged: boolean;
  readonly metadataChanged: boolean;
};
