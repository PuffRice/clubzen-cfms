/**
 * SettingsController — Thin controller handling user settings requests from the UI.
 *
 * Responsibilities:
 *   • Accept requests from the UI layer
 *   • Delegate to SettingsService for business logic
 *   • Return formatted results to the UI
 *   • Convert service errors into user-friendly messages
 *
 * Design Decision:
 *   Controller is a thin layer — all settings logic is delegated to
 *   SettingsService. The service receives ISettingsRepository via DI,
 *   so persistence is fully decoupled.
 */

import type { SettingsService } from "@core/service/SettingsService";
import type { CurrencyCode } from "@core/domain/Settings";

export interface SettingsResult {
  success: boolean;
  settings?: {
    userId: string;
    email: string;
    fullName: string;
    role: string;
    currency: CurrencyCode;
  };
  error?: string;
}

export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  async getSettings(userId: string): Promise<SettingsResult> {
    try {
      const settings = await this.settingsService.getSettings(userId);
      if (!settings) return { success: false, error: "Settings not found." };

      return {
        success: true,
        settings: {
          userId: settings.userId,
          email: settings.email,
          fullName: settings.fullName,
          role: settings.role,
          currency: settings.currency,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load settings.";
      return { success: false, error: message };
    }
  }

  async updateName(userId: string, fullName: string): Promise<SettingsResult> {
    try {
      const settings = await this.settingsService.updateName(userId, fullName);
      if (!settings) return { success: false, error: "Failed to update name." };

      return {
        success: true,
        settings: {
          userId: settings.userId,
          email: settings.email,
          fullName: settings.fullName,
          role: settings.role,
          currency: settings.currency,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update name.";
      return { success: false, error: message };
    }
  }

  async updateCurrency(userId: string, currency: string): Promise<SettingsResult> {
    try {
      const settings = await this.settingsService.updateCurrency(userId, currency);
      if (!settings) return { success: false, error: "Failed to update currency." };

      return {
        success: true,
        settings: {
          userId: settings.userId,
          email: settings.email,
          fullName: settings.fullName,
          role: settings.role,
          currency: settings.currency,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update currency.";
      return { success: false, error: message };
    }
  }
}
