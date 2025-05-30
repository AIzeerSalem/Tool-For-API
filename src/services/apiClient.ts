import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { ApiProfile } from '../types';

class ApiClient {
  private axiosInstance;
  private currentProfile: ApiProfile | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (!this.currentProfile) {
          throw new Error('No API profile selected');
        }

        // Add authentication
        if (this.currentProfile.authType === 'bearer') {
          config.headers.Authorization = `Bearer ${this.currentProfile.authValue}`;
        } else if (this.currentProfile.authType === 'basic') {
          config.headers.Authorization = `Basic ${btoa(this.currentProfile.authValue || '')}`;
        } else if (this.currentProfile.apiKey) {
          config.headers['X-API-Key'] = this.currentProfile.apiKey;
        }

        // Add custom headers
        Object.entries(this.currentProfile.headers).forEach(([key, value]) => {
          config.headers[key] = value;
        });

        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Enhanced error handling
        const enhancedError = {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          request: {
            method: error.config?.method,
            url: error.config?.url,
            data: error.config?.data,
            headers: error.config?.headers,
          },
        };
        return Promise.reject(enhancedError);
      }
    );
  }

  setProfile(profile: ApiProfile) {
    this.currentProfile = profile;
    this.axiosInstance.defaults.baseURL = profile.baseUrl;
  }

  async request(method: string, endpoint: string, params?: any, data?: any) {
    if (!this.currentProfile) {
      throw new Error('No API profile selected');
    }

    const config = {
      method,
      url: endpoint,
      params,
      data,
    };

    try {
      const response = await this.axiosInstance.request(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Helper methods for common HTTP methods
  async get(endpoint: string, params?: any) {
    return this.request('GET', endpoint, params);
  }

  async post(endpoint: string, data?: any, params?: any) {
    return this.request('POST', endpoint, params, data);
  }

  async put(endpoint: string, data?: any, params?: any) {
    return this.request('PUT', endpoint, params, data);
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