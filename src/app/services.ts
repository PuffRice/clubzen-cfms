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

import {
  SupabaseTransactionRepository,
  SupabaseLoanRepository,
  SupabaseAuthRepository,
} from "@core/repository";
import { SupabaseSupportTicketRepository } from "@core/repository/SupabaseSupportTicketRepository";
import { TransactionService, ReportService, LoanService } from "@core/service";
import { SupportTicketService } from "../service/SupportTicketService";
import {
  AuthController,
  TransactionController,
  ReportController,
  CategoryController,
  SettingsController,
  UserController,
  LoanController,
  SupportTicketController,
} from "@core/controller";

import { SupabaseCategoryRepository } from "../repository/SupabaseCategoryRepository";
import { CategoryService } from "../service/CategoryService";

// ── Data Access layer singletons ────────────────────────────
export const transactionRepository = new SupabaseTransactionRepository();
export const categoryRepository = new SupabaseCategoryRepository();
export const loanRepository = new SupabaseLoanRepository(transactionRepository);
export const supportTicketRepository = new SupabaseSupportTicketRepository();
export const authRepository = new SupabaseAuthRepository();

// ── Service layer singletons ────────────────────────────────
export const transactionService = new TransactionService(transactionRepository);
export const reportService = new ReportService(transactionService);
export const categoryService = new CategoryService(categoryRepository);
export const loanService = new LoanService(loanRepository);
export const supportTicketService = new SupportTicketService(supportTicketRepository);

// ── Controller layer singletons ─────────────────────────────
export const authController = new AuthController();
export const transactionController = new TransactionController(transactionService);
export const reportController = new ReportController(reportService);
export const categoryController = new CategoryController(categoryService);
export const settingsController = new SettingsController();
export const userController = new UserController();
export const loanController = new LoanController(loanService);
export const supportTicketController = new SupportTicketController(
  supportTicketService,
  authRepository
);
