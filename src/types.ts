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
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timestamp: number;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  timestamp: number;
}

export type ApiErrorCode = 
  | 'STORAGE_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'PROFILE_NOT_FOUND'
  | 'REQUEST_ABORTED'
  | 'INVALID_RESPONSE';

export class ApiError extends Error {
  constructor(message: string, public code: ApiErrorCode) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiContextValue {
  profiles: ApiProfile[];
  addProfile: (profile: ApiProfile) => Promise<void>;
  updateProfile: (profile: ApiProfile) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  history: Array<{ request: ApiRequest; response: ApiResponse }>;
  clearHistory: () => Promise<void>;
  deleteHistoryItem: (requestId: string) => Promise<void>;
  replayRequest: (request: ApiRequest) => Promise<ApiResponse>;
  cancelRequest: (requestId: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isMockEnabled: boolean;
  toggleMockApi: () => void;
}

export interface RequestHistory {
  id: string;
  timestamp: string;
  profileId: string;
  method: string;
  endpoint: string;
  parameters: unknown;
  response: unknown;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie';
  title: string;
  labelKey: string;
  dataKey: string;
}

export interface ApiParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
}

export interface ApiEndpoint {
  path: string;
  method: string;
  description: string;
  parameters: ApiParameter[];
}

export interface ApiConfig {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  validateStatus?: (status: number) => boolean;
} 