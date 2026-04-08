import { supabase } from "@core/supabase/client";
import { ICategoryRepository } from "./ICategoryRepository";
import { Category } from "../domain/Category";

/**
 * SupabaseCategoryRepository — concrete implementation for categories table.
 *
 * The shared `supabase` client is imported directly (mirrors
 * SupabaseTransactionRepository) so callers don't need to provide a client.
 */
export class SupabaseCategoryRepository implements ICategoryRepository {
  // constructor removed: repository uses imported `supabase`.

  async createCategory(
    groupId: number,
    name: string,
    color?: string
  ): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .insert([
        {
          group_id: groupId,
          name,
          color: color || null,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);

    return this.mapToCategory(data, 0);
  }

  async getAllCategories(): Promise<Category[]> {
    const [categoriesResult, expenseCounts, incomeCounts] = await Promise.all([
      supabase.from("categories").select("*").order("group_id"),
      this.loadExpenseCategoryCounts(),
      this.loadIncomeCategoryCounts(),
    ]);

    if (categoriesResult.error) throw new Error(categoriesResult.error.message);

    return (categoriesResult.data ?? []).map((row) => {
      const count = row.group_id === 2
        ? incomeCounts[row.name] ?? 0
        : expenseCounts[row.name] ?? 0;
      return this.mapToCategory(row, count);
    });
  }

  async getCategoriesByGroup(groupId: number): Promise<Category[]> {
    const categories = await this.getAllCategories();
    return categories.filter((category) => category.groupId === groupId);
  }

  async getCategoryById(id: number): Promise<Category | null> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // no rows found
      throw new Error(error.message);
    }

    const count = data.group_id === 2
      ? (await this.loadIncomeCategoryCounts())[data.name] ?? 0
      : (await this.loadExpenseCategoryCounts())[data.name] ?? 0;

    return this.mapToCategory(data, count);
  }

  async updateCategory(
    id: number,
    name: string,
    color?: string
  ): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .update({
        name,
        color: color || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return this.mapToCategory(data, 0);
  }

  async deleteCategory(id: number): Promise<void> {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
  }

  private mapToCategory(row: any, count = 0): Category {
    return {
      id: row.id,
      groupId: row.group_id,
      name: row.name,
      color: row.color,
      count,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private async loadExpenseCategoryCounts(): Promise<Record<string, number>> {
    const { data, error } = await supabase.from("expense").select("category");
    if (error) throw error;

    return (data ?? []).reduce((memo: Record<string, number>, row: any) => {
      const key = row.category ?? "";
      memo[key] = (memo[key] ?? 0) + 1;
      return memo;
    }, {});
  }

  private async loadIncomeCategoryCounts(): Promise<Record<string, number>> {
    const { data, error } = await supabase.from("income").select("source");
    if (error) throw error;

    return (data ?? []).reduce((memo: Record<string, number>, row: any) => {
      const key = row.source ?? "";
      memo[key] = (memo[key] ?? 0) + 1;
      return memo;
    }, {});
  }
}