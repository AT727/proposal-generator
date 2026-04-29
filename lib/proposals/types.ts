import { z } from 'zod';

// Mirrors the LEFTCLICK 6-page template exactly:
//   01 Cover · 02 Problem · 03 Solution · 04 Approach · 05 Investment · 06 Acceptance
// Each form field maps to a placeholder in business_proposal_template.pdf.

export const problemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export const benefitSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export const phaseSchema = z.object({
  duration: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
});

export const lineItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  qty: z.number().int().min(1),
  unit_cents: z.number().int().min(0),
});

export const proposalDataSchema = z.object({
  // Cover (page 1)
  project_title: z.string().min(1),
  quote_reference_number: z.string().min(1),
  date_issued: z.string().min(1),
  // Problem (page 2)
  problems: z.array(problemSchema).length(4),
  // Solution (page 3)
  benefits: z.array(benefitSchema).length(4),
  // Approach (page 4)
  phases: z.array(phaseSchema).length(4),
  // Investment (page 5)
  line_items: z.array(lineItemSchema).min(1).max(8),
  payment_schedule: z.string().min(1),
  quote_valid_until: z.string().min(1),
  // Acceptance (page 6)
  prepared_by_name: z.string().min(1),
  project_lead_name: z.string().min(1),
  date_proposed_start: z.string().min(1),
});

export type ProposalData = z.infer<typeof proposalDataSchema>;

// Form input shape. total_cents is computed from line_items in the action.
export const proposalRowSchema = z.object({
  client_company: z.string().min(1),
  client_name: z.string().min(1),
  client_email: z.string().email().optional().or(z.literal('')),
  title: z.string().min(1),
  currency: z.string().length(3),
  data: proposalDataSchema,
});

export type ProposalRowInput = z.infer<typeof proposalRowSchema>;

export type ProposalStatus =
  | 'draft' | 'sent' | 'viewed' | 'signed' | 'paid' | 'cancelled';

export interface Proposal {
  id: string;
  owner_id: string;
  public_slug: string;
  status: ProposalStatus;
  client_company: string;
  client_name: string;
  client_email: string | null;
  title: string;
  data: ProposalData;
  total_cents: number;
  currency: string;
  stripe_session_id: string | null;
  paid_at: string | null;
  signed_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export const STATUS_LABEL: Record<ProposalStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  signed: 'Signed',
  paid: 'Paid',
  cancelled: 'Cancelled',
};

// Empty default values so the create form has 4 problem/benefit/phase rows.
export const emptyProposalData: ProposalData = {
  project_title: '',
  quote_reference_number: '',
  date_issued: new Date().toISOString().slice(0, 10),
  problems: Array.from({ length: 4 }, () => ({ title: '', description: '' })),
  benefits: Array.from({ length: 4 }, () => ({ title: '', description: '' })),
  phases: Array.from({ length: 4 }, () => ({
    duration: '',
    name: '',
    description: '',
  })),
  line_items: [{ name: '', description: '', qty: 1, unit_cents: 0 }],
  payment_schedule: '50% on signature, 50% on completion',
  quote_valid_until: '',
  prepared_by_name: '',
  project_lead_name: '',
  date_proposed_start: '',
};

export function computeTotalCents(data: ProposalData): number {
  return data.line_items.reduce((sum, li) => sum + li.qty * li.unit_cents, 0);
}

export function formatCents(cents: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}
