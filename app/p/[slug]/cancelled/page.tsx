export const dynamic = 'force-dynamic';

export default async function CancelledPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="bg-proposal-bg min-h-screen">
      <div className="proposal-page">
        <header className="flex items-start justify-between mb-16">
          <span className="proposal-eyebrow">LEFTCLICK</span>
          <span className="proposal-eyebrow-muted">PAYMENT CANCELLED</span>
        </header>
        <h1 className="proposal-display">
          <span className="bold">NO</span>{' '}
          <span className="italic">worries.</span>
        </h1>
        <hr className="proposal-rule" />
        <p className="proposal-body max-w-lg">
          Payment was cancelled. Your signature is still on file — head back to
          the proposal whenever you&apos;re ready to complete it.
        </p>
        <a
          href={`/p/${slug}`}
          className="mt-10 inline-block text-sm underline text-proposal-fg"
        >
          ← Back to proposal
        </a>
      </div>
    </main>
  );
}
