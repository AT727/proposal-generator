import { formatCents, type ProposalData } from '@/lib/proposals/types';

interface Props {
  brand?: string; // header word (e.g. "LEFTCLICK")
  client_company: string;
  client_name: string;
  title: string;
  data: ProposalData;
  currency: string;
}

const FOOTER = '[SLIDE.FOOTER]';

export function ProposalRenderer(p: Props) {
  return (
    <div className="bg-proposal-bg text-proposal-fg">
      <CoverPage {...p} />
      <ProblemPage {...p} />
      <SolutionPage {...p} />
      <ApproachPage {...p} />
      <InvestmentPage {...p} />
    </div>
  );
}

function PageFrame({
  page,
  total = 6,
  section,
  children,
  brand = 'LEFTCLICK',
}: {
  page: number;
  total?: number;
  section: string;
  children: React.ReactNode;
  brand?: string;
}) {
  const pageStr = `${String(page).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  return (
    <section className="proposal-page">
      <header className="flex items-start justify-between mb-16">
        <span className="proposal-eyebrow">{brand}</span>
        <span className="proposal-eyebrow-muted">
          {section} · {pageStr}
        </span>
      </header>
      {children}
      <footer className="mt-24">
        <span className="proposal-eyebrow-muted">{FOOTER}</span>
      </footer>
    </section>
  );
}

// ── 01 Cover ────────────────────────────────────────────────────────────
function CoverPage({
  client_company,
  client_name,
  data,
  brand = 'LEFTCLICK',
}: Props) {
  const dateLabel = data.date_issued
    ? new Date(data.date_issued).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';
  return (
    <PageFrame page={1} section="PROPOSAL" brand={brand}>
      <div>
        <h1 className="proposal-display">
          <span className="bold">[{client_company || 'Client.Company'}]</span>
        </h1>
        <p className="mt-6 text-base text-proposal-fg">
          [ {data.project_title || 'Personalization.Project.Title'} ]
        </p>
        <p className="mt-2 text-xs text-proposal-muted tracking-wide">
          {data.quote_reference_number || '[Quote.Reference.Number]'}
        </p>

        <div className="mt-16 aspect-[3/2] w-full overflow-hidden rounded-sm">
          <div
            className="h-full w-full"
            style={{
              background:
                'linear-gradient(135deg, #c9d1e3 0%, #d4c5d5 50%, #cad5d8 100%)',
              position: 'relative',
            }}
          >
            <div
              className="absolute"
              style={{
                top: '22%',
                left: '20%',
                width: '38%',
                height: '50%',
                background: 'rgba(255,255,255,0.55)',
              }}
            />
            <div
              className="absolute"
              style={{
                top: '38%',
                left: '46%',
                width: '32%',
                height: '40%',
                background: 'rgba(180,193,210,0.55)',
              }}
            />
            <div
              className="absolute"
              style={{
                top: '32%',
                left: '32%',
                width: '24%',
                height: '32%',
                background: 'rgba(245,245,250,0.65)',
              }}
            />
            <div
              className="absolute"
              style={{
                top: '50%',
                left: '54%',
                width: '28%',
                height: '24%',
                background: 'rgba(150,170,200,0.5)',
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="proposal-eyebrow-muted">
            {(dateLabel || '[DATE.ISSUED]').toUpperCase()}
          </span>
          <span className="proposal-eyebrow-muted">·</span>
          <span className="proposal-eyebrow-muted">
            PREPARED FOR {(client_name || '[CLIENT.NAME]').toUpperCase()}
          </span>
        </div>
      </div>
    </PageFrame>
  );
}

// ── 02 Problem ──────────────────────────────────────────────────────────
function ProblemPage({ data, brand = 'LEFTCLICK' }: Props) {
  return (
    <PageFrame page={2} section="THE PROBLEM" brand={brand}>
      <Heading bold="YOUR" italic="problem areas." />
      <p className="proposal-body max-w-md">
        Systems are innately high-leverage. But this leverage can either work{' '}
        <strong>for</strong> you or <strong>against</strong> you. In your case,
        there are a few small, persistent problems that are currently impacting
        growth:
      </p>
      <hr className="proposal-rule" />
      <NumberedGrid items={data.problems} />
    </PageFrame>
  );
}

// ── 03 Solution ─────────────────────────────────────────────────────────
function SolutionPage({ data, brand = 'LEFTCLICK' }: Props) {
  return (
    <PageFrame page={3} section="THE SOLUTION" brand={brand}>
      <Heading bold="YOUR" italic="solution." />
      <p className="proposal-body max-w-md">
        Solving the above needs is straightforward; we&apos;ve done so many
        times before. In practice, our solution is almost always a combination
        of <strong>process</strong>, <strong>automation</strong>, and{' '}
        <strong>SOP</strong>. Here&apos;s what that would look like for you:
      </p>
      <hr className="proposal-rule" />
      <NumberedGrid items={data.benefits} />
    </PageFrame>
  );
}

// ── 04 Approach ─────────────────────────────────────────────────────────
function ApproachPage({ data, brand = 'LEFTCLICK' }: Props) {
  return (
    <PageFrame page={4} section="THE APPROACH" brand={brand}>
      <Heading bold="OUR" italic="approach." />
      <p className="proposal-body max-w-md">
        A phased rollout that minimizes disruption and front-loads quick wins.
        Each phase produces a tangible deliverable you&apos;ll review and sign
        off on before we proceed.
      </p>
      <div className="relative mt-12">
        <div
          aria-hidden
          className="absolute left-[7px] top-2 bottom-2 w-px bg-proposal-fg"
        />
        <ol className="space-y-10">
          {data.phases.map((phase, i) => (
            <li key={i} className="relative pl-10">
              <span
                aria-hidden
                className="absolute left-0 top-1 inline-block size-[15px]"
                style={{
                  background: 'var(--proposal-highlight)',
                  border: '1px solid var(--proposal-fg)',
                }}
              />
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="proposal-eyebrow-muted">
                  PHASE {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-xs text-proposal-fg">·</span>
                <span className="text-xs uppercase tracking-wider text-proposal-fg">
                  {phase.duration || '[DURATION]'}
                </span>
              </div>
              <h3 className="mt-2 text-lg font-semibold">
                {phase.name || 'Phase name'}
              </h3>
              <p className="mt-1 max-w-lg proposal-body">
                {phase.description || 'Phase description.'}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </PageFrame>
  );
}

// ── 05 Investment ───────────────────────────────────────────────────────
function InvestmentPage({ data, currency, brand = 'LEFTCLICK' }: Props) {
  const total = data.line_items.reduce(
    (s, li) => s + li.qty * li.unit_cents,
    0,
  );
  const validUntil = data.quote_valid_until
    ? new Date(data.quote_valid_until).toLocaleDateString()
    : '—';
  return (
    <PageFrame page={5} section="INVESTMENT" brand={brand}>
      <Heading bold="YOUR" italic="investment." />
      <p className="proposal-body max-w-md">
        A transparent breakdown of every line item. No hidden retainers, no
        surprise add-ons. Final figure shown below; payment terms outlined
        beneath.
      </p>

      <div className="mt-10">
        <div className="grid grid-cols-[3fr_0.6fr_1fr_1fr] items-end gap-4 pb-3 border-b border-proposal-fg">
          <span className="proposal-eyebrow-muted">LINE ITEM</span>
          <span className="proposal-eyebrow-muted text-right">QUANTITY</span>
          <span className="proposal-eyebrow-muted text-right">RATE</span>
          <span className="proposal-eyebrow-muted text-right">SUBTOTAL</span>
        </div>
        {data.line_items.map((li, i) => (
          <div
            key={i}
            className="grid grid-cols-[3fr_0.6fr_1fr_1fr] gap-4 py-5 border-t border-proposal-rule first:border-t-0"
          >
            <div>
              <div className="font-medium text-[15px]">
                {li.name || `Line item ${i + 1}`}
              </div>
              <div className="proposal-body-muted mt-1">{li.description}</div>
            </div>
            <div className="text-right tabular-nums">{li.qty}</div>
            <div className="text-right tabular-nums">
              {formatCents(li.unit_cents, currency)}
            </div>
            <div className="text-right tabular-nums">
              {formatCents(li.qty * li.unit_cents, currency)}
            </div>
          </div>
        ))}
        <div className="mt-2 flex items-baseline justify-between border-t border-proposal-fg pt-5">
          <span className="text-sm font-semibold uppercase tracking-wider">
            Total Investment
          </span>
          <span className="text-xl font-semibold tabular-nums">
            {formatCents(total, currency)}
          </span>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-3 gap-8">
        <DefBlock label="PAYMENT SCHEDULE" value={data.payment_schedule} />
        <DefBlock label="QUOTE VALID UNTIL" value={validUntil} />
        <DefBlock label="CURRENCY" value={currency.toUpperCase()} />
      </div>
    </PageFrame>
  );
}

// Acceptance page is handled separately on the public route so we can wire
// the SignaturePad + PayButton inline.

export function AcceptancePage({
  client_company,
  data,
  brand = 'LEFTCLICK',
  children,
}: Props & { children?: React.ReactNode }) {
  const dateIssued = data.date_issued
    ? new Date(data.date_issued).toLocaleDateString()
    : '—';
  const dateStart = data.date_proposed_start
    ? new Date(data.date_proposed_start).toLocaleDateString()
    : '—';
  return (
    <PageFrame page={6} section="ACCEPTANCE" brand={brand}>
      <Heading bold="NEXT" italic="steps." />
      <p className="proposal-body max-w-md">
        Sign below and we&apos;ll send a kickoff calendar invite within{' '}
        <strong>one business day</strong>. The first phase begins on the start
        date you specify, and the project lead listed below becomes your single
        point of contact for everything that follows.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-x-12 gap-y-8">
        <DefLine label="PREPARED BY" value={data.prepared_by_name} />
        <DefLine label="PROJECT LEAD" value={data.project_lead_name} />
        <DefLine label="ISSUE DATE" value={dateIssued} />
        <DefLine label="PROPOSED START" value={dateStart} />
      </div>

      <div className="mt-12 rounded-sm border border-proposal-fg p-8">
        <h3 className="text-base font-semibold">Acceptance</h3>
        <p className="mt-2 proposal-body">
          By signing below,{' '}
          <span className="font-medium">{client_company}</span> accepts the
          scope, timeline, and investment outlined in this proposal. Work begins
          on the proposed start date once a signed copy and the first invoice
          payment have been received.
        </p>

        <div className="mt-6">{children}</div>
      </div>
    </PageFrame>
  );
}

// ── small primitives ────────────────────────────────────────────────────

function Heading({ bold, italic }: { bold: string; italic: string }) {
  return (
    <h2 className="proposal-display mb-6">
      <span className="bold">{bold}</span>{' '}
      <span className="italic">{italic}</span>
    </h2>
  );
}

function NumberedGrid({
  items,
}: {
  items: { title: string; description: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-x-12 gap-y-10">
      {items.map((item, i) => (
        <div key={i}>
          <div className="proposal-numeral">
            {String(i + 1).padStart(2, '0')}
          </div>
          <div className="mt-3 text-[15px] font-medium">
            {item.title || `Item ${i + 1}`}
          </div>
          <p className="mt-2 proposal-body-muted max-w-xs">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}

function DefBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="proposal-eyebrow-muted">{label}</div>
      <div className="mt-2 text-[15px]">{value || '—'}</div>
    </div>
  );
}

function DefLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="proposal-eyebrow-muted">{label}</div>
      <div className="mt-2 border-b border-proposal-fg/60 pb-1 text-[15px]">
        {value || '—'}
      </div>
    </div>
  );
}
