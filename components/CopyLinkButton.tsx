'use client';

import { useState } from 'react';

export function CopyLinkButton({ href }: { href: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="app-button app-button-secondary"
    >
      {copied ? 'Copied' : 'Copy public link'}
    </button>
  );
}
