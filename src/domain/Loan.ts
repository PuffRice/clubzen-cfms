export type LoanDirection = "taken" | "given";

/**
 * Loan — domain model backed by the `loans` table (`id` is `loans.id`).
 * New loans are also mirrored to income/expense for reporting.
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

