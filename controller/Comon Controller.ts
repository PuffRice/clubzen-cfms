export interface HttpRequest<T = any> {
  body?: T;
  params?: Record<string, string>;
  query?: Record<string, string>;
  userId?: string; // injected by auth middleware (conceptually)
}

export interface HttpResponse {
  statusCode: number;
  body: any;
}