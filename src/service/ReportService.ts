/**
 * ReportService — Generates financial summaries from transaction data.
 *
 * Responsibilities:
 *   • Total income / total expense / net profit‑or‑loss
 *   • Simple daily summary   (group by YYYY‑MM‑DD)
 *   • Simple monthly summary (group by YYYY‑MM)
 *
 * Design Decision:
 *   ReportService receives a TransactionService instance so it can
 *   query data without owning the storage.  This keeps reporting
 *   logic separated from data‑mutation logic.
 */

import { Transaction } from "../domain";
import { TransactionService } from "./TransactionService";

export interface DailySummary {
  date: string;          // "YYYY-MM-DD"
  totalIncome: number;
  totalExpense: number;
  net: number;
}

export interface MonthlySummary {
  month: string;         // "YYYY-MM"
  totalIncome: number;
  totalExpense: number;
  net: number;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  netProfitLoss: number;
}

export class ReportService {
  constructor(private readonly transactionService: TransactionService) {}

  /* ── Aggregate helpers ────────────────────────────────────── */

  async getTotalIncome(): Promise<number> {
    const incomes = await this.transactionService.getIncomes();
    return incomes.reduce((sum, t) => sum + t.amount, 0);
  }

  async getTotalExpense(): Promise<number> {
    const expenses = await this.transactionService.getExpenses();
    return expenses.reduce((sum, t) => sum + t.amount, 0);
  }

  async getNetProfitLoss(): Promise<number> {
    const [income, expense] = await Promise.all([
      this.getTotalIncome(),
      this.getTotalExpense(),
    ]);
    return income - expense;
  }

  /* ── Dashboard ────────────────────────────────────────────── */

  async getDashboardSummary(): Promise<DashboardSummary> {
    const [totalIncome, totalExpense] = await Promise.all([
      this.getTotalIncome(),
      this.getTotalExpense(),
    ]);
    return {
      totalIncome,
      totalExpense,
      netProfitLoss: totalIncome - totalExpense,
    };
  }

  /* ── Daily summary ────────────────────────────────────────── */

  async getDailySummary(): Promise<DailySummary[]> {
    const all = await this.transactionService.getAll();
    const grouped = this.groupBy(all, (t) => this.formatDate(t.date));

    return Object.entries(grouped).map(([date, txns]) => {
      const income = txns
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
      const expense = txns
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);
      return { date, totalIncome: income, totalExpense: expense, net: income - expense };
    });
  }

  /* ── Monthly summary ──────────────────────────────────────── */

  async getMonthlySummary(): Promise<MonthlySummary[]> {
    const all = await this.transactionService.getAll();
    const grouped = this.groupBy(all, (t) => this.formatMonth(t.date));

    return Object.entries(grouped).map(([month, txns]) => {
      const income = txns
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
      const expense = txns
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);
      return { month, totalIncome: income, totalExpense: expense, net: income - expense };
    });
  }

  /* ── Private helpers ──────────────────────────────────────── */

  private formatDate(d: Date): string {
    return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
  }

  private formatMonth(d: Date): string {
    return d.toISOString().slice(0, 7); // "YYYY-MM"
  }

  private groupBy<T>(
    items: T[],
    keyFn: (item: T) => string,
  ): Record<string, T[]> {
    return items.reduce<Record<string, T[]>>((acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }
}
