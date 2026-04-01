// #1
import { supabase } from "@core/supabase/client";

export async function clearSupabaseTables(): Promise<void> {
  const { error: repErr } = await supabase
    .from("support_ticket_replies")
    .delete()
    .gte("id", 0);
  if (repErr) console.error("clear support_ticket_replies:", repErr.message);

  const { error: stErr } = await supabase.from("support_tickets").delete().gte("id", 0);
  if (stErr) console.error("clear support_tickets:", stErr.message);

  const { error: lrErr } = await supabase.from("loan_repayments").delete().gte("id", 0);
  if (lrErr) console.error("clear loan_repayments:", lrErr.message);

  const { error: loansErr } = await supabase.from("loans").delete().gte("id", 0);
  if (loansErr) console.error("clear loans:", loansErr.message);

  const { error: incErr } = await supabase.from("income").delete().gte("id", 0);
  if (incErr) console.error("clear income:", incErr.message);

  const { error: expErr } = await supabase.from("expense").delete().gte("id", 0);
  if (expErr) console.error("clear expense:", expErr.message);

  const { error: catErr } = await supabase.from("categories").delete().gte("id", 0);
  if (catErr) console.error("clear categories:", catErr.message);
}

/**
 * Resolves a `public.users.id` UUID for integration tests.
 * Prefer `VITE_TEST_LOAN_USER_ID`, then sign-in, then first row in `users`.
 */
export async function resolveIntegrationTestUserId(): Promise<string> {
  const fromEnv = import.meta.env.VITE_TEST_LOAN_USER_ID as string | undefined;
  if (fromEnv?.trim()) {
    return fromEnv.trim();
  }

  const adminEmail = import.meta.env.VITE_TEST_ADMIN_EMAIL ?? "admin@gmail.com";
  const adminPassword = import.meta.env.VITE_TEST_ADMIN_PASSWORD ?? "password123";

  const { data: sessionData, error: signErr } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  });
  if (!signErr && sessionData.user?.id) {
    return sessionData.user.id;
  }

  const { data: row, error: userErr } = await supabase
    .from("users")
    .select("id")
    .limit(1)
    .maybeSingle();
  if (!userErr && row?.id) {
    return row.id;
  }

  throw new Error(
    "Integration tests need a user id: set VITE_TEST_LOAN_USER_ID in .env, " +
      "or valid VITE_TEST_ADMIN_EMAIL / VITE_TEST_ADMIN_PASSWORD, " +
      "or allow anon read on public.users with at least one row.",
  );
}
