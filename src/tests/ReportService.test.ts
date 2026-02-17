/**
 * ReportService.test.ts — Sprint 3 unit tests
 *
 * Tests:
 *   1. Total income calculation
 *   2. Total expense calculation
 *   3. Net profit / loss calculation
 *   4. Dashboard summary shape
 *   5. Daily summary grouping
 *   6. Monthly summary grouping
 *   7. Empty data edge case
 */

import { describe, it, expect, beforeEach } from "vitest";
import { TransactionService } from "@core/service/TransactionService";
import { ReportService } from "@core/service/ReportService";
import { InMemoryTransactionRepository } from "./InMemoryTransactionRepository";

describe("ReportService", () => {
  let repo: InMemoryTransactionRepository;
  let txService: TransactionService;
  let reportService: ReportService;

  beforeEach(() => {
    repo = new InMemoryTransactionRepository();
    repo.clear();
    txService = new TransactionService(repo);
    reportService = new ReportService(txService);
  });

  /* ── Totals ───────────────────────────────────────────────── */

  it("should calculate total income correctly", async () => {
    await txService.addIncome(1000, new Date("2026-02-01"), "Salary", "Pay");
    await txService.addIncome(500, new Date("2026-02-15"), "Donation", "Sponsor");

    expect(await reportService.getTotalIncome()).toBe(1500);
  });

  it("should calculate total expense correctly", async () => {
    await txService.addExpense(200, new Date("2026-02-03"), "Food", "Lunch");
    await txService.addExpense(800, new Date("2026-02-10"), "Rent", "Office rent");

    expect(await reportService.getTotalExpense()).toBe(1000);
  });

  it("should calculate net profit (income > expense)", async () => {
    await txService.addIncome(3000, new Date("2026-02-01"), "Salary", "Pay");
    await txService.addExpense(1000, new Date("2026-02-02"), "Rent", "Office");

    expect(await reportService.getNetProfitLoss()).toBe(2000);
  });

  it("should calculate net loss (expense > income)", async () => {
    await txService.addIncome(500, new Date("2026-02-01"), "Salary", "Pay");
    await txService.addExpense(1200, new Date("2026-02-02"), "Rent", "Office");

    expect(await reportService.getNetProfitLoss()).toBe(-700);
  });

  /* ── Dashboard summary ────────────────────────────────────── */

  it("should return correct dashboard summary shape", async () => {
    await txService.addIncome(2000, new Date("2026-02-01"), "Salary", "Pay");
    await txService.addExpense(500, new Date("2026-02-05"), "Food", "Catering");

    const summary = await reportService.getDashboardSummary();

    expect(summary).toEqual({
      totalIncome: 2000,
      totalExpense: 500,
      netProfitLoss: 1500,
    });
  });

  /* ── Daily summary ────────────────────────────────────────── */

  it("should group transactions by day", async () => {
    await txService.addIncome(1000, new Date("2026-02-01"), "Salary", "Pay");
    await txService.addExpense(200, new Date("2026-02-01"), "Food", "Lunch");
    await txService.addExpense(300, new Date("2026-02-02"), "Transport", "Fuel");

    const daily = await reportService.getDailySummary();

    expect(daily).toHaveLength(2);

    const feb01 = daily.find((d) => d.date === "2026-02-01");
    expect(feb01).toBeDefined();
    expect(feb01!.totalIncome).toBe(1000);
    expect(feb01!.totalExpense).toBe(200);
    expect(feb01!.net).toBe(800);

    const feb02 = daily.find((d) => d.date === "2026-02-02");
    expect(feb02).toBeDefined();
    expect(feb02!.totalIncome).toBe(0);
    expect(feb02!.totalExpense).toBe(300);
    expect(feb02!.net).toBe(-300);
  });

  /* ── Monthly summary ──────────────────────────────────────── */

  it("should group transactions by month", async () => {
    await txService.addIncome(1000, new Date("2026-01-15"), "Salary", "Jan pay");
    await txService.addIncome(1000, new Date("2026-02-15"), "Salary", "Feb pay");
    await txService.addExpense(400, new Date("2026-02-20"), "Food", "Catering");

    const monthly = await reportService.getMonthlySummary();

    expect(monthly).toHaveLength(2);

    const jan = monthly.find((m) => m.month === "2026-01");
    expect(jan!.totalIncome).toBe(1000);
    expect(jan!.totalExpense).toBe(0);

    const feb = monthly.find((m) => m.month === "2026-02");
    expect(feb!.totalIncome).toBe(1000);
    expect(feb!.totalExpense).toBe(400);
    expect(feb!.net).toBe(600);
  });

  /* ── Edge case: no data ───────────────────────────────────── */

  it("should return zeros when there are no transactions", async () => {
    expect(await reportService.getTotalIncome()).toBe(0);
    expect(await reportService.getTotalExpense()).toBe(0);
    expect(await reportService.getNetProfitLoss()).toBe(0);
    expect(await reportService.getDailySummary()).toEqual([]);
    expect(await reportService.getMonthlySummary()).toEqual([]);
  });
});
