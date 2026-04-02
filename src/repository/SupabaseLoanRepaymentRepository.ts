import { supabase } from "@core/supabase/client";
import { formatLocalDateKey } from "../utils/calendarDate";
import { ILoanRepaymentRepository } from "./ILoanRepaymentRepository";

export class SupabaseLoanRepaymentRepository implements ILoanRepaymentRepository {

  private async getCurrentUserId(): Promise<string> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error("User not authenticated");
    }

    return user.id;
  }

  async createRepayment(
    loanId: string,
    amount: number,
    date: Date,
    description?: string
  ) {
    const userId = await this.getCurrentUserId();

    const { data, error } = await supabase
      .from("loan_repayments")
      .insert({
        loan_id: Number(loanId),
        user_id: userId, // ✅ FIXED
        amount,
        date: formatLocalDateKey(date),
        description: description || null
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data;
  }

  async findByLoanId(loanId: string) {
    const { data, error } = await supabase
      .from("loan_repayments")
      .select("*")
      .eq("loan_id", Number(loanId))
      .order("date", { ascending: false });

    if (error) throw new Error(error.message);

    return data || [];
  }
}