/**
 * ReportController — Thin controller that delegates to ReportService.
 *
 * Design Decision:
 *   The original ReportController.ts returned hardcoded numbers and
 *   used HttpRequest/HttpResponse.  This version delegates to the
 *   ReportService so the data is live and calculated from the
 *   in‑memory transaction store.
 */

import { ReportService, DashboardSummary, DailySummary, MonthlySummary } from "../service";

export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  getDashboardSummary(): DashboardSummary {
    return this.reportService.getDashboardSummary();
  }

  getDailySummary(): DailySummary[] {
    return this.reportService.getDailySummary();
  }

  getMonthlySummary(): MonthlySummary[] {
    return this.reportService.getMonthlySummary();
  }
}
