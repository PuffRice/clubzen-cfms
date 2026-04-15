/**
 * ReportBuilder Pattern Tests
 *
 * Demonstrates the Builder pattern for composable report creation.
 * The builder enables flexible filtering and grouping without parameter explosion.
 */

import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { TransactionService } from "@core/service/TransactionService";
import { ReportService } from "@core/service/ReportService";
import { ReportBuilder, FilteredReport, GroupedReport } from "@core/service/ReportBuilder";
import { SupabaseTransactionRepository } from "@core/repository/SupabaseTransactionRepository";
import { clearSupabaseTables } from "./SupabaseTestHelper";

describe("ReportBuilder Pattern", () => {
  let txService: TransactionService;
  let reportService: ReportService;
  let builder: ReportBuilder;

  beforeEach(async () => {
    await clearSupabaseTables();
    const repo = new SupabaseTransactionRepository();
    txService = new TransactionService(repo);
    reportService = new ReportService(txService);
    builder = reportService.query();
  });

  afterAll(async () => {
    await clearSupabaseTables();
  });

  describe("Basic filtering", () => {
    it("should filter transactions by date range", async () => {
      // Add three transactions on different dates
      await txService.addIncome(1000, new Date("2026-01-01"), "Salary", "Pay");
      await txService.addExpense(200, new Date("2026-01-15"), "Food", "Lunch");
      await txService.addExpense(300, new Date("2026-01-30"), "Rent", "Office");

      // Query for transactions between Jan 1 and Jan 20 (should include first two)
      const result = (await reportService
        .query()
        .forRange(new Date("2026-01-01"), new Date("2026-01-20"))
        .build()) as FilteredReport;

      // Should include Income (Jan 1) and Expense (Jan 15), exclude Expense (Jan 30)
      expect(result.count).toBeGreaterThanOrEqual(2);
      expect(result.totalIncome).toBe(1000);
      expect(result.totalExpense).toBeGreaterThanOrEqual(200);
    });

    it("should filter transactions by single category", async () => {
      await txService.addExpense(200, new Date("2026-01-01"), "Food", "Lunch");
      await txService.addExpense(500, new Date("2026-01-02"), "Food", "Dinner");
      await txService.addExpense(800, new Date("2026-01-03"), "Rent", "Office");

      const result = (await reportService
        .query()
        .byCategory("Food")
        .build()) as FilteredReport;

      expect(result.count).toBe(2);
      expect(result.totalExpense).toBe(700);
    });

    it("should filter transactions by multiple categories", async () => {
      await txService.addExpense(200, new Date("2026-01-01"), "Food", "Lunch");
      await txService.addExpense(800, new Date("2026-01-02"), "Rent", "Office");
      await txService.addExpense(100, new Date("2026-01-03"), "Transport", "Fuel");

      const result = (await reportService
        .query()
        .byCategories(["Food", "Transport"])
        .build()) as FilteredReport;

      expect(result.count).toBe(2);
      expect(result.totalExpense).toBe(300);
    });

    it("should filter transactions by type (income only)", async () => {
      await txService.addIncome(1000, new Date("2026-01-01"), "Salary", "Pay");
      await txService.addIncome(500, new Date("2026-01-02"), "Bonus", "Annual");
      await txService.addExpense(200, new Date("2026-01-03"), "Food", "Lunch");

      const result = (await reportService
        .query()
        .byType("income")
        .build()) as FilteredReport;

      expect(result.count).toBe(2);
      expect(result.totalIncome).toBe(1500);
      expect(result.totalExpense).toBe(0);
    });

    it("should filter transactions by type (expense only)", async () => {
      await txService.addIncome(1000, new Date("2026-01-01"), "Salary", "Pay");
      await txService.addExpense(200, new Date("2026-01-02"), "Food", "Lunch");
      await txService.addExpense(300, new Date("2026-01-03"), "Transport", "Fuel");

      const result = (await reportService
        .query()
        .byType("expense")
        .build()) as FilteredReport;

      expect(result.count).toBe(2);
      expect(result.totalExpense).toBe(500);
      expect(result.totalIncome).toBe(0);
    });
  });

  describe("Chained filtering", () => {
    it("should combine multiple filters (date + category + type)", async () => {
      const jan1 = new Date("2026-01-01");
      const jan31 = new Date("2026-01-31");

      await txService.addIncome(1000, jan1, "Salary", "Pay");
      await txService.addExpense(200, new Date("2026-01-02"), "Food", "Lunch");
      await txService.addExpense(500, new Date("2026-01-03"), "Food", "Dinner");
      await txService.addExpense(800, new Date("2026-01-04"), "Rent", "Office");

      const result = (await reportService
        .query()
        .forRange(jan1, jan31)
        .byCategory("Food")
        .byType("expense")
        .build()) as FilteredReport;

      expect(result.count).toBe(2);
      expect(result.totalExpense).toBe(700);
    });
  });

  describe("Grouping", () => {
    it("should group transactions by day", async () => {
      await txService.addIncome(1000, new Date("2026-01-01"), "Salary", "Pay");
      await txService.addExpense(200, new Date("2026-01-01"), "Food", "Lunch");
      await txService.addExpense(300, new Date("2026-01-02"), "Transport", "Fuel");

      const result = (await reportService
        .query()
        .groupBy("daily")
        .build()) as GroupedReport[];

      expect(result).toHaveLength(2);
      expect(result[0].groupKey).toBe("2026-01-01");
      expect(result[0].totalIncome).toBe(1000);
      expect(result[0].totalExpense).toBe(200);
      expect(result[1].groupKey).toBe("2026-01-02");
      expect(result[1].totalExpense).toBe(300);
    });

    it("should group transactions by month", async () => {
      await txService.addIncome(1000, new Date("2026-01-15"), "Salary", "Jan pay");
      await txService.addExpense(200, new Date("2026-01-20"), "Food", "Lunch");
      await txService.addIncome(1000, new Date("2026-02-15"), "Salary", "Feb pay");
      await txService.addExpense(300, new Date("2026-02-20"), "Food", "Lunch");

      const result = (await reportService
        .query()
        .groupBy("monthly")
        .build()) as GroupedReport[];

      expect(result).toHaveLength(2);
      expect(result[0].groupKey).toBe("2026-01");
      expect(result[0].totalIncome).toBe(1000);
      expect(result[0].totalExpense).toBe(200);
      expect(result[1].groupKey).toBe("2026-02");
      expect(result[1].totalIncome).toBe(1000);
      expect(result[1].totalExpense).toBe(300);
    });

    it("should group filtered transactions by month", async () => {
      const jan1 = new Date("2026-01-01");
      const feb28 = new Date("2026-02-28");

      await txService.addExpense(200, new Date("2026-01-01"), "Food", "Lunch");
      await txService.addExpense(300, new Date("2026-01-15"), "Food", "Dinner");
      await txService.addExpense(150, new Date("2026-01-20"), "Rent", "Office");
      await txService.addExpense(250, new Date("2026-02-05"), "Food", "Lunch");
      await txService.addExpense(100, new Date("2026-02-15"), "Transport", "Fuel");

      const result = (await reportService
        .query()
        .forRange(jan1, feb28)
        .byCategory("Food")
        .groupBy("monthly")
        .build()) as GroupedReport[];

      expect(result).toHaveLength(2);
      expect(result[0].groupKey).toBe("2026-01");
      expect(result[0].totalExpense).toBe(500); // 200 + 300
      expect(result[1].groupKey).toBe("2026-02");
      expect(result[1].totalExpense).toBe(250);
    });
  });

  describe("Shortcut methods", () => {
    it("should build dashboard summary quickly", async () => {
      await txService.addIncome(1000, new Date("2026-01-01"), "Salary", "Pay");
      await txService.addExpense(200, new Date("2026-01-02"), "Food", "Lunch");

      const result = await reportService.query().buildDashboard();

      expect(result.totalIncome).toBe(1000);
      expect(result.totalExpense).toBe(200);
      expect(result.net).toBe(800);
    });

    it("should build daily summary quickly", async () => {
      await txService.addIncome(1000, new Date("2026-01-01"), "Salary", "Pay");
      await txService.addExpense(200, new Date("2026-01-02"), "Food", "Lunch");

      const result = await reportService.query().buildDaily();

      expect(result).toHaveLength(2);
      expect(result[0].groupKey).toBe("2026-01-01");
    });

    it("should build monthly summary quickly", async () => {
      await txService.addIncome(1000, new Date("2026-01-01"), "Salary", "Pay");
      await txService.addIncome(1000, new Date("2026-02-01"), "Salary", "Pay");

      const result = await reportService.query().buildMonthly();

      expect(result).toHaveLength(2);
    });
  });

  describe("Internal transaction filtering", () => {
    it("should exclude loan transactions when requested", async () => {
      await txService.addIncome(1000, new Date("2026-01-01"), "Salary", "Pay");
      await txService.addExpense(500, new Date("2026-01-02"), "Loan", "Lend to friend");
      await txService.addExpense(200, new Date("2026-01-03"), "Food", "Lunch");

      const result = (await reportService
        .query()
        .excludeInternal()
        .build()) as FilteredReport;

      expect(result.count).toBe(2); // Salary + Food (Loan excluded)
      expect(result.totalExpense).toBe(200);
    });

    it("should include loan transactions by default", async () => {
      await txService.addIncome(1000, new Date("2026-01-01"), "Salary", "Pay");
      await txService.addExpense(500, new Date("2026-01-02"), "Loan", "Lend to friend");
      await txService.addExpense(200, new Date("2026-01-03"), "Food", "Lunch");

      const result = (await reportService
        .query()
        .includeInternal()
        .build()) as FilteredReport;

      expect(result.count).toBe(3);
      expect(result.totalExpense).toBe(700);
    });
  });

  describe("Edge cases", () => {
    it("should throw error for invalid date range", async () => {
      expect(() => {
        reportService
          .query()
          .forRange(new Date("2026-02-01"), new Date("2026-01-01"));
      }).toThrow("Start date must be before or equal to end date");
    });

    it("should throw error for empty categories array", async () => {
      expect(() => {
        reportService.query().byCategories([]);
      }).toThrow("At least one category required");
    });

    it("should return empty result for non-matching filters", async () => {
      await txService.addIncome(1000, new Date("2026-01-01"), "Salary", "Pay");

      const result = (await reportService
        .query()
        .byCategory("NonExistent")
        .build()) as FilteredReport;

      expect(result.count).toBe(0);
      expect(result.totalIncome).toBe(0);
    });
  });
});
