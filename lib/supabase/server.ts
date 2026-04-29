import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// SSR Supabase client bound to the request's cookies.
// Use this in Server Components, Server Actions, and Route Handlers
// when you want RLS-gated access (anon key + auth.uid()).
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll inside a Server Component is a no-op; the middleware
            // refreshes the session cookie on the next request.
          }
        },
      },
    },
  );
}
