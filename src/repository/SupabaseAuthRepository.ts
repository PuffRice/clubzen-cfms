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
import type { IAuthRepository, AuthCredentials, AuthRow } from "./IAuthRepository";

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
      .select("id, email, role, created_at")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      // Create default user record if it doesn't exist
      const { data: newUser } = await supabase
        .from("users")
        .insert({
          id: userId,
          email,
          role: email.toLowerCase() === "admin@clubzen.com" ? "Admin" : "Staff",
          created_at: new Date().toISOString(),
        })
        .select("id, email, role, created_at")
        .single();

      if (!newUser) {
        throw new Error("Failed to create user profile");
      }

      return {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role as "Admin" | "Staff",
        token: accessToken,
        createdAt: newUser.created_at,
      };
    }

    return {
      userId: userData.id,
      email: userData.email,
      role: userData.role as "Admin" | "Staff",
      token: accessToken,
      createdAt: userData.created_at,
    };
  }

  async getUserProfile(userId: string): Promise<AuthRow | null> {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, role, created_at")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    // Fetch current session to get token
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token || "";

    return {
      userId: data.id,
      email: data.email,
      role: data.role as "Admin" | "Staff",
      token,
      createdAt: data.created_at,
    };
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message || "Logout failed");
    }
  }
}
