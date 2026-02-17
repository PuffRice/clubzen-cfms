/**
 * AuthController — Handles authentication requests from the UI.
 *
 * Design Decision:
 *   No real authentication library is used.  The controller delegates
 *   to a simple mock check and returns a role.
 *   Compatible with the original AuthService.ts pattern but restructured
 *   so that the controller is a thin layer — auth logic is kept minimal
 *   and could be moved to a dedicated AuthService in the service layer.
 *
 *   • admin@clubzen.com → Admin role
 *   • any other valid email → Staff role
 */

export type UserRole = "Admin" | "Staff";

export interface AuthResult {
  success: boolean;
  role?: UserRole;
  token?: string;
  userId?: string;
  error?: string;
}

export class AuthController {
  /**
   * Mock login — accepts any well‑formed email and non‑empty password.
   */
  login(email: string, password: string): AuthResult {
    if (!email || email.trim().length === 0) {
      return { success: false, error: "Email is required." };
    }

    if (!this.isValidEmail(email)) {
      return { success: false, error: "Invalid email format." };
    }

    if (!password || password.trim().length === 0) {
      return { success: false, error: "Password is required." };
    }

    const isAdmin = email.toLowerCase() === "admin@clubzen.com";
    const role: UserRole = isAdmin ? "Admin" : "Staff";

    return {
      success: true,
      role,
      token: "mock-jwt-token",           // matches original AuthService
      userId: isAdmin ? "user-001" : "user-002",
    };
  }

  /* ── Private helpers ──────────────────────────────────────── */

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
