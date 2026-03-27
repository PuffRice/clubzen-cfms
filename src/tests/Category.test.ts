import { describe, it, expect, beforeEach, vi } from "vitest";
import { CategoryService } from "../service/CategoryService";
import { CategoryController } from "../controller/CategoryController";
import { SupabaseCategoryRepository } from "../repository/SupabaseCategoryRepository";

// CATEGORY SERVICE TESTS

describe("CategoryService", () => {
  let categoryService: CategoryService;
  let categoryRepository: any;

  beforeEach(() => {
    categoryRepository = {
      createCategory: vi.fn(),
      getAllCategories: vi.fn(),
      getCategoriesByGroup: vi.fn(),
      getCategoryById: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
    };

    categoryService = new CategoryService(categoryRepository);
  });

  it("should be defined", () => {
    expect(categoryService).toBeDefined();
  });

  it("should create a category", async () => {
    categoryRepository.createCategory.mockResolvedValue({
      id: 1,
      name: "Food",
    });

    const result = await categoryService.createCategory(1, "Food");

    expect(categoryRepository.createCategory).toHaveBeenCalledWith(
      1,
      "Food",
      undefined
    );
    expect(result.name).toBe("Food");
  });

  it("should throw error if category name is empty", async () => {
    await expect(
      categoryService.createCategory(1, "")
    ).rejects.toThrow("Category name is required");
  });

  it("should throw error if groupId is missing", async () => {
    await expect(
      categoryService.createCategory(0, "Food")
    ).rejects.toThrow("Category group is required");
  });

  it("should get all categories", async () => {
    categoryRepository.getAllCategories.mockResolvedValue([
      { id: 1, name: "Food" },
    ]);

    const result = await categoryService.getAllCategories();

    expect(result.length).toBe(1);
  });

  it("should get categories by group", async () => {
    categoryRepository.getCategoriesByGroup.mockResolvedValue([
      { id: 1, name: "Food" },
    ]);

    const result = await categoryService.getCategoriesByGroup(1);

    expect(result.length).toBe(1);
  });

  it("should throw error if groupId is missing in getCategoriesByGroup", async () => {
    await expect(
      categoryService.getCategoriesByGroup(0)
    ).rejects.toThrow("Group id is required");
  });

  it("should get category by id", async () => {
    categoryRepository.getCategoryById.mockResolvedValue({
      id: 1,
      name: "Food",
    });

    const result = await categoryService.getCategoryById(1);

    expect(result.name).toBe("Food");
  });

  it("should throw error if category not found", async () => {
    categoryRepository.getCategoryById.mockResolvedValue(null);

    await expect(
      categoryService.getCategoryById(1)
    ).rejects.toThrow("Category not found");
  });

  it("should update category", async () => {
    categoryRepository.getCategoryById.mockResolvedValue({ id: 1 });
    categoryRepository.updateCategory.mockResolvedValue({
      id: 1,
      name: "Updated",
    });

    const result = await categoryService.updateCategory(1, "Updated");

    expect(result.name).toBe("Updated");
  });

  it("should throw error if updating non-existing category", async () => {
    categoryRepository.getCategoryById.mockResolvedValue(null);

    await expect(
      categoryService.updateCategory(1, "Updated")
    ).rejects.toThrow("Category not found");
  });

  it("should delete category", async () => {
    categoryRepository.getCategoryById.mockResolvedValue({ id: 1 });
    categoryRepository.deleteCategory.mockResolvedValue(true);

    const result = await categoryService.deleteCategory(1);

    expect(result.message).toBe("Category deleted successfully");
  });

  it("should throw error if deleting non-existing category", async () => {
    categoryRepository.getCategoryById.mockResolvedValue(null);

    await expect(
      categoryService.deleteCategory(1)
    ).rejects.toThrow("Category not found");
  });
});

// 🎮 CATEGORY CONTROLLER TESTS

describe("CategoryController", () => {
  let categoryController: CategoryController;
  let mockCategoryService: any;

  beforeEach(() => {
    mockCategoryService = {
      getAllCategories: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
    };

    categoryController = new CategoryController(mockCategoryService);
  });

  it("should be defined", () => {
    expect(categoryController).toBeDefined();
  });

  it("should return all categories", async () => {
    mockCategoryService.getAllCategories.mockResolvedValue([
      { id: 1, name: "Food", groupId: 1, color: "red" },
    ]);

    const res = await categoryController.createCategories();

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it("should create category successfully", async () => {
    mockCategoryService.createCategory.mockResolvedValue({
      id: 1,
      name: "Salary",
      groupId: 2,
      color: "green",
    });

    const res = await categoryController.createCategory({
      body: { name: "Salary", type: "Income", color: "green" },
    } as any);

    expect(res.statusCode).toBe(201);
  });

  it("should return 400 if name or type missing", async () => {
    const res = await categoryController.createCategory({
      body: {},
    } as any);

    expect(res.statusCode).toBe(400);
  });

  it("should update category", async () => {
    mockCategoryService.updateCategory.mockResolvedValue({
      id: 1,
      name: "Updated",
      groupId: 1,
    });

    const res = await categoryController.updateCategory({
      params: { id: "1" },
      body: { name: "Updated" },
    } as any);

    expect(res.statusCode).toBe(200);
  });

  it("should return 400 if id or name missing in update", async () => {
    const res = await categoryController.updateCategory({
      params: {},
      body: {},
    } as any);

    expect(res.statusCode).toBe(400);
  });

  it("should delete category", async () => {
    mockCategoryService.deleteCategory.mockResolvedValue(undefined);

    const res = await categoryController.deleteCategory({
      params: { id: "1" },
    } as any);

    expect(res.statusCode).toBe(200);
  });

  it("should return 400 if id missing in delete", async () => {
    const res = await categoryController.deleteCategory({
      params: {},
    } as any);

    expect(res.statusCode).toBe(400);
  });

  it("should return 500 if service throws error", async () => {
    mockCategoryService.getAllCategories.mockRejectedValue(
      new Error("DB error")
    );

    const res = await categoryController.createCategories();

    expect(res.statusCode).toBe(500);
  });
});