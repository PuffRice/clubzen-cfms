import type { ILoanRepository } from "./ILoanRepository";
import type { ITransactionRepository, TransactionRow } from "./ITransactionRepository";
import type { LoanDirection } from "../domain";
import { Loan } from "../domain";

/**
 * SupabaseLoanRepository — Loan data-access built on top of the
 * existing transaction repository.
 *
 * It maps:
 *   • Loan "taken" → income row with category "Loan Taken"
 *   • Loan "given" → expense row with category "Loan Given"
 */
export class SupabaseLoanRepository implements ILoanRepository {
  constructor(private readonly txRepo: ITransactionRepository) {}

  async create(
    direction: LoanDirection,
    amount: number,
    date: Date,
    description: string,
  ): Promise<Loan> {
    const isTaken = direction === "taken";

    const row = await this.txRepo.save({
      type: isTaken ? "income" : "expense",
      amount,
      date: date.toISOString().slice(0, 10),
      category: isTaken ? "Loan Taken" : "Loan Given",
      description,
    });

    const loan = this.toLoan(row);
    if (!loan) {
      throw new Error("Failed to map transaction row to loan");
    }

    return loan;
  }

  async findAll(): Promise<Loan[]> {
    const rows = await this.txRepo.findAll();
    return rows
      .map((r) => this.toLoan(r))
      .filter((l): l is Loan => l !== null);
  }

  async findByDirection(direction: LoanDirection): Promise<Loan[]> {
    const isTaken = direction === "taken";
    const rows = await this.txRepo.findByType(isTaken ? "income" : "expense");

    return rows
      .map((r) => this.toLoan(r))
      .filter((l): l is Loan => l !== null);
  }

  async findById(id: string): Promise<Loan | null> {
    const row = await this.txRepo.findById(id);
    if (!row) return null;
    return this.toLoan(row);
  }

  private toLoan(row: TransactionRow): Loan | null {
    if (row.type === "income" && row.category === "Loan Taken") {
      return new Loan(
        row.id,
        Number(row.amount),
        new Date(row.date),
        "taken",
        row.description,
      );
    }

    if (row.type === "expense" && row.category === "Loan Given") {
      return new Loan(
        row.id,
        Number(row.amount),
        new Date(row.date),
        "given",
        row.description,
      );
    }

    return null;
  }
}

