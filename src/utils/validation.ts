import { ApiRequest, ApiResponse } from '../types';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export class Validator<T> {
  private rules: ValidationRule<T>[] = [];

  addRule(rule: ValidationRule<T>): this {
    this.rules.push(rule);
    return this;
  }

  validate(value: T): void {
    for (const rule of this.rules) {
      if (!rule.validate(value)) {
        throw new ValidationError(rule.message);
      }
    }
  }
}

// Request validation
export const createRequestValidator = () => {
  const validator = new Validator<ApiRequest>();

  return validator
    .addRule({
      validate: (request) => !!request.url,
      message: 'URL is required',
    })
    .addRule({
      validate: (request) => ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method),
      message: 'Invalid HTTP method',
    })
    .addRule({
      validate: (request) => {
        if (request.method === 'GET' || request.method === 'DELETE') {
          return !request.data;
        }
        return true;
      },
      message: 'GET and DELETE requests should not have a request body',
    });
};

// Response validation
export const createResponseValidator = () => {
  const validator = new Validator<ApiResponse>();

  return validator
    .addRule({
      validate: (response) => response.status >= 100 && response.status < 600,
      message: 'Invalid HTTP status code',
    })
    .addRule({
      validate: (response) => !!response.statusText,
      message: 'Status text is required',
    })
    .addRule({
      validate: (response) => typeof response.headers === 'object',
      message: 'Headers must be an object',
    });
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Content type validation
export const isJsonContent = (headers: Record<string, string>): boolean => {
  const contentType = headers['content-type'] || headers['Content-Type'];
  return contentType?.includes('application/json') || false;
};

// Schema validation (basic example)
export const validateSchema = (data: any, schema: Record<string, string>): boolean => {
  for (const [key, type] of Object.entries(schema)) {
    if (!(key in data)) return false;
    if (typeof data[key] !== type) return false;
  }
  return true;
}; 