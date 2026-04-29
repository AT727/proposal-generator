import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/service';
import { customAlphabet } from 'nanoid';

export const runtime = 'nodejs';

const bodySchema = z.object({
  slug: z.string().min(1),
  signer_name: z.string().min(1).max(120),
  signer_title: z.string().max(120).nullable().optional(),
  png_base64: z.string().startsWith('data:image/png;base64,'),
});

const fileId = customAlphabet('abcdefghjkmnpqrstuvwxyz23456789', 8);

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

  const { data: proposal, error: lookupError } = await supabase
    .from('proposals')
    .select('id, status, public_slug')
    .eq('public_slug', payload.slug)
    .maybeSingle();
  if (lookupError) {
    return NextResponse.json({ error: lookupError.message }, { status: 500 });
  }
  if (!proposal) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (proposal.status !== 'sent' && proposal.status !== 'viewed') {
    return NextResponse.json(
      { error: `Proposal is ${proposal.status}; cannot sign.` },
      { status: 409 },
    );
  }

  // Decode PNG
  const base64 = payload.png_base64.replace(/^data:image\/png;base64,/, '');
  const bytes = Buffer.from(base64, 'base64');
  if (bytes.byteLength === 0 || bytes.byteLength > 1_500_000) {
    return NextResponse.json(
      { error: 'Signature image invalid or too large' },
      { status: 400 },
    );
  }

  const path = `${proposal.id}/${fileId()}.png`;
  const { error: uploadError } = await supabase.storage
    .from('signatures')
    .upload(path, bytes, { contentType: 'image/png', upsert: false });
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  const ua = req.headers.get('user-agent') ?? null;

  const { error: sigError } = await supabase.from('signatures').insert({
    proposal_id: proposal.id,
    signer_name: payload.signer_name,
    signer_title: payload.signer_title ?? null,
    signature_url: path,
    ip,
    user_agent: ua,
  });
  if (sigError) {
    return NextResponse.json({ error: sigError.message }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from('proposals')
    .update({
      status: 'signed',
      signed_at: new Date().toISOString(),
    })
    .eq('id', proposal.id)
    .in('status', ['sent', 'viewed']);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabase.from('proposal_events').insert({
    proposal_id: proposal.id,
    type: 'signed',
    metadata: { ip, user_agent: ua, signer_name: payload.signer_name },
  });

  return NextResponse.json({ ok: true });
}
