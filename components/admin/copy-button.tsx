"use client";
import { useState } from "react";

export default function CopyButton({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="primary"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
      }}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
