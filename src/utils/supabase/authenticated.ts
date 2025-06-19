import { createClient } from '@supabase/supabase-js';

/**
 * Create authenticated Supabase client using user's access token
 * This is the secure method that respects RLS policies and user boundaries
 */
export const createClientWithToken = (accessToken: string) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}; 