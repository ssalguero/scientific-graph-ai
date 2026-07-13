import type { ThemeMode } from "@/lib/app-preferences/domain/types";

export const getChartTheme = (mode: ThemeMode) =>
  mode === "dark"
    ? {
        grid: "#334155",
        axis: "#94a3b8",
        tooltipBg: "#111827",
        tooltipBorder: "#334155",
        tooltipColor: "#e5e7eb",
      }
    : {
        grid: "#e2e8f0",
        axis: "#64748b",
        tooltipBg: "#ffffff",
        tooltipBorder: "#e2e8f0",
        tooltipColor: "#334155",
      };
