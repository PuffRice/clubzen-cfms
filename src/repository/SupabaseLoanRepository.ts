import type { ILoanRepository } from "./ILoanRepository";
import type { ITransactionRepository } from "./ITransactionRepository";
import type { LoanDirection } from "../domain";
import { Loan } from "../domain";
import { supabase } from "@core/supabase/client";

type LoanDbRow = {
  id: number;
  user_id: string;
  direction: string;
  amount: number | string;
  note: string | null;
  created_at: string;
  updated_at: string;
  mirror_income_id?: number | null;
  mirror_expense_id?: number | null;
};

let mirrorColumnsSupported: boolean | null = null;

async function hasMirrorColumns(): Promise<boolean> {
  if (mirrorColumnsSupported !== null) return mirrorColumnsSupported;
  const { error } = await supabase
    .from("loans")
    .select("mirror_income_id")
    .limit(0);
  mirrorColumnsSupported = !error;
  return mirrorColumnsSupported;
}

/**
 * SupabaseLoanRepository — source of truth is the `loans` table.
 * Each loan is mirrored to `income` (Loan Taken) or `expense` (Loan Given) for reports.
 * If `mirror_income_id` / `mirror_expense_id` columns exist they are kept in sync;
 * otherwise the mirroring still works — we just can't update old mirrors on edits.
 */
export class SupabaseLoanRepository implements ILoanRepository {
  constructor(
    private readonly txRepo: ITransactionRepository,
    private readonly userIdOverride?: string | null,
  ) {}

  private async getCurrentUserId(): Promise<string> {
    if (this.userIdOverride) {
      return this.userIdOverride;
    }
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error("You must be signed in to manage loans.");
    }
    return user.id;
  }

  private toLoan(row: LoanDbRow): Loan {
    return new Loan(
      String(row.id),
      Number(row.amount),
      new Date(row.created_at),
      row.direction as LoanDirection,
      (row.note ?? "").trim() || (row.direction === "taken" ? "Loan Taken" : "Loan Given"),
    );
  }

  async create(
    direction: LoanDirection,
    amount: number,
    date: Date,
    description: string,
  ): Promise<Loan> {
    const userId = await this.getCurrentUserId();
    const note =
      description.trim() ||
      (direction === "taken" ? "Loan Taken" : "Loan Given");

    // 1. Insert into `loans`
    const { data: loanInsert, error: insertErr } = await supabase
      .from("loans")
      .insert({
        user_id: userId,
        direction,
        amount,
        note,
        created_at: date.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertErr) throw insertErr;
    if (!loanInsert) throw new Error("insert into loans returned no row");

    const loanId = (loanInsert as LoanDbRow).id;

    // 2. Mirror to income/expense for reporting
    try {
      const txRow = await this.txRepo.save({
        type: direction === "taken" ? "income" : "expense",
        amount,
        date: date.toISOString().slice(0, 10),
        category: direction === "taken" ? "Loan Taken" : "Loan Given",
        description: note,
      });

      // 3. If mirror columns exist, link the mirror row back to the loan
      if (await hasMirrorColumns()) {
        const patch: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
          mirror_income_id: direction === "taken" ? Number(txRow.id) : null,
          mirror_expense_id: direction === "given" ? Number(txRow.id) : null,
        };
        await supabase.from("loans").update(patch).eq("id", loanId);
      }
    } catch (mirrorErr) {
      console.warn("Mirror transaction failed (loan was still created):", mirrorErr);
    }

    // Re-fetch so we return the final state
    const { data: final, error: fetchErr } = await supabase
      .from("loans")
      .select()
      .eq("id", loanId)
      .single();
    if (fetchErr) throw fetchErr;
    return this.toLoan(final as LoanDbRow);
  }

  async update(
    id: string,
    params: {
      direction: LoanDirection;
      amount: number;
      date: Date;
      description: string;
    },
  ): Promise<Loan> {
    const num = Number(id);
    if (Number.isNaN(num)) {
      throw new Error("Invalid loan id");
    }
    if (params.amount <= 0) {
      throw new Error("Amount must be greater than zero.");
    }

    const userId = await this.getCurrentUserId();

    const { data: existing, error: fetchErr } = await supabase
      .from("loans")
      .select()
      .eq("id", num)
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!existing) throw new Error("Loan not found");

    const row = existing as LoanDbRow;
    const note =
      params.description.trim() ||
      (params.direction === "taken" ? "Loan Taken" : "Loan Given");
    const dateStr = params.date.toISOString().slice(0, 10);

    // Update the loans row itself (only core columns that always exist)
    const loanPatch: Record<string, unknown> = {
      direction: params.direction,
      amount: params.amount,
      note,
      created_at: params.date.toISOString(),
      updated_at: new Date().toISOString(),
    };

    const useMirror = await hasMirrorColumns();

    // Try to update or create the mirrored transaction
    try {
      const directionChanged = row.direction !== params.direction;
      let mirrorIncomeId = row.mirror_income_id ?? null;
      let mirrorExpenseId = row.mirror_expense_id ?? null;

      if (directionChanged && useMirror) {
        if (mirrorIncomeId != null) {
          await supabase.from("income").delete().eq("id", mirrorIncomeId);
        }
        if (mirrorExpenseId != null) {
          await supabase.from("expense").delete().eq("id", mirrorExpenseId);
        }
        mirrorIncomeId = null;
        mirrorExpenseId = null;
      }

      const canUpdateInPlace =
        !directionChanged &&
        useMirror &&
        ((params.direction === "taken" && mirrorIncomeId != null) ||
          (params.direction === "given" && mirrorExpenseId != null));

      if (canUpdateInPlace) {
        if (params.direction === "taken" && mirrorIncomeId != null) {
          await this.txRepo.update({
            id: String(mirrorIncomeId),
            type: "income",
            amount: params.amount,
            date: dateStr,
            category: "Loan Taken",
            description: note,
          });
        } else if (params.direction === "given" && mirrorExpenseId != null) {
          await this.txRepo.update({
            id: String(mirrorExpenseId),
            type: "expense",
            amount: params.amount,
            date: dateStr,
            category: "Loan Given",
            description: note,
          });
        }
      } else {
        const txRow = await this.txRepo.save({
          type: params.direction === "taken" ? "income" : "expense",
          amount: params.amount,
          date: dateStr,
          category: params.direction === "taken" ? "Loan Taken" : "Loan Given",
          description: note,
        });
        mirrorIncomeId = params.direction === "taken" ? Number(txRow.id) : null;
        mirrorExpenseId = params.direction === "given" ? Number(txRow.id) : null;
      }

      if (useMirror) {
        loanPatch.mirror_income_id = mirrorIncomeId;
        loanPatch.mirror_expense_id = mirrorExpenseId;
      }
    } catch (mirrorErr) {
      console.warn("Mirror update failed:", mirrorErr);
    }

    const { data, error } = await supabase
      .from("loans")
      .update(loanPatch)
      .eq("id", num)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("Loan update returned no row");

    return this.toLoan(data as LoanDbRow);
  }

  async findAll(): Promise<Loan[]> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from("loans")
      .select()
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map((row) => this.toLoan(row as LoanDbRow));
  }

  async findByDirection(direction: LoanDirection): Promise<Loan[]> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from("loans")
      .select()
      .eq("user_id", userId)
      .eq("direction", direction)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map((row) => this.toLoan(row as LoanDbRow));
  }

  async findById(id: string): Promise<Loan | null> {
    const num = Number(id);
    if (Number.isNaN(num)) return null;
    const userId = await this.getCurrentUserId();
    const { data, error } = await supabase
      .from("loans")
      .select()
      .eq("id", num)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data ? this.toLoan(data as LoanDbRow) : null;
  }
}
