/**
 * Transaction — Abstract base class for all financial transactions.
 *
 * Design Decision:
 *   The domain layer is completely independent of UI, repository, or
 *   framework concerns.  It uses plain TypeScript classes with proper
 *   encapsulation (private fields + getters) so that domain rules are
 *   enforced at the model level.
 */

export type TransactionType = "income" | "expense";

export abstract class Transaction {
  private readonly _id: string;
  private readonly _amount: number;
  private readonly _date: Date;
  private readonly _category: string;
  private readonly _description: string;
  private readonly _type: TransactionType;
  /** When the row was saved (e.g. DB `created_at`); use for clock time in daily views. */
  private readonly _recordedAt?: Date;

  constructor(
    id: string,
    amount: number,
    date: Date,
    category: string,
    description: string,
    type: TransactionType,
    recordedAt?: Date,
  ) {
    this._id = id;
    this._amount = amount;
    this._date = date;
    this._category = category;
    this._description = description;
    this._type = type;
    this._recordedAt = recordedAt;
  }

  /* ── Getters (read‑only access) ────────────────────────────── */

  get id(): string {
    return this._id;
  }

  get amount(): number {
    return this._amount;
  }

  get date(): Date {
    return this._date;
  }

  get category(): string {
    return this._category;
  }

  get description(): string {
    return this._description;
  }

  get type(): TransactionType {
    return this._type;
  }

  /** Instant for display time (actual save time); undefined if not available. */
  get recordedAt(): Date | undefined {
    return this._recordedAt;
  }
}
