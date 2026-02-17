/**
 * ExpenseTransaction — Concrete class representing money spent.
 */

import { Transaction } from "./Transaction";

export class ExpenseTransaction extends Transaction {
  constructor(
    id: string,
    amount: number,
    date: Date,
    category: string,
    description: string,
  ) {
    super(id, amount, date, category, description, "expense");
  }
}
