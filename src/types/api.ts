export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiProfile {
  id: string;
  name: string;
  baseUrl: string;
  authType: 'none' | 'bearer' | 'basic';
  authValue?: string;
  apiKey?: string;
  headers: Record<string, string>;
}

export interface ApiRequest {
  id: string;
  method: HttpMethod;
  url: string;
  data?: unknown;
  params?: Record<string, unknown>;
  timestamp: number;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  timestamp: number;
}

export type ApiErrorCode = 'NETWORK_ERROR' | 'TIMEOUT_ERROR' | 'INVALID_RESPONSE';

export class ApiError extends Error {
  constructor(message: string, public code: ApiErrorCode) {
    super(message);
    this.name = 'ApiError';
  }
} 