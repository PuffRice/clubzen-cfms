// #1
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

import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import { AuthController } from "@core/controller/AuthController";
import { TransactionController } from "@core/controller/TransactionController";
import { ReportController } from "@core/controller/ReportController";
import { TransactionService } from "@core/service/TransactionService";
import { ReportService } from "@core/service/ReportService";
import { SupabaseTransactionRepository } from "@core/repository/SupabaseTransactionRepository";
import { clearSupabaseTables } from "./SupabaseTestHelper";

/* ================================================================
   AuthController — validation (no successful Supabase sign-in required)
   ================================================================ */

describe("AuthController — validation", () => {
  let auth: AuthController;

  beforeEach(() => {
    auth = new AuthController();
  });

  it("should fail when email is empty", async () => {
    const result = await auth.login("", "secret");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Email is required.");
  });

  it("should fail when email format is invalid", async () => {
    const result = await auth.login("not-an-email", "secret");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid email format.");
  });

  it("should fail when password is empty", async () => {
    const result = await auth.login("user@example.com", "");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Password is required.");
  });
});

/* ================================================================
   AuthController — Supabase Auth (real session + JWT)
   ================================================================ */

const testAdminEmail =
  (import.meta.env.VITE_TEST_ADMIN_EMAIL as string | undefined)?.trim() || "admin@gmail.com";
const testAdminPassword =
  (import.meta.env.VITE_TEST_ADMIN_PASSWORD as string | undefined)?.trim() || "password123";

describe("AuthController — Supabase", () => {
  let auth: AuthController;
  /** Set in beforeAll: probe login so we skip when this project has no matching Auth user. */
  let supabaseAuthProbeOk = false;

  beforeAll(async () => {
    const a = new AuthController();
    const r = await a.login(testAdminEmail, testAdminPassword);
    supabaseAuthProbeOk = r.success;
  });

  beforeEach(() => {
    auth = new AuthController();
  });

  it("returns Admin role when credentials match Supabase Auth + public.users", async (ctx) => {
    if (!supabaseAuthProbeOk) {
      ctx.skip(
        `Supabase sign-in failed for ${testAdminEmail}. Set VITE_TEST_ADMIN_EMAIL and VITE_TEST_ADMIN_PASSWORD in .env.`,
      );
    }
    const result = await auth.login(testAdminEmail, testAdminPassword);
    expect(result.success).toBe(true);
    expect(result.role).toBe("Admin");
  });

  it("returns a Supabase access token (JWT) on success", async (ctx) => {
    if (!supabaseAuthProbeOk) {
      ctx.skip(
        `Supabase sign-in failed for ${testAdminEmail}. Set VITE_TEST_ADMIN_EMAIL and VITE_TEST_ADMIN_PASSWORD in .env.`,
      );
    }
    const result = await auth.login(testAdminEmail, testAdminPassword);
    expect(result.success).toBe(true);
    expect(result.token).toBeTruthy();
    expect(result.token!.length).toBeGreaterThan(40);
    expect(result.userId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it.skipIf(!import.meta.env.VITE_TEST_STAFF_EMAIL)(
    "returns Staff role for configured staff user",
    async () => {
      const email = import.meta.env.VITE_TEST_STAFF_EMAIL as string;
      const password = (import.meta.env.VITE_TEST_STAFF_PASSWORD as string) || "";
      const result = await auth.login(email, password);
      expect(result.success).toBe(true);
      expect(result.role).toBe("Staff");
    },
  );
});

/* ================================================================
   TransactionController
   ================================================================ */

describe("TransactionController", () => {
  let txService: TransactionService;
  let controller: TransactionController;

  beforeEach(async () => {
    await clearSupabaseTables();
    const repo = new SupabaseTransactionRepository();
    txService = new TransactionService(repo);
    controller = new TransactionController(txService);
  });

  afterAll(async () => {
    await clearSupabaseTables();
  });

  it("should delegate addIncome to TransactionService", async () => {
    const tx = await controller.addIncome(500, new Date(), "Salary", "Monthly pay");

    expect(tx.type).toBe("income");
    expect(tx.amount).toBe(500);
    expect(await txService.getAll()).toHaveLength(1);
  });

  it("should forward optional payment_method through to the service for income", async () => {
    const tx = await controller.addIncome(
      800,
      new Date(),
      "Grant",
      "Research grant",
      "one-time",
    );
    expect(tx.payment_method).toBe("one-time");
  });

  it("should delegate addExpense to TransactionService", async () => {
    const tx = await controller.addExpense(120, new Date(), "Food", "Team lunch");

    expect(tx.type).toBe("expense");
    expect(tx.amount).toBe(120);
    expect(await txService.getAll()).toHaveLength(1);
  });

  it("should forward optional payment_method through to the service for expense", async () => {
    const tx = await controller.addExpense(
      250,
      new Date(),
      "Travel",
      "Taxi fare",
      "card",
    );
    expect(tx.payment_method).toBe("card");
  });

  it("should propagate validation errors from the service", async () => {
    await expect(
      controller.addIncome(0, new Date(), "Salary", "Bad amount"),
    ).rejects.toThrow("Amount must be greater than zero.");
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
  let txService: TransactionService;
  let reportCtrl: ReportController;

  beforeEach(async () => {
    await clearSupabaseTables();
    const repo = new SupabaseTransactionRepository();
    txService = new TransactionService(repo);
    const reportService = new ReportService(txService);
    reportCtrl = new ReportController(reportService);
  });

  afterAll(async () => {
    await clearSupabaseTables();
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
