/**
 * CommonTypes — Shared HTTP request/response interfaces for controllers.
 *
 * Based on the original "Comon Controller.ts" but with the filename
 * corrected for clean imports.
 */

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
