/**
 * CARD-FIRST Product Face navigation contract.
 * ProductScreenId is the only Product Face router. Meaning is fixed by PLAN.
 *
 * `vgb` is a Face screen. `avanzado` is not.
 */

export const PRODUCT_SCREEN_IDS = [
  "home",
  "importar",
  "comparar",
  "graph",
  "vgb",
  "analizar",
  "evaluar-metodologia",
  "results",
  "reports",
] as const;

export type ProductScreenId = (typeof PRODUCT_SCREEN_IDS)[number];

export function isProductScreenId(value: string): value is ProductScreenId {
  return (PRODUCT_SCREEN_IDS as readonly string[]).includes(value);
}
