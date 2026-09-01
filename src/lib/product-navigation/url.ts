import {
  isProductScreenId,
  type ProductScreenId,
} from "./screens";

/**
 * App Router pathnames for Product Face screens.
 * ProductScreenId `graph` uses `/grafico` because `/graph/[id]` is share (must stay intact).
 * `/avanzado` is not a Face pathname (no redirect to Graph).
 */
export const PRODUCT_SCREEN_PATHNAME: Record<ProductScreenId, string> = {
  home: "/",
  importar: "/importar",
  comparar: "/comparar",
  graph: "/grafico",
  vgb: "/vgb",
  analizar: "/analizar",
  "evaluar-metodologia": "/evaluar-metodologia",
  results: "/resultados",
  reports: "/reportes",
};

/** Route folders under `src/app/` (excludes `/`). Share `/graph/[id]` is not a Face screen. */
export const PRODUCT_FACE_ROUTE_SEGMENTS: readonly string[] = (
  Object.values(PRODUCT_SCREEN_PATHNAME) as string[]
)
  .filter((pathname) => pathname !== "/")
  .map((pathname) => pathname.slice(1));

const PATHNAME_TO_SCREEN: Record<string, ProductScreenId> = Object.fromEntries(
  (Object.entries(PRODUCT_SCREEN_PATHNAME) as [ProductScreenId, string][]).map(
    ([screen, pathname]) => [pathname, screen]
  )
) as Record<string, ProductScreenId>;

export function productScreenToPathname(screen: ProductScreenId): string {
  return PRODUCT_SCREEN_PATHNAME[screen];
}

export function pathnameToProductScreen(pathname: string): ProductScreenId {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (normalized.startsWith("/graph/")) {
    return "home";
  }
  // Leftover URL. Not Face. Must not resolve to graph.
  if (normalized === "/avanzado") {
    return "home";
  }
  const screen = PATHNAME_TO_SCREEN[normalized];
  if (screen && isProductScreenId(screen)) {
    return screen;
  }
  return "home";
}

export function isShareGraphPathname(pathname: string): boolean {
  return pathname.startsWith("/graph/");
}
