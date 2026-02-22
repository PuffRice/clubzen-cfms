/**
 * Supabase Client — Single shared client instance for the entire app.
 *
 * Reads credentials from Vite environment variables:
 *   VITE_SUPABASE_URL      — Project URL
 *   VITE_SUPABASE_ANON_KEY — Public (anon) API key
 *
 * Usage:
 *   import { supabase } from "@core/supabase/client";
 */

import { createClient } from "@supabase/supabase-js";

// allow both prefixed and unprefixed env vars so .env changes
// (or lack thereof) don't immediately break the UI.
const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  (import.meta.env.SUPABASE_URL as string);
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  (import.meta.env.SUPABASE_KEY as string);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. " +
    "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
