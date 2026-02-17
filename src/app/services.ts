/**
 * Service & Controller singletons — shared across the entire app.
 *
 * Moved from presentation/ServiceInstances.ts so that the polished
 * app/ pages can import directly without cross‑layer dependencies.
 */

import { TransactionService, ReportService } from "@core/service";
import {
  AuthController,
  TransactionController,
  ReportController,
  CategoryController,
  SettingsController,
  UserController,
} from "@core/controller";

// ── Service layer singletons ────────────────────────────────
export const transactionService = new TransactionService();
export const reportService = new ReportService(transactionService);

// ── Controller layer singletons ─────────────────────────────
export const authController = new AuthController();
export const transactionController = new TransactionController(transactionService);
export const reportController = new ReportController(reportService);
export const categoryController = new CategoryController();
export const settingsController = new SettingsController();
export const userController = new UserController();
