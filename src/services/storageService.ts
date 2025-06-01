import { ApiProfile, ApiRequest, ApiResponse } from '../types';

interface StorageData {
  profiles: ApiProfile[];
  history: Array<{
    request: ApiRequest;
    response: ApiResponse;
    timestamp: number;
  }>;
  settings: {
    darkMode: boolean;
    cacheEnabled: boolean;
    cacheTTL: number;
  };
}

const STORAGE_KEY = 'api-tool-data';
const MAX_HISTORY_ITEMS = 100;

export class StorageService {
  private data: StorageData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): StorageData {
    const defaultData: StorageData = {
      profiles: [],
      history: [],
      settings: {
        darkMode: false,
        cacheEnabled: true,
        cacheTTL: 5 * 60 * 1000, // 5 minutes
      },
    };

    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      return storedData ? { ...defaultData, ...JSON.parse(storedData) } : defaultData;
    } catch {
      return defaultData;
    }
  }

  private saveData(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  }

  // Profile methods
  getProfiles(): ApiProfile[] {
    return this.data.profiles;
  }

  saveProfile(profile: ApiProfile): void {
    const existingIndex = this.data.profiles.findIndex(p => p.id === profile.id);
    if (existingIndex >= 0) {
      this.data.profiles[existingIndex] = profile;
    } else {
      this.data.profiles.push(profile);
    }
    this.saveData();
  }

  deleteProfile(profileId: string): void {
    this.data.profiles = this.data.profiles.filter(p => p.id !== profileId);
    this.saveData();
  }

  // History methods
  getHistory(): Array<{ request: ApiRequest; response: ApiResponse; timestamp: number }> {
    return this.data.history;
  }

  addHistoryItem(request: ApiRequest, response: ApiResponse): void {
    this.data.history.unshift({
      request,
      response,
      timestamp: Date.now(),
    });

    // Limit history size
    if (this.data.history.length > MAX_HISTORY_ITEMS) {
      this.data.history = this.data.history.slice(0, MAX_HISTORY_ITEMS);
    }

    this.saveData();
  }

  clearHistory(): void {
    this.data.history = [];
    this.saveData();
  }

  // Settings methods
  getSettings(): StorageData['settings'] {
    return this.data.settings;
  }

  updateSettings(settings: Partial<StorageData['settings']>): void {
    this.data.settings = { ...this.data.settings, ...settings };
    this.saveData();
  }

  // Export/Import
  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  importData(jsonData: string): void {
    try {
      const importedData = JSON.parse(jsonData);
      this.data = {
        ...this.loadData(), // Keep default values for missing fields
        ...importedData,
      };
      this.saveData();
    } catch (error) {
      throw new Error('Invalid import data format');
    }
  }
} 