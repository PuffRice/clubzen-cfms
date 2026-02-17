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
    category: string,
    description: string,
  ): Promise<IncomeTransaction> {
    return this.transactionService.addIncome(amount, date, category, description);
  }

  async addExpense(
    amount: number,
    date: Date,
    category: string,
    description: string,
  ): Promise<ExpenseTransaction> {
    return this.transactionService.addExpense(amount, date, category, description);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return this.transactionService.getAll();
  }
}
