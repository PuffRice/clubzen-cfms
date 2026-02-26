export type LoanDirection = "taken" | "given";

/**
 * Loan — domain model for a loan transaction.
 *
 * We treat loans as a semantic layer on top of income/expense
 * transactions:
 *   • "taken"  → money received  → income with category "Loan Taken"
 *   • "given"  → money lent out → expense with category "Loan Given"
 */
export class Loan {
  constructor(
    public readonly id: string,
    public readonly amount: number,
    public readonly date: Date,
    public readonly direction: LoanDirection,
    public readonly description: string,
  ) {}
}

