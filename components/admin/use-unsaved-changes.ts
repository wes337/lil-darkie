"use client";
import { useEffect } from "react";

// Admin links use document navigation so this also covers Back and Forward.
export function useUnsavedChanges(unsaved: boolean) {
  useEffect(() => {
    if (!unsaved) return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);
}
