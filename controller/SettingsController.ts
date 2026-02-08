interface HttpRequest<T = any> {
  body?: T;
}

interface HttpResponse {
  statusCode: number;
  body: any;
}

export class SettingsController {
  async updateSettings(req: HttpRequest): Promise<HttpResponse> {
    const settings = req.body;

    if (!settings) {
      return {
        statusCode: 400,
        body: { message: "Settings data is required" },
      };
    }

    // Controller layer responsibility ends here
    return {
      statusCode: 200,
      body: { message: "Settings updated successfully" },
    };
  }
}
