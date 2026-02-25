import { supabase } from "@core/supabase/client";
import type { ITransactionRepository, TransactionRow } from "./ITransactionRepository";
import type { TransactionType } from "../domain";

/**
 * SupabaseTransactionRepository — concrete repository for Supabase.
 *
 * This class implements `ITransactionRepository` and performs all
 * operations against a `transactions` table using the shared
 * Supabase client.  Errors from Supabase are propagated as thrown
 * values so callers (services) can handle them or let them bubble up.
 */
export class SupabaseTransactionRepository implements ITransactionRepository {

  async save(
    row: Omit<TransactionRow, "id" | "created_at">
  ): Promise<TransactionRow> {
    if (row.type === "income") {
      // build insert payload, only including incomeType if provided
      const payload: any = {
        amount: row.amount,
        date: row.date,
        source: row.category,
        description: row.description,
      };
      if ((row as any).incomeType) {
        // the corresponding column will be named `income_type` in the DB
        payload.income_type = (row as any).incomeType;
      }

      const { data, error } = await supabase
        .from("income")
        .insert(payload)
        .select()
        .single();

      if (error) {
        throw error;
      }
      if (!data) {
        throw new Error("insert returned no data");
      }

      // map supabase result back to generic TransactionRow
      return {
        id: String((data as any).id),
        type: "income",
        amount: Number((data as any).amount),
        date: (data as any).date,
        category: (data as any).source,
        description: (data as any).description,
        created_at: (data as any).created_at ?? undefined,
      };
    } else {
      const payload: any = {
        amount: row.amount,
        date: row.date,
        category: row.category,
        description: row.description,
      };
      if ((row as any).paymentMethod) {
        // expense column is `payment_method`
        payload.payment_method = (row as any).paymentMethod;
      }
      const { data, error } = await supabase
        .from("expense")
        .insert(payload)
        .select()
        .single();

      if (error) {
        throw error;
      }
      if (!data) {
        throw new Error("insert returned no data");
      }

      return {
        id: String((data as any).id),
        type: "expense",
        amount: Number((data as any).amount),
        date: (data as any).date,
        category: (data as any).category,
        description: (data as any).description,
        created_at: (data as any).created_at ?? undefined,
      };
    }
  }

  async findAll(): Promise<TransactionRow[]> {
    try {
      const { data: incomes, error: errInc } = await supabase
        .from("income")
        .select();
      if (errInc) {
        throw errInc;
      }

      const { data: expenses, error: errExp } = await supabase
        .from("expense")
        .select();
      if (errExp) {
        throw errExp;
      }

      const mappedIncomes: TransactionRow[] = (incomes ?? []).map((i: any) => ({
        id: String(i.id),
        type: "income",
        amount: Number(i.amount),
        date: i.date,
        category: i.source ?? "",
        description: i.description ?? "",
        incomeType: i.income_type ?? undefined,
        created_at: i.created_at ?? undefined,
      }));

      const mappedExpenses: TransactionRow[] = (expenses ?? []).map((e: any) => ({
        id: String(e.id),
        type: "expense",
        amount: Number(e.amount),
        date: e.date,
        category: e.category ?? "",
        description: e.description ?? "",
        paymentMethod: e.payment_method ?? undefined,
        created_at: e.created_at ?? undefined,
      }));

      return [...mappedIncomes, ...mappedExpenses];
    } catch (err) {
      console.error("SupabaseTransactionRepository.findAll error:", err);
      return [];
    }
  }

  async findByType(type: TransactionType): Promise<TransactionRow[]> {
    try {
      if (type === "income") {
        const { data, error } = await supabase.from("income").select();
        if (error) throw error;
        return ((data ?? []) as any[]).map((i) => ({
          id: String(i.id),
          type: "income",
          amount: Number(i.amount),
          date: i.date,
          category: i.source ?? "",
          description: i.description ?? "",
          incomeType: i.income_type ?? undefined,
          created_at: i.created_at ?? undefined,
        }));
      } else {
        const { data, error } = await supabase.from("expense").select();
        if (error) throw error;
        return ((data ?? []) as any[]).map((e) => ({
          id: String(e.id),
          type: "expense",
          amount: Number(e.amount),
          date: e.date,
          category: e.category ?? "",
          description: e.description ?? "",
          paymentMethod: e.payment_method ?? undefined,
          created_at: e.created_at ?? undefined,
        }));
      }
    } catch (err) {
      console.error("SupabaseTransactionRepository.findByType error:", err);
      return [];
    }
  }

  async findById(id: string): Promise<TransactionRow | null> {
    try {
      // try income first
      const num = Number(id);
      if (isNaN(num)) return null;

      const { data: incData, error: incErr } = await supabase
        .from("income")
        .select()
        .eq("id", num)
        .single();

      if (incErr && incErr.code !== "PGRST116") {
        throw incErr;
      }

      if (incData) {
        return {
          id: String(incData.id),
          type: "income",
          amount: Number(incData.amount),
          date: incData.date,
          category: incData.source ?? "",
          description: incData.description ?? "",
          incomeType: incData.income_type ?? undefined,
          created_at: incData.created_at ?? undefined,
        };
      }

      const { data: expData, error: expErr } = await supabase
        .from("expense")
        .select()
        .eq("id", num)
        .single();

      if (expErr && expErr.code !== "PGRST116") {
        throw expErr;
      }

      if (expData) {
        return {
          id: String(expData.id),
          type: "expense",
          amount: Number(expData.amount),
          date: expData.date,
          category: expData.category ?? "",
          description: expData.description ?? "",
          paymentMethod: expData.payment_method ?? undefined,
          created_at: expData.created_at ?? undefined,
        };
      }

      return null;
    } catch (err) {
      console.error("SupabaseTransactionRepository.findById error:", err);
      return null;
    }
  }
}