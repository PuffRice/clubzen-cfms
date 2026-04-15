/**
 * ReportBuilder — Builder pattern for composable report creation.
 *
 * Allows flexible, chainable report configuration without parameter explosion.
 * Enables developers to construct complex reports with readable method calls.
 *
 * Example:
 *   const report = new ReportBuilder(transactionService)
 *     .forRange(new Date('2024-01-01'), new Date('2024-12-31'))
 *     .byCategory('Food')
 *     .byType('expense')
 *     .groupBy('month')
 *     .build();
 */

import { Transaction } from "../domain";
import { TransactionService } from "./TransactionService";
import { formatLocalDateKey, formatLocalMonthKey } from "../utils/calendarDate";

export type GroupBy = "daily" | "monthly" | "none";
export type FilterType = "income" | "expense" | "both";

export interface ReportQuery {
  startDate?: Date;
  endDate?: Date;
  categories?: string[];
  type?: FilterType;
  groupBy?: GroupBy;
  excludeInternal?: boolean;
}

export interface GroupedReport {
  groupKey: string;
  totalIncome: number;
  totalExpense: number;
  net: number;
  count: number;
}

export interface FilteredReport {
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  net: number;
  count: number;
}

export class ReportBuilder {
  private query: ReportQuery = {
    type: "both",
    groupBy: "none",
    excludeInternal: false,
  };

  constructor(private readonly transactionService: TransactionService) {}

  /**
   * Set date range for the report (inclusive on both ends)
   */
  forRange(startDate: Date, endDate: Date): this {
    if (startDate > endDate) {
      throw new Error("Start date must be before or equal to end date");
    }
    this.query.startDate = startDate;
    this.query.endDate = endDate;
    return this;
  }

  /**
   * Filter by single category
   */
  byCategory(category: string): this {
    this.query.categories = [category];
    return this;
  }

  /**
   * Filter by multiple categories
   */
  byCategories(categories: string[]): this {
    if (categories.length === 0) {
      throw new Error("At least one category required");
    }
    this.query.categories = categories;
    return this;
  }

  /**
   * Filter by transaction type (income, expense, or both)
   */
  byType(type: FilterType): this {
    this.query.type = type;
    return this;
  }

  /**
   * Group results by daily, monthly, or not at all
   */
  groupBy(groupBy: GroupBy): this {
    this.query.groupBy = groupBy;
    return this;
  }

  /**
   * Exclude internal transactions (e.g., transfers between accounts)
   */
  excludeInternal(): this {
    this.query.excludeInternal = true;
    return this;
  }

  /**
   * Include internal transactions (default)
   */
  includeInternal(): this {
    this.query.excludeInternal = false;
    return this;
  }

  /**
   * Build and execute the report query
   */
  async build(): Promise<FilteredReport | GroupedReport[]> {
    // Fetch all transactions
    const all = await this.transactionService.getAll();

    // Apply filters
    let filtered = this.applyFilters(all);

    // Return grouped or flat result
    if (this.query.groupBy === "daily") {
      return this.groupByDaily(filtered);
    } else if (this.query.groupBy === "monthly") {
      return this.groupByMonthly(filtered);
    } else {
      return this.flattenResult(filtered);
    }
  }

  /**
   * Shortcut to build a dashboard-style summary (all data, no grouping)
   */
  async buildDashboard(): Promise<FilteredReport> {
    const all = await this.transactionService.getAll();
    const filtered = this.applyFilters(all);
    return this.flattenResult(filtered);
  }

  /**
   * Shortcut to build a daily-grouped report
   */
  async buildDaily(): Promise<GroupedReport[]> {
    const all = await this.transactionService.getAll();
    const filtered = this.applyFilters(all);
    return this.groupByDaily(filtered);
  }

  /**
   * Shortcut to build a monthly-grouped report
   */
  async buildMonthly(): Promise<GroupedReport[]> {
    const all = await this.transactionService.getAll();
    const filtered = this.applyFilters(all);
    return this.groupByMonthly(filtered);
  }

  /**
   * ── Private helpers ───────────────────────────────────────
   */

  private applyFilters(transactions: Transaction[]): Transaction[] {
    return transactions
      .filter((t) => this.filterByDateRange(t))
      .filter((t) => this.filterByCategory(t))
      .filter((t) => this.filterByType(t))
      .filter((t) => this.filterByInternal(t));
  }

  private filterByDateRange(t: Transaction): boolean {
    if (!this.query.startDate && !this.query.endDate) return true;

    const txDate = t.date.getTime();
    const start = this.query.startDate?.getTime() ?? 0;
    const end = this.query.endDate?.getTime() ?? Date.now();

    return txDate >= start && txDate <= end;
  }

  private filterByCategory(t: Transaction): boolean {
    if (!this.query.categories || this.query.categories.length === 0) return true;
    return this.query.categories.includes(t.category);
  }

  private filterByType(t: Transaction): boolean {
    if (this.query.type === "both") return true;
    return t.type === this.query.type;
  }

  private filterByInternal(t: Transaction): boolean {
    if (!this.query.excludeInternal) return true;
    // Exclude "Loan" category transactions (internal transfers)
    return !t.category.includes("Loan");
  }

  private flattenResult(transactions: Transaction[]): FilteredReport {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      transactions,
      totalIncome: income,
      totalExpense: expense,
      net: income - expense,
      count: transactions.length,
    };
  }

  private groupByDaily(transactions: Transaction[]): GroupedReport[] {
    const grouped = this.groupByHelper(transactions, (t) => this.formatDate(t.date));
    return this.buildGroupedReport(grouped);
  }

  private groupByMonthly(transactions: Transaction[]): GroupedReport[] {
    const grouped = this.groupByHelper(transactions, (t) => this.formatMonth(t.date));
    return this.buildGroupedReport(grouped);
  }

  private buildGroupedReport(
    grouped: Record<string, Transaction[]>
  ): GroupedReport[] {
    return Object.entries(grouped).map(([groupKey, txns]) => {
      const income = txns
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = txns
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        groupKey,
        totalIncome: income,
        totalExpense: expense,
        net: income - expense,
        count: txns.length,
      };
    });
  }

  private groupByHelper<T>(
    items: T[],
    keyFn: (item: T) => string
  ): Record<string, T[]> {
    return items.reduce<Record<string, T[]>>((acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }

  private formatDate(d: Date): string {
    return formatLocalDateKey(d);
  }

  private formatMonth(d: Date): string {
    return formatLocalMonthKey(d);
  }
}
