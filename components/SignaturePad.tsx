'use client';

import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface Props {
  slug: string;
  defaultName?: string;
  onSigned?: () => void;
}

export function SignaturePad({ slug, defaultName = '', onSigned }: Props) {
  const ref = useRef<SignatureCanvas | null>(null);
  const [name, setName] = useState(defaultName);
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function clear() {
    ref.current?.clear();
  }

  async function submit() {
    if (!ref.current || ref.current.isEmpty()) {
      setError('Please draw your signature.');
      return;
    }
    if (!name.trim()) {
      setError('Please type your printed name.');
      return;
    }
    setError(null);
    setSubmitting(true);

    const png = ref.current.toDataURL('image/png');
    try {
      const res = await fetch('/api/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          signer_name: name.trim(),
          signer_title: title.trim() || null,
          png_base64: png,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Failed to submit signature');
      }
      if (onSigned) onSigned();
      // Hard refresh so the server component re-fetches and shows PayButton.
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit signature');
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <div className="text-xs uppercase tracking-wider text-proposal-muted">
          CLIENT SIGNATURE
        </div>
        <div className="mt-2 rounded-sm border border-proposal-fg/60 bg-white">
          <SignatureCanvas
            ref={(r) => {
              ref.current = r;
            }}
            penColor="#1a1a1a"
            canvasProps={{
              className: 'w-full h-40',
            }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={clear}
            className="text-xs text-proposal-muted hover:text-proposal-fg"
          >
            Clear
          </button>
          <span className="text-xs text-proposal-muted">
            Draw with mouse or finger
          </span>
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-proposal-muted">
          PRINTED NAME
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full border-b border-proposal-fg/60 bg-transparent py-1 text-[15px] focus:outline-none focus:border-proposal-fg"
          placeholder="Your full name"
        />
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-proposal-muted">
          TITLE
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-2 w-full border-b border-proposal-fg/60 bg-transparent py-1 text-[15px] focus:outline-none focus:border-proposal-fg"
          placeholder="CEO"
        />
      </div>

      <div className="sm:col-span-2 flex items-center justify-between">
        {error ? (
          <p className="text-sm text-red-700">{error}</p>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-full bg-proposal-fg px-6 py-2.5 text-sm font-medium text-proposal-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Sign proposal'}
        </button>
      </div>
    </div>
  );
}
