import { Loan, LoanDirection, LoanRepayment } from "../domain";
import type { ILoanRepository } from "../repository/ILoanRepository";
import type { ILoanRepaymentRepository } from "../repository/ILoanRepaymentRepository";

/**
 * LoanService — application-level logic for loans.
 *
 * Business rules live here, not in the controller or UI.
 */
export class LoanService {
  constructor(
    private readonly loanRepo: ILoanRepository,
    private readonly repaymentRepo?: ILoanRepaymentRepository,
  ) {}

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

  async updateLoan(
    id: string,
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

    return this.loanRepo.update(id, {
      direction,
      amount,
      date,
      description,
    });
  }

  async getAllLoans(): Promise<Loan[]> {
    return this.loanRepo.findAll();
  }

  async getLoansByDirection(direction: LoanDirection): Promise<Loan[]> {
    return this.loanRepo.findByDirection(direction);
  }

  async getLoanById(id: string): Promise<Loan | null> {
    return this.loanRepo.findById(id);
  }

  async getRepaymentsByLoanId(loanId: string): Promise<LoanRepayment[]> {
    if (!this.repaymentRepo) {
      throw new Error("Repayment repository not configured");
    }
    const repayments = await this.repaymentRepo.findByLoanId(loanId);
    return repayments.map(
      (r) =>
        new LoanRepayment(
          r.id,
          r.loan_id,
          Number(r.amount),
          new Date(r.date),
          r.description,
        ),
    );
  }

  async getTotalRepaid(loanId: string): Promise<number> {
    const repayments = await this.getRepaymentsByLoanId(loanId);
    return repayments.reduce((sum, r) => sum + r.amount, 0);
  }

  async getRemainingAmount(loanId: string): Promise<number> {
    const loan = await this.loanRepo.findById(loanId);
    if (!loan) {
      throw new Error("Loan not found");
    }
    const totalRepaid = await this.getTotalRepaid(loanId);
    return loan.amount - totalRepaid;
  }
}

