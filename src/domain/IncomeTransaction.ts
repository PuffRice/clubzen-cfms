/**
 * IncomeTransaction — Concrete class representing money received.
 */

import { Transaction } from "./Transaction";

export class IncomeTransaction extends Transaction {
  constructor(
    id: string,
    amount: number,
    date: Date,
    category: string,
    description: string,
  ) {
    super(id, amount, date, category, description, "income");
  }
}
