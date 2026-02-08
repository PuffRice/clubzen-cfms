interface HttpRequest<T = any> {
  body?: T;
  params?: {
    id?: string;
  };
}

interface HttpResponse {
  statusCode: number;
  body: any;
}

export class CategoryController {
  async getCategories(): Promise<HttpResponse> {
    return {
      statusCode: 200,
      body: [
        { id: "1", name: "Food", type: "Expense" },
        { id: "2", name: "Salary", type: "Income" },
      ],
    };
  }

  async createCategory(req: HttpRequest): Promise<HttpResponse> {
    const { name, type, parentId } = req.body || {};

    if (!name || !type) {
      return {
        statusCode: 400,
        body: { message: "Category name and type are required" },
      };
    }

    return {
      statusCode: 201,
      body: {
        id: "new-category-id",
        name,
        type,
        parentId: parentId || null,
      },
    };
  }

  async updateCategory(req: HttpRequest): Promise<HttpResponse> {
    const { id } = req.params || {};
    const { name } = req.body || {};

    if (!id || !name) {
      return {
        statusCode: 400,
        body: { message: "Category id and name required" },
      };
    }

    return {
      statusCode: 200,
      body: { message: "Category updated successfully" },
    };
  }

  async deleteCategory(req: HttpRequest): Promise<HttpResponse> {
    const { id } = req.params || {};

    if (!id) {
      return {
        statusCode: 400,
        body: { message: "Category id required" },
      };
    }

    return {
      statusCode: 200,
      body: { message: "Category deleted successfully" },
    };
  }
}
