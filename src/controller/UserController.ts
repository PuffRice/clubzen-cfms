/**
 * UserController — User profile and password management.
 *
 * Kept from original controller/UserController.ts.
 * Returns mocked data (no database in Sprint 1–3).
 */

import { HttpRequest, HttpResponse } from "./CommonTypes";

export class UserController {
  async changePassword(req: HttpRequest): Promise<HttpResponse> {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return {
        statusCode: 400,
        body: { message: "Current and new password required" },
      };
    }

    return {
      statusCode: 200,
      body: { message: "Password changed successfully" },
    };
  }

  async getProfile(): Promise<HttpResponse> {
    return {
      statusCode: 200,
      body: {
        userId: "user-001",
        name: "Demo User",
        role: "ADMIN",
      },
    };
  }
}
