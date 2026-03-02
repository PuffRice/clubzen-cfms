/**
 * AuthService — Application-level authentication logic.
 *
 * Responsibilities:
 *   • Validate login credentials
 *   • Orchestrate authentication flow
 *   • Convert raw repository rows into domain Auth objects
 *   • Handle business rules (e.g., role assignment)
 *
 * Design Decision:
 *   Service receives IAuthRepository through DI, so auth storage
 *   is fully decoupled from business logic.
 */

import { Auth, type UserRole } from "../domain/Auth";
import type { IAuthRepository } from "../repository/IAuthRepository";

export class AuthService {
  constructor(private readonly repo: IAuthRepository) {}

  /**
   * Authenticate user and return Auth domain object.
   * @throws Error when validation fails or authentication fails.
   */
  async login(email: string, password: string): Promise<Auth> {
    // Validate inputs
    if (!email || email.trim().length === 0) {
      throw new Error("Email is required.");
    }

    if (!this.isValidEmail(email)) {
      throw new Error("Invalid email format.");
    }

    if (!password || password.trim().length === 0) {
      throw new Error("Password is required.");
    }

    // Delegate to repository
    const authRow = await this.repo.login({
      email,
      password,
    });

    // Return domain object
    return new Auth(
      authRow.userId,
      authRow.email,
      authRow.role,
      authRow.token,
      new Date(authRow.createdAt)
    );
  }

  /**
   * Fetch user profile by ID.
   */
  async getUserProfile(userId: string): Promise<Auth | null> {
    const authRow = await this.repo.getUserProfile(userId);

    if (!authRow) {
      return null;
    }

    return new Auth(
      authRow.userId,
      authRow.email,
      authRow.role,
      authRow.token,
      new Date(authRow.createdAt)
    );
  }

  /**
   * Logout user and invalidate session.
   */
  async logout(): Promise<void> {
    await this.repo.logout();
  }

  /**
   * Simple email validation.
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
