interface HttpRequest {
  query?: {
    date?: string;
    month?: string;
    year?: string;
  };
}

interface HttpResponse {
  statusCode: number;
  body: any;
}

export class ReportController {
  async getDailySummary(req: HttpRequest): Promise<HttpResponse> {
    const { date } = req.query || {};

    if (!date) {
      return {
        statusCode: 400,
        body: { message: "Date is required" },
      };
    }

    // Mocked response for controller layer
    return {
      statusCode: 200,
      body: {
        date,
        totalIncome: 5000,
        totalExpense: 3200,
        balance: 1800,
      },
    };
  }

  async getMonthlySummary(req: HttpRequest): Promise<HttpResponse> {
    const { month, year } = req.query || {};

    if (!month || !year) {
      return {
        statusCode: 400,
        body: { message: "Month and year are required" },
      };
    }

    return {
      statusCode: 200,
      body: {
        month,
        year,
        totalIncome: 45000,
        totalExpense: 30000,
        balance: 15000,
      },
    };
  }

  async exportReport(): Promise<HttpResponse> {
    return {
      statusCode: 200,
      body: {
        message: "Report exported successfully",
        format: "PDF",
      },
    };
  }
}
