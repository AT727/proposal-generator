'use client';

import { useState } from 'react';

export function PayButton({
  slug,
  amountLabel,
}: {
  slug: string;
  amountLabel: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const body = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !body.url) {
        throw new Error(body.error ?? 'Failed to start payment');
      }
      window.location.href = body.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start payment');
      setSubmitting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={pay}
        disabled={submitting}
        className="inline-flex items-center justify-center rounded-full bg-proposal-fg px-6 py-2.5 text-sm font-medium text-proposal-bg transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? 'Redirecting…' : `Pay ${amountLabel}`}
      </button>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
