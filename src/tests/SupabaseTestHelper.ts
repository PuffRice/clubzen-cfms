import { supabase } from "@core/supabase/client";

export async function clearSupabaseTables(): Promise<void> {
  // income
  const { error: incErr } = await supabase.from("income").delete().gte("id", 0);
  if (incErr) console.error("clear income:", incErr.message);

  // expense
  const { error: expErr } = await supabase.from("expense").delete().gte("id", 0);
  if (expErr) console.error("clear expense:", expErr.message);

  // FIX: categories (VERY IMPORTANT)
  const { error: catErr } = await supabase.from("categories").delete().gte("id", 0);
  if (catErr) console.error("clear categories:", catErr.message);
}