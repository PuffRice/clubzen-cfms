import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { SupabaseLoanRepository } from "../repository/SupabaseLoanRepository";
import { SupabaseTransactionRepository } from "../repository/SupabaseTransactionRepository";
import { clearSupabaseTables } from "./SupabaseTestHelper";

// These tests use the real repository and DB

describe("Due Adding Integration", () => {
  let txRepo: SupabaseTransactionRepository;
  let loanRepo: SupabaseLoanRepository;

  beforeEach(async () => {
    await clearSupabaseTables();
    txRepo = new SupabaseTransactionRepository();
    loanRepo = new SupabaseLoanRepository(txRepo);
  });

  afterAll(async () => {
    await clearSupabaseTables();
  });

  it("should insert Loan Taken as income and Loan Given as expense", async () => {
    // Loan Taken
    const loanTaken = await loanRepo.create("taken", 500, new Date("2026-03-15"), "Loan for event");
    expect(loanTaken.amount).toBe(500);
    expect(loanTaken.direction).toBe("taken");
    expect(loanTaken.description).toBe("Loan for event");

    // Loan Given
    const loanGiven = await loanRepo.create("given", 300, new Date("2026-03-16"), "Loan to member");
    expect(loanGiven.amount).toBe(300);
    expect(loanGiven.direction).toBe("given");
    expect(loanGiven.description).toBe("Loan to member");

    // Check DB mapping
    const allTx = await txRepo.findAll();
    expect(allTx.some((t) => t.type === "income" && t.category === "Loan Taken" && t.amount === 500 && t.description === "Loan for event")).toBe(true);
    expect(allTx.some((t) => t.type === "expense" && t.category === "Loan Given" && t.amount === 300 && t.description === "Loan to member")).toBe(true);
  });
});
