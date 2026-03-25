import { supabase } from "@core/supabase/client";
import { ILoanRepaymentRepository } from "./ILoanRepaymentRepository";

export class SupabaseLoanRepaymentRepository implements ILoanRepaymentRepository {

  async createRepayment(
    loanId: string,
    amount: number,
    date: Date,
    description?: string
  ) {

    const { data, error } = await supabase
      .from("loan_repayments")
      .insert({
        loan_id: loanId,
        amount: amount,
        date: date.toISOString().slice(0,10),
        description: description || null
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async findByLoanId(loanId: string) {

    const { data, error } = await supabase
      .from("loan_repayments")
      .select("*")
      .eq("loan_id", loanId);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }
}