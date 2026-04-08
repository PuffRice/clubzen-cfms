import { Category } from "../domain/Category";

export interface ICategoryRepository {
  // Create
  createCategory(groupId: number, name: string, color?: string): Promise<Category>;

  // Read
  getAllCategories(): Promise<Category[]>;
  getCategoriesByGroup(groupId: number): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | null>;

  // Update
  updateCategory(id: number, name: string, color?: string): Promise<Category>;

  // Delete
  deleteCategory(id: number): Promise<void>;
}