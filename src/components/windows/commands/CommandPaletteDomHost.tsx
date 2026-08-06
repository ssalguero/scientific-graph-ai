/**
 * UX-9.6 — Command Palette DomHost + Overlay.
 *
 * Overlay Ownership Freeze: overlay UI lives only in Productivity Layer.
 * Palette DOM Freeze: sole Ctrl/Cmd+K · Esc capture via onKeyDown.
 * No document.addEventListener · no window.addEventListener.
 *
 * Search Purity: typing updates query → search → list only.
 * Execution: Enter → InteractionCommandBridge.execute only.
 */

"use client";

import {
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { UI_TOKENS } from "@/lib/ui/tokens";
import type { CommandId } from "@/ui/commands";
import { useInteractionCommands } from "@/ui/interaction-commands";
import {
  commandPaletteBridge,
  getOverlayState,
  subscribeOverlayState,
} from "./CommandPaletteBridge";
import { interactionCommandBridge } from "./InteractionCommandBridge";

const OVERLAY_CHROME = {
  backdrop: [
    "fixed inset-0 z-[80]",
    "bg-[var(--color-surface-canvas)]/70",
  ].join(" "),
  panel: [
    "fixed left-1/2 top-[18%] z-[90] w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2",
    "flex flex-col overflow-hidden",
    UI_TOKENS.radius.md,
    UI_TOKENS.border.default,
    "bg-[var(--color-surface-default)]",
    UI_TOKENS.shadow.md,
  ].join(" "),
  input: [
    "w-full border-0 bg-transparent px-3 py-2.5 text-sm outline-none",
    "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
    UI_TOKENS.border.bottom,
  ].join(" "),
  list: "max-h-64 overflow-auto py-1",
  item: [
    "flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm",
    "text-[var(--color-text-primary)]",
  ].join(" "),
  itemSelected: "bg-[var(--color-brand-primary)]/10 text-[var(--color-text-primary)]",
  empty: "px-3 py-4 text-sm text-[var(--color-text-muted)]",
  hint: [
    "flex items-center justify-between gap-2 px-3 py-1.5 text-[10px]",
    "text-[var(--color-text-muted)]",
    UI_TOKENS.border.bottom,
  ].join(" "),
} as const;

export type CommandPaletteDomHostProps = Readonly<{
  children: ReactNode;
}>;

export function CommandPaletteDomHost({
  children,
}: CommandPaletteDomHostProps) {
  const { dispatcher } = useInteractionCommands();
  const overlay = useSyncExternalStore(
    subscribeOverlayState,
    getOverlayState,
    getOverlayState,
  );

  const results = commandPaletteBridge.search(overlay.query);
  const selectedIndex =
    results.length === 0
      ? 0
      : Math.min(overlay.selectedIndex, results.length - 1);

  const executeSelected = () => {
    if (results.length === 0) {
      return;
    }
    const commandId = results[selectedIndex];
    if (commandId === undefined) {
      return;
    }
    interactionCommandBridge.execute(dispatcher, commandId);
    commandPaletteBridge.close();
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const mod = event.ctrlKey || event.metaKey;
    const key = event.key;

    if (mod && key.toLowerCase() === "k") {
      event.preventDefault();
      event.stopPropagation();
      if (overlay.open) {
        commandPaletteBridge.close();
      } else {
        commandPaletteBridge.open();
      }
      return;
    }

    if (!overlay.open) {
      return;
    }

    if (key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      commandPaletteBridge.close();
      return;
    }

    if (key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();
      commandPaletteBridge.moveSelection(1, results.length);
      return;
    }

    if (key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      commandPaletteBridge.moveSelection(-1, results.length);
      return;
    }

    if (key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      executeSelected();
    }
  };

  return (
    <div
      data-command-palette-host="true"
      data-command-palette-open={overlay.open ? "true" : "false"}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="relative h-full w-full outline-none"
    >
      {children}
      {overlay.open ? (
        <div
          className={OVERLAY_CHROME.backdrop}
          data-command-palette-overlay="true"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              commandPaletteBridge.close();
            }
          }}
        >
          <div
            className={OVERLAY_CHROME.panel}
            role="dialog"
            aria-label="Command Palette"
            aria-modal="true"
          >
            <div className={OVERLAY_CHROME.hint}>
              <span>Command Palette</span>
              <span>Esc to close</span>
            </div>
            <input
              autoFocus
              type="text"
              value={overlay.query}
              placeholder="Search commands…"
              aria-label="Search commands"
              data-command-palette-query="true"
              className={OVERLAY_CHROME.input}
              onChange={(event) => {
                commandPaletteBridge.setQuery(event.target.value);
              }}
              onKeyDown={(event) => {
                if (
                  event.key === "ArrowDown" ||
                  event.key === "ArrowUp" ||
                  event.key === "Enter" ||
                  event.key === "Escape"
                ) {
                  event.preventDefault();
                  onKeyDown(
                    event as unknown as ReactKeyboardEvent<HTMLDivElement>,
                  );
                }
              }}
            />
            <ul className={OVERLAY_CHROME.list} data-command-palette-list="true">
              {results.length === 0 ? (
                <li className={OVERLAY_CHROME.empty}>No commands</li>
              ) : (
                results.map((commandId: CommandId, index: number) => {
                  const selected = index === selectedIndex;
                  return (
                    <li key={commandId}>
                      <button
                        type="button"
                        data-command-palette-item={commandId}
                        data-command-palette-selected={
                          selected ? "true" : "false"
                        }
                        className={[
                          OVERLAY_CHROME.item,
                          selected ? OVERLAY_CHROME.itemSelected : "",
                        ].join(" ")}
                        onMouseEnter={() => {
                          commandPaletteBridge.setSelectedIndex(index);
                        }}
                        onClick={() => {
                          interactionCommandBridge.execute(
                            dispatcher,
                            commandId,
                          );
                          commandPaletteBridge.close();
                        }}
                      >
                        {commandPaletteBridge.getLabel(commandId)}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
