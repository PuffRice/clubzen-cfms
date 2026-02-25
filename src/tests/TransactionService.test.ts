/**
 * TransactionService.test.ts — Sprint 3 unit tests
 *
 * Tests:
 *   1. Adding income creates an IncomeTransaction
 *   2. Adding expense creates an ExpenseTransaction
 *   3. Validation rejects amount <= 0
 *   4. Validation rejects empty category
 *   5. Validation rejects empty description
 *   6. getAll returns all stored transactions
 *   7. getIncomes / getExpenses filter correctly
 */

import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { TransactionService } from "@core/service/TransactionService";
import { SupabaseTransactionRepository } from "@core/repository/SupabaseTransactionRepository";
import { clearSupabaseTables } from "./SupabaseTestHelper";

describe("TransactionService", () => {
  let repo: SupabaseTransactionRepository;
  let service: TransactionService;

  beforeEach(async () => {
    await clearSupabaseTables();
    repo = new SupabaseTransactionRepository();
    service = new TransactionService(repo);
  });

  afterAll(async () => {
    await clearSupabaseTables();
  });

  /* ── addIncome ────────────────────────────────────────────── */

  it("should add an income transaction with correct properties", async () => {
    const tx = await service.addIncome(1000, new Date("2026-02-01"), "Salary", "Monthly salary");

    expect(tx.type).toBe("income");
    expect(tx.amount).toBe(1000);
    // source is alias for category
    expect(tx.source).toBe("Salary");
    expect(tx.category).toBe("Salary");
    expect(tx.description).toBe("Monthly salary");
    expect(tx.id).toBeDefined();
    expect(tx.incomeType).toBeUndefined();
  });

  it("should persist incomeType when provided and return it on later queries", async () => {
    const tx = await service.addIncome(
      1200,
      new Date("2026-03-01"),
      "Bonus",
      "Performance bonus",
      "one-time",
    );

    expect(tx.incomeType).toBe("one-time");

    const incomes = await service.getIncomes();
    expect(incomes[0].incomeType).toBe("one-time");
  });

  /* ── addExpense ───────────────────────────────────────────── */

  it("should add an expense transaction with correct properties", async () => {
    const tx = await service.addExpense(250, new Date("2026-02-05"), "Food", "Team lunch");

    expect(tx.type).toBe("expense");
    expect(tx.amount).toBe(250);
    expect(tx.category).toBe("Food");
    expect(tx.paymentMethod).toBeUndefined();
  });

  it("should persist paymentMethod when provided and return it on later queries", async () => {
    const tx = await service.addExpense(
      300,
      new Date("2026-03-05"),
      "Supplies",
      "Office supplies",
      "cash",
    );

    expect(tx.paymentMethod).toBe("cash");

    const expenses = await service.getExpenses();
    expect(expenses[0].paymentMethod).toBe("cash");
  });

  /* ── Validation: amount ───────────────────────────────────── */

  it("should throw when income amount is zero", async () => {
    await expect(
      service.addIncome(0, new Date(), "Salary", "Zero salary"),
    ).rejects.toThrow("Amount must be greater than zero.");
  });

  it("should throw when expense amount is negative", async () => {
    await expect(
      service.addExpense(-50, new Date(), "Food", "Negative"),
    ).rejects.toThrow("Amount must be greater than zero.");
  });

  /* ── Validation: category ─────────────────────────────────── */

  it("should throw when category is empty string", async () => {
    await expect(
      service.addIncome(100, new Date(), "", "No category"),
    ).rejects.toThrow("Category is required.");
  });

  it("should throw when category is only whitespace", async () => {
    await expect(
      service.addExpense(100, new Date(), "   ", "Whitespace category"),
    ).rejects.toThrow("Category is required.");
  });

  /* ── Validation: description ──────────────────────────────── */

  it("should throw when description is empty", async () => {
    await expect(
      service.addIncome(100, new Date(), "Misc", ""),
    ).rejects.toThrow("Description is required.");
  });

  /* ── getAll / getIncomes / getExpenses ────────────────────── */

  it("should return all transactions via getAll", async () => {
    await service.addIncome(500, new Date(), "Salary", "Pay");
    await service.addExpense(100, new Date(), "Food", "Lunch");
    await service.addIncome(200, new Date(), "Donation", "Sponsor");

    const all = await service.getAll();
    expect(all).toHaveLength(3);
  });

  it("should filter only incomes", async () => {
    await service.addIncome(500, new Date(), "Salary", "Pay");
    await service.addExpense(100, new Date(), "Food", "Lunch");

    const incomes = await service.getIncomes();
    expect(incomes).toHaveLength(1);
    expect(incomes[0].type).toBe("income");
  });

  it("should filter only expenses", async () => {
    await service.addIncome(500, new Date(), "Salary", "Pay");
    await service.addExpense(100, new Date(), "Food", "Lunch");

    const expenses = await service.getExpenses();
    expect(expenses).toHaveLength(1);
    expect(expenses[0].type).toBe("expense");
  });
});
