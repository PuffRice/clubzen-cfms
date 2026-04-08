import { LoanRepayment } from "../domain";
import type { ILoanRepository } from "../repository/ILoanRepository";
import type {
  ILoanRepaymentRepository,
  LoanRepaymentRow,
} from "../repository/ILoanRepaymentRepository";
import type { ITransactionRepository } from "../repository/ITransactionRepository";
import { formatLocalDateKey } from "../utils/calendarDate";

export class LoanRepaymentService {
  constructor(
    private loanRepo: ILoanRepository,
    private repaymentRepo: ILoanRepaymentRepository,
    private txRepo: ITransactionRepository,
  ) {}

  private mapToLoanRepayment(row: LoanRepaymentRow): LoanRepayment {
    return new LoanRepayment(
      String(row.id),
      String(row.loan_id),
      Number(row.amount),
      new Date(row.date),
      row.description ?? undefined,
    );
  }

  async makeRepayment(
    loanId: string,
    amount: number,
    date: Date,
    description?: string,
  ): Promise<LoanRepayment> {
    if (amount <= 0) {
      throw new Error("Repayment amount must be greater than zero");
    }

    const loan = await this.loanRepo.findById(loanId);
    if (!loan) throw new Error("Loan not found");

    const repayments = await this.repaymentRepo.findByLoanId(loanId);

    const totalRepaid = repayments.reduce(
      (sum, r) => sum + Number(r.amount),
      0,
    );

    const remaining = loan.amount - totalRepaid;

    if (amount > remaining) {
      throw new Error("Repayment amount cannot exceed remaining loan");
    }

    const repaymentRow = await this.repaymentRepo.createRepayment(
      loanId,
      amount,
      date,
      description,
    );

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
      const errorCode = txError.code || txError.status;
      const errorMessage = txError.message || "";

      if (errorCode === "23505" || errorMessage.includes("duplicate key")) {
        console.warn("Loan repayment transaction already created:", {
          code: errorCode,
          message: errorMessage,
        });
      } else {
        console.error("Transaction save error:", txError);
        throw txError;
      }
    }

    return this.mapToLoanRepayment(repaymentRow);
  }
}


