"use client";

import { useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  pathnameToProductScreen,
  productScreenToPathname,
  type ProductScreenId,
} from "@/lib/product-navigation";

/**
 * Product Face screen is the App Router pathname.
 * GraphEditor stays mounted in the persistent product shell.
 * Share `/graph/[id]` does not participate.
 */
export function useProductScreen(shareMode: boolean): {
  productScreen: ProductScreenId;
  openProductScreen: (screen: ProductScreenId) => void;
} {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const productScreen = shareMode ? "home" : pathnameToProductScreen(pathname);

  const openProductScreen = useCallback(
    (screen: ProductScreenId) => {
      if (shareMode) return;
      const next = productScreenToPathname(screen);
      const current = pathnameRef.current.replace(/\/+$/, "") || "/";
      if (current === next) return;
      router.push(next, { scroll: false });
    },
    [shareMode, router]
  );

  return { productScreen, openProductScreen };
}
