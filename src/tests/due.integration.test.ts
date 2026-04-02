// #1
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { SupabaseLoanRepository } from "../repository/SupabaseLoanRepository";
import { SupabaseTransactionRepository } from "../repository/SupabaseTransactionRepository";
import { clearSupabaseTables, resolveIntegrationTestUserId } from "./SupabaseTestHelper";

describe("Due Adding Integration", () => {
  let txRepo: SupabaseTransactionRepository;
  let loanRepo: SupabaseLoanRepository;

  beforeEach(async () => {
    await clearSupabaseTables();
    const userId = await resolveIntegrationTestUserId();
    txRepo = new SupabaseTransactionRepository();
    loanRepo = new SupabaseLoanRepository(txRepo, userId);
  });

  afterAll(async () => {
    await clearSupabaseTables();
  });

  //EXISTING TEST 
  it("should insert Loan Taken as income and Loan Given as expense", async () => {
    const loanTaken = await loanRepo.create("taken", 500, new Date("2026-03-15"), "Loan for event");
    expect(loanTaken.amount).toBe(500);
    expect(loanTaken.direction).toBe("taken");

    const loanGiven = await loanRepo.create("given", 300, new Date("2026-03-16"), "Loan to member");
    expect(loanGiven.amount).toBe(300);
    expect(loanGiven.direction).toBe("given");

    const allTx = await txRepo.findAll();

    expect(allTx.some((t) =>
      t.type === "income" &&
      t.category === "Loan Taken" &&
      t.amount === 500
    )).toBe(true);

    expect(allTx.some((t) =>
      t.type === "expense" &&
      t.category === "Loan Given" &&
      t.amount === 300
    )).toBe(true);
  });

  //findAll loans
  it("should return all loans using findAll()", async () => {
    await loanRepo.create("taken", 1000, new Date(), "Loan A");
    await loanRepo.create("given", 400, new Date(), "Loan B");

    const loans = await loanRepo.findAll();

    expect(loans.length).toBe(2);
    expect(loans.some(l => l.direction === "taken")).toBe(true);
    expect(loans.some(l => l.direction === "given")).toBe(true);
  });

  //filter by direction
  it("should filter loans by direction", async () => {
    await loanRepo.create("taken", 800, new Date(), "Loan A");
    await loanRepo.create("given", 200, new Date(), "Loan B");

    const takenLoans = await loanRepo.findByDirection("taken");
    const givenLoans = await loanRepo.findByDirection("given");

    expect(takenLoans.length).toBe(1);
    expect(takenLoans[0].direction).toBe("taken");

    expect(givenLoans.length).toBe(1);
    expect(givenLoans[0].direction).toBe("given");
  });

  //findById success
  it("should find loan by ID", async () => {
    const loan = await loanRepo.create("taken", 600, new Date(), "Test Loan");

    const found = await loanRepo.findById(loan.id);

    expect(found).not.toBeNull();
    expect(found?.id).toBe(loan.id);
    expect(found?.amount).toBe(600);
  });

  //findById failure
  it("should return null for non-existing loan id", async () => {
    const result = await loanRepo.findById("999999");

    expect(result).toBeNull();
  });

  //ensure non-loan transactions are ignored
  it("should ignore non-loan transactions in findAll()", async () => {
    // manually insert NON-loan data
    await txRepo.save({
      type: "income",
      amount: 999,
      date: "2026-03-20",
      category: "Salary",
      description: "Not a loan",
    });

    const loans = await loanRepo.findAll();

    expect(loans.length).toBe(0);
  });

  //date correctness
  it("should store correct date format", async () => {
    const date = new Date("2026-05-10");

    const loan = await loanRepo.create("taken", 700, date, "Date Test");

    expect(loan.date.toISOString().slice(0, 10)).toBe("2026-05-10");
  });

});