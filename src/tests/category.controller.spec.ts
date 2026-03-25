import { describe, it, expect, beforeEach, vi } from "vitest";
import { CategoryController } from "../controller/CategoryController";
import { CategoryService } from "../service/CategoryService";
import { SupabaseCategoryRepository } from "../repository/SupabaseCategoryRepository";

describe("CategoryController", () => {

  let categoryController: CategoryController;
  let categoryService: CategoryService;
  let categoryRepository: SupabaseCategoryRepository;

  beforeEach(() => {

    categoryRepository = {
      addCategory: vi.fn(),
      removeCategory: vi.fn(),
      editCategory: vi.fn(),
      getAllCategories: vi.fn()
    } as unknown as SupabaseCategoryRepository;

    categoryService = new CategoryService(categoryRepository);

    categoryController = new CategoryController(categoryService);

  });

  it("should be defined", () => {
    expect(categoryController).toBeDefined();
  });

});