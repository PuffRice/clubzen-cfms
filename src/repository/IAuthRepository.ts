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
  role: "Admin" | "Staff";
  token: string;
  createdAt: string;
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
   * Logout user (invalidate session).
   */
  logout(): Promise<void>;
}
