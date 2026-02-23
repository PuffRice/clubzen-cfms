/**
 * SupabaseTestHelper.ts — Utilities for tests that hit the real Supabase DB.
 *
 * Provides a shared cleanup function that deletes ALL rows from the
 * `income` and `expense` tables so each test starts with a clean slate.
 *
 * IMPORTANT: Only use this against a development / test Supabase project,
 * never against production.
 */

import { supabase } from "@core/supabase/client";

/**
 * Delete every row from both `income` and `expense` tables.
 * Call this in `beforeEach` so each test starts fresh.
 */
export async function clearSupabaseTables(): Promise<void> {
  // Supabase .delete() requires a filter — use gte(id, 0) to match all rows.
  const { error: incErr } = await supabase.from("income").delete().gte("id", 0);
  if (incErr) console.error("clearSupabaseTables income:", incErr.message);

  const { error: expErr } = await supabase.from("expense").delete().gte("id", 0);
  if (expErr) console.error("clearSupabaseTables expense:", expErr.message);
}
