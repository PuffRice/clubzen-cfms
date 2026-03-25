import { describe, it, expect, beforeEach, vi } from "vitest";
import { SupabaseCategoryRepository } from "../repository/SupabaseCategoryRepository";

describe("SupabaseCategoryRepository", () => {
  let categoryRepository: SupabaseCategoryRepository;

  beforeEach(() => {
    categoryRepository = {
      addCategory: vi.fn(),
      removeCategory: vi.fn(),
      editCategory: vi.fn(),
      getAllCategories: vi.fn(),
    } as unknown as SupabaseCategoryRepository;
  });

  it("should be defined", () => {
    expect(categoryRepository).toBeDefined();
  });
});