import { ILoanRepository } from "../repository/ILoanRepository";
import { ILoanRepaymentRepository } from "../repository/ILoanRepaymentRepository";
import { ITransactionRepository } from "../repository/ITransactionRepository";
import { formatLocalDateKey } from "../utils/calendarDate";

export class LoanRepaymentService {

  constructor(
    private loanRepo: ILoanRepository,
    private repaymentRepo: ILoanRepaymentRepository,
    private txRepo: ITransactionRepository
  ) {}

  async makeRepayment(
  loanId: string,
  amount: number,
  date: Date,
  description?: string
) {

  if (amount <= 0) {
    throw new Error("Repayment amount must be greater than zero");
  }

  const loan = await this.loanRepo.findById(loanId);
  if (!loan) throw new Error("Loan not found");

  const repayments = await this.repaymentRepo.findByLoanId(loanId);

  const totalRepaid = repayments.reduce(
    (sum, r) => sum + Number(r.amount),
    0
  );

  const remaining = loan.amount - totalRepaid;

  if (amount > remaining) {
    throw new Error("Repayment amount cannot exceed remaining loan");
  }

  //SAVE REPAYMENT
  const repayment = await this.repaymentRepo.createRepayment(
    loanId,
    amount,
    date,
    description
  );

  // BUSINESS LOGIC (income/expense)
  try {
    await this.txRepo.save({
      type: loan.direction === "given" ? "income" : "expense",
      amount,
      date: formatLocalDateKey(date),
      category: "Loan Repayment",
      description:
        description ||
        (loan.direction === "given"
          ? "Loan repayment received"
          : "Loan repayment paid"),
    });
  } catch (txError: any) {
    // Check for duplicate key error (code 23505 from Supabase)
    const errorCode = txError.code || txError.status;
    const errorMessage = txError.message || "";
    
    if (errorCode === "23505" || errorMessage.includes("duplicate key")) {
      // Transaction already exists (likely from Supabase trigger or auto-increment)
      console.warn("Loan repayment transaction already created:", {
        code: errorCode,
        message: errorMessage,
      });
      // Continue anyway - the repayment is saved, just not the expense transaction
    } else {
      // It's a different error, so throw it
      console.error("Transaction save error:", txError);
      throw txError;
    }
  }

  return repayment;
}
}

