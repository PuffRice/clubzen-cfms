/**
 * SupabaseTransactionRepository — Concrete data-access layer.
 *
 * Implements ITransactionRepository by executing queries against the
 * Supabase `transactions` table.  This is the ONLY file that knows
 * about the Supabase client; all other layers remain database-agnostic.
 */

import { supabase } from "../supabase/client";
import type { ITransactionRepository, TransactionRow } from "./ITransactionRepository";
import type { TransactionType } from "../domain";

export class SupabaseTransactionRepository implements ITransactionRepository {

  /** Insert a new row into the `transactions` table. */
  async save(
    row: Omit<TransactionRow, "id" | "created_at">,
  ): Promise<TransactionRow> {
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        type: row.type,
        amount: row.amount,
        date: row.date,
        category: row.category,
        description: row.description,
      })
      .select()          // return the inserted row
      .single();

    if (error) {
      throw new Error(`Supabase insert failed: ${error.message}`);
    }

    return data as TransactionRow;
  }

  /** Fetch all transactions, newest first. */
  async findAll(): Promise<TransactionRow[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      throw new Error(`Supabase select failed: ${error.message}`);
    }

    return (data ?? []) as TransactionRow[];
  }

  /** Fetch transactions filtered by type (income / expense). */
  async findByType(type: TransactionType): Promise<TransactionRow[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("type", type)
      .order("date", { ascending: false });

    if (error) {
      throw new Error(`Supabase select failed: ${error.message}`);
    }

    return (data ?? []) as TransactionRow[];
  }

  /** Fetch a single transaction by UUID. */
  async findById(id: string): Promise<TransactionRow | null> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Supabase select failed: ${error.message}`);
    }

    return (data as TransactionRow) ?? null;
  }
}
