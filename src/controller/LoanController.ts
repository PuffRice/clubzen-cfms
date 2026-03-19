import { LoanService } from "../service/LoanService";
import { LoanRepaymentService } from "../service/LoanRepaymentService";
import type { Loan, LoanDirection, LoanRepayment } from "../domain";

/**
 * LoanController — thin layer between UI and LoanService.
 */
export class LoanController {
  constructor(
    private readonly loanService: LoanService,
    private readonly repaymentService?: LoanRepaymentService,
  ) {}

  async createLoan(
    direction: LoanDirection,
    amount: number,
    date: Date,
    note?: string,
  ): Promise<Loan> {
    return this.loanService.createLoan(direction, amount, date, note);
  }

  async getAllLoans(): Promise<Loan[]> {
    return this.loanService.getAllLoans();
  }

  async getLoansByDirection(direction: LoanDirection): Promise<Loan[]> {
    return this.loanService.getLoansByDirection(direction);
  }

  async getLoanById(id: string): Promise<Loan | null> {
    return this.loanService.getLoanById(id);
  }

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
    if (!this.repaymentService) {
      throw new Error("Repayment service not configured");
    }
    return this.repaymentService.makeRepayment(loanId, amount, date, description);
  }
}

