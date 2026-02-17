/**
 * TransactionService — Application‑level logic for managing transactions.
 *
 * Responsibilities:
 *   • Add income / expense with validation
 *   • Store data in an in‑memory array (acts as a simple repository)
 *   • Expose the list so other services (ReportService) can consume it
 *
 * Design Decision:
 *   Business rules live here, NOT in the controller or UI.
 *   The in‑memory array satisfies the "no database" constraint while
 *   still keeping a clean separation.  When a real repository is added
 *   we simply inject it via the constructor.
 */

import { Transaction, IncomeTransaction, ExpenseTransaction } from "../domain";

export class TransactionService {
  private transactions: Transaction[] = [];
  private nextId = 1;

  /* ── Commands ─────────────────────────────────────────────── */

  /**
   * Add an income transaction after validating the input.
   * @throws Error when validation fails.
   */
  addIncome(
    amount: number,
    date: Date,
    category: string,
    description: string,
  ): IncomeTransaction {
    this.validate(amount, category, description);

    const tx = new IncomeTransaction(
      this.generateId(),
      amount,
      date,
      category,
      description,
    );
    this.transactions.push(tx);
    return tx;
  }

  /**
   * Add an expense transaction after validating the input.
   * @throws Error when validation fails.
   */
  addExpense(
    amount: number,
    date: Date,
    category: string,
    description: string,
  ): ExpenseTransaction {
    this.validate(amount, category, description);

    const tx = new ExpenseTransaction(
      this.generateId(),
      amount,
      date,
      category,
      description,
    );
    this.transactions.push(tx);
    return tx;
  }

  /* ── Queries ──────────────────────────────────────────────── */

  /** Return all stored transactions (read‑only copy). */
  getAll(): Transaction[] {
    return [...this.transactions];
  }

  /** Return only income transactions. */
  getIncomes(): IncomeTransaction[] {
    return this.transactions.filter(
      (t): t is IncomeTransaction => t.type === "income",
    );
  }

  /** Return only expense transactions. */
  getExpenses(): ExpenseTransaction[] {
    return this.transactions.filter(
      (t): t is ExpenseTransaction => t.type === "expense",
    );
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

  private generateId(): string {
    return `txn-${this.nextId++}`;
  }
}
