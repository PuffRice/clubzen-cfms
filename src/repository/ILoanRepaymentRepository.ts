export interface LoanRepaymentRow {
  id: number | string;
  loan_id: number | string;
  amount: number | string;
  date: string;
  description?: string | null;
}

export interface ILoanRepaymentRepository {
  createRepayment(
    loanId: string,
    amount: number,
    date: Date,
    description?: string,
  ): Promise<LoanRepaymentRow>;

  findByLoanId(loanId: string): Promise<LoanRepaymentRow[]>;
}
