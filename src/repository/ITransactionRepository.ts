import { Transaction, TransactionType } from "../domain";

/** Raw row shape coming from / going to the data store. */
export interface TransactionRow {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;          // "YYYY-MM-DD"
  category: string;
  description: string;

  /**
   * Optional, user‑selected classification for income records.  Stored
   * in the database once we add the corresponding column (Sprint 4).
   */
  incomeType?: string;

  /**
   * Optional, user‑selected payment method for expenses.  Also
   * persisted once the schema supports it.
   */
  paymentMethod?: string;

  created_at?: string;
}

export interface ITransactionRepository {
  /** Persist a new transaction and return the saved row. */
  save(row: Omit<TransactionRow, "id" | "created_at">): Promise<TransactionRow>;

  /** Return every stored transaction. */
  findAll(): Promise<TransactionRow[]>;

  /** Return only income or expense transactions. */
  findByType(type: TransactionType): Promise<TransactionRow[]>;

  /** Return a single transaction by its id, or null. */
  findById(id: string): Promise<TransactionRow | null>;
}
