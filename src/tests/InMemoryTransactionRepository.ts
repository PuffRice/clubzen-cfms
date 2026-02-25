/**
 * InMemoryTransactionRepository — Test-only repository implementation.
 *
 * Stores transactions in a plain array so unit tests can run
 * without hitting Supabase.  Implements the same ITransactionRepository
 * interface used by the real SupabaseTransactionRepository.
 */

import type { ITransactionRepository, TransactionRow } from "../repository/ITransactionRepository";
import type { TransactionType } from "../domain";

/** Simple incrementing id generator for tests. */
let counter = 0;
function fakeId(): string {
  return `test-${++counter}`;
}

export class InMemoryTransactionRepository implements ITransactionRepository {
  private rows: TransactionRow[] = [];

  async save(row: Omit<TransactionRow, "id" | "created_at">): Promise<TransactionRow> {
    const saved: TransactionRow = {
      id: fakeId(),
      type: row.type,
      amount: row.amount,
      date: row.date,
      category: row.category,
      description: row.description,
      // propagate optional props if provided (tests rely on them later)
      incomeType: (row as any).incomeType,
      paymentMethod: (row as any).paymentMethod,
      created_at: new Date().toISOString(),
    };
    this.rows.push(saved);
    return saved;
  }

  async findAll(): Promise<TransactionRow[]> {
    return [...this.rows];
  }

  async findByType(type: TransactionType): Promise<TransactionRow[]> {
    return this.rows.filter((r) => r.type === type);
  }

  async findById(id: string): Promise<TransactionRow | null> {
    return this.rows.find((r) => r.id === id) ?? null;
  }

  /** Helper: clear all data between tests. */
  clear(): void {
    this.rows = [];
    counter = 0;
  }
}
