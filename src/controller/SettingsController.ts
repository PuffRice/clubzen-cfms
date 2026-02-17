/**
 * SettingsController — Application settings management.
 *
 * Kept from original controller/SettingsController.ts.
 * Returns mocked data (no database in Sprint 1–3).
 */

import { HttpRequest, HttpResponse } from "./CommonTypes";

export class SettingsController {
  async updateSettings(req: HttpRequest): Promise<HttpResponse> {
    const settings = req.body;

    if (!settings) {
      return {
        statusCode: 400,
        body: { message: "Settings data is required" },
      };
    }

    return {
      statusCode: 200,
      body: { message: "Settings updated successfully" },
    };
  }
}
