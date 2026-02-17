/**
 * Controllers.test.ts — Sprint 3 unit tests
 *
 * Tests the controller → service flow to ensure controllers:
 *   • Properly delegate to services
 *   • Do NOT contain business logic themselves
 *
 * Covers:
 *   1. AuthController — login success / failure
 *   2. TransactionController — addIncome / addExpense delegation
 *   3. ReportController — getDashboardSummary delegation
 */

import { describe, it, expect, beforeEach } from "vitest";
import { AuthController } from "@core/controller/AuthController";
import { TransactionController } from "@core/controller/TransactionController";
import { ReportController } from "@core/controller/ReportController";
import { TransactionService } from "@core/service/TransactionService";
import { ReportService } from "@core/service/ReportService";
import { InMemoryTransactionRepository } from "./InMemoryTransactionRepository";

/* ================================================================
   AuthController
   ================================================================ */

describe("AuthController", () => {
  let auth: AuthController;

  beforeEach(() => {
    auth = new AuthController();
  });

  it("should return Admin role for admin@clubzen.com", () => {
    const result = auth.login("admin@clubzen.com", "password123");
    expect(result.success).toBe(true);
    expect(result.role).toBe("Admin");
  });

  it("should return Staff role for any other valid email", () => {
    const result = auth.login("staff@example.com", "secret");
    expect(result.success).toBe(true);
    expect(result.role).toBe("Staff");
  });

  it("should return a mock token on success", () => {
    const result = auth.login("admin@clubzen.com", "pass");
    expect(result.token).toBe("mock-jwt-token");
    expect(result.userId).toBeDefined();
  });

  it("should fail when email is empty", () => {
    const result = auth.login("", "secret");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Email is required.");
  });

  it("should fail when email format is invalid", () => {
    const result = auth.login("not-an-email", "secret");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid email format.");
  });

  it("should fail when password is empty", () => {
    const result = auth.login("user@example.com", "");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Password is required.");
  });
});

/* ================================================================
   TransactionController
   ================================================================ */

describe("TransactionController", () => {
  let repo: InMemoryTransactionRepository;
  let txService: TransactionService;
  let controller: TransactionController;

  beforeEach(() => {
    repo = new InMemoryTransactionRepository();
    repo.clear();
    txService = new TransactionService(repo);
    controller = new TransactionController(txService);
  });

  it("should delegate addIncome to TransactionService", async () => {
    const tx = await controller.addIncome(500, new Date(), "Salary", "Monthly pay");

    expect(tx.type).toBe("income");
    expect(tx.amount).toBe(500);
    expect(await txService.getAll()).toHaveLength(1);
  });

  it("should delegate addExpense to TransactionService", async () => {
    const tx = await controller.addExpense(120, new Date(), "Food", "Team lunch");

    expect(tx.type).toBe("expense");
    expect(tx.amount).toBe(120);
    expect(await txService.getAll()).toHaveLength(1);
  });

  it("should propagate validation errors from the service", () => {
    expect(() =>
      controller.addIncome(0, new Date(), "Salary", "Bad amount"),
    ).toThrow("Amount must be greater than zero.");
  });

  it("should return all transactions via getAllTransactions", async () => {
    await controller.addIncome(100, new Date(), "Salary", "Pay");
    await controller.addExpense(50, new Date(), "Food", "Snacks");

    const all = await controller.getAllTransactions();
    expect(all).toHaveLength(2);
  });
});

/* ================================================================
   ReportController
   ================================================================ */

describe("ReportController", () => {
  let repo: InMemoryTransactionRepository;
  let txService: TransactionService;
  let reportCtrl: ReportController;

  beforeEach(() => {
    repo = new InMemoryTransactionRepository();
    repo.clear();
    txService = new TransactionService(repo);
    const reportService = new ReportService(txService);
    reportCtrl = new ReportController(reportService);
  });

  it("should return correct dashboard summary from service", async () => {
    await txService.addIncome(2000, new Date("2026-02-01"), "Salary", "Pay");
    await txService.addExpense(800, new Date("2026-02-05"), "Rent", "Office");

    const summary = await reportCtrl.getDashboardSummary();

    expect(summary.totalIncome).toBe(2000);
    expect(summary.totalExpense).toBe(800);
    expect(summary.netProfitLoss).toBe(1200);
  });

  it("should delegate getDailySummary to service", async () => {
    await txService.addIncome(1000, new Date("2026-03-01"), "Salary", "Mar pay");
    const daily = await reportCtrl.getDailySummary();

    expect(daily).toHaveLength(1);
    expect(daily[0].date).toBe("2026-03-01");
  });

  it("should delegate getMonthlySummary to service", async () => {
    await txService.addIncome(1000, new Date("2026-01-15"), "Salary", "Jan");
    await txService.addExpense(300, new Date("2026-02-10"), "Food", "Feb food");

    const monthly = await reportCtrl.getMonthlySummary();
    expect(monthly).toHaveLength(2);
  });
});
