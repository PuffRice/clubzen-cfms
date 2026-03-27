import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { CategoryController } from "../controller/CategoryController";
import { CategoryService } from "../service/CategoryService";
import { SupabaseCategoryRepository } from "../repository/SupabaseCategoryRepository";
import { clearSupabaseTables } from "./SupabaseTestHelper";

describe("Category CRUD Integration", () => {
  let repo: SupabaseCategoryRepository;
  let service: CategoryService;
  let controller: CategoryController;

  beforeEach(async () => {
    await clearSupabaseTables();
    repo = new SupabaseCategoryRepository();
    service = new CategoryService(repo);
    controller = new CategoryController(service);
  });

  afterAll(async () => {
    await clearSupabaseTables();
  });

  // Create category
  it("should add a new expense category and persist it", async () => {
    const res = await controller.createCategory({
      body: { name: "Test Expense", type: "Expense", color: "#123456" },
    } as any);

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Test Expense");

    const all = await controller.createCategories();
    expect(all.body.some((c: any) => c.name === "Test Expense")).toBe(true);
  });

  // Multiple categories
  it("should create multiple categories and return all", async () => {
    await controller.createCategory({
      body: { name: "Food", type: "Expense" },
    } as any);

    await controller.createCategory({
      body: { name: "Salary", type: "Income" },
    } as any);

    const all = await controller.createCategories();

    expect(all.statusCode).toBe(200);
    expect(all.body.length).toBe(2);
  });

  //Validation fail (create)
  it("should return 400 if name or type missing", async () => {
    const res = await controller.createCategory({
      body: { name: "" },
    } as any);

    expect(res.statusCode).toBe(400);
  });

  // Update category
  it("should edit an existing category", async () => {
    const create = await controller.createCategory({
      body: { name: "EditMe", type: "Income", color: "#abcdef" },
    } as any);

    const id = create.body.id;

    const update = await controller.updateCategory({
      params: { id: String(id) },
      body: { name: "Edited", color: "#fedcba" },
    } as any);

    expect(update.statusCode).toBe(200);
    expect(update.body.name).toBe("Edited");
  });

  //Update non-existing
  it("should return 500 when updating non-existing category", async () => {
    const res = await controller.updateCategory({
      params: { id: "9999" },
      body: { name: "DoesNotExist" },
    } as any);

    expect(res.statusCode).toBe(500);
  });

  //Update validation fail
  it("should return 400 if id or name missing in update", async () => {
    const res = await controller.updateCategory({
      params: {},
      body: {},
    } as any);

    expect(res.statusCode).toBe(400);
  });

  //Delete category
  it("should remove a category", async () => {
    const create = await controller.createCategory({
      body: { name: "DeleteMe", type: "Expense", color: "#000000" },
    } as any);

    const id = create.body.id;

    const del = await controller.deleteCategory({
      params: { id: String(id) },
    } as any);

    expect(del.statusCode).toBe(200);

    const all = await controller.createCategories();
    expect(all.body.some((c: any) => c.id === id)).toBe(false);
  });

  //Delete non-existing
  it("should return 500 when deleting non-existing category", async () => {
    const res = await controller.deleteCategory({
      params: { id: "9999" },
    } as any);

    expect(res.statusCode).toBe(500);
  });

  //Delete validation fail
  it("should return 400 if id missing in delete", async () => {
    const res = await controller.deleteCategory({
      params: {},
    } as any);

    expect(res.statusCode).toBe(400);
  });

  //Payment Method type mapping
  it("should return 500 if Payment Method group does not exist", async () => {
  const res = await controller.createCategory({
    body: { name: "Bkash", type: "Payment Method" },
  } as any);

  expect(res.statusCode).toBe(500);
});
  //Ensure data consistency after multiple operations
  it("should maintain correct state after multiple operations", async () => {
    const c1 = await controller.createCategory({
      body: { name: "A", type: "Expense" },
    } as any);

    const c2 = await controller.createCategory({
      body: { name: "B", type: "Expense" },
    } as any);

    await controller.deleteCategory({
      params: { id: String(c1.body.id) },
    } as any);

    const all = await controller.createCategories();

    expect(all.body.length).toBe(1);
    expect(all.body[0].name).toBe("B");
  });
});