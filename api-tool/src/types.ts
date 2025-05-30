export interface ApiProfile {
  id: string;
  name: string;
  baseUrl: string;
  authType: 'none' | 'bearer' | 'basic';
  authValue?: string;
  apiKey?: string;
  headers: Record<string, string>;
}

export interface RequestHistory {
  id: string;
  timestamp: string;
  profileId: string;
  method: string;
  endpoint: string;
  parameters: any;
  response: any;
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