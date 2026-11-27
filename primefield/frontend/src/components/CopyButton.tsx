"use client";

import { useState } from "react";

export default function CopyButton({ value }: { value: string }) {
  const [label, setLabel] = useState("Copy");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setLabel("Copied");
      setTimeout(() => setLabel("Copy"), 1500);
    } catch {
      // Clipboard access is refused on plain http and in some embedded
      // browsers; the number is on screen, so ask for a manual select.
      setLabel("Select it");
    }
  };
  return <button type="button" className="copy-btn" onClick={copy}>{label}</button>;
}
