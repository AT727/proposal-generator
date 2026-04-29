import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/service';
import { formatCents, type Proposal } from '@/lib/proposals/types';

export const dynamic = 'force-dynamic';

export default async function PaidPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createClient();
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('public_slug', slug)
    .maybeSingle();
  if (error || !data) notFound();
  const proposal = data as Proposal;

  const isPaid = proposal.status === 'paid';
  const amount = formatCents(proposal.total_cents, proposal.currency);

  return (
    <main className="bg-proposal-bg min-h-screen">
      <div className="proposal-page">
        <header className="flex items-start justify-between mb-16">
          <span className="proposal-eyebrow">LEFTCLICK</span>
          <span className="proposal-eyebrow-muted">CONFIRMATION</span>
        </header>
        <h1 className="proposal-display">
          <span className="bold">THANK</span>{' '}
          <span className="italic">you.</span>
        </h1>
        <hr className="proposal-rule" />
        {isPaid ? (
          <p className="proposal-body max-w-lg">
            We&apos;ve received your payment of <strong>{amount}</strong>. The
            engagement is officially confirmed — you&apos;ll get a kickoff
            calendar invite within one business day.
          </p>
        ) : (
          <p className="proposal-body max-w-lg">
            Stripe is finalizing your payment. This page will reflect the paid
            status as soon as the confirmation arrives. Refresh in a moment if
            it doesn&apos;t update on its own.
          </p>
        )}
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
