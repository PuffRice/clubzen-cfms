/**
 * TransactionController — Thin controller that delegates to TransactionService.
 *
 * Design Decision:
 *   Controllers are "glue" between the presentation layer and the
 *   service layer.  They perform NO business logic — they simply
 *   translate UI inputs into service calls and return the results.
 *
 *   This replaces the original TransactionController.ts (which was
 *   actually named TransactionService and contained business logic).
 *   The validation and storage now live in src/service/TransactionService.
 */

import { TransactionService } from "../service";
import { IncomeTransaction, ExpenseTransaction, Transaction } from "../domain";

export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  addIncome(
    amount: number,
    date: Date,
    category: string,
    description: string,
  ): IncomeTransaction {
    return this.transactionService.addIncome(amount, date, category, description);
  }

  addExpense(
    amount: number,
    date: Date,
    category: string,
    description: string,
  ): ExpenseTransaction {
    return this.transactionService.addExpense(amount, date, category, description);
  }

  getAllTransactions(): Transaction[] {
    return this.transactionService.getAll();
  }
}
