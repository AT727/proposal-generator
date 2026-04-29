'use client';

import { useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  proposalRowSchema,
  type ProposalRowInput,
  emptyProposalData,
  computeTotalCents,
  formatCents,
} from '@/lib/proposals/types';

interface Props {
  initial?: ProposalRowInput;
  submitLabel?: string;
  onSubmit: (formData: FormData) => Promise<void>;
}

const DEFAULTS: ProposalRowInput = {
  client_company: '',
  client_name: '',
  client_email: '',
  title: '',
  currency: 'usd',
  data: emptyProposalData,
};

export function ProposalForm({
  initial,
  onSubmit,
  submitLabel = 'Save',
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ProposalRowInput>({
    resolver: zodResolver(proposalRowSchema),
    defaultValues: initial ?? DEFAULTS,
  });

  const lineItems = useFieldArray({ control, name: 'data.line_items' });

  const watched = watch('data');
  const currency = watch('currency');
  const total = useMemo(
    () => (watched ? computeTotalCents(watched) : 0),
    [watched],
  );

  async function onValid(values: ProposalRowInput) {
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set('payload', JSON.stringify(values));
      await onSubmit(fd);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-10">
      {/* ─── Client + title ─── */}
      <Section title="Client & title" subtitle="Cover page details.">
        <Grid2>
          <Field label="Client company" error={errors.client_company?.message}>
            <input className="app-input" {...register('client_company')} />
          </Field>
          <Field label="Client contact name" error={errors.client_name?.message}>
            <input className="app-input" {...register('client_name')} />
          </Field>
          <Field label="Client email (optional)" error={errors.client_email?.message}>
            <input
              type="email"
              className="app-input"
              {...register('client_email')}
            />
          </Field>
          <Field label="Proposal title" error={errors.title?.message}>
            <input
              className="app-input"
              placeholder="Operations System Build"
              {...register('title')}
            />
          </Field>
          <Field
            label="Project subtitle (cover)"
            error={errors.data?.project_title?.message}
          >
            <input className="app-input" {...register('data.project_title')} />
          </Field>
          <Field
            label="Quote reference number"
            error={errors.data?.quote_reference_number?.message}
          >
            <input
              className="app-input"
              placeholder="LC-2026-001"
              {...register('data.quote_reference_number')}
            />
          </Field>
          <Field
            label="Date issued"
            error={errors.data?.date_issued?.message}
          >
            <input
              type="date"
              className="app-input"
              {...register('data.date_issued')}
            />
          </Field>
          <Field label="Currency" error={errors.currency?.message}>
            <select className="app-input" {...register('currency')}>
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
              <option value="gbp">GBP</option>
              <option value="cad">CAD</option>
              <option value="aud">AUD</option>
            </select>
          </Field>
        </Grid2>
      </Section>

      {/* ─── Problems ─── */}
      <Section
        title="Problem areas"
        subtitle="Page 02 — four problems the client is currently facing."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-3 rounded-xl border border-border p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted">
                Problem 0{i + 1}
              </div>
              <Field label="Title" error={errors.data?.problems?.[i]?.title?.message}>
                <input
                  className="app-input"
                  {...register(`data.problems.${i}.title` as const)}
                />
              </Field>
              <Field
                label="Description"
                error={errors.data?.problems?.[i]?.description?.message}
              >
                <textarea
                  className="app-input"
                  rows={3}
                  {...register(`data.problems.${i}.description` as const)}
                />
              </Field>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── Benefits ─── */}
      <Section
        title="Solution benefits"
        subtitle="Page 03 — four benefits, each mapped 1-to-1 to the problems above."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-3 rounded-xl border border-border p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted">
                Benefit 0{i + 1}
              </div>
              <Field label="Title" error={errors.data?.benefits?.[i]?.title?.message}>
                <input
                  className="app-input"
                  {...register(`data.benefits.${i}.title` as const)}
                />
              </Field>
              <Field
                label="Description"
                error={errors.data?.benefits?.[i]?.description?.message}
              >
                <textarea
                  className="app-input"
                  rows={3}
                  {...register(`data.benefits.${i}.description` as const)}
                />
              </Field>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── Phases ─── */}
      <Section
        title="Approach phases"
        subtitle="Page 04 — four phases of the rollout."
      >
        <div className="space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border p-4">
              <div className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
                Phase 0{i + 1}
              </div>
              <Grid2>
                <Field
                  label="Duration"
                  error={errors.data?.phases?.[i]?.duration?.message}
                >
                  <input
                    className="app-input"
                    placeholder="2 weeks"
                    {...register(`data.phases.${i}.duration` as const)}
                  />
                </Field>
                <Field
                  label="Phase name"
                  error={errors.data?.phases?.[i]?.name?.message}
                >
                  <input
                    className="app-input"
                    placeholder="Discovery & audit"
                    {...register(`data.phases.${i}.name` as const)}
                  />
                </Field>
              </Grid2>
              <div className="mt-3">
                <Field
                  label="Description"
                  error={errors.data?.phases?.[i]?.description?.message}
                >
                  <textarea
                    className="app-input"
                    rows={2}
                    {...register(`data.phases.${i}.description` as const)}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── Investment ─── */}
      <Section
        title="Investment"
        subtitle="Page 05 — line items, payment schedule, validity. Total is computed from line items."
      >
        <div className="space-y-3">
          {lineItems.fields.map((field, i) => (
            <div
              key={field.id}
              className="rounded-xl border border-border p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium uppercase tracking-wide text-muted">
                  Line item {i + 1}
                </div>
                {lineItems.fields.length > 1 && (
                  <button
                    type="button"
                    className="text-xs text-red-600 hover:underline"
                    onClick={() => lineItems.remove(i)}
                  >
                    Remove
                  </button>
                )}
              </div>
              <Field label="Name" error={errors.data?.line_items?.[i]?.name?.message}>
                <input
                  className="app-input"
                  {...register(`data.line_items.${i}.name` as const)}
                />
              </Field>
              <Field
                label="Description"
                error={errors.data?.line_items?.[i]?.description?.message}
              >
                <input
                  className="app-input"
                  {...register(`data.line_items.${i}.description` as const)}
                />
              </Field>
              <Grid2>
                <Field
                  label="Quantity"
                  error={errors.data?.line_items?.[i]?.qty?.message}
                >
                  <input
                    type="number"
                    min={1}
                    step={1}
                    className="app-input"
                    {...register(`data.line_items.${i}.qty` as const, {
                      valueAsNumber: true,
                    })}
                  />
                </Field>
                <Field
                  label="Unit price (cents)"
                  error={errors.data?.line_items?.[i]?.unit_cents?.message}
                >
                  <input
                    type="number"
                    min={0}
                    step={1}
                    className="app-input"
                    {...register(`data.line_items.${i}.unit_cents` as const, {
                      valueAsNumber: true,
                    })}
                  />
                </Field>
              </Grid2>
            </div>
          ))}
          <button
            type="button"
            className="app-button-secondary app-button"
            onClick={() =>
              lineItems.append({
                name: '',
                description: '',
                qty: 1,
                unit_cents: 0,
              })
            }
          >
            Add line item
          </button>

          <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
            <span className="text-sm uppercase tracking-wide text-muted">
              Total
            </span>
            <span className="text-2xl font-semibold tabular-nums">
              {formatCents(total, currency || 'usd')}
            </span>
          </div>
        </div>

        <Grid2 className="mt-6">
          <Field
            label="Payment schedule"
            error={errors.data?.payment_schedule?.message}
          >
            <input
              className="app-input"
              placeholder="50% on signature, 50% on completion"
              {...register('data.payment_schedule')}
            />
          </Field>
          <Field
            label="Quote valid until"
            error={errors.data?.quote_valid_until?.message}
          >
            <input
              type="date"
              className="app-input"
              {...register('data.quote_valid_until')}
            />
          </Field>
        </Grid2>
      </Section>

      {/* ─── Acceptance ─── */}
      <Section title="Acceptance" subtitle="Page 06 — sign-off details.">
        <Grid2>
          <Field
            label="Prepared by"
            error={errors.data?.prepared_by_name?.message}
          >
            <input className="app-input" {...register('data.prepared_by_name')} />
          </Field>
          <Field
            label="Project lead"
            error={errors.data?.project_lead_name?.message}
          >
            <input className="app-input" {...register('data.project_lead_name')} />
          </Field>
          <Field
            label="Proposed start date"
            error={errors.data?.date_proposed_start?.message}
          >
            <input
              type="date"
              className="app-input"
              {...register('data.date_proposed_start')}
            />
          </Field>
        </Grid2>
      </Section>

      <div className="flex items-center justify-between border-t border-border pt-6">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="app-button ml-auto"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Grid2({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${className}`}>{children}</div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="app-label">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
