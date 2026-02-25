/**
 * Integration.test.ts — Integration tests for income & expense flows.
 *
 * Unlike unit tests that test a single class in isolation, these
 * integration tests verify the FULL path:
 *
 *   Controller → Service → Repository → Domain objects
 *
 * Each test exercises a realistic user scenario end‑to‑end and
 * asserts the combined behaviour of every layer involved.
 *
 * Covers:
 *   1.  Add income end‑to‑end and verify persistence
 *   2.  Add expense end‑to‑end and verify persistence
 *   3.  Mixed income + expense flow with report generation
 *   4.  Validation errors propagate from service through controller
 *   5.  Filtering incomes / expenses after mixed insertions
 *   6.  Multiple incomes accumulate correctly
 *   7.  Multiple expenses accumulate correctly
 *   8.  Dashboard summary reflects combined transactions
 *   9.  Daily summary groups transactions by date
 *  10.  Monthly summary groups transactions by month
 *  11.  Optional fields (incomeType, paymentMethod) pass through
 *  12.  Empty state returns correct defaults
 */

import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { TransactionController } from "@core/controller/TransactionController";
import { ReportController } from "@core/controller/ReportController";
import { TransactionService } from "@core/service/TransactionService";
import { ReportService } from "@core/service/ReportService";
import { SupabaseTransactionRepository } from "@core/repository/SupabaseTransactionRepository";
import { clearSupabaseTables } from "./SupabaseTestHelper";

describe("Integration — Income & Expense flows", () => {
  let repo: SupabaseTransactionRepository;
  let txService: TransactionService;
  let txController: TransactionController;
  let reportController: ReportController;

  beforeEach(async () => {
    await clearSupabaseTables();
    repo = new SupabaseTransactionRepository();
    txService = new TransactionService(repo);
    txController = new TransactionController(txService);
    const reportService = new ReportService(txService);
    reportController = new ReportController(reportService);
  });

  afterAll(async () => {
    await clearSupabaseTables();
  });

  /* ================================================================
     1. Add income — full path
     ================================================================ */

  it("should persist an income transaction through Controller → Service → Repository", async () => {
    // ACT — call through the controller (the entry point the UI would use)
    const income = await txController.addIncome(
      5000,
      new Date("2026-02-01"),
      "Membership Fees",
      "February membership dues",
    );

    // ASSERT — domain object returned correctly
    expect(income.type).toBe("income");
    expect(income.amount).toBe(5000);
    expect(income.source).toBe("Membership Fees");
    expect(income.category).toBe("Membership Fees");
    expect(income.description).toBe("February membership dues");
    expect(income.id).toBeDefined();

    // ASSERT — data actually reached the repository
    const rows = await repo.findAll();
    expect(rows).toHaveLength(1);
    expect(rows[0].type).toBe("income");
    expect(rows[0].amount).toBe(5000);
    expect(rows[0].category).toBe("Membership Fees");
  });

  /* ================================================================
     2. Add expense — full path
     ================================================================ */

  it("should persist an expense transaction through Controller → Service → Repository", async () => {
    const expense = await txController.addExpense(
      1200,
      new Date("2026-02-05"),
      "Utilities",
      "Electricity bill for February",
    );

    expect(expense.type).toBe("expense");
    expect(expense.amount).toBe(1200);
    expect(expense.category).toBe("Utilities");
    expect(expense.description).toBe("Electricity bill for February");
    expect(expense.id).toBeDefined();

    const rows = await repo.findAll();
    expect(rows).toHaveLength(1);
    expect(rows[0].type).toBe("expense");
    expect(rows[0].amount).toBe(1200);
  });

  /* ================================================================
     3. Mixed flow — income + expense + report
     ================================================================ */

  it("should compute correct dashboard summary after mixed transactions", async () => {
    await txController.addIncome(10000, new Date("2026-02-01"), "Dues", "Monthly dues");
    await txController.addIncome(3000, new Date("2026-02-10"), "Sponsorship", "Gold sponsor");
    await txController.addExpense(4000, new Date("2026-02-03"), "Rent", "Club‑house rent");
    await txController.addExpense(1500, new Date("2026-02-07"), "Supplies", "Cleaning supplies");

    const summary = await reportController.getDashboardSummary();

    expect(summary.totalIncome).toBe(13000);
    expect(summary.totalExpense).toBe(5500);
    expect(summary.netProfitLoss).toBe(7500);
  });

  /* ================================================================
     4. Validation errors propagate through the controller
     ================================================================ */

  it("should reject zero‑amount income at the controller level", async () => {
    await expect(
      txController.addIncome(0, new Date(), "Salary", "Zero"),
    ).rejects.toThrow("Amount must be greater than zero.");
  });

  it("should reject negative‑amount expense at the controller level", async () => {
    await expect(
      txController.addExpense(-100, new Date(), "Food", "Negative"),
    ).rejects.toThrow("Amount must be greater than zero.");
  });

  it("should reject empty category through the controller", async () => {
    await expect(
      txController.addIncome(100, new Date(), "", "No category"),
    ).rejects.toThrow("Category is required.");
  });

  it("should reject empty description through the controller", async () => {
    await expect(
      txController.addExpense(100, new Date(), "Food", ""),
    ).rejects.toThrow("Description is required.");
  });

  /* ================================================================
     5. Filtering after mixed insertions
     ================================================================ */

  it("should return only incomes when filtering after mixed data", async () => {
    await txController.addIncome(2000, new Date("2026-03-01"), "Dues", "March dues");
    await txController.addExpense(500, new Date("2026-03-02"), "Food", "Team lunch");
    await txController.addIncome(1000, new Date("2026-03-05"), "Donation", "Anonymous");

    const incomes = await txService.getIncomes();
    expect(incomes).toHaveLength(2);
    incomes.forEach((tx) => expect(tx.type).toBe("income"));
  });

  it("should return only expenses when filtering after mixed data", async () => {
    await txController.addIncome(2000, new Date("2026-03-01"), "Dues", "March dues");
    await txController.addExpense(500, new Date("2026-03-02"), "Food", "Team lunch");
    await txController.addExpense(300, new Date("2026-03-04"), "Transport", "Cab");

    const expenses = await txService.getExpenses();
    expect(expenses).toHaveLength(2);
    expenses.forEach((tx) => expect(tx.type).toBe("expense"));
  });

  /* ================================================================
     6. Multiple incomes accumulate correctly
     ================================================================ */

  it("should accumulate multiple incomes in the repository", async () => {
    await txController.addIncome(1000, new Date("2026-01-01"), "Dues", "Jan dues");
    await txController.addIncome(1500, new Date("2026-02-01"), "Dues", "Feb dues");
    await txController.addIncome(2000, new Date("2026-03-01"), "Dues", "Mar dues");

    const all = await txController.getAllTransactions();
    expect(all).toHaveLength(3);

    const total = all.reduce((sum, tx) => sum + tx.amount, 0);
    expect(total).toBe(4500);
  });

  /* ================================================================
     7. Multiple expenses accumulate correctly
     ================================================================ */

  it("should accumulate multiple expenses in the repository", async () => {
    await txController.addExpense(800, new Date("2026-01-10"), "Rent", "Jan rent");
    await txController.addExpense(600, new Date("2026-02-10"), "Rent", "Feb rent");
    await txController.addExpense(400, new Date("2026-03-10"), "Rent", "Mar rent");

    const all = await txController.getAllTransactions();
    expect(all).toHaveLength(3);

    const total = all.reduce((sum, tx) => sum + tx.amount, 0);
    expect(total).toBe(1800);
  });

  /* ================================================================
     8. Dashboard summary on empty state
     ================================================================ */

  it("should return zeroes for dashboard summary when no transactions exist", async () => {
    const summary = await reportController.getDashboardSummary();

    expect(summary.totalIncome).toBe(0);
    expect(summary.totalExpense).toBe(0);
    expect(summary.netProfitLoss).toBe(0);
  });

  /* ================================================================
     9. Daily summary groups transactions correctly
     ================================================================ */

  it("should group transactions by day in the daily summary", async () => {
    // Two transactions on the same day, one on a different day
    await txController.addIncome(1000, new Date("2026-04-01"), "Dues", "Day1 income");
    await txController.addExpense(200, new Date("2026-04-01"), "Food", "Day1 expense");
    await txController.addIncome(500, new Date("2026-04-02"), "Donation", "Day2 income");

    const daily = await reportController.getDailySummary();

    // Should have entries for the two distinct dates
    const dates = daily.map((d) => d.date);
    expect(dates).toContain("2026-04-01");
    expect(dates).toContain("2026-04-02");
  });

  /* ================================================================
    10. Monthly summary groups transactions correctly
     ================================================================ */

  it("should group transactions by month in the monthly summary", async () => {
    await txController.addIncome(3000, new Date("2026-01-15"), "Dues", "Jan income");
    await txController.addExpense(1000, new Date("2026-01-20"), "Rent", "Jan expense");
    await txController.addIncome(4000, new Date("2026-02-10"), "Dues", "Feb income");

    const monthly = await reportController.getMonthlySummary();

    expect(monthly.length).toBeGreaterThanOrEqual(2);
  });

  /* ================================================================
    11. Optional fields pass through the full stack
     ================================================================ */

  it("should carry incomeType through controller → service → domain and survive retrieval", async () => {
    const income = await txController.addIncome(
      2500,
      new Date("2026-02-15"),
      "Sponsorship",
      "Event sponsor",
      "one-time",
    );

    expect(income.incomeType).toBe("one-time");

    // fetch from service later to ensure repository returned the field as well
    const incomes = await txService.getIncomes();
    expect(incomes[0].incomeType).toBe("one-time");
    // repository row should also carry the field
    const rows = await repo.findAll();
    expect(rows[0].incomeType).toBe("one-time");  });

  it("should carry paymentMethod through controller → service → domain and survive retrieval", async () => {
    const expense = await txController.addExpense(
      750,
      new Date("2026-02-20"),
      "Catering",
      "Event food",
      "bank-transfer",
    );

    expect(expense.paymentMethod).toBe("bank-transfer");

    const rows = await repo.findAll();
    expect(rows[0].paymentMethod).toBe("bank-transfer");

    const expenses = await txService.getExpenses();
    expect(expenses[0].paymentMethod).toBe("bank-transfer");
  });

  /* ================================================================
    12. Data consistency — repository state matches service queries
     ================================================================ */

  it("should have consistent counts between repository and service layer", async () => {
    await txController.addIncome(1000, new Date("2026-05-01"), "Dues", "May dues");
    await txController.addExpense(300, new Date("2026-05-02"), "Food", "Lunch");
    await txController.addIncome(500, new Date("2026-05-03"), "Donation", "Sponsor");
    await txController.addExpense(200, new Date("2026-05-04"), "Transport", "Cab");

    // Repository level
    const repoRows = await repo.findAll();
    // Service level
    const serviceTxns = await txService.getAll();
    // Controller level
    const controllerTxns = await txController.getAllTransactions();

    // All three layers must agree on the count
    expect(repoRows).toHaveLength(4);
    expect(serviceTxns).toHaveLength(4);
    expect(controllerTxns).toHaveLength(4);

    // And on individual type counts
    const repoIncomes = await repo.findByType("income");
    const serviceIncomes = await txService.getIncomes();
    expect(repoIncomes).toHaveLength(2);
    expect(serviceIncomes).toHaveLength(2);

    const repoExpenses = await repo.findByType("expense");
    const serviceExpenses = await txService.getExpenses();
    expect(repoExpenses).toHaveLength(2);
    expect(serviceExpenses).toHaveLength(2);
  });
});
