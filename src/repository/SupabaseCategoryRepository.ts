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

    return this.mapToCategory(data);
  }

  async getAllCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("group_id");

    if (error) throw new Error(error.message);

    return data.map(this.mapToCategory);
  }

  async getCategoriesByGroup(groupId: number): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("group_id", groupId);

    if (error) throw new Error(error.message);

    return data.map(this.mapToCategory);
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

    return this.mapToCategory(data);
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

    return this.mapToCategory(data);
  }

  async deleteCategory(id: number): Promise<void> {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
  }

  private mapToCategory(row: any): Category {
    return {
      id: row.id,
      groupId: row.group_id,
      name: row.name,
      color: row.color,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}