/**
 * IAuthRepository — Contract for authentication persistence.
 *
 * Responsibilities:
 *   • Define interface for login with Supabase
 *   • Separate auth persistence logic from business logic
 */

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthRow {
  userId: string;
  email: string;
  role: "Admin" | "Staff" | "User";
  token: string;
  createdAt: string;
  fullName?: string;
  currency?: string;
}

export interface UpdateProfileParams {
  fullName?: string;
  currency?: string;
}

export interface IAuthRepository {
  /**
   * Authenticate user with email and password.
   * @throws Error if authentication fails.
   */
  login(credentials: AuthCredentials): Promise<AuthRow>;

  /**
   * Retrieve user profile from Supabase.
   */
  getUserProfile(userId: string): Promise<AuthRow | null>;

  /**
   * Update user profile (full_name, currency).
   */
  updateUserProfile(userId: string, params: UpdateProfileParams): Promise<AuthRow | null>;

  /**
   * Change user password.
   * @throws Error if password change fails.
   */
  changePassword(currentPassword: string, newPassword: string): Promise<void>;

  /**
   * Logout user (invalidate session).
   */
  logout(): Promise<void>;
}
