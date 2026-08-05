/**
 * UX-9.7 — Undo / Redo DomHost.
 *
 * DOM Freeze: sole Ctrl/Cmd+Z · Ctrl/Cmd+Shift+Z · Ctrl/Cmd+Y capture via onKeyDown.
 * No document.addEventListener · no window.addEventListener.
 *
 * Calls UndoRedoBridge.executeUndo / executeRedo only.
 * Never Adapter · never Dispatcher · never overlay ownership.
 */

"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { useInteractionCommands } from "@/ui/interaction-commands";
import { undoRedoBridge } from "./UndoRedoBridge";

export type UndoRedoDomHostProps = Readonly<{
  children: ReactNode;
}>;

export function UndoRedoDomHost({ children }: UndoRedoDomHostProps) {
  const { dispatcher } = useInteractionCommands();

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const mod = event.ctrlKey || event.metaKey;
    if (!mod) {
      return;
    }

    const key = event.key.toLowerCase();
    const shift = event.shiftKey;

    if (key === "z" && !shift) {
      event.preventDefault();
      event.stopPropagation();
      undoRedoBridge.executeUndo(dispatcher);
      return;
    }

    if ((key === "z" && shift) || key === "y") {
      event.preventDefault();
      event.stopPropagation();
      undoRedoBridge.executeRedo(dispatcher);
    }
  };

  return (
    <div
      data-undo-redo-dom-host="true"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="contents"
    >
      {children}
    </div>
  );
}
