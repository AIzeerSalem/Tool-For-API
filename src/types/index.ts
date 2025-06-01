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
  data?: any;
  params?: Record<string, string>;
  timestamp: number;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  timestamp: number;
}

export interface ApiConfig {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  validateStatus?: (status: number) => boolean;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
  config?: any;
}

export interface ApiContextValue {
  profiles: ApiProfile[];
  addProfile: (profile: ApiProfile) => Promise<void>;
  updateProfile: (profile: ApiProfile) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  history: Array<{ request: ApiRequest; response: ApiResponse }>;
  clearHistory: () => Promise<void>;
  replayRequest: (request: ApiRequest) => Promise<void>;
  deleteHistoryItem: (requestId: string) => Promise<void>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isMockEnabled: boolean;
  toggleMockApi: () => void;
}

export interface RequestHistory {
  id: string;
  timestamp: number;
  endpoint: string;
  method: string;
  parameters: Record<string, any>;
  response?: any;
  profileId: string;
}

export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  parameters: ApiParameter[];
}

export interface ApiParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  description: string;
  example?: any;
}

export interface TableConfig {
  columns: {
    field: string;
    title: string;
    visible: boolean;
    width?: number;
  }[];
  highlightRules: {
    column: string;
    condition: string;
    value: any;
    color: string;
  }[];
}

export interface ChartConfig {
  type: 'bar' | 'pie' | 'line';
  dataKey: string;
  labelKey: string;
  title: string;
} 