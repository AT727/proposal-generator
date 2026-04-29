import { STATUS_LABEL, type ProposalStatus } from '@/lib/proposals/types';

const COLORS: Record<ProposalStatus, string> = {
  draft: 'bg-zinc-100 text-zinc-700',
  sent: 'bg-blue-50 text-blue-700',
  viewed: 'bg-amber-50 text-amber-800',
  signed: 'bg-violet-50 text-violet-700',
  paid: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
};

export function StatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
