/**
 * CategoryController — CRUD operations for transaction categories.
 *
 * Kept from original controller/CategoryController.ts.
 * Uses HttpRequest/HttpResponse pattern.  Returns mocked data
 * (no database in Sprint 1–3).
 */

import { HttpRequest, HttpResponse } from "./CommonTypes";

export class CategoryController {
  async getCategories(): Promise<HttpResponse> {
    return {
      statusCode: 200,
      body: [
        { id: "1", name: "Food", type: "Expense" },
        { id: "2", name: "Salary", type: "Income" },
        { id: "3", name: "Transport", type: "Expense" },
        { id: "4", name: "Donation", type: "Income" },
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
