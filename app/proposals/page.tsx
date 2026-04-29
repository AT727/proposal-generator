import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCents, type ProposalStatus } from '@/lib/proposals/types';

export const dynamic = 'force-dynamic';

interface Row {
  id: string;
  title: string;
  client_company: string;
  client_name: string;
  status: ProposalStatus;
  total_cents: number;
  currency: string;
  updated_at: string;
}

export default async function ProposalsListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('proposals')
    .select(
      'id, title, client_company, client_name, status, total_cents, currency, updated_at',
    )
    .order('updated_at', { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Proposals</h1>
        <p className="mt-4 text-red-600">Failed to load: {error.message}</p>
      </div>
    );
  }

  const rows = (data ?? []) as Row[];

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Proposals</h1>
          <p className="mt-1 text-sm text-muted">
            {rows.length} {rows.length === 1 ? 'proposal' : 'proposals'}
          </p>
        </div>
        <Link href="/proposals/new" className="app-button">
          New proposal
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="app-card mt-8 text-center">
          <p className="text-muted">No proposals yet.</p>
          <Link
            href="/proposals/new"
            className="app-button mt-4 inline-flex"
          >
            Create your first
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden">
          {rows.map((row) => (
            <li key={row.id}>
              <Link
                href={`/proposals/${row.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-zinc-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="truncate text-[15px] font-medium">
                      {row.title || 'Untitled proposal'}
                    </span>
                    <StatusBadge status={row.status} />
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted">
                    {row.client_company} · {row.client_name}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <div className="font-medium tabular-nums">
                    {formatCents(row.total_cents, row.currency)}
                  </div>
                  <div className="text-xs text-muted">
                    {new Date(row.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
