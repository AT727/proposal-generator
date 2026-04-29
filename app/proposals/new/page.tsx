import Link from 'next/link';
import { ProposalForm } from '@/components/ProposalForm';
import { createProposal } from '../actions';

export default function NewProposalPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8">
        <Link
          href="/proposals"
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          ← Proposals
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          New proposal
        </h1>
        <p className="mt-1 text-sm text-muted">
          Fill in the details below. Once saved, you can copy a public link to
          send to your client.
        </p>
      </div>
      <ProposalForm onSubmit={createProposal} submitLabel="Create proposal" />
    </div>
  );
}
