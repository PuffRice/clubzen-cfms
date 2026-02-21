/**
 * TransactionService — Application‑level logic for managing transactions.
 *
 * Responsibilities:
 *   • Validate inputs (amount > 0, category required, etc.)
 *   • Delegate persistence to an ITransactionRepository
 *   • Convert raw rows into domain objects for the rest of the app
 *
 * Design Decision:
 *   Business rules live here, NOT in the controller or UI.
 *   The service receives a repository through its constructor so
 *   storage is fully decoupled (Dependency Inversion).
 */

import { Transaction, IncomeTransaction, ExpenseTransaction } from "../domain";
import type { ITransactionRepository, TransactionRow } from "../repository";

export class TransactionService {
  constructor(private readonly repo: ITransactionRepository) {}

  /* ── Commands ─────────────────────────────────────────────── */

  /**
   * Add an income transaction after validating the input.
   * @throws Error when validation fails or persistence fails.
   */
  async addIncome(
    amount: number,
    date: Date,
    category: string,
    description: string,
  ): Promise<IncomeTransaction> {
    this.validate(amount, category, description);

    const row = await this.repo.save({
      type: "income",
      amount,
      date: this.toDateString(date),
      category: category.trim(),
      description: description.trim(),
    });

    return this.toDomainIncome(row);
  }

  /**
   * Add an expense transaction after validating the input.
   * @throws Error when validation fails or persistence fails.
   */
  async addExpense(
    amount: number,
    date: Date,
    category: string,
    description: string,
  ): Promise<ExpenseTransaction> {
    this.validate(amount, category, description);

    const row = await this.repo.save({
      type: "expense",
      amount,
      date: this.toDateString(date),
      category: category.trim(),
      description: description.trim(),
    });

    return this.toDomainExpense(row);
  }

  /* ── Queries ──────────────────────────────────────────────── */

  /** Return all stored transactions (domain objects). */
  async getAll(): Promise<Transaction[]> {
    const rows = await this.repo.findAll();
    return rows.map((r) => this.toDomain(r));
  }

  /** Return only income transactions. */
  async getIncomes(): Promise<IncomeTransaction[]> {
    const rows = await this.repo.findByType("income");
    return rows.map((r) => this.toDomainIncome(r));
  }

  /** Return only expense transactions. */
  async getExpenses(): Promise<ExpenseTransaction[]> {
    const rows = await this.repo.findByType("expense");
    return rows.map((r) => this.toDomainExpense(r));
  }

  /* ── Private helpers ──────────────────────────────────────── */

  private validate(
    amount: number,
    category: string,
    description: string,
  ): void {
    if (amount <= 0) {
      throw new Error("Amount must be greater than zero.");
    }
    if (!category || category.trim().length === 0) {
      throw new Error("Category is required.");
    }
    if (!description || description.trim().length === 0) {
      throw new Error("Description is required.");
    }
  }

  /** Format a Date as "YYYY-MM-DD" for the database. */
  private toDateString(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  /** Convert a raw row into the correct domain subclass. */
  private toDomain(row: TransactionRow): Transaction {
    if (row.type === "income") return this.toDomainIncome(row);
    return this.toDomainExpense(row);
  }

  private toDomainIncome(row: TransactionRow): IncomeTransaction {
    return new IncomeTransaction(
      row.id,
      Number(row.amount),
      new Date(row.date),
      row.category,
      row.description,
    );
  }

  private toDomainExpense(row: TransactionRow): ExpenseTransaction {
    return new ExpenseTransaction(
      row.id,
      Number(row.amount),
      new Date(row.date),
      row.category,
      row.description,
    );
  }
}
