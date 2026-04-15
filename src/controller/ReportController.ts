/**
 * ReportController — Thin controller that delegates to ReportService.
 *
 * All methods are async because the underlying service now queries
 * the Supabase database through the repository layer.
 *
 * The ReportBuilder pattern enables flexible report composition:
 *
 *   // Example: Monthly expense report for a category
 *   const report = await reportService
 *     .query()
 *     .forRange(janStart, janEnd)
 *     .byCategory('Food')
 *     .byType('expense')
 *     .groupBy('month')
 *     .build();
 */

import { ReportService, DashboardSummary, DailySummary, MonthlySummary } from "../service";

export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  async getDashboardSummary(): Promise<DashboardSummary> {
    return this.reportService.getDashboardSummary();
  }

  async getDailySummary(): Promise<DailySummary[]> {
    return this.reportService.getDailySummary();
  }

  async getMonthlySummary(): Promise<MonthlySummary[]> {
    return this.reportService.getMonthlySummary();
  }

  /**
   * Custom report: Expenses by category for a given month
   */
  async getExpensesByCategory(month: string): Promise<any> {
    const [year, monthNum] = month.split("-").map(Number);
    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 0);

    return this.reportService
      .query()
      .forRange(start, end)
      .byType("expense")
      .groupBy("none") // Flat list per category
      .build();
  }

  /**
   * Custom report: Income vs Expense by month for a date range
   */
  async getIncomeVsExpense(startDate: Date, endDate: Date): Promise<any> {
    return this.reportService
      .query()
      .forRange(startDate, endDate)
      .groupBy("monthly")
      .build();
  }

  /**
   * Custom report: Food category spending (daily breakdown)
   */
  async getFoodSpendingDaily(startDate: Date, endDate: Date): Promise<any> {
    return this.reportService
      .query()
      .forRange(startDate, endDate)
      .byCategory("Food")
      .byType("expense")
      .groupBy("daily")
      .build();
  }

  /**
   * Custom report: Loan-related transactions for a period
   */
  async getLoanActivityReport(startDate: Date, endDate: Date): Promise<any> {
    return this.reportService
      .query()
      .forRange(startDate, endDate)
      .byCategories(["Loan", "Loan Repayment"])
      .build();
  }
}
