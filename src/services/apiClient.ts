import axios, { AxiosInstance, AxiosError, AxiosResponse, CancelTokenSource } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { ApiProfile, ApiConfig, ApiError, ApiRequest, ApiResponse, ApiErrorCode } from '../types';
import { cacheService, loggingService } from './index';

const DEFAULT_CONFIG: ApiConfig = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  validateStatus: (status: number) => status >= 200 && status < 300,
};

class ApiClient {
  private axiosInstance: AxiosInstance;
  private currentProfile: ApiProfile | null = null;
  private config: ApiConfig;
  private cancelTokens: Map<string, CancelTokenSource> = new Map();

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.axiosInstance = axios.create({
      timeout: this.config.timeout,
    });
    this.setupInterceptors();
  }

  setProfile(profile: ApiProfile): void {
    this.currentProfile = profile;
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (!this.currentProfile) {
          throw new Error('No API profile selected');
        }

        // Add base URL
        config.baseURL = this.currentProfile.baseUrl;

        // Add authentication
        if (this.currentProfile.authType === 'bearer' && this.currentProfile.authValue) {
          config.headers.Authorization = `Bearer ${this.currentProfile.authValue}`;
        } else if (this.currentProfile.authType === 'basic' && this.currentProfile.authValue) {
          config.headers.Authorization = `Basic ${btoa(this.currentProfile.authValue)}`;
        }

        // Add API key if present
        if (this.currentProfile.apiKey) {
          config.headers['X-API-Key'] = this.currentProfile.apiKey;
        }

        // Add custom headers
        Object.entries(this.currentProfile.headers).forEach(([key, value]) => {
          config.headers[key] = value;
        });

        // Add cancel token
        const cancelToken = axios.CancelToken.source();
        this.cancelTokens.set(config.url || '', cancelToken);
        config.cancelToken = cancelToken.token;

        // Log request
        const request: ApiRequest = {
          id: Date.now().toString(),
          method: config.method?.toUpperCase() as ApiRequest['method'],
          url: config.url || '',
          headers: config.headers as Record<string, string>,
          data: config.data,
          timestamp: Date.now(),
        };
        loggingService.logRequest(request);

        return config;
      },
      (error: AxiosError) => {
        loggingService.logError(error);
        return Promise.reject(this.handleError(error));
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        const request: ApiRequest = {
          id: Date.now().toString(),
          method: response.config.method?.toUpperCase() as ApiRequest['method'],
          url: response.config.url || '',
          headers: response.config.headers as Record<string, string>,
          data: response.config.data,
          timestamp: Date.now(),
        };

        const apiResponse: ApiResponse = {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers as Record<string, string>,
          data: response.data,
          timestamp: Date.now(),
        };

        loggingService.logResponse(request, apiResponse);
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as InternalAxiosRequestConfig & { _retry?: number };
        
        // Handle retry logic
        if (
          config &&
          config._retry !== undefined &&
          config._retry < (this.config.retryAttempts || 0) &&
          this.shouldRetry(error)
        ) {
          config._retry = (config._retry || 0) + 1;
          await this.delay(this.config.retryDelay || 0);
          return this.axiosInstance(config);
        }

        loggingService.logError(error);
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors and 5xx server errors
    return (
      !error.response ||
      (error.response.status >= 500 && error.response.status <= 599)
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleError(error: AxiosError): ApiError {
    let message: string;
    let code: ApiErrorCode;

    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data as { message?: string };
      message = errorData?.message || error.message || 'Server error';
      code = 'NETWORK_ERROR';
    } else if (error.request) {
      // Request made but no response received
      message = 'No response received from server';
      code = 'TIMEOUT_ERROR';
    } else {
      // Request setup error
      message = error.message || 'Unknown error occurred';
      code = 'NETWORK_ERROR';
    }

    return new ApiError(message, code);
  }

  async request<T = unknown>(request: ApiRequest): Promise<ApiResponse> {
    if (!this.currentProfile) {
      throw new ApiError('No API profile selected', 'INVALID_RESPONSE');
    }

    try {
      const response = await this.axiosInstance.request({
        method: request.method,
        url: request.url,
        data: request.data,
        params: request.params,
      });

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
        data: response.data as T,
        timestamp: Date.now(),
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // Cancel ongoing request
  cancelRequest(url: string): void {
    const source = this.cancelTokens.get(url);
    if (source) {
      source.cancel('Request cancelled by user');
      this.cancelTokens.delete(url);
    }
  }

  // Cancel all ongoing requests
  cancelAllRequests(): void {
    this.cancelTokens.forEach((source) => {
      source.cancel('Request cancelled by user');
    });
    this.cancelTokens.clear();
  }

  // Helper methods for common HTTP methods
  async get<T = unknown>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse> {
    return this.request({
      id: Date.now().toString(),
      method: 'GET',
      url: endpoint,
      params,
      timestamp: Date.now(),
    });
  }

  async post<T = unknown>(endpoint: string, data?: unknown): Promise<ApiResponse> {
    return this.request({
      id: Date.now().toString(),
      method: 'POST',
      url: endpoint,
      data,
      timestamp: Date.now(),
    });
  }

  async put<T = unknown>(endpoint: string, data?: unknown): Promise<ApiResponse> {
    return this.request({
      id: Date.now().toString(),
      method: 'PUT',
      url: endpoint,
      data,
      timestamp: Date.now(),
    });
  }

  async delete<T = unknown>(endpoint: string): Promise<ApiResponse> {
    return this.request({
      id: Date.now().toString(),
      method: 'DELETE',
      url: endpoint,
      timestamp: Date.now(),
    });
  }

  // Generate curl command for current request
  generateCurl(method: string, endpoint: string, data?: any): string {
    if (!this.currentProfile) {
      throw new Error('No API profile selected');
    }

    let curl = `curl -X ${method} '${this.currentProfile.baseUrl}${endpoint}'`;

    // Add headers
    const headers = { ...this.currentProfile.headers };
    if (this.currentProfile.authType === 'bearer') {
      headers.Authorization = `Bearer ${this.currentProfile.authValue}`;
    } else if (this.currentProfile.authType === 'basic') {
      headers.Authorization = `Basic ${btoa(this.currentProfile.authValue || '')}`;
    }
    if (this.currentProfile.apiKey) {
      headers['X-API-Key'] = this.currentProfile.apiKey;
    }

    Object.entries(headers).forEach(([key, value]) => {
      curl += ` \\\n  -H '${key}: ${value}'`;
    });

    // Add request body
    if (data) {
      curl += ` \\\n  -d '${JSON.stringify(data)}'`;
    }

    return curl;
  }
}

export const apiClient = new ApiClient(); 