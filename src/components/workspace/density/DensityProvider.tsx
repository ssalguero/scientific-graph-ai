import type { ReactNode } from "react";

/**
 * UX-2.25 — Compose-only semantic boundary. Not a React Context provider.
 * Performs no runtime work.
 *
 * DensityProvider is a compose-only semantic boundary and must never evolve
 * into Context. Future density scales: comfortable | compact | touch —
 * only comfortable is implemented this phase; compact is accepted and ignored.
 */
export type DensityProviderProps = {
  density?: "comfortable" | "compact";
  children?: ReactNode;
};

export function DensityProvider({
  density = "comfortable",
  children,
}: DensityProviderProps) {
  void density;
  return <>{children}</>;
}
