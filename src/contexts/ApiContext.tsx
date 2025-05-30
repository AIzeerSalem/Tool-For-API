import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { mockApi } from '../services/mockApi';
import { ApiProfile, ApiRequest, ApiResponse, ApiContextValue } from '../types';

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
      const [savedProfiles, savedHistory] = await Promise.all([
        storage.getItem('profiles'),
        storage.getItem('history'),
      ]);
      if (savedProfiles) setProfiles(savedProfiles);
      if (savedHistory) setHistory(savedHistory);
    };
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('mockEnabled', JSON.stringify(isMockEnabled));
  }, [isMockEnabled]);

  const addProfile = async (profile: ApiProfile) => {
    const updatedProfiles = [...profiles, profile];
    await storage.setItem('profiles', updatedProfiles);
    setProfiles(updatedProfiles);
  };

  const updateProfile = async (profile: ApiProfile) => {
    const updatedProfiles = profiles.map(p => 
      p.id === profile.id ? profile : p
    );
    await storage.setItem('profiles', updatedProfiles);
    setProfiles(updatedProfiles);
  };

  const deleteProfile = async (id: string) => {
    const updatedProfiles = profiles.filter(p => p.id !== id);
    await storage.setItem('profiles', updatedProfiles);
    setProfiles(updatedProfiles);
  };

  const addHistoryItem = async (request: ApiRequest, response: ApiResponse) => {
    const updatedHistory = [...history, { request, response }];
    await storage.setItem('history', updatedHistory);
    setHistory(updatedHistory);
  };

  const clearHistory = async () => {
    await storage.setItem('history', []);
    setHistory([]);
  };

  const deleteHistoryItem = async (requestId: string) => {
    const updatedHistory = history.filter(item => item.request.id !== requestId);
    await storage.setItem('history', updatedHistory);
    setHistory(updatedHistory);
  };

  const replayRequest = async (request: ApiRequest) => {
    const profile = profiles.find(p => p.id === request.profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    const response = isMockEnabled
      ? await mockApi.request(request)
      : await fetch(request.url, {
          method: request.method,
          headers: {
            ...request.headers,
            'Content-Type': 'application/json',
          },
          body: request.body ? JSON.stringify(request.body) : undefined,
        }).then(async res => ({
          status: res.status,
          statusText: res.statusText,
          headers: Object.fromEntries(res.headers.entries()),
          data: await res.json(),
          timestamp: Date.now(),
        }));

    await addHistoryItem(request, response);
    return response;
  };

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const toggleMockApi = () => setIsMockEnabled(prev => !prev);

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
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
}; 