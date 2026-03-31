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

    if (!loan) {
      throw new Error("Loan not found");
    }

    const repayments = await this.repaymentRepo.findByLoanId(loanId);

    const totalRepaid = repayments.reduce(
      (sum, r) => sum + Number(r.amount),
      0
    );

    const remaining = loan.amount - totalRepaid;

    if (amount > remaining) {
      throw new Error("Repayment amount cannot exceed remaining loan");
    }

    const repayment = await this.repaymentRepo.createRepayment(
      loanId,
      amount,
      date,
      description
    );

    /**
     * BUSINESS RULE
     */

    if (loan.direction === "given") {

      await this.txRepo.save({
        type: "income",
        amount: amount,
        date: formatLocalDateKey(date),
        category: "Loan Repayment",
        description: description || "Loan repayment received"
      });

    } else {

      await this.txRepo.save({
        type: "expense",
        amount: amount,
        date: formatLocalDateKey(date),
        category: "Loan Repayment",
        description: description || "Loan repayment paid"
      });

    }

    return repayment;
  }
}