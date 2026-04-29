'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { proposalRowSchema, computeTotalCents } from '@/lib/proposals/types';
import { generateSlug } from '@/lib/proposals/slug';

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function createProposal(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const raw = formData.get('payload');
  if (typeof raw !== 'string') throw new Error('Missing payload');
  const parsed = proposalRowSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error('Invalid form: ' + parsed.error.message);
  }
  const { client_company, client_name, client_email, title, currency, data } =
    parsed.data;
  const total_cents = computeTotalCents(data);

  const { data: row, error } = await supabase
    .from('proposals')
    .insert({
      owner_id: user.id,
      public_slug: generateSlug(),
      status: 'draft',
      client_company,
      client_name,
      client_email: client_email || null,
      title,
      currency,
      total_cents,
      data,
    })
    .select('id')
    .single();
  if (error) throw error;

  // Audit log
  await supabase.from('proposal_events').insert({
    proposal_id: row.id,
    type: 'created',
  });

  revalidatePath('/proposals');
  redirect(`/proposals/${row.id}`);
}

export async function updateProposal(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const raw = formData.get('payload');
  if (typeof raw !== 'string') throw new Error('Missing payload');
  const parsed = proposalRowSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error('Invalid form: ' + parsed.error.message);
  }
  const { client_company, client_name, client_email, title, currency, data } =
    parsed.data;
  const total_cents = computeTotalCents(data);

  const { error } = await supabase
    .from('proposals')
    .update({
      client_company,
      client_name,
      client_email: client_email || null,
      title,
      currency,
      total_cents,
      data,
    })
    .eq('id', id);
  if (error) throw error;

  revalidatePath('/proposals');
  revalidatePath(`/proposals/${id}`);
}

export async function markSent(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase
    .from('proposals')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'draft');
  if (error) throw error;

  await supabase.from('proposal_events').insert({
    proposal_id: id,
    type: 'sent',
  });

  revalidatePath('/proposals');
  revalidatePath(`/proposals/${id}`);
}

export async function deleteProposal(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase.from('proposals').delete().eq('id', id);
  if (error) throw error;

  revalidatePath('/proposals');
  redirect('/proposals');
}
