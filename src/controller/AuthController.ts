/**
 * AuthController — Thin controller handling authentication requests from the UI.
 *
 * Responsibilities:
 *   • Accept credentials from UI
 *   • Delegate to AuthService for business logic
 *   • Return formatted results to UI
 *   • Handle service errors and convert to user-friendly messages
 *
 * Design Decision:
 *   Controller is a thin layer — all auth logic delegated to AuthService.
 *   Service receives IAuthRepository via DI, so authentication storage
 *   is fully decoupled and can be switched (Supabase, Firebase, etc.).
 */

import { AuthService } from "@core/service/AuthService";
import { SupabaseAuthRepository } from "@core/repository/SupabaseAuthRepository";
import type { UserRole } from "@core/domain/Auth";

export interface AuthResult {
  success: boolean;
  role?: UserRole;
  token?: string;
  userId?: string;
  email?: string;
  error?: string;
}

export class AuthController {
  private readonly authService: AuthService;

  constructor() {
    const authRepository = new SupabaseAuthRepository();
    this.authService = new AuthService(authRepository);
  }

  /**
   * Login with Supabase Auth.
   * @throws Error if async operation fails (caller should handle).
   */
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const auth = await this.authService.login(email, password);

      return {
        success: true,
        role: auth.role,
        token: auth.token,
        userId: auth.userId,
        email: auth.email,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";

      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Get user profile (name, role, email, currency).
   */
  async getProfile(userId: string): Promise<{
    success: boolean;
    profile?: { userId: string; email: string; role: UserRole; fullName?: string; currency?: string };
    error?: string;
  }> {
    try {
      const auth = await this.authService.getUserProfile(userId);
      if (!auth) return { success: false, error: "Profile not found" };
      return {
        success: true,
        profile: {
          userId: auth.userId,
          email: auth.email,
          role: auth.role,
          fullName: auth.fullName ?? undefined,
          currency: auth.currency ?? "USD",
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load profile";
      return { success: false, error: message };
    }
  }

  /**
   * Update user profile (fullName, currency).
   */
  async updateProfile(
    userId: string,
    params: { fullName?: string; currency?: string }
  ): Promise<AuthResult & { profile?: { fullName?: string; currency?: string } }> {
    try {
      const auth = await this.authService.updateProfile(userId, params);
      if (!auth) return { success: false, error: "Failed to update profile" };
      return {
        success: true,
        profile: {
          fullName: auth.fullName ?? undefined,
          currency: auth.currency ?? "USD",
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      return { success: false, error: message };
    }
  }

  /**
   * Logout user.
   */
  async logout(): Promise<AuthResult> {
    try {
      await this.authService.logout();

      return {
        success: true,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Logout failed";

      return {
        success: false,
        error: message,
      };
    }
  }
}
