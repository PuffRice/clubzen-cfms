import { ICategoryRepository } from "../repository/ICategoryRepository";

export class CategoryService {
  constructor(private categoryRepository: ICategoryRepository) {}

  // Create Category
  async createCategory(groupId: number, name: string, color?: string) {
    if (!name || name.trim() === "") {
      throw new Error("Category name is required");
    }

    if (!groupId) {
      throw new Error("Category group is required");
    }

    return await this.categoryRepository.createCategory(
      groupId,
      name.trim(),
      color
    );
  }

  // Get All Categories
  async getAllCategories() {
    return await this.categoryRepository.getAllCategories();
  }

  // Get Categories By Group (Expense / Income)
  async getCategoriesByGroup(groupId: number) {
    if (!groupId) {
      throw new Error("Group id is required");
    }

    return await this.categoryRepository.getCategoriesByGroup(groupId);
  }

  // Get Category By Id
  async getCategoryById(id: number) {
    if (!id) {
      throw new Error("Category id is required");
    }

    const category = await this.categoryRepository.getCategoryById(id);

    if (!category) {
      throw new Error("Category not found");
    }

    return category;
  }

  // Update Category
  async updateCategory(id: number, name: string, color?: string) {
    if (!id) {
      throw new Error("Category id is required");
    }

    if (!name || name.trim() === "") {
      throw new Error("Category name is required");
    }

    const existing = await this.categoryRepository.getCategoryById(id);

    if (!existing) {
      throw new Error("Category not found");
    }

    return await this.categoryRepository.updateCategory(
      id,
      name.trim(),
      color
    );
  }

  // Delete Category
  async deleteCategory(id: number) {
    if (!id) {
      throw new Error("Category id is required");
    }

    const existing = await this.categoryRepository.getCategoryById(id);

    if (!existing) {
      throw new Error("Category not found");
    }

    await this.categoryRepository.deleteCategory(id);

    return { message: "Category deleted successfully" };
  }
}