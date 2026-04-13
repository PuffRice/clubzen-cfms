/**
 * SettingsService — Application-level settings logic.
 *
 * Responsibilities:
 *   • Validate setting values before persisting
 *   • Convert repository rows into Settings domain objects
 *   • Enforce business rules (e.g. supported currencies)
 *
 * Design Decision:
 *   Service receives ISettingsRepository through DI, keeping
 *   persistence fully decoupled from business logic.
 */

import { Settings } from "../domain/Settings";
import type { CurrencyCode } from "../domain/Settings";
import type { ISettingsRepository, UpdateSettingsParams } from "../repository/ISettingsRepository";

export class SettingsService {
  constructor(private readonly repo: ISettingsRepository) {}

  async getSettings(userId: string): Promise<Settings | null> {
    if (!userId) throw new Error("User ID is required.");

    const row = await this.repo.getByUserId(userId);
    if (!row) return null;

    return new Settings(
      row.userId,
      row.email,
      row.fullName,
      row.role,
      (row.currency || "BDT") as CurrencyCode,
      row.updatedAt ? new Date(row.updatedAt) : new Date(),
    );
  }

  async updateName(userId: string, fullName: string): Promise<Settings | null> {
    if (!userId) throw new Error("User ID is required.");
    if (fullName !== undefined && fullName.trim().length === 0) {
      throw new Error("Name cannot be empty.");
    }

    return this.applyUpdate(userId, { fullName: fullName.trim() });
  }

  async updateCurrency(userId: string, currency: string): Promise<Settings | null> {
    if (!userId) throw new Error("User ID is required.");
    if (!Settings.isSupportedCurrency(currency)) {
      throw new Error(`Unsupported currency: ${currency}. Supported: USD, BDT.`);
    }

    return this.applyUpdate(userId, { currency });
  }

  private async applyUpdate(userId: string, params: UpdateSettingsParams): Promise<Settings | null> {
    const row = await this.repo.update(userId, params);
    if (!row) return null;

    return new Settings(
      row.userId,
      row.email,
      row.fullName,
      row.role,
      (row.currency || "BDT") as CurrencyCode,
      row.updatedAt ? new Date(row.updatedAt) : new Date(),
    );
  }
}
