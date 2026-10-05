"use client";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

// A modal over the admin screen. Clicking outside it closes it. It renders
// into the body, because a form panel would otherwise trap it inside itself.
export default function Dialog({
  title,
  onClose,
  small = false,
  children,
}: {
  title: string;
  onClose: () => void;
  small?: boolean;
  children: ReactNode;
}) {
  return createPortal(
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className={`dialog${small ? " small" : ""}`}
        role="dialog"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="row">
          <h2>{title}</h2>
          <button type="button" className="dismiss" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
