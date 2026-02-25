/**
 * CategoryController — CRUD operations for transaction categories.
 *
 * This controller is the thin layer between the React UI and the
 * CategoryService, which talks to Supabase through the
 * SupabaseCategoryRepository.
 *
 * It keeps the existing HttpRequest/HttpResponse shape so existing
 * callers (forms) can continue to work, while now persisting data.
 */

import { HttpRequest, HttpResponse } from "./CommonTypes";
import { CategoryService } from "../service/CategoryService";
import { Category } from "../domain/Category";

type CategoryType = "Expense" | "Income";

// Hard-coded group IDs used in the database
const EXPENSE_GROUP_ID = 1;
const INCOME_GROUP_ID = 2;

interface HttpCategory {
  id: string;
  name: string;
  type: CategoryType;
  color?: string | null;
}

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  private mapToType(groupId: number): CategoryType {
    if (groupId === EXPENSE_GROUP_ID) return "Expense";
    if (groupId === INCOME_GROUP_ID) return "Income";
    return "Expense";
  }

  private mapToHttpCategory(category: Category): HttpCategory {
    return {
      id: String(category.id),
      name: category.name,
      type: this.mapToType(category.groupId),
      color: category.color ?? undefined,
    };
  }

  async getCategories(): Promise<HttpResponse> {
    try {
      const categories = await this.categoryService.getAllCategories();
      return {
        statusCode: 200,
        body: categories.map((c) => this.mapToHttpCategory(c)),
      };
    } catch (err: any) {
      return {
        statusCode: 500,
        body: { message: err?.message || "Failed to load categories" },
      };
    }
  }

  async createCategory(req: HttpRequest): Promise<HttpResponse> {
    const { name, type, color } = req.body || {};

    if (!name || !type) {
      return {
        statusCode: 400,
        body: { message: "Category name and type are required" },
      };
    }

    const groupId: number = type === "Income" ? INCOME_GROUP_ID : EXPENSE_GROUP_ID;

    try {
      const created = await this.categoryService.createCategory(
        groupId,
        name,
        color
      );

      return {
        statusCode: 201,
        body: this.mapToHttpCategory(created),
      };
    } catch (err: any) {
      return {
        statusCode: 500,
        body: { message: err?.message || "Failed to create category" },
      };
    }
  }

  async updateCategory(req: HttpRequest): Promise<HttpResponse> {
    const { id } = req.params || {};
    const { name, color } = req.body || {};

    if (!id || !name) {
      return {
        statusCode: 400,
        body: { message: "Category id and name required" },
      };
    }

    try {
      const updated = await this.categoryService.updateCategory(
        Number(id),
        name,
        color
      );

      return {
        statusCode: 200,
        body: this.mapToHttpCategory(updated),
      };
    } catch (err: any) {
      return {
        statusCode: 500,
        body: { message: err?.message || "Failed to update category" },
      };
    }
  }

  async deleteCategory(req: HttpRequest): Promise<HttpResponse> {
    const { id } = req.params || {};

    if (!id) {
      return {
        statusCode: 400,
        body: { message: "Category id required" },
      };
    }

    try {
      await this.categoryService.deleteCategory(Number(id));
      return {
        statusCode: 200,
        body: { message: "Category deleted successfully" },
      };
    } catch (err: any) {
      return {
        statusCode: 500,
        body: { message: err?.message || "Failed to delete category" },
      };
    }
  }
}
