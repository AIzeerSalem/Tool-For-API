import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { mockApi } from '../services/mockApi';
import { ApiProfile, ApiRequest, ApiResponse, ApiContextValue, ApiError } from '../types';

const DEFAULT_TIMEOUT = 30000; // 30 seconds

const ApiContext = createContext<ApiContextValue | null>(null);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<ApiProfile[]>([]);
  const [history, setHistory] = useState<Array<{ request: ApiRequest; response: ApiResponse }>>([]);
  const [activeRequests, setActiveRequests] = useState<Map<string, AbortController>>(new Map());
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMockEnabled, setIsMockEnabled] = useState(() => {
    const saved = localStorage.getItem('mockEnabled');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedProfiles, savedHistory] = await Promise.all([
          storage.getItem<ApiProfile[]>('profiles'),
          storage.getItem<Array<{ request: ApiRequest; response: ApiResponse }>>('history'),
        ]);
        if (savedProfiles) setProfiles(savedProfiles as ApiProfile[]);
        if (savedHistory) setHistory(savedHistory as Array<{ request: ApiRequest; response: ApiResponse }>);
      } catch (error) {
        console.error('Failed to load data:', error);
        throw new ApiError('Failed to load saved data', 'STORAGE_ERROR');
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('mockEnabled', JSON.stringify(isMockEnabled));
  }, [isMockEnabled]);

  // Cleanup function for active requests
  useEffect(() => {
    return () => {
      activeRequests.forEach(controller => controller.abort());
    };
  }, [activeRequests]);

  const addProfile = async (profile: ApiProfile) => {
    try {
      const updatedProfiles = [...profiles, profile];
      await storage.setItem('profiles', updatedProfiles);
      setProfiles(updatedProfiles);
    } catch (error) {
      console.error('Failed to add profile:', error);
      throw new ApiError('Failed to add profile', 'STORAGE_ERROR');
    }
  };

  const updateProfile = async (profile: ApiProfile) => {
    try {
      const updatedProfiles = profiles.map(p => 
        p.id === profile.id ? profile : p
      );
      await storage.setItem('profiles', updatedProfiles);
      setProfiles(updatedProfiles);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw new ApiError('Failed to update profile', 'STORAGE_ERROR');
    }
  };

  const deleteProfile = async (id: string) => {
    try {
      const updatedProfiles = profiles.filter(p => p.id !== id);
      await storage.setItem('profiles', updatedProfiles);
      setProfiles(updatedProfiles);
    } catch (error) {
      console.error('Failed to delete profile:', error);
      throw new ApiError('Failed to delete profile', 'STORAGE_ERROR');
    }
  };

  const addHistoryItem = async (request: ApiRequest, response: ApiResponse) => {
    try {
      const updatedHistory = [...history, { request, response }];
      // Keep only the last 100 requests to prevent performance issues
      const trimmedHistory = updatedHistory.slice(-100);
      await storage.setItem('history', trimmedHistory);
      setHistory(trimmedHistory);
    } catch (error) {
      console.error('Failed to add history item:', error);
      throw new ApiError('Failed to add history item', 'STORAGE_ERROR');
    }
  };

  const clearHistory = async () => {
    try {
      await storage.setItem('history', []);
      setHistory([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
      throw new ApiError('Failed to clear history', 'STORAGE_ERROR');
    }
  };

  const deleteHistoryItem = async (requestId: string) => {
    try {
      const updatedHistory = history.filter(item => item.request.id !== requestId);
      await storage.setItem('history', updatedHistory);
      setHistory(updatedHistory);
    } catch (error) {
      console.error('Failed to delete history item:', error);
      throw new ApiError('Failed to delete history item', 'STORAGE_ERROR');
    }
  };

  const cancelRequest = (requestId: string) => {
    const controller = activeRequests.get(requestId);
    if (controller) {
      controller.abort();
      activeRequests.delete(requestId);
      setActiveRequests(new Map(activeRequests));
    }
  };

  const replayRequest = async (request: ApiRequest) => {
    const profile = profiles.find(p => p.id === request.profileId);
    if (!profile) {
      throw new ApiError('Profile not found', 'PROFILE_NOT_FOUND');
    }

    // Create abort controller for this request
    const controller = new AbortController();
    setActiveRequests(prev => new Map(prev).set(request.id, controller));

    try {
      let response: ApiResponse;

      if (isMockEnabled) {
        response = await mockApi.request(request);
      } else {
        const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

        try {
          const res = await fetch(request.url, {
            method: request.method,
            headers: {
              ...request.headers,
              'Content-Type': 'application/json',
            },
            body: request.body ? JSON.stringify(request.body) : undefined,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          let responseData;
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            try {
              responseData = await res.json();
            } catch (error) {
              responseData = { error: 'Invalid JSON response' };
            }
          } else {
            responseData = await res.text();
          }

          response = {
            status: res.status,
            statusText: res.statusText,
            headers: Object.fromEntries(res.headers.entries()),
            data: responseData,
            timestamp: Date.now(),
          };
        } catch (error) {
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              throw new ApiError('Request timeout or cancelled', 'REQUEST_ABORTED');
            }
            throw error;
          }
          throw new ApiError('Unknown error occurred', 'NETWORK_ERROR');
        }
      }

      await addHistoryItem(request, response);
      return response;
    } catch (error) {
      console.error('Request failed:', error);
      const errorResponse: ApiResponse = {
        status: error instanceof Error ? 0 : (error as any).status || 0,
        statusText: error instanceof Error ? error.message : 'Request failed',
        headers: {},
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: Date.now(),
      };
      await addHistoryItem(request, errorResponse);
      throw error;
    } finally {
      activeRequests.delete(request.id);
      setActiveRequests(new Map(activeRequests));
    }
  };

  const toggleDarkMode = () => setIsDarkMode((prev: boolean) => !prev);
  const toggleMockApi = () => setIsMockEnabled((prev: boolean) => !prev);

  const value: ApiContextValue = {
    profiles,
    addProfile,
    updateProfile,
    deleteProfile,
    history,
    clearHistory,
    replayRequest,
    deleteHistoryItem,
    isDarkMode,
    toggleDarkMode,
    isMockEnabled,
    toggleMockApi,
    cancelRequest,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
}; 