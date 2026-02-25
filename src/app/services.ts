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

import { SupabaseTransactionRepository, SupabaseLoanRepository } from "@core/repository";
import { TransactionService, ReportService, LoanService } from "@core/service";
import {
  AuthController,
  TransactionController,
  ReportController,
  CategoryController,
  SettingsController,
  UserController,
  LoanController,
} from "@core/controller";

import { SupabaseCategoryRepository } from "../repository/SupabaseCategoryRepository";
import { CategoryService } from "../service/CategoryService";

// ── Data Access layer singletons ────────────────────────────
export const transactionRepository = new SupabaseTransactionRepository();
export const categoryRepository = new SupabaseCategoryRepository();
export const loanRepository = new SupabaseLoanRepository(transactionRepository);

// ── Service layer singletons ────────────────────────────────
export const transactionService = new TransactionService(transactionRepository);
export const reportService = new ReportService(transactionService);
export const categoryService = new CategoryService(categoryRepository);
export const loanService = new LoanService(loanRepository);

// ── Controller layer singletons ─────────────────────────────
export const authController = new AuthController();
export const transactionController = new TransactionController(transactionService);
export const reportController = new ReportController(reportService);
export const categoryController = new CategoryController(categoryService);
export const settingsController = new SettingsController();
export const userController = new UserController();
export const loanController = new LoanController(loanService);
