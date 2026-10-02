"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

type CopyEmailButtonProps = {
  email: string;
  label: string;
  /** Announced to screen readers once the address is on the clipboard. */
  copiedLabel: string;
  /**
   * Computed on the server with `buttonStyles()`, so this island doesn't ship
   * the class-merging code to the browser.
   */
  className?: string;
};

/** Copies the address for people whose `mailto:` opens the wrong app. */
export function CopyEmailButton({
  email,
  label,
  copiedLabel,
  className,
}: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      // Clipboard access denied: the address stays visible next to the button.
    }
  }

  return (
    <>
      <button type="button" onClick={copy} className={className}>
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        {label}
      </button>
      <span role="status" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </>
  );
}
