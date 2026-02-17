/**
 * ITransactionRepository — Abstract repository interface.
 *
 * Design Decision:
 *   We program against an interface so the service layer never depends
 *   on a concrete storage mechanism.  In Sprint 1–3 the only
 *   implementation is the in‑memory store inside TransactionService.
 *   A real DB adapter can be plugged in later without changing
 *   service or domain code.
 */

import { Transaction } from "../domain";

export interface ITransactionRepository {
  /** Persist a transaction and return it. */
  save(transaction: Transaction): Transaction;

  /** Return every stored transaction. */
  findAll(): Transaction[];

  /** Return a single transaction by its id, or undefined. */
  findById(id: string): Transaction | undefined;
}
