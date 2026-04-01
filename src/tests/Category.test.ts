// #1
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { CategoryService } from "../service/CategoryService";
import { CategoryController } from "../controller/CategoryController";
import { SupabaseCategoryRepository } from "../repository/SupabaseCategoryRepository";
import { clearSupabaseTables } from "./SupabaseTestHelper";

describe("CategoryService (Supabase)", () => {
  let categoryService: CategoryService;

  beforeEach(async () => {
    await clearSupabaseTables();
    categoryService = new CategoryService(new SupabaseCategoryRepository());
  });

  afterAll(async () => {
    await clearSupabaseTables();
  });

  it("creates a category", async () => {
    const result = await categoryService.createCategory(1, "Food Integration");
    expect(result.name).toBe("Food Integration");
    expect(result.groupId).toBe(1);
  });

  it("throws if category name is empty", async () => {
    await expect(categoryService.createCategory(1, "")).rejects.toThrow("Category name is required");
  });

  it("throws if groupId is missing", async () => {
    await expect(categoryService.createCategory(0, "Food")).rejects.toThrow("Category group is required");
  });

  it("gets all categories", async () => {
    await categoryService.createCategory(1, "Alpha");
    await categoryService.createCategory(2, "Beta");

    const result = await categoryService.getAllCategories();
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it("gets categories by group", async () => {
    await categoryService.createCategory(1, "Expense Cat");

    const result = await categoryService.getCategoriesByGroup(1);
    expect(result.some((c) => c.name === "Expense Cat")).toBe(true);
  });

  it("throws if groupId missing in getCategoriesByGroup", async () => {
    await expect(categoryService.getCategoriesByGroup(0)).rejects.toThrow("Group id is required");
  });

  it("gets category by id", async () => {
    const created = await categoryService.createCategory(1, "By Id Test");

    const result = await categoryService.getCategoryById(created.id);
    expect(result?.name).toBe("By Id Test");
  });

  it("throws if category not found", async () => {
    await expect(categoryService.getCategoryById(999999)).rejects.toThrow("Category not found");
  });

  it("updates category", async () => {
    const created = await categoryService.createCategory(1, "Old Name");

    const result = await categoryService.updateCategory(created.id, "Updated Name");
    expect(result.name).toBe("Updated Name");
  });

  it("throws if updating non-existing category", async () => {
    await expect(categoryService.updateCategory(999999, "x")).rejects.toThrow("Category not found");
  });

  it("deletes category", async () => {
    const created = await categoryService.createCategory(1, "To Delete");

    const result = await categoryService.deleteCategory(created.id);
    expect(result.message).toBe("Category deleted successfully");

    await expect(categoryService.getCategoryById(created.id)).rejects.toThrow("Category not found");
  });

  it("throws if deleting non-existing category", async () => {
    await expect(categoryService.deleteCategory(999999)).rejects.toThrow("Category not found");
  });
});

describe("CategoryController (Supabase)", () => {
  let categoryController: CategoryController;

  beforeEach(async () => {
    await clearSupabaseTables();
    categoryController = new CategoryController(new CategoryService(new SupabaseCategoryRepository()));
  });

  afterAll(async () => {
    await clearSupabaseTables();
  });

  it("returns all categories", async () => {
    const svc = new CategoryService(new SupabaseCategoryRepository());
    await svc.createCategory(1, "List Me");

    const res = await categoryController.createCategories();
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect((res.body as { name: string }[]).some((c) => c.name === "List Me")).toBe(true);
  });

  it("creates category successfully", async () => {
    const res = await categoryController.createCategory({
      body: { name: "Salary", type: "Income", color: "green" },
    } as any);

    expect(res.statusCode).toBe(201);
    expect((res.body as { name: string }).name).toBe("Salary");
  });

  it("returns 400 if name or type missing", async () => {
    const res = await categoryController.createCategory({
      body: {},
    } as any);

    expect(res.statusCode).toBe(400);
  });

  it("updates category", async () => {
    const svc = new CategoryService(new SupabaseCategoryRepository());
    const created = await svc.createCategory(1, "Old");

    const res = await categoryController.updateCategory({
      params: { id: String(created.id) },
      body: { name: "Updated" },
    } as any);

    expect(res.statusCode).toBe(200);
    expect((res.body as { name: string }).name).toBe("Updated");
  });

  it("returns 400 if id or name missing in update", async () => {
    const res = await categoryController.updateCategory({
      params: {},
      body: {},
    } as any);

    expect(res.statusCode).toBe(400);
  });

  it("deletes category", async () => {
    const svc = new CategoryService(new SupabaseCategoryRepository());
    const created = await svc.createCategory(1, "Del");

    const res = await categoryController.deleteCategory({
      params: { id: String(created.id) },
    } as any);

    expect(res.statusCode).toBe(200);
  });

  it("returns 400 if id missing in delete", async () => {
    const res = await categoryController.deleteCategory({
      params: {},
    } as any);

    expect(res.statusCode).toBe(400);
  });
});
