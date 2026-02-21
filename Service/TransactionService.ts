export interface ExpenseInput {
  amount: number;
  date: string;
  categoryId: string;
  method: string;
  description?: string;
}

export interface IncomeInput {
  amount: number;
  date: string;
  categoryId: string;
  method: string;
  description?: string;
}

export interface DueInput {
  amount: number;
  dueDate: string;
  partyName: string;
  type: "TAKEN" | "GIVEN";
}

export class TransactionService {
  async addExpense(expense: ExpenseInput) {
    if (expense.amount <= 0) {
      throw new Error("Expense amount must be positive");
    }

    return {
      id: `exp-${Date.now()}`,
      type: "EXPENSE",
      ...expense,
      createdAt: new Date().toISOString(),
    };
  }

  async addIncome(income: IncomeInput) {
    if (income.amount <= 0) {
      throw new Error("Income amount must be positive");
    }

    return {
      id: `inc-${Date.now()}`,
      type: "INCOME",
      ...income,
      createdAt: new Date().toISOString(),
    };
  }

  async addDue(due: DueInput) {
    if (due.amount <= 0) {
      throw new Error("Due amount must be positive");
    }

    return {
      id: `due-${Date.now()}`,
      ...due,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
  }
}