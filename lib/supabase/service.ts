import 'server-only';
import { createClient as createServiceClient } from '@supabase/supabase-js';

// Service-role client. Bypasses RLS. Server-only.
// Used by /api/sign, /api/webhooks/stripe, /api/checkout, and /p/[slug]
// for the public-page writes (events, signatures, status flips).
export function createClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
