/**
 * ReportController — Thin controller that delegates to ReportService.
 *
 * All methods are async because the underlying service now queries
 * the Supabase database through the repository layer.
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
}
