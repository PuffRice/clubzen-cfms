/**
 * SupabaseAuthRepository — Concrete repository for Supabase Auth.
 *
 * Responsibilities:
 *   • Handle Supabase Auth API calls
 *   • Map Supabase responses to domain types
 *   • Propagate errors to services
 *
 * Design Decision:
 *   Uses Supabase's built-in auth (via supabase.auth) and a custom
 *   users table to store role and profile information.
 */

import { supabase } from "@core/supabase/client";
import type { IAuthRepository, AuthCredentials, AuthRow, UpdateProfileParams } from "./IAuthRepository";

const USER_COLS = "id, email, full_name, role, currency, created_at";

function toAuthRow(data: Record<string, unknown>, token: string): AuthRow {
  return {
    userId: data.id as string,
    email: data.email as string,
    role: data.role as "Admin" | "Staff" | "User",
    token,
    createdAt: (data.created_at as string) ?? "",
    fullName: data.full_name != null ? String(data.full_name) : undefined,
    currency: data.currency != null ? String(data.currency) : "USD",
  };
}

export class SupabaseAuthRepository implements IAuthRepository {
  async login(credentials: AuthCredentials): Promise<AuthRow> {
    const { email, password } = credentials;

    // Step 1: Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Authentication failed");
    }

    const userId = authData.user.id;
    const accessToken = authData.session?.access_token || "";

    // Step 2: Fetch user profile from users table to get role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(USER_COLS)
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      // Create default user record if it doesn't exist
      const { data: newUser } = await supabase
        .from("users")
        .insert({
          id: userId,
          email,
          role: email.toLowerCase() === "admin@gmail.com" ? "Admin" : "Staff",
          created_at: new Date().toISOString(),
        })
        .select(USER_COLS)
        .single();

      if (!newUser) {
        throw new Error("Failed to create user profile");
      }

      return toAuthRow(newUser as Record<string, unknown>, accessToken);
    }

    return toAuthRow(userData as Record<string, unknown>, accessToken);
  }

  async getUserProfile(userId: string): Promise<AuthRow | null> {
    const { data, error } = await supabase
      .from("users")
      .select(USER_COLS)
      .eq("id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token || "";

    return toAuthRow(data as Record<string, unknown>, token);
  }

  async updateUserProfile(userId: string, params: UpdateProfileParams): Promise<AuthRow | null> {
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (params.fullName !== undefined) updates.full_name = params.fullName;
    if (params.currency !== undefined) updates.currency = params.currency;

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select(USER_COLS)
      .single();

    if (error || !data) return null;

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token || "";
    return toAuthRow(data as Record<string, unknown>, token);
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message || "Logout failed");
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // Get current user's email from session
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    const userEmail = user?.email;

    if (!user || !userEmail) {
      throw new Error("No active session");
    }

    // Verify current password by attempting to sign in with current credentials
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    });

    if (signInError) {
      throw new Error("Current password is incorrect");
    }

    // Update password using Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      throw new Error(updateError.message || "Failed to change password");
    }
  }
}
