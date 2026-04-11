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
export { TransactionFactory } from "./TransactionFactory";
export type { CreateIncomeParams, CreateExpenseParams, CreateTransactionParams } from "./TransactionFactory";
export { Loan } from "./Loan";
export type { LoanDirection } from "./Loan";
export { LoanRepayment } from "./LoanRepayment";
export { Auth } from "./Auth";
export type { UserRole } from "./Auth";
export { SupportTicket, SupportTicketReply, SupportTicketActivity } from "./SupportTicket";
export type { TicketStatus, SupportTicketActivityKind } from "./SupportTicket";
export { Settings } from "./Settings";
export type { CurrencyCode } from "./Settings";
