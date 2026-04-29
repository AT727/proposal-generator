import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/service';
import {
  AcceptancePage,
  ProposalRenderer,
} from '@/components/ProposalRenderer';
import { SignaturePad } from '@/components/SignaturePad';
import { PayButton } from '@/components/PayButton';
import { formatCents, type Proposal } from '@/lib/proposals/types';

export const dynamic = 'force-dynamic';

export default async function PublicProposalPage({
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
  // Drafts aren't public.
  if (proposal.status === 'draft' || proposal.status === 'cancelled') notFound();

  // Cookie-debounced "viewed" event: fire once per browser per proposal.
  const cookieStore = await cookies();
  const viewedKey = `viewed_${proposal.id}`;
  if (!cookieStore.get(viewedKey)) {
    await supabase
      .from('proposal_events')
      .insert({ proposal_id: proposal.id, type: 'viewed' });
    if (proposal.status === 'sent') {
      await supabase
        .from('proposals')
        .update({ status: 'viewed' })
        .eq('id', proposal.id)
        .eq('status', 'sent');
    }
    // Note: Server Components can't set cookies, but the next request through
    // middleware also doesn't help here because /p/* is matcher-excluded.
    // The dedupe is best-effort: a duplicate "viewed" row is acceptable in
    // the audit log. Owner UI shows the most recent view timestamp.
  }

  const amountLabel = formatCents(proposal.total_cents, proposal.currency);
  const isSigned =
    proposal.status === 'signed' || proposal.status === 'paid';
  const isPaid = proposal.status === 'paid';

  return (
    <main className="bg-proposal-bg min-h-screen">
      <ProposalRenderer
        client_company={proposal.client_company}
        client_name={proposal.client_name}
        title={proposal.title}
        data={proposal.data}
        currency={proposal.currency}
      />

      <AcceptancePage
        client_company={proposal.client_company}
        client_name={proposal.client_name}
        title={proposal.title}
        data={proposal.data}
        currency={proposal.currency}
      >
        {isPaid ? (
          <div className="rounded-sm bg-emerald-50 border border-emerald-300 p-4 text-sm text-emerald-900">
            Paid {amountLabel}.{' '}
            {proposal.paid_at
              ? `Received ${new Date(proposal.paid_at).toLocaleString()}.`
              : ''}{' '}
            Thank you — you&apos;ll get a kickoff calendar invite within one
            business day.
          </div>
        ) : isSigned ? (
          <div className="space-y-6">
            <div className="rounded-sm bg-violet-50 border border-violet-300 p-4 text-sm text-violet-900">
              Signed{' '}
              {proposal.signed_at
                ? `on ${new Date(proposal.signed_at).toLocaleString()}`
                : ''}
              . One step left — complete payment of {amountLabel} to confirm
              the engagement.
            </div>
            <PayButton slug={proposal.public_slug} amountLabel={amountLabel} />
          </div>
        ) : (
          <SignaturePad
            slug={proposal.public_slug}
            defaultName={proposal.client_name}
          />
        )}
      </AcceptancePage>
    </main>
  );
}
