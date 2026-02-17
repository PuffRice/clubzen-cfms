/**
 * Service & Controller singletons — shared across the entire app.
 *
 * Wiring order:
 *   Repository  →  Service  →  Controller
 *
 * The SupabaseTransactionRepository is the concrete data-access layer
 * that talks to the cloud database.  Everything else is injected via
 * constructor parameters (Dependency Inversion).
 */

import { SupabaseTransactionRepository } from "@core/repository";
import { TransactionService, ReportService } from "@core/service";
import {
  AuthController,
  TransactionController,
  ReportController,
  CategoryController,
  SettingsController,
  UserController,
} from "@core/controller";

// ── Data Access layer singleton ─────────────────────────────
export const transactionRepository = new SupabaseTransactionRepository();

// ── Service layer singletons ────────────────────────────────
export const transactionService = new TransactionService(transactionRepository);
export const reportService = new ReportService(transactionService);

// ── Controller layer singletons ─────────────────────────────
export const authController = new AuthController();
export const transactionController = new TransactionController(transactionService);
export const reportController = new ReportController(reportService);
export const categoryController = new CategoryController();
export const settingsController = new SettingsController();
export const userController = new UserController();
