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
 *
 *   Transaction creation is delegated to TransactionFactory (Factory Pattern),
 *   which encapsulates the logic of instantiating concrete transaction types.
 *   This keeps the service focused on business logic, not object creation.
 */

import { Transaction, IncomeTransaction, ExpenseTransaction, TransactionFactory } from "../domain";
import type { ITransactionRepository, TransactionRow } from "../repository";
import { formatLocalDateKey, parseStoredCalendarDate } from "../utils/calendarDate";

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
    payment_method?: string,
  ): Promise<IncomeTransaction> {
    this.validate(amount, category, description);

    // include optional field in the row sent to the repository so it can be
    // persisted once the DB schema supports it.  The repo implementation is
    // responsible for ignoring undefined values when generating SQL.
    const row = await this.repo.save({
      type: "income",
      amount,
      date: this.toDateString(date),
      category: category.trim(), // treated as "source" by the UI
      description: description.trim(),
      ...(payment_method ? { payment_method } : {}),
    });

    // when repo returns the saved row it should include any optional fields
    // that were stored; our helper will propagate them to the domain object.
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
    payment_method?: string,
  ): Promise<ExpenseTransaction> {
    this.validate(amount, category, description);

    const row = await this.repo.save({
      type: "expense",
      amount,
      date: this.toDateString(date),
      category: category.trim(),
      description: description.trim(),
      ...(payment_method ? { payment_method } : {}),
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

  /** Format a Date as "YYYY-MM-DD" for the database (local calendar day, not UTC). */
  private toDateString(d: Date): string {
    return formatLocalDateKey(d);
  }

  /** Convert a raw row into the correct domain subclass using the factory. */
  private toDomain(row: TransactionRow): Transaction {
    const recordedAt = this.parseRecordedAt(row.created_at);
    return TransactionFactory.create(row.type, {
      id: row.id,
      amount: Number(row.amount),
      date: parseStoredCalendarDate(row.date),
      recordedAt,
      ...(row.type === "income"
        ? {
            source: row.category,
            description: row.description,
            payment_method: row.payment_method,
          }
        : {
            category: row.category,
            description: row.description,
            payment_method: row.payment_method,
          }),
    });
  }

  private toDomainIncome(row: TransactionRow): IncomeTransaction {
    return TransactionFactory.create("income", {
      id: row.id,
      amount: Number(row.amount),
      date: parseStoredCalendarDate(row.date),
      source: row.category,
      description: row.description,
      payment_method: row.payment_method,
      recordedAt: this.parseRecordedAt(row.created_at),
    }) as IncomeTransaction;
  }

  private toDomainExpense(row: TransactionRow): ExpenseTransaction {
    return TransactionFactory.create("expense", {
      id: row.id,
      amount: Number(row.amount),
      date: parseStoredCalendarDate(row.date),
      category: row.category,
      description: row.description,
      payment_method: row.payment_method,
      recordedAt: this.parseRecordedAt(row.created_at),
    }) as ExpenseTransaction;
  }

  private parseRecordedAt(created_at?: string): Date | undefined {
    if (!created_at) return undefined;
    const d = new Date(created_at);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
}
