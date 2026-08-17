"use client";

import {
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

import { capabilityAccentBridgeStyle } from "@/lib/smart-start/capability-accents";
import { DS_FOCUS_RING, DS_MOTION_FEEDBACK } from "@/lib/ui/focus-ring";

type DestinationReportDrawerProps = {
  open: boolean;
  title: string;
  status: string;
  statusHasIssues?: boolean;
  fileName: string;
  meta: string;
  onClose: () => void;
  onDownload: () => void;
  children: ReactNode;
  returnFocusRef?: RefObject<HTMLElement | null>;
};

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const THEME_TOKEN_NAMES = [
  "--color-text-primary",
  "--color-text-muted",
  "--color-text-inverse",
  "--color-surface-default",
  "--color-surface-raised",
  "--color-feedback-warning",
  "--color-feedback-danger",
  "--color-capability-pink",
  "--typography-heading-sm-font-size",
  "--typography-heading-sm-line-height",
  "--typography-body-lg-font-size",
  "--typography-body-lg-line-height",
  "--typography-body-font-size",
] as const;

function readThemeTokenBridge(): CSSProperties {
  if (typeof document === "undefined") return {};
  const host = document.querySelector("[data-theme]");
  if (!host) return {};
  const computed = getComputedStyle(host);
  const next: Record<string, string> = {};
  for (const name of THEME_TOKEN_NAMES) {
    const value = computed.getPropertyValue(name).trim();
    if (value) next[name] = value;
  }
  return next as CSSProperties;
}

const footerActionClass = [
  "inline-flex h-11 items-center justify-center rounded-2xl px-5",
  "text-[length:var(--typography-body-lg-font-size)] font-semibold",
  "text-[var(--color-text-primary)]",
  DS_FOCUS_RING,
  DS_MOTION_FEEDBACK,
].join(" ");

const footerActionSurface = {
  backgroundColor:
    "color-mix(in srgb, var(--color-text-primary) 22%, var(--color-surface-raised))",
} as const;

/**
 * CRP-6.4.D.7.5 — Importar destination context window (not a right drawer).
 */
export function DestinationReportDrawer({
  open,
  title,
  status,
  statusHasIssues = false,
  fileName,
  meta,
  onClose,
  onDownload,
  children,
  returnFocusRef,
}: DestinationReportDrawerProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      const panel = panelRef.current;
      if (event.key !== "Tab" || !panel) return;
      const nodes = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (node) => !node.hasAttribute("disabled")
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      const restore = returnFocusRef?.current ?? previous;
      restore?.focus?.();
    };
  }, [open, returnFocusRef]);

  if (!open || typeof document === "undefined") return null;

  const themeVars = readThemeTokenBridge();

  return createPortal(
    <div
      className="fixed inset-0 z-50 isolate flex items-center justify-center p-4"
      data-destination-report-drawer=""
      data-destination-report-window=""
      style={{ ...capabilityAccentBridgeStyle, ...themeVars }}
    >
      <button
        type="button"
        className="absolute inset-0 z-0 bg-[color-mix(in_srgb,black_45%,transparent)]"
        aria-label="Cerrar informe de importación"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-destination-report-panel=""
        className="relative z-10 flex w-[min(780px,calc(100vw-2rem))] max-h-[min(88dvh,calc(100dvh-2rem))] flex-col overflow-hidden rounded-2xl opacity-100"
        style={{
          isolation: "isolate",
          opacity: 1,
          color: "var(--color-text-primary)",
          backgroundColor: "var(--color-surface-raised, #1e293b)",
        }}
      >
        <header className="shrink-0 px-6 pb-4 pt-5 text-left">
          <h2
            id={titleId}
            className="text-[length:var(--typography-heading-sm-font-size)] font-semibold leading-[var(--typography-heading-sm-line-height)] tracking-tight text-[var(--color-text-primary)]"
          >
            {title}
          </h2>
          <div className="mt-3 space-y-0.5">
            <p
              className={`text-[length:var(--typography-body-lg-font-size)] font-semibold leading-[var(--typography-body-lg-line-height)] ${
                statusHasIssues
                  ? "text-[var(--color-feedback-warning)]"
                  : "text-[var(--color-text-primary)]"
              }`}
            >
              {status}
            </p>
            <p className="text-[length:var(--typography-body-lg-font-size)] font-semibold leading-[var(--typography-body-lg-line-height)] text-[var(--color-text-primary)]">
              {fileName}
            </p>
            <p className="text-[length:var(--typography-body-font-size)] text-[var(--color-text-muted)]">
              {meta}
            </p>
          </div>
        </header>
        <div
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 pb-2"
          data-destination-report-scroll=""
        >
          {children}
        </div>
        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-6 py-4">
          <button
            ref={closeButtonRef}
            type="button"
            className={footerActionClass}
            style={footerActionSurface}
            onClick={onClose}
          >
            Cerrar
          </button>
          <button
            type="button"
            className={footerActionClass}
            style={footerActionSurface}
            onClick={onDownload}
          >
            Descargar informe
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
