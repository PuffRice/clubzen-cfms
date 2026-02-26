import { Loan, LoanDirection } from "../domain";
import type { ILoanRepository } from "../repository/ILoanRepository";

/**
 * LoanService — application-level logic for loans.
 *
 * Business rules live here, not in the controller or UI.
 */
export class LoanService {
  constructor(private readonly loanRepo: ILoanRepository) {}

  async createLoan(
    direction: LoanDirection,
    amount: number,
    date: Date,
    note?: string,
  ): Promise<Loan> {
    if (amount <= 0) {
      throw new Error("Amount must be greater than zero.");
    }

    const description =
      (note ?? "").trim() ||
      (direction === "taken" ? "Loan Taken" : "Loan Given");

    return this.loanRepo.create(direction, amount, date, description);
  }

  async getAllLoans(): Promise<Loan[]> {
    return this.loanRepo.findAll();
  }

  async getLoansByDirection(direction: LoanDirection): Promise<Loan[]> {
    return this.loanRepo.findByDirection(direction);
  }
}

