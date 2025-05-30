import { ApiEndpoint, ApiParameter } from '../types';
import { ApiRequest, ApiResponse } from '../types';

interface MockResponse {
  data: any;
  status: number;
  headers: Record<string, string>;
}

interface MockEndpoint extends ApiEndpoint {
  response: MockResponse;
  delay?: number;
  validateRequest?: (params: any, body: any) => boolean;
}

interface MockData {
  id: number;
  name: string;
  value: number;
  status: string;
  date: string;
}

const generateMockData = (count: number): MockData[] => {
  const statuses = ['active', 'pending', 'completed', 'failed'];
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    value: Math.floor(Math.random() * 1000),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }));
};

const mockDatabase = {
  items: generateMockData(50)
};

const filterData = (data: MockData[], params: Record<string, any>) => {
  if (!params || Object.keys(params).length === 0) return data;

  const operator = params._operator || 'and';
  delete params._operator;

  return data.filter(item => {
    const conditions = Object.entries(params).map(([field, condition]) => {
      const { operator, value } = condition as { operator: string; value: string };
      const itemValue = item[field as keyof MockData];

      switch (operator) {
        case 'equals':
          return String(itemValue) === value;
        case 'contains':
          return String(itemValue).includes(value);
        case 'startsWith':
          return String(itemValue).startsWith(value);
        case 'endsWith':
          return String(itemValue).endsWith(value);
        case 'greaterThan':
          return Number(itemValue) > Number(value);
        case 'lessThan':
          return Number(itemValue) < Number(value);
        case 'between':
          const [min, max] = value.split(',').map(Number);
          return Number(itemValue) >= min && Number(itemValue) <= max;
        case 'before':
          return new Date(itemValue) < new Date(value);
        case 'after':
          return new Date(itemValue) > new Date(value);
        default:
          return true;
      }
    });

    return operator === 'and'
      ? conditions.every(Boolean)
      : conditions.some(Boolean);
  });
};

class MockApi {
  private endpoints: Map<string, MockEndpoint> = new Map();
  private isEnabled: boolean = false;

  constructor(mockData?: { endpoints: MockEndpoint[] }) {
    if (mockData) {
      this.loadMockData(mockData);
    }
    this.setupDefaultEndpoints();
  }

  private setupDefaultEndpoints(): void {
    const defaultEndpoints: MockEndpoint[] = [
      {
        path: '/api/items',
        method: 'GET',
        description: 'Get a list of items with optional filtering',
        parameters: [
          {
            name: 'filter',
            type: 'object',
            required: false,
            description: 'Filter criteria'
          }
        ],
        response: {
          status: 200,
          data: mockDatabase.items,
          headers: { 'Content-Type': 'application/json' }
        }
      },
      {
        path: '/api/items',
        method: 'POST',
        description: 'Create a new item',
        parameters: [
          {
            name: 'name',
            type: 'string',
            required: true,
            description: 'Item name'
          },
          {
            name: 'value',
            type: 'number',
            required: true,
            description: 'Item value'
          }
        ],
        response: {
          status: 201,
          data: { message: 'Item created successfully' },
          headers: { 'Content-Type': 'application/json' }
        }
      },
      {
        path: '/api/items/stats',
        method: 'GET',
        description: 'Get statistics about items',
        parameters: [
          {
            name: 'filter',
            type: 'object',
            required: false,
            description: 'Filter criteria for statistics'
          }
        ],
        response: {
          status: 200,
          data: {
            total: mockDatabase.items.length,
            averageValue: mockDatabase.items.reduce((sum, item) => sum + item.value, 0) / mockDatabase.items.length,
            statusCounts: mockDatabase.items.reduce((counts, item) => {
              counts[item.status] = (counts[item.status] || 0) + 1;
              return counts;
            }, {} as Record<string, number>)
          },
          headers: { 'Content-Type': 'application/json' }
        }
      }
    ];

    defaultEndpoints.forEach(endpoint => {
      const key = `${endpoint.method}:${endpoint.path}`;
      this.endpoints.set(key, endpoint);
    });
  }

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }

  isActive(): boolean {
    return this.isEnabled;
  }

  loadMockData(data: { endpoints: MockEndpoint[] }): void {
    data.endpoints.forEach(endpoint => {
      const key = `${endpoint.method}:${endpoint.path}`;
      this.endpoints.set(key, endpoint);
    });
  }

  async handleRequest(method: string, path: string, params?: any, body?: any): Promise<MockResponse> {
    if (!this.isEnabled) {
      throw new Error('Mock API is not enabled');
    }

    const key = `${method}:${path}`;
    const endpoint = this.endpoints.get(key);

    if (!endpoint) {
      return {
        status: 404,
        data: { error: `Endpoint ${method} ${path} not found` },
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Validate request if validator is provided
    if (endpoint.validateRequest && !endpoint.validateRequest(params, body)) {
      return {
        status: 400,
        data: { error: 'Invalid request parameters' },
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Simulate network delay
    if (endpoint.delay) {
      await new Promise(resolve => setTimeout(resolve, endpoint.delay));
    }

    // Handle special endpoints
    if (path === '/api/items' && method === 'GET') {
      return {
        status: 200,
        data: filterData(mockDatabase.items, params),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    if (path === '/api/items' && method === 'POST') {
      const newItem: MockData = {
        id: mockDatabase.items.length + 1,
        name: body.name,
        value: body.value,
        status: 'pending',
        date: new Date().toISOString()
      };
      mockDatabase.items.push(newItem);
      return {
        status: 201,
        data: newItem,
        headers: { 'Content-Type': 'application/json' }
      };
    }

    if (path === '/api/items/stats' && method === 'GET') {
      const filteredItems = filterData(mockDatabase.items, params);
      return {
        status: 200,
        data: {
          total: filteredItems.length,
          averageValue: filteredItems.reduce((sum, item) => sum + item.value, 0) / filteredItems.length,
          statusCounts: filteredItems.reduce((counts, item) => {
            counts[item.status] = (counts[item.status] || 0) + 1;
            return counts;
          }, {} as Record<string, number>)
        },
        headers: { 'Content-Type': 'application/json' }
      };
    }

    return endpoint.response;
  }

  // Helper method to generate realistic mock data
  static generateMockData(schema: Record<string, string>, count: number = 1): any {
    const generateValue = (type: string): any => {
      switch (type) {
        case 'string':
          return Math.random().toString(36).substring(7);
        case 'number':
          return Math.floor(Math.random() * 1000);
        case 'boolean':
          return Math.random() > 0.5;
        case 'date':
          return new Date(Date.now() - Math.random() * 10000000000).toISOString();
        default:
          return null;
      }
    };

    const generateObject = (schema: Record<string, string>): any => {
      const result: any = {};
      Object.entries(schema).forEach(([key, type]) => {
        result[key] = generateValue(type);
      });
      return result;
    };

    if (count === 1) {
      return generateObject(schema);
    }

    return Array.from({ length: count }, () => generateObject(schema));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateMockResponse(request: ApiRequest): ApiResponse {
    const timestamp = Date.now();
    
    // Success responses for different methods
    const successResponses: Record<string, any> = {
      GET: { data: { id: 1, name: 'Mock Data', timestamp } },
      POST: { id: Math.floor(Math.random() * 1000), success: true, timestamp },
      PUT: { success: true, updated: timestamp },
      DELETE: { success: true, deleted: timestamp },
      PATCH: { success: true, patched: timestamp },
    };

    // Error responses
    const errorResponses = {
      notFound: {
        status: 404,
        statusText: 'Not Found',
        data: { error: 'Resource not found' },
      },
      badRequest: {
        status: 400,
        statusText: 'Bad Request',
        data: { error: 'Invalid request parameters' },
      },
      serverError: {
        status: 500,
        statusText: 'Internal Server Error',
        data: { error: 'Server error occurred' },
      },
    };

    // Simulate different response scenarios based on URL patterns
    if (request.url.includes('error')) {
      return {
        ...errorResponses.serverError,
        headers: { 'content-type': 'application/json' },
        timestamp,
      };
    }

    if (request.url.includes('notfound')) {
      return {
        ...errorResponses.notFound,
        headers: { 'content-type': 'application/json' },
        timestamp,
      };
    }

    // Success response
    return {
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
        'x-mock-api': 'true',
      },
      data: successResponses[request.method] || { success: true },
      timestamp,
    };
  }

  async request(request: ApiRequest): Promise<ApiResponse> {
    // Simulate network delay
    await this.delay(Math.random() * 1000);

    return this.generateMockResponse(request);
  }
}

// Export a singleton instance
export const mockApi = new MockApi(); 