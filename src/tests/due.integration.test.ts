// #1
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { SupabaseLoanRepository } from "../repository/SupabaseLoanRepository";
import { SupabaseTransactionRepository } from "../repository/SupabaseTransactionRepository";
import { SupabaseLoanRepaymentRepository } from "../repository/SupabaseLoanRepaymentRepository";
import { LoanService } from "../service/LoanService";
import { LoanRepaymentService } from "../service/LoanRepaymentService";
import { clearSupabaseTables, resolveIntegrationTestUserId } from "./SupabaseTestHelper";

describe("Due Adding Integration", () => {
  let txRepo: SupabaseTransactionRepository;
  let loanRepo: SupabaseLoanRepository;
  let repaymentRepo: SupabaseLoanRepaymentRepository;
  let loanService: LoanService;
  let repaymentService: LoanRepaymentService;
  let userId: string;

  beforeEach(async () => {
    await clearSupabaseTables();
    userId = await resolveIntegrationTestUserId();
    txRepo = new SupabaseTransactionRepository();
    loanRepo = new SupabaseLoanRepository(txRepo, userId);
    repaymentRepo = new SupabaseLoanRepaymentRepository(userId);
    loanService = new LoanService(loanRepo, repaymentRepo);
    repaymentService = new LoanRepaymentService(loanRepo, repaymentRepo, txRepo);
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

  // Test loan repayment creation
  it("should create a loan repayment and update remaining amount", async () => {
    const loan = await loanRepo.create("taken", 1000, new Date("2026-03-15"), "Loan for repayment test");

    const repayment = await repaymentService.makeRepayment(loan.id, 500, new Date("2026-03-20"), "Partial repayment");

    expect(repayment.amount).toBe(500);
    expect(repayment.loanId).toBe(loan.id);

    const remaining = await loanService.getRemainingAmount(loan.id);
    expect(remaining).toBe(500);

    const totalRepaid = await loanService.getTotalRepaid(loan.id);
    expect(totalRepaid).toBe(500);
  });

  // Test full repayment
  it("should allow full repayment of a loan", async () => {
    const loan = await loanRepo.create("given", 800, new Date("2026-03-16"), "Full repayment test");

    const repayment = await repaymentService.makeRepayment(loan.id, 800, new Date("2026-03-21"), "Full repayment");

    expect(repayment.amount).toBe(800);

    const remaining = await loanService.getRemainingAmount(loan.id);
    expect(remaining).toBe(0);

    const totalRepaid = await loanService.getTotalRepaid(loan.id);
    expect(totalRepaid).toBe(800);
  });

  // Test multiple repayments
  it("should handle multiple repayments on the same loan", async () => {
    const loan = await loanRepo.create("taken", 1200, new Date("2026-03-17"), "Multiple repayments test");

    await repaymentService.makeRepayment(loan.id, 400, new Date("2026-03-22"), "First repayment");
    await repaymentService.makeRepayment(loan.id, 300, new Date("2026-03-23"), "Second repayment");

    const remaining = await loanService.getRemainingAmount(loan.id);
    expect(remaining).toBe(500);

    const totalRepaid = await loanService.getTotalRepaid(loan.id);
    expect(totalRepaid).toBe(700);

    const repayments = await loanService.getRepaymentsByLoanId(loan.id);
    expect(repayments.length).toBe(2);
    expect(repayments[0].amount).toBe(300); // Newer repayment first (date ascending false)
    expect(repayments[1].amount).toBe(400);
  });

  // Test over-repayment prevention
  it("should prevent repayment exceeding remaining amount", async () => {
    const loan = await loanRepo.create("given", 600, new Date("2026-03-18"), "Over-repayment test");

    await expect(repaymentService.makeRepayment(loan.id, 700, new Date("2026-03-24"), "Over repayment")).rejects.toThrow("Repayment amount cannot exceed remaining loan");
  });

  // Test repayment transaction creation
  it("should create corresponding transaction for repayment", async () => {
    const loan = await loanRepo.create("taken", 900, new Date("2026-03-19"), "Transaction test");

    await repaymentService.makeRepayment(loan.id, 450, new Date("2026-03-25"), "Repayment with transaction");

    const allTx = await txRepo.findAll();
    const repaymentTx = allTx.find(tx => tx.category === "Loan Repayment" && tx.amount === 450);

    expect(repaymentTx).toBeDefined();
    expect(repaymentTx?.type).toBe("expense"); // Since loan direction is "taken", repayment is expense
  });

  // Test repayment for "given" loan (repayment is income)
  it("should create income transaction for repayment on given loan", async () => {
    const loan = await loanRepo.create("given", 750, new Date("2026-03-20"), "Given loan repayment test");

    await repaymentService.makeRepayment(loan.id, 375, new Date("2026-03-26"), "Repayment on given loan");

    const allTx = await txRepo.findAll();
    const repaymentTx = allTx.find(tx => tx.category === "Loan Repayment" && tx.amount === 375);

    expect(repaymentTx).toBeDefined();
    expect(repaymentTx?.type).toBe("income"); // Since loan direction is "given", repayment is income
  });
});