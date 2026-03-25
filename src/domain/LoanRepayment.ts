export class LoanRepayment {
  constructor(
    public readonly id: string,
    public readonly loanId: string,
    public readonly amount: number,
    public readonly date: Date,
    public readonly description?: string
  ) {}
}