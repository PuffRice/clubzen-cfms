/**
 * ExpenseTransaction — Concrete class representing money spent.
 */

import { Transaction } from "./Transaction";

export class ExpenseTransaction extends Transaction {
  /**
   * Payment method selected by the user.  Stored in the domain but not
   * persisted by the database in Sprint 3.  Kept here for API symmetry
   * and future work.
   */
  public readonly payment_method?: string;

  constructor(
    id: string,
    amount: number,
    date: Date,
    category: string,
    description: string,
    payment_method?: string,
  ) {
    super(id, amount, date, category, description, "expense");
    this.payment_method = payment_method;
  }
}
