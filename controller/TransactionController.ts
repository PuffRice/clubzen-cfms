// src/controllers/TransactionController.ts

// Local request & response models
interface HttpRequest<T = any> {
  body?: T;
}

interface HttpResponse {
  statusCode: number;
  body: any;
}

export class TransactionController {

  async addExpense(req: HttpRequest): Promise<HttpResponse> {
    const { amount, date, categoryId, method, description } = req.body || {};

    if (!amount || amount <= 0) {
      return {
        statusCode: 400,
        body: { message: "Expense amount must be positive" },
      };
    }

    if (!date || !categoryId || !method) {
      return {
        statusCode: 400,
        body: { message: "Required expense fields missing" },
      };
    }

    return {
      statusCode: 201,
      body: {
        id: "exp-001",
        type: "EXPENSE",
        amount,
        date,
        categoryId,
        method,
        description: description || null,
        createdAt: new Date().toISOString(),
      },
    };
  }

  async addIncome(req: HttpRequest): Promise<HttpResponse> {
    const { amount, date, categoryId, method, description } = req.body || {};

    if (!amount || amount <= 0) {
      return {
        statusCode: 400,
        body: { message: "Income amount must be positive" },
      };
    }

    if (!date || !categoryId || !method) {
      return {
        statusCode: 400,
        body: { message: "Required income fields missing" },
      };
    }

    return {
      statusCode: 201,
      body: {
        id: "inc-001",
        type: "INCOME",
        amount,
        date,
        categoryId,
        method,
        description: description || null,
        createdAt: new Date().toISOString(),
      },
    };
  }

  async addDue(req: HttpRequest): Promise<HttpResponse> {
    const { amount, dueDate, partyName, type } = req.body || {};

    if (!amount || amount <= 0) {
      return {
        statusCode: 400,
        body: { message: "Due amount must be positive" },
      };
    }

    if (!dueDate || !partyName || !type) {
      return {
        statusCode: 400,
        body: { message: "Required due fields missing" },
      };
    }

    if (type !== "TAKEN" && type !== "GIVEN") {
      return {
        statusCode: 400,
        body: { message: "Due type must be TAKEN or GIVEN" },
      };
    }

    return {
      statusCode: 201,
      body: {
        id: "due-001",
        amount,
        dueDate,
        partyName,
        type,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      },
    };
  }
}
