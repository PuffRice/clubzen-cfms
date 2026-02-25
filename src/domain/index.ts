/**
 * Barrel export for the domain layer.
 *
 * Other layers import from "@core/domain" so they never reach into
 * individual files — keeps coupling low.
 */

export { Transaction } from "./Transaction";
export type { TransactionType } from "./Transaction";
export { IncomeTransaction } from "./IncomeTransaction";
export { ExpenseTransaction } from "./ExpenseTransaction";
export { Loan } from "./Loan";
export type { LoanDirection } from "./Loan";
