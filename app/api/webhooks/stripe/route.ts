import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'STRIPE_WEBHOOK_SECRET not set' },
      { status: 500 },
    );
  }

  // Raw body — never `req.json()` first.
  const raw = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    return NextResponse.json(
      { error: `Webhook signature failed: ${e instanceof Error ? e.message : 'unknown'}` },
      { status: 400 },
    );
  }

  const supabase = createClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const proposalId =
      session.metadata?.proposal_id ?? session.client_reference_id;
    if (!proposalId) {
      return NextResponse.json({ received: true, ignored: 'no proposal id' });
    }

    // Idempotent: only update if not already paid.
    const { data: existing } = await supabase
      .from('proposals')
      .select('id, status')
      .eq('id', proposalId)
      .maybeSingle();
    if (!existing) {
      return NextResponse.json({ received: true, ignored: 'not found' });
    }
    if (existing.status === 'paid') {
      return NextResponse.json({ received: true, ignored: 'already paid' });
    }

    const { error: updateErr } = await supabase
      .from('proposals')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        stripe_session_id: session.id,
      })
      .eq('id', proposalId);
    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    await supabase.from('proposal_events').insert({
      proposal_id: proposalId,
      type: 'paid',
      metadata: {
        stripe_session_id: session.id,
        payment_intent: session.payment_intent,
        amount_total: session.amount_total,
        currency: session.currency,
      },
    });
  }

  return NextResponse.json({ received: true });
}
