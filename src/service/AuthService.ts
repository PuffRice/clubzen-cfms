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
import type { IAuthRepository, UpdateProfileParams } from "../repository/IAuthRepository";

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
      new Date(authRow.createdAt),
      authRow.fullName,
      authRow.currency
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
      new Date(authRow.createdAt),
      authRow.fullName,
      authRow.currency
    );
  }

  /**
   * Update user profile (full name, currency).
   */
  async updateProfile(userId: string, params: UpdateProfileParams): Promise<Auth | null> {
    const authRow = await this.repo.updateUserProfile(userId, params);
    if (!authRow) return null;
    return new Auth(
      authRow.userId,
      authRow.email,
      authRow.role,
      authRow.token,
      new Date(authRow.createdAt),
      authRow.fullName,
      authRow.currency
    );
  }

  /**
   * Logout user and invalidate session.
   */
  async logout(): Promise<void> {
    await this.repo.logout();
  }

  /**
   * Change user password.
   * Validates inputs before delegating to repository.
   * @throws Error when validation fails or password change fails.
   */
  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    // Validate inputs
    if (!currentPassword || currentPassword.trim().length === 0) {
      throw new Error("Current password is required.");
    }

    if (!newPassword || newPassword.trim().length === 0) {
      throw new Error("New password is required.");
    }

    if (!confirmPassword || confirmPassword.trim().length === 0) {
      throw new Error("Password confirmation is required.");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    if (newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters.");
    }

    if (currentPassword === newPassword) {
      throw new Error("New password must be different from current password.");
    }

    // Delegate to repository
    await this.repo.changePassword(currentPassword, newPassword);
  }

  /**
   * Simple email validation.
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
