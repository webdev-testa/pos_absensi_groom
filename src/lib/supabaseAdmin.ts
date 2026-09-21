import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin Client — uses the SERVICE ROLE KEY.
 * 
 * ⚠️  WARNING: The service-role key bypasses Row-Level Security.
 *     Only use this client in admin-only pages / internal tools.
 *     For a production setup, move admin operations to a secure
 *     server-side API (Edge Function / backend) instead of
 *     exposing the service-role key in the browser.
 */
export const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      storageKey: 'supabase.admin.auth.token',
    },
    db: {
      schema: import.meta.env.VITE_SUPABASE_SCHEMA || 'public',
    },
  }
)
