/**
 * ServiceInstances — Singleton wiring of all service / controller objects.
 *
 * Design Decision:
 *   A single file creates and exports shared instances so that
 *   every React component (and every test that imports these) uses
 *   the same in‑memory data store during a session.
 *   This is intentionally simple — no DI container.
 */

import { TransactionService, ReportService } from "@core/service";
import {
  AuthController,
  TransactionController,
  ReportController,
} from "@core/controller";

// ── Service layer singletons ────────────────────────────────
export const transactionService = new TransactionService();
export const reportService = new ReportService(transactionService);

// ── Controller layer singletons ─────────────────────────────
export const authController = new AuthController();
export const transactionController = new TransactionController(transactionService);
export const reportController = new ReportController(reportService);
