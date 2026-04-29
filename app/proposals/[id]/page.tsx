import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProposalForm } from '@/components/ProposalForm';
import { StatusBadge } from '@/components/StatusBadge';
import { CopyLinkButton } from '@/components/CopyLinkButton';
import {
  formatCents,
  type Proposal,
  type ProposalRowInput,
} from '@/lib/proposals/types';
import { deleteProposal, markSent, updateProposal } from '../actions';

export const dynamic = 'force-dynamic';

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) notFound();
  const proposal = data as Proposal;

  const initial: ProposalRowInput = {
    client_company: proposal.client_company,
    client_name: proposal.client_name,
    client_email: proposal.client_email ?? '',
    title: proposal.title,
    currency: proposal.currency,
    data: proposal.data,
  };

  const update = updateProposal.bind(null, proposal.id);
  const sendIt = markSent.bind(null, proposal.id);
  const remove = deleteProposal.bind(null, proposal.id);

  const publicUrl = `${
    process.env.NEXT_PUBLIC_APP_URL ?? ''
  }/p/${proposal.public_slug}`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/proposals"
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          ← Proposals
        </Link>
        <StatusBadge status={proposal.status} />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          {proposal.title || 'Untitled proposal'}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {proposal.client_company} · {proposal.client_name} ·{' '}
          {formatCents(proposal.total_cents, proposal.currency)}
        </p>
      </div>

      {/* Public link card */}
      <div className="app-card mb-10">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-medium">Public link</div>
            <div className="mt-1 truncate text-xs text-muted">{publicUrl}</div>
          </div>
          <div className="flex shrink-0 gap-2">
            <CopyLinkButton href={publicUrl} />
            <a
              href={`/p/${proposal.public_slug}`}
              target="_blank"
              rel="noreferrer"
              className="app-button app-button-secondary"
            >
              Preview
            </a>
          </div>
        </div>
        {proposal.status === 'draft' && (
          <form action={sendIt} className="mt-4">
            <button className="app-button" type="submit">
              Mark as sent
            </button>
            <p className="mt-2 text-xs text-muted">
              Drafts return 404 on the public URL. Mark sent to share.
            </p>
          </form>
        )}
      </div>

      {/* Edit form */}
      <ProposalForm
        initial={initial}
        onSubmit={update}
        submitLabel="Save changes"
      />

      {/* Danger zone */}
      <div className="mt-12 border-t border-border pt-6">
        <form action={remove}>
          <button
            type="submit"
            className="text-sm text-red-600 hover:underline"
          >
            Delete proposal
          </button>
        </form>
      </div>
    </div>
  );
}
