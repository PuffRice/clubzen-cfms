export interface ILoanRepaymentRepository {

  createRepayment(
    loanId: string,
    amount: number,
    date: Date,
    description?: string
  ): Promise<any>;

  findByLoanId(loanId: string): Promise<any[]>;

}