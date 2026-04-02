/**
 * TransactionController — Thin controller that delegates to TransactionService.
 *
 * Design Decision:
 *   Controllers are "glue" between the presentation layer and the
 *   service layer.  They perform NO business logic — they simply
 *   translate UI inputs into service calls and return the results.
 *   All methods are async because the service layer now talks to
 *   a real database through the repository.
 */

import { TransactionService } from "../service";
import { IncomeTransaction, ExpenseTransaction, Transaction } from "../domain";

export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  async addIncome(
    amount: number,
    date: Date,
    source: string,
    description: string,
    payment_method?: string,
  ): Promise<IncomeTransaction> {
    // service still expects category param but we treat it as source
    return this.transactionService.addIncome(amount, date, source, description, payment_method);
  }

  async addExpense(
    amount: number,
    date: Date,
    category: string,
    description: string,
    payment_method?: string,
  ): Promise<ExpenseTransaction> {
    return this.transactionService.addExpense(amount, date, category, description, payment_method);
  }

  async updateTransaction(
    id: string,
    amount: number,
    date: Date,
    category: string,
    description: string,
    type: "income" | "expense",
    payment_method?: string,
  ): Promise<Transaction> {
    return this.transactionService.updateTransaction(id, amount, date, category, description, type, payment_method);
  }

  async deleteTransaction(id: string, type: "income" | "expense"): Promise<void> {
    return this.transactionService.deleteTransaction(id, type);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    try {
      return await this.transactionService.getAll();
    } catch (err) {
      console.error("TransactionController.getAllTransactions error:", err);
      // return empty list so UI can continue without crashing
      return [];
    }
  }
}
