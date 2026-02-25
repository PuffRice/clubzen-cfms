import { LoanService } from "../service/LoanService";
import type { Loan, LoanDirection } from "../domain";

/**
 * LoanController — thin layer between UI and LoanService.
 */
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

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
}

