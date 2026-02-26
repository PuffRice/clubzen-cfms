import { Loan, LoanDirection } from "../domain";

export interface ILoanRepository {
  create(
    direction: LoanDirection,
    amount: number,
    date: Date,
    description: string,
  ): Promise<Loan>;

  findAll(): Promise<Loan[]>;

  findByDirection(direction: LoanDirection): Promise<Loan[]>;

  findById(id: string): Promise<Loan | null>;
}

