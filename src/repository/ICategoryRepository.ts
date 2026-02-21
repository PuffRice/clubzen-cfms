export interface ICategoryRepository {
  // Create
  createCategory(groupId: number, name: string, color?: string): Promise<any>;

  // Read
  getAllCategories(): Promise<any[]>;
  getCategoriesByGroup(groupId: number): Promise<any[]>;
  getCategoryById(id: number): Promise<any | null>;

  // Update
  updateCategory(id: number, name: string, color?: string): Promise<any>;

  // Delete
  deleteCategory(id: number): Promise<void>;
}