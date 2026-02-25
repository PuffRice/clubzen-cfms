import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryTransactionRepository } from "../tests/InMemoryTransactionRepository";
import type { TransactionType } from "../domain";

/**
 * Basic sanity checks on the in-memory repository.  These tests act as a
 * lightweight "unit" suite for the data layer and guard against regressions
 * when the shape of `TransactionRow` changes.
 */

describe("InMemoryTransactionRepository", () => {
  let repo: InMemoryTransactionRepository;

  beforeEach(() => {
    repo = new InMemoryTransactionRepository();
  });

  it("should save and return an income row with incomeType", async () => {
    const saved = await repo.save({
      type: "income",
      amount: 100,
      date: "2026-06-01",
      category: "Salary",
      description: "June pay",
      incomeType: "one-time",
    } as any);

    expect(saved.incomeType).toBe("one-time");

    const rows = await repo.findAll();
    expect(rows).toHaveLength(1);
    expect(rows[0].incomeType).toBe("one-time");
  });

  it("should save and return an expense row with paymentMethod", async () => {
    const saved = await repo.save({
      type: "expense",
      amount: 50,
      date: "2026-06-02",
      category: "Food",
      description: "Lunch",
      paymentMethod: "cash",
    } as any);

    expect(saved.paymentMethod).toBe("cash");

    const expenses = await repo.findByType("expense");
    expect(expenses[0].paymentMethod).toBe("cash");
  });
});
