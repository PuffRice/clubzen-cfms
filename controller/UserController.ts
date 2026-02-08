interface HttpRequest<T = any> {
  body?: T;
  params?: Record<string, string>;
  query?: Record<string, string>;
  userId?: string;
}

interface HttpResponse {
  statusCode: number;
  body: any;
}

export class UserController {
  async changePassword(req: HttpRequest): Promise<HttpResponse> {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return {
        statusCode: 400,
        body: { message: "Current and new password required" },
      };
    }

    // Controller responsibility ends here
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
