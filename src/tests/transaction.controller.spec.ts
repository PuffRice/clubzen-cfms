import { describe, it, expect, beforeEach, vi } from "vitest";
import { TransactionController } from "../controller/TransactionController";
import { TransactionService } from "../service/TransactionService";
import { SupabaseTransactionRepository } from "../repository/SupabaseTransactionRepository";

describe("TransactionController", () => {

  let transactionController: TransactionController;
  let transactionService: TransactionService;
  let transactionRepository: SupabaseTransactionRepository;

  beforeEach(() => {

    transactionRepository = {
      save: vi.fn(),
      findAll: vi.fn(),
      findByType: vi.fn(),
      findById: vi.fn(),
    } as unknown as SupabaseTransactionRepository;

    transactionService = new TransactionService(transactionRepository);

    transactionController = new TransactionController(transactionService);

  });

  describe("addTransaction", () => {

    it("should add a transaction successfully", async () => {

      const transaction: any = {
        amount: 100,
        date: new Date(),
        description: "Test Transaction",
        dueDate: new Date(),
        type: "Loan",
      };

      (transactionRepository.save as any).mockResolvedValueOnce(transaction);

      const response: any = await transactionController.getAllTransactions();

      expect(response.statusCode).toBe(201);
      expect(transactionRepository.save).toHaveBeenCalled();

    });

    it("should return error if transaction fails", async () => {

      const transaction: any = {
        amount: 100,
        date: new Date(),
        description: "Test Transaction",
        dueDate: new Date(),
        type: "Loan",
      };

      (transactionRepository.save as any).mockRejectedValueOnce(
        new Error("Failed")
      );

      const response: any = await transactionController.getAllTransactions();

      expect(response.statusCode).toBe(500);

    });

  });

});