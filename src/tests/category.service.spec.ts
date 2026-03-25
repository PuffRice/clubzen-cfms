import { describe, it, expect, beforeEach, vi } from "vitest";
import { CategoryService } from "../service/CategoryService";
import { SupabaseCategoryRepository } from "../repository/SupabaseCategoryRepository";

describe("CategoryService", () => {
  let categoryService: CategoryService;
  let categoryRepository: SupabaseCategoryRepository;

  beforeEach(() => {
    categoryRepository = {
      addCategory: vi.fn(),
      removeCategory: vi.fn(),
      editCategory: vi.fn(),
      getAllCategories: vi.fn(),
    } as unknown as SupabaseCategoryRepository;

    categoryService = new CategoryService(categoryRepository);
  });

  it("should be defined", () => {
    expect(categoryService).toBeDefined();
  });
});