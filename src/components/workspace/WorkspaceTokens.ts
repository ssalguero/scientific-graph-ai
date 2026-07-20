/**
 * D47.2 — Frozen layout class strings (move-only copy from page.tsx shell).
 * Sole source of Workspace shell Tailwind classes. Not Design Tokens v2 (D48).
 */
export const WORKSPACE_TOKENS = {
  shell: "flex min-h-screen flex-col lg:flex-row",
  mainColumn: "flex-1 min-w-0 overflow-auto",
  inner: "w-full px-3 sm:px-4 lg:px-5 xl:px-6 py-2.5 sm:py-3 space-y-3",
} as const;
