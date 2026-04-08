import { LoanService } from "../service/LoanService";
import { LoanRepaymentService } from "../service/LoanRepaymentService";
import type { LoanRepayment } from "../domain";

export class LoanRepaymentController {
  constructor(
    private readonly loanService: LoanService,
    private readonly repaymentService: LoanRepaymentService,
  ) {}

  async getRepaymentsByLoanId(loanId: string): Promise<LoanRepayment[]> {
    return this.loanService.getRepaymentsByLoanId(loanId);
  }

  async getTotalRepaid(loanId: string): Promise<number> {
    return this.loanService.getTotalRepaid(loanId);
  }

  async getRemainingAmount(loanId: string): Promise<number> {
    return this.loanService.getRemainingAmount(loanId);
  }

  async makeRepayment(
    loanId: string,
    amount: number,
    date: Date,
    description?: string,
  ): Promise<LoanRepayment> {
    return this.repaymentService.makeRepayment(loanId, amount, date, description);
  }
}
