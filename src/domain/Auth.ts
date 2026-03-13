/**
 * Auth — Domain entity representing an authenticated user.
 *
 * Responsibilities:
 *   • Encapsulates user identity and role information
 *   • Separates auth domain logic from implementation details
 */

export type UserRole = "Admin" | "Staff" | "User";

export class Auth {
  constructor(
    readonly userId: string,
    readonly email: string,
    readonly role: UserRole,
    readonly token: string,
    readonly createdAt: Date,
    readonly fullName?: string,
    readonly currency?: string
  ) {}

  /**
   * Check if user has admin privileges.
   */
  isAdmin(): boolean {
    return this.role === "Admin";
  }

  /**
   * Check if token is still valid (basic check).
   */
  isTokenValid(expiresIn: number = 3600): boolean {
    const now = Date.now();
    const created = this.createdAt.getTime();
    return now - created < expiresIn * 1000;
  }
}
