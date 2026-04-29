import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/service';
import { getStripe } from '@/lib/stripe/server';

export const runtime = 'nodejs';

const bodySchema = z.object({
  slug: z.string().min(1),
});

export async function POST(req: NextRequest) {
  let payload: z.infer<typeof bodySchema>;
  try {
    payload = bodySchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Invalid body' },
      { status: 400 },
    );
  }

  const supabase = createClient();
  const { data: proposal, error } = await supabase
    .from('proposals')
    .select(
      'id, status, public_slug, title, total_cents, currency, stripe_session_id',
    )
    .eq('public_slug', payload.slug)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!proposal) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (proposal.status === 'paid') {
    return NextResponse.json(
      { error: 'Already paid' },
      { status: 409 },
    );
  }
  if (proposal.status !== 'signed') {
    return NextResponse.json(
      { error: 'Sign the proposal before paying.' },
      { status: 409 },
    );
  }
  if (proposal.total_cents <= 0) {
    return NextResponse.json(
      { error: 'No amount to charge.' },
      { status: 409 },
    );
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: proposal.currency,
          product_data: { name: proposal.title || 'Proposal' },
          unit_amount: proposal.total_cents,
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/p/${proposal.public_slug}/paid?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/p/${proposal.public_slug}/cancelled`,
    client_reference_id: proposal.id,
    metadata: {
      proposal_id: proposal.id,
      public_slug: proposal.public_slug,
    },
  });

  await supabase
    .from('proposals')
    .update({ stripe_session_id: session.id })
    .eq('id', proposal.id);

  return NextResponse.json({ url: session.url });
}
