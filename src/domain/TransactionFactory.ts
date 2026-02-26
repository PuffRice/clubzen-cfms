/**
 * TransactionFactory — Factory Pattern Implementation
 *
 * Responsibility:
 *   Encapsulates the creation logic for Transaction objects.
 *   Clients don't need to know about concrete classes (IncomeTransaction, ExpenseTransaction).
 *   The factory decides which concrete class to instantiate based on the transaction type.
 *
 * Benefits:
 *   • Centralized creation logic — easy to modify or extend in the future
 *   • Loose coupling — clients depend on the factory, not concrete classes
 *   • Easy to add new transaction types (e.g., LoanTransaction) without modifying client code
 *   • Consistent object creation across the application
 *
 * Usage:
 *   const income = TransactionFactory.create("income", {
 *     id: "tx-001",
 *     amount: 5000,
 *     date: new Date(),
 *     source: "Salary",
 *     description: "Monthly salary",
 *     incomeType: "Recurring",
 *   });
 *
 *   const expense = TransactionFactory.create("expense", {
 *     id: "tx-002",
 *     amount: 500,
 *     date: new Date(),
 *     category: "Groceries",
 *     description: "Weekly groceries",
 *     paymentMethod: "Debit Card",
 *   });
 */

import { Transaction, TransactionType } from "./Transaction";
import { IncomeTransaction } from "./IncomeTransaction";
import { ExpenseTransaction } from "./ExpenseTransaction";

/**
 * Parameters for creating an income transaction.
 */
export interface CreateIncomeParams {
  id: string;
  amount: number;
  date: Date;
  source: string;
  description: string;
  incomeType?: string;
}

/**
 * Parameters for creating an expense transaction.
 */
export interface CreateExpenseParams {
  id: string;
  amount: number;
  date: Date;
  category: string;
  description: string;
  paymentMethod?: string;
}

/**
 * Union type for flexible parameter passing.
 */
export type CreateTransactionParams = CreateIncomeParams | CreateExpenseParams;

/**
 * TransactionFactory — Creates transaction objects of the appropriate type.
 */
export class TransactionFactory {
  /**
   * Factory method to create a transaction based on type.
   *
   * @param type - The type of transaction ("income" or "expense")
   * @param params - The parameters needed to create the transaction
   * @returns A new transaction instance (IncomeTransaction or ExpenseTransaction)
   * @throws Error if the type is invalid or required parameters are missing
   */
  static create(type: TransactionType, params: CreateTransactionParams): Transaction {
    switch (type) {
      case "income":
        return this.createIncome(params as CreateIncomeParams);

      case "expense":
        return this.createExpense(params as CreateExpenseParams);

      default:
        throw new Error(`Unknown transaction type: ${type}`);
    }
  }

  /**
   * Create an income transaction.
   * @private — Use create() instead for consistent handling.
   */
  private static createIncome(params: CreateIncomeParams): IncomeTransaction {
    this.validateParams(params, ["id", "amount", "date", "source", "description"]);

    return new IncomeTransaction(
      params.id,
      params.amount,
      params.date,
      params.source,
      params.description,
      params.incomeType,
    );
  }

  /**
   * Create an expense transaction.
   * @private — Use create() instead for consistent handling.
   */
  private static createExpense(params: CreateExpenseParams): ExpenseTransaction {
    this.validateParams(params, ["id", "amount", "date", "category", "description"]);

    return new ExpenseTransaction(
      params.id,
      params.amount,
      params.date,
      params.category,
      params.description,
      params.paymentMethod,
    );
  }

  /**
   * Validate that all required parameters are present.
   * @private
   */
  private static validateParams(
    params: Record<string, any>,
    required: string[],
  ): void {
    for (const key of required) {
      if (params[key] === undefined || params[key] === null) {
        throw new Error(`Missing required parameter: ${key}`);
      }
    }
  }
}
