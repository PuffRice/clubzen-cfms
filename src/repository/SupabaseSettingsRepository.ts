/**
 * SupabaseSettingsRepository — Concrete repository for user settings in Supabase.
 *
 * Reads/writes the `users` table for profile and preference fields.
 */

import { supabase } from "@core/supabase/client";
import type { ISettingsRepository, SettingsRow, UpdateSettingsParams } from "./ISettingsRepository";

const COLS = "id, email, full_name, role, currency, updated_at";

function toSettingsRow(data: Record<string, unknown>): SettingsRow {
  return {
    userId: data.id as string,
    email: (data.email as string) ?? "",
    fullName: data.full_name != null ? String(data.full_name) : "",
    role: (data.role as string) ?? "Staff",
    currency: data.currency != null ? String(data.currency) : "BDT",
    updatedAt: (data.updated_at as string) ?? "",
  };
}

export class SupabaseSettingsRepository implements ISettingsRepository {
  async getByUserId(userId: string): Promise<SettingsRow | null> {
    const { data, error } = await supabase
      .from("users")
      .select(COLS)
      .eq("id", userId)
      .single();

    if (error || !data) return null;
    return toSettingsRow(data as Record<string, unknown>);
  }

  async update(userId: string, params: UpdateSettingsParams): Promise<SettingsRow | null> {
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (params.fullName !== undefined) updates.full_name = params.fullName;
    if (params.currency !== undefined) updates.currency = params.currency;

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select(COLS)
      .single();

    if (error || !data) return null;
    return toSettingsRow(data as Record<string, unknown>);
  }
}
