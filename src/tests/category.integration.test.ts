import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { CategoryController } from "../controller/CategoryController";
import { CategoryService } from "../service/CategoryService";
import { SupabaseCategoryRepository } from "../repository/SupabaseCategoryRepository";
import { clearSupabaseTables } from "./SupabaseTestHelper";

// These tests use the real repository and DB

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

  it("should add a new expense category and persist it", async () => {
    const res = await controller.createCategory({
      body: { name: "Test Expense", type: "Expense", color: "#123456" },
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Test Expense");
    expect(res.body.type).toBe("Expense");
    expect(res.body.color).toBe("#123456");

    // Check DB
    const all = await controller.createCategories();
    expect(all.body.some((c: any) => c.name === "Test Expense" && c.type === "Expense")).toBe(true);
  });

  it("should edit an existing category", async () => {
    const create = await controller.createCategory({
      body: { name: "EditMe", type: "Income", color: "#abcdef" },
    });
    const id = create.body.id;
    const update = await controller.updateCategory({
      params: { id: String(id) },
      body: { name: "Edited", color: "#fedcba" },
    });
    expect(update.statusCode).toBe(200);
    expect(update.body.name).toBe("Edited");
    expect(update.body.color).toBe("#fedcba");
  });

  it("should remove a category", async () => {
    const create = await controller.createCategory({
      body: { name: "DeleteMe", type: "Expense", color: "#000000" },
    });
    const id = create.body.id;
    const del = await controller.deleteCategory({ params: { id: String(id) } });
    expect(del.statusCode).toBe(200);
    // Check DB
    const all = await controller.createCategories();
    expect(all.body.some((c: any) => c.id === id)).toBe(false);
  });
});
