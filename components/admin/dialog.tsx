"use client";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import Icon from "./icon";

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
          <button type="button" className="bare" onClick={onClose} aria-label="Close">
            <Icon name="cross" grey />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

// A yes-or-no question in a small modal. `children` is the question.
export function Confirm({
  title,
  onYes,
  onNo,
  children,
}: {
  title: string;
  onYes: () => void;
  onNo: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog title={title} onClose={onNo} small>
      <p>{children}</p>
      <div className="row fill">
        <button type="button" className="primary" onClick={onYes}>
          Yes
        </button>
        <button type="button" className="dismiss" onClick={onNo}>
          No
        </button>
      </div>
    </Dialog>
  );
}

// Asks before something is deleted. `name` is what the question calls it.
export function ConfirmDelete({
  name,
  onYes,
  onNo,
}: {
  name: string;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <Confirm title="Delete" onYes={onYes} onNo={onNo}>
      Are you sure you want to delete <strong>{name}</strong>?
    </Confirm>
  );
}