// src/controllers/AuthController.ts

// Local request & response models
interface HttpRequest<T = any> {
  body?: T;
}

interface HttpResponse {
  statusCode: number;
  body: any;
}

export class AuthController {

  async login(req: HttpRequest): Promise<HttpResponse> {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return {
        statusCode: 400,
        body: { message: "Email and password are required" },
      };
    }

    // Mock authentication response (controller layer only)
    return {
      statusCode: 200,
      body: {
        token: "mock-jwt-token",
        userId: "user-001",
        role: "ADMIN",
      },
    };
  }
}
