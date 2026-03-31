import { Loan, LoanDirection } from "../domain";

export interface ILoanRepository {
  create(
    direction: LoanDirection,
    amount: number,
    date: Date,
    description: string,
  ): Promise<Loan>;

  /**
   * Update loan in `loans` and keep the mirrored income/expense row in sync
   * (or replace the mirror if direction changes).
   */
  update(
    id: string,
    params: {
      direction: LoanDirection;
      amount: number;
      date: Date;
      description: string;
    },
  ): Promise<Loan>;

  findAll(): Promise<Loan[]>;

  findByDirection(direction: LoanDirection): Promise<Loan[]>;

  findById(id: string): Promise<Loan | null>;
}
