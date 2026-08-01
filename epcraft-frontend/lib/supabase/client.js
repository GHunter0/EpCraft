import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for client-side / browser components.
 * Fallbacks are provided to prevent static prerendering build failures when env vars are unset.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  )
}
