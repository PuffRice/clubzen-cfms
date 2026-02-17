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

import { describe, it, expect, beforeEach } from "vitest";
import { TransactionService } from "@core/service/TransactionService";

describe("TransactionService", () => {
  let service: TransactionService;

  beforeEach(() => {
    service = new TransactionService();
  });

  /* ── addIncome ────────────────────────────────────────────── */

  it("should add an income transaction with correct properties", () => {
    const tx = service.addIncome(1000, new Date("2026-02-01"), "Salary", "Monthly salary");

    expect(tx.type).toBe("income");
    expect(tx.amount).toBe(1000);
    expect(tx.category).toBe("Salary");
    expect(tx.description).toBe("Monthly salary");
    expect(tx.id).toBeDefined();
  });

  /* ── addExpense ───────────────────────────────────────────── */

  it("should add an expense transaction with correct properties", () => {
    const tx = service.addExpense(250, new Date("2026-02-05"), "Food", "Team lunch");

    expect(tx.type).toBe("expense");
    expect(tx.amount).toBe(250);
    expect(tx.category).toBe("Food");
  });

  /* ── Validation: amount ───────────────────────────────────── */

  it("should throw when income amount is zero", () => {
    expect(() =>
      service.addIncome(0, new Date(), "Salary", "Zero salary"),
    ).toThrow("Amount must be greater than zero.");
  });

  it("should throw when expense amount is negative", () => {
    expect(() =>
      service.addExpense(-50, new Date(), "Food", "Negative"),
    ).toThrow("Amount must be greater than zero.");
  });

  /* ── Validation: category ─────────────────────────────────── */

  it("should throw when category is empty string", () => {
    expect(() =>
      service.addIncome(100, new Date(), "", "No category"),
    ).toThrow("Category is required.");
  });

  it("should throw when category is only whitespace", () => {
    expect(() =>
      service.addExpense(100, new Date(), "   ", "Whitespace category"),
    ).toThrow("Category is required.");
  });

  /* ── Validation: description ──────────────────────────────── */

  it("should throw when description is empty", () => {
    expect(() =>
      service.addIncome(100, new Date(), "Misc", ""),
    ).toThrow("Description is required.");
  });

  /* ── getAll / getIncomes / getExpenses ────────────────────── */

  it("should return all transactions via getAll", () => {
    service.addIncome(500, new Date(), "Salary", "Pay");
    service.addExpense(100, new Date(), "Food", "Lunch");
    service.addIncome(200, new Date(), "Donation", "Sponsor");

    expect(service.getAll()).toHaveLength(3);
  });

  it("should filter only incomes", () => {
    service.addIncome(500, new Date(), "Salary", "Pay");
    service.addExpense(100, new Date(), "Food", "Lunch");

    expect(service.getIncomes()).toHaveLength(1);
    expect(service.getIncomes()[0].type).toBe("income");
  });

  it("should filter only expenses", () => {
    service.addIncome(500, new Date(), "Salary", "Pay");
    service.addExpense(100, new Date(), "Food", "Lunch");

    expect(service.getExpenses()).toHaveLength(1);
    expect(service.getExpenses()[0].type).toBe("expense");
  });
});
