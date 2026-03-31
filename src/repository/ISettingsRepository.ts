/**
 * ISettingsRepository — Contract for user settings persistence.
 *
 * Responsibilities:
 *   • Define read/write interface for user profile & preferences
 *   • Decouple persistence from business logic
 */

export interface SettingsRow {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  currency: string;
  updatedAt: string;
}

export interface UpdateSettingsParams {
  fullName?: string;
  currency?: string;
}

export interface ISettingsRepository {
  getByUserId(userId: string): Promise<SettingsRow | null>;

  update(userId: string, params: UpdateSettingsParams): Promise<SettingsRow | null>;
}
