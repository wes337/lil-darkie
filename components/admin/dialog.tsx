"use client";
import type { ReactNode } from "react";

// A modal over the admin screen. Clicking outside it closes it.
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
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className={`dialog${small ? " small" : ""}`}
        role="dialog"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="row">
          <h2>{title}</h2>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
