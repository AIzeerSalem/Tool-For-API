import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { ApiProfile } from '../types';

class ApiClient {
  private axiosInstance: AxiosInstance;
  private currentProfile: ApiProfile | null = null;

  constructor() {
    this.axiosInstance = axios.create();
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

        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        // Enhanced error handling
        const enhancedError = {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: error.config,
        };

        return Promise.reject(enhancedError);
      }
    );
  }

  async request<T>(method: string, url: string, data?: unknown): Promise<T> {
    try {
      const response = await this.axiosInstance.request<T>({
        method,
        url,
        data,
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  // Helper methods for common HTTP methods
  async get(endpoint: string, params?: any) {
    return this.request('GET', endpoint, params);
  }

  async post(endpoint: string, data?: any, params?: any) {
    return this.request('POST', endpoint, data);
  }

  async put(endpoint: string, data?: any, params?: any) {
    return this.request('PUT', endpoint, data);
  }

  async delete(endpoint: string, params?: any) {
    return this.request('DELETE', endpoint, params);
  }

  // Generate curl command for current request
  generateCurl(method: string, endpoint: string, params?: any, data?: any): string {
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
    } else if (this.currentProfile.apiKey) {
      headers['X-API-Key'] = this.currentProfile.apiKey;
    }

    Object.entries(headers).forEach(([key, value]) => {
      curl += ` \\\n  -H '${key}: ${value}'`;
    });

    // Add query parameters
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      if (queryString) {
        curl += ` \\\n  '?${queryString}'`;
      }
    }

    // Add request body
    if (data) {
      curl += ` \\\n  -d '${JSON.stringify(data)}'`;
    }

    return curl;
  }
}

export const apiClient = new ApiClient(); 