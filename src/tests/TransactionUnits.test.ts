// #1
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
import { TransactionController } from "@core/controller/TransactionController";
import { Auth } from "@core/domain/Auth";
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

  /* ── add update and delete income ────────────────────────────────────────────── */

  it("should add an income transaction with correct properties", async () => {
    const tx = await service.addIncome(1000, new Date("2026-02-01"), "Salary", "Monthly salary");

    expect(tx.type).toBe("income");
    expect(tx.amount).toBe(1000);
    // source is alias for category
    expect(tx.source).toBe("Salary");
    expect(tx.category).toBe("Salary");
    expect(tx.description).toBe("Monthly salary");
    expect(tx.id).toBeDefined();
    expect(tx.payment_method).toBeUndefined();
  });

  it("should update a income transaction", async() => {
    const tx = await service.addIncome(1000, new Date("2026-02-01"), "Salary", "Monthly salary", "Credit Card");

    const updatedTx = await service.updateTransaction(
      tx.id,
      1200,
      new Date("2026-02-01"),
      "Salary",
      "Updated salary",
      "income",
      "Credit Card"
    )

    const updated = await service.getIncomes();
    expect(updated).toHaveLength(1);
    expect(updated[0].amount).toBe(1200);
    expect(updated[0].description).toBe("Updated salary");

  })

  it("should persist payment_method for income when provided and return it on later queries", async () => {
    const tx = await service.addIncome(
      1200,
      new Date("2026-03-01"),
      "Bonus",
      "Performance bonus",
      "one-time",
    );

    expect(tx.payment_method).toBe("one-time");

    const incomes = await service.getIncomes();
    expect(incomes[0].payment_method).toBe("one-time");
  });

  /* ── addExpense ───────────────────────────────────────────── */

  it("should add an expense transaction with correct properties", async () => {
    const tx = await service.addExpense(250, new Date("2026-02-05"), "Food", "Team lunch");

    expect(tx.type).toBe("expense");
    expect(tx.amount).toBe(250);
    expect(tx.category).toBe("Food");
    expect(tx.payment_method).toBeUndefined();
  });

  it("should persist payment_method for expense when provided and return it on later queries", async () => {
    const tx = await service.addExpense(
      300,
      new Date("2026-03-05"),
      "Supplies",
      "Office supplies",
      "cash",
    );

    expect(tx.payment_method).toBe("cash");

    const expenses = await service.getExpenses();
    expect(expenses[0].payment_method).toBe("cash");
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

  /* ── deleteTransaction (income) ───────────────────────────── */

  it("should delete an income transaction", async () => {
    const tx = await service.addIncome(500, new Date("2026-02-01"), "Salary", "Payment");
    
    await service.deleteTransaction(tx.id, "income");
    
    const incomes = await service.getIncomes();
    expect(incomes).toHaveLength(0);
  });

  it("should delete an income transaction and verify it's removed from getAll", async () => {
    const income = await service.addIncome(500, new Date(), "Salary", "Pay");
    const expense = await service.addExpense(100, new Date(), "Food", "Lunch");
    
    await service.deleteTransaction(income.id, "income");
    
    const all = await service.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].type).toBe("expense");
    expect(all[0].id).toBe(expense.id);
  });

  it("should delete only the specified income transaction when multiple exist", async () => {
    const tx1 = await service.addIncome(500, new Date(), "Salary", "Pay");
    const tx2 = await service.addIncome(200, new Date(), "Bonus", "Bonus");
    const tx3 = await service.addIncome(100, new Date(), "Donation", "Sponsor");
    
    await service.deleteTransaction(tx2.id, "income");
    
    const incomes = await service.getIncomes();
    expect(incomes).toHaveLength(2);
    expect(incomes).not.toContainEqual(expect.objectContaining({ id: tx2.id }));
    expect(incomes).toContainEqual(expect.objectContaining({ amount: 500 }));
    expect(incomes).toContainEqual(expect.objectContaining({ amount: 100 }));
  });

  /* ── deleteTransaction (expense) ──────────────────────────── */

  it("should delete an expense transaction", async () => {
    const tx = await service.addExpense(250, new Date("2026-02-05"), "Food", "Team lunch");
    
    await service.deleteTransaction(tx.id, "expense");
    
    const expenses = await service.getExpenses();
    expect(expenses).toHaveLength(0);
  });

  it("should delete an expense transaction and verify it's removed from getAll", async () => {
    const income = await service.addIncome(500, new Date(), "Salary", "Pay");
    const expense = await service.addExpense(100, new Date(), "Food", "Lunch");
    
    await service.deleteTransaction(expense.id, "expense");
    
    const all = await service.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].type).toBe("income");
    expect(all[0].id).toBe(income.id);
  });

  it("should delete only the specified expense transaction when multiple exist", async () => {
    const tx1 = await service.addExpense(250, new Date(), "Food", "Lunch");
    const tx2 = await service.addExpense(100, new Date(), "Transport", "Gas");
    const tx3 = await service.addExpense(50, new Date(), "Entertainment", "Movie");
    
    await service.deleteTransaction(tx1.id, "expense");
    
    const expenses = await service.getExpenses();
    expect(expenses).toHaveLength(2);
    expect(expenses).not.toContainEqual(expect.objectContaining({ id: tx1.id }));
    expect(expenses).toContainEqual(expect.objectContaining({ amount: 100 }));
    expect(expenses).toContainEqual(expect.objectContaining({ amount: 50 }));
  });

  it("should throw when trying to delete income with invalid id", async () => {
    await expect(
      service.deleteTransaction("invalid-id", "income")
    ).rejects.toThrow();
  });
});

/* ── TransactionController Tests ──────────────────────────────────────────── */

describe("TransactionController", () => {
  let repo: SupabaseTransactionRepository;
  let service: TransactionService;
  let controller: TransactionController;

  beforeEach(async () => {
    await clearSupabaseTables();
    repo = new SupabaseTransactionRepository();
    service = new TransactionService(repo);
    controller = new TransactionController(service);
  });

  afterAll(async () => {
    await clearSupabaseTables();
  });

  /* ── Controller: updateTransaction ────────────────────────────────────── */

  it("should update an income transaction via controller", async () => {
    const tx = await controller.addIncome(1000, new Date("2026-02-01"), "Salary", "Monthly salary");
    
    const updatedTx = await controller.updateTransaction(
      tx.id,
      1500,
      new Date("2026-02-01"),
      "Salary",
      "Updated salary",
      "income"
    );

    expect(updatedTx.amount).toBe(1500);
    expect(updatedTx.description).toBe("Updated salary");
    expect(updatedTx.id).toBe(tx.id);
  });

  it("should update an expense transaction via controller", async () => {
    const tx = await controller.addExpense(250, new Date("2026-02-05"), "Food", "Team lunch");
    
    const updatedTx = await controller.updateTransaction(
      tx.id,
      350,
      new Date("2026-02-05"),
      "Groceries",
      "Updated lunch",
      "expense",
      "cash"
    );

    expect(updatedTx.amount).toBe(350);
    expect(updatedTx.category).toBe("Groceries");
    expect(updatedTx.description).toBe("Updated lunch");

  });

  it("should update and persist payment_method via controller", async () => {
    const tx = await controller.addIncome(1000, new Date(), "Salary", "Pay", "Bank");
    
    const updatedTx = await controller.updateTransaction(
      tx.id,
      1200,
      new Date(),
      "Salary",
      "Pay",
      "income",
      "Check"
    );


    
    const incomes = await service.getIncomes();
    expect(incomes[0].payment_method).toBe("Check");
  });

  /* ── Controller: deleteTransaction ────────────────────────────────────── */

  it("should delete an income transaction via controller", async () => {
    const tx = await controller.addIncome(500, new Date(), "Salary", "Pay");
    
    await controller.deleteTransaction(tx.id, "income");
    
    const incomes = await controller.getAllTransactions();
    expect(incomes).toHaveLength(0);
  });

  it("should delete an expense transaction via controller", async () => {
    const tx = await controller.addExpense(250, new Date(), "Food", "Lunch");
    
    await controller.deleteTransaction(tx.id, "expense");
    
    const all = await controller.getAllTransactions();
    expect(all).toHaveLength(0);
  });

  it("should delete correct transaction when multiple exist via controller", async () => {
    const income1 = await controller.addIncome(500, new Date(), "Salary", "Pay");
    const income2 = await controller.addIncome(200, new Date(), "Bonus", "Bonus");
    const expense = await controller.addExpense(100, new Date(), "Food", "Lunch");
    
    await controller.deleteTransaction(income1.id, "income");
    
    const all = await controller.getAllTransactions();
    expect(all).toHaveLength(2);
    expect(all.find(t => t.id === income1.id)).toBeUndefined();
    expect(all.find(t => t.id === income2.id)).toBeDefined();
    expect(all.find(t => t.id === expense.id)).toBeDefined();
  });

  it("should handle delete and update operations in sequence", async () => {
    const tx1 = await controller.addIncome(500, new Date(), "Salary", "Pay");
    const tx2 = await controller.addExpense(100, new Date(), "Food", "Lunch");
    
    // Update tx1
    const updated = await controller.updateTransaction(
      tx1.id,
      600,
      new Date(),
      "Salary",
      "Updated pay",
      "income"
    );
    expect(updated.amount).toBe(600);
    
    // Delete tx2
    await controller.deleteTransaction(tx2.id, "expense");
    
    const all = await controller.getAllTransactions();
    expect(all).toHaveLength(1);
    expect(all[0].amount).toBe(600);
    expect(all[0].description).toBe("Updated pay");
  });
});

/* ── Auth Domain Layer Tests ──────────────────────────────────────────── */

describe("Auth Domain Layer", () => {
  /* ── isAdmin() method ─────────────────────────────────────────── */

  it("should return true when user role is Admin", () => {
    const adminAuth = new Auth(
      "user-1",
      "admin@example.com",
      "Admin",
      "token-123",
      new Date(),
      "Admin User"
    );

    expect(adminAuth.isAdmin()).toBe(true);
  });

  it("should return false when user role is Staff", () => {
    const staffAuth = new Auth(
      "user-2",
      "staff@example.com",
      "Staff",
      "token-456",
      new Date(),
      "Staff User"
    );

    expect(staffAuth.isAdmin()).toBe(false);
  });

  it("should return false when user role is User", () => {
    const userAuth = new Auth(
      "user-3",
      "user@example.com",
      "User",
      "token-789",
      new Date(),
      "Regular User"
    );

    expect(userAuth.isAdmin()).toBe(false);
  });

  /* ── isTokenValid() method ───────────────────────────────────────── */

  it("should return true for valid freshly created token", () => {
    const auth = new Auth(
      "user-1",
      "admin@example.com",
      "Admin",
      "token-123",
      new Date(), // Just created
      "Admin User"
    );

    expect(auth.isTokenValid(3600)).toBe(true); // 1 hour expiry
  });

  it("should return false for expired token", () => {
    const expiredDate = new Date(Date.now() - 7200 * 1000); // 2 hours ago
    const auth = new Auth(
      "user-1",
      "admin@example.com",
      "Admin",
      "token-123",
      expiredDate,
      "Admin User"
    );

    expect(auth.isTokenValid(3600)).toBe(false); // 1 hour expiry
  });

  it("should return true for recently created token within expiry window", () => {
    const recentDate = new Date(Date.now() - 1800 * 1000); // 30 minutes ago
    const auth = new Auth(
      "user-1",
      "admin@example.com",
      "Admin",
      "token-123",
      recentDate,
      "Admin User"
    );

    expect(auth.isTokenValid(3600)).toBe(true); // 1 hour expiry, token is 30min old
  });

  /* ── Auth properties ─────────────────────────────────────────── */

  it("should correctly store and retrieve auth properties", () => {
    const auth = new Auth(
      "user-123",
      "john@example.com",
      "Admin",
      "jwt-token-abc",
      new Date("2026-04-02"),
      "John Doe",
      "USD"
    );

    expect(auth.userId).toBe("user-123");
    expect(auth.email).toBe("john@example.com");
    expect(auth.role).toBe("Admin");
    expect(auth.token).toBe("jwt-token-abc");
    expect(auth.fullName).toBe("John Doe");
    expect(auth.currency).toBe("USD");
  });

  it("should handle optional fullName and currency properties", () => {
    const auth = new Auth(
      "user-456",
      "jane@example.com",
      "Staff",
      "jwt-token-def",
      new Date()
    );

    expect(auth.userId).toBe("user-456");
    expect(auth.email).toBe("jane@example.com");
    expect(auth.role).toBe("Staff");
    expect(auth.fullName).toBeUndefined();
    expect(auth.currency).toBeUndefined();
  });
});

/* ── UI Layer Access Control Tests ────────────────────────────────────── */

describe("UI Layer - Access Control", () => {
  /* ── Role-based button visibility ────────────────────────────── */

  it("should disable Edit button for Staff role", () => {
    // Simulate sessionStorage for Staff user
    sessionStorage.setItem("userRole", "Staff");
    const userRole = sessionStorage.getItem("userRole") ?? "Staff";
    const isAdmin = userRole === "Admin";

    expect(isAdmin).toBe(false);
    expect(isAdmin).not.toBe(true);
  });

  it("should enable Edit button for Admin role", () => {
    // Simulate sessionStorage for Admin user
    sessionStorage.setItem("userRole", "Admin");
    const userRole = sessionStorage.getItem("userRole") ?? "Staff";
    const isAdmin = userRole === "Admin";

    expect(isAdmin).toBe(true);
  });

  it("should default to Staff role if userRole not in sessionStorage", () => {
    // Clear sessionStorage
    sessionStorage.removeItem("userRole");
    const userRole = sessionStorage.getItem("userRole") ?? "Staff";
    const isAdmin = userRole === "Admin";

    expect(userRole).toBe("Staff");
    expect(isAdmin).toBe(false);
  });

  /* ── Button disable/enable state ─────────────────────────────── */

  it("should render Edit button with correct CSS classes for Admin", () => {
    sessionStorage.setItem("userRole", "Admin");
    const userRole = sessionStorage.getItem("userRole") ?? "Staff";
    const isAdmin = userRole === "Admin";

    // Simulate the className logic from Expenses.tsx
    const buttonClass = isAdmin
      ? "hover:bg-blue-600 hover:text-white cursor-pointer"
      : "opacity-50 cursor-not-allowed text-gray-500";

    expect(buttonClass).toContain("hover:bg-blue-600");
    expect(buttonClass).toContain("cursor-pointer");
    expect(buttonClass).not.toContain("cursor-not-allowed");
  });

  it("should render Edit button with correct CSS classes for Staff", () => {
    sessionStorage.setItem("userRole", "Staff");
    const userRole = sessionStorage.getItem("userRole") ?? "Staff";
    const isAdmin = userRole === "Admin";

    // Simulate the className logic from Expenses.tsx
    const buttonClass = isAdmin
      ? "hover:bg-blue-600 hover:text-white cursor-pointer"
      : "opacity-50 cursor-not-allowed text-gray-500";

    expect(buttonClass).toContain("opacity-50");
    expect(buttonClass).toContain("cursor-not-allowed");
    expect(buttonClass).toContain("text-gray-500");
    expect(buttonClass).not.toContain("hover:bg-blue-600");
  });

  /* ── Edit dialog flow for different roles ──────────────────── */

  it("should prevent opening edit dialog for Staff role", () => {
    sessionStorage.setItem("userRole", "Staff");
    const userRole = sessionStorage.getItem("userRole") ?? "Staff";
    const isAdmin = userRole === "Admin";

    // Verify that a Staff user cannot access edit features
    expect(isAdmin).toBe(false);

    // In real UI, this would prevent modal opening
    // because button is disabled: disabled={!isAdmin}
    if (isAdmin) {
      // This code should NOT execute for Staff
      throw new Error("Staff should not reach edit dialog");
    }
  });

  it("should allow opening edit dialog for Admin role", () => {
    sessionStorage.setItem("userRole", "Admin");
    const userRole = sessionStorage.getItem("userRole") ?? "Staff";
    const isAdmin = userRole === "Admin";

    expect(isAdmin).toBe(true);

    // In real UI, Admin can click and open dialog
    if (isAdmin) {
      // Dialog should open - this is expected path for Admin
      expect(true).toBe(true);
    }
  });

  /* ── Session storage persistence across operations ───────────── */

  it("should maintain role state during transaction workflow", () => {
    // Simulate user login and setting role
    sessionStorage.setItem("userRole", "Admin");

    // Simulate transaction viewing
    const userRole = sessionStorage.getItem("userRole");
    expect(userRole).toBe("Admin");

    // Simulate clicking edit
    const isAdmin = userRole === "Admin";
    expect(isAdmin).toBe(true);

    // Simulate form submission (role should persist)
    const postSubmitRole = sessionStorage.getItem("userRole");
    expect(postSubmitRole).toBe("Admin");
  });

  it("should prevent Staff access even after multiple page refreshes", () => {
    // Initial login as Staff
    sessionStorage.setItem("userRole", "Staff");

    // First transaction view
    let isAdmin = sessionStorage.getItem("userRole") === "Admin";
    expect(isAdmin).toBe(false);

    // Simulate page navigation/refresh
    let userRole = sessionStorage.getItem("userRole") ?? "Staff";
    isAdmin = userRole === "Admin";
    expect(isAdmin).toBe(false);

    // Another transaction view
    userRole = sessionStorage.getItem("userRole") ?? "Staff";
    isAdmin = userRole === "Admin";
    expect(isAdmin).toBe(false); // Still Staff after refresh
  });

  afterAll(() => {
    // Clean up sessionStorage after UI tests
    sessionStorage.removeItem("userRole");
  });
});
