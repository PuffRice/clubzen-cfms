/**
 * IncomeTransaction — Concrete class representing money received.
 */

import { Transaction } from "./Transaction";

export class IncomeTransaction extends Transaction {
  // `category` in the base class represents the income source for
  // income transactions.  We expose a more meaningful alias so callers
  // can use `tx.source` instead of `tx.category`.
  get source(): string {
    return this.category;
  }

  /**
   * Optional classification of the income (recurring, one-time, etc.)
   * captured by the UI.  It isn't persisted in Sprint 3, but the field
   * is kept in the model for future expansion.
   */
  public readonly payment_method?: string;

  constructor(
    id: string,
    amount: number,
    date: Date,
    source: string,
    description: string,
    payment_method?: string,
    recordedAt?: Date,
  ) {
    super(id, amount, date, source, description, "income", recordedAt);
    this.payment_method = payment_method;
  }
}
