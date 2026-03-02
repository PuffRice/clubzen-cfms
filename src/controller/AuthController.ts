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
