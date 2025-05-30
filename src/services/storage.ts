import localforage from 'localforage';
import { ApiProfile, RequestHistory } from '../types';

// Initialize localforage
localforage.config({
  name: 'api-tool',
  storeName: 'api_tool_store',
});

export const storage = {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      return await localforage.getItem<T>(key);
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  },

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await localforage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await localforage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
    }
  },

  async clear(): Promise<void> {
    try {
      await localforage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  async exportData(): Promise<Record<string, any>> {
    const data: Record<string, any> = {};
    try {
      await localforage.iterate((value, key) => {
        data[key] = value;
      });
    } catch (error) {
      console.error('Error exporting data:', error);
    }
    return data;
  },

  async importData(data: Record<string, any>): Promise<void> {
    try {
      await this.clear();
      for (const [key, value] of Object.entries(data)) {
        await this.setItem(key, value);
      }
    } catch (error) {
      console.error('Error importing data:', error);
    }
  },
};

class StorageService {
  private store = localforage;

  async getItem<T>(key: string): Promise<T | null> {
    return this.store.getItem<T>(key);
  }

  async setItem<T>(key: string, value: T): Promise<T> {
    return this.store.setItem<T>(key, value);
  }

  async removeItem(key: string): Promise<void> {
    return this.store.removeItem(key);
  }

  async clear(): Promise<void> {
    return this.store.clear();
  }

  async exportData(): Promise<{
    profiles: ApiProfile[];
    history: RequestHistory[];
    settings: {
      darkMode: boolean;
      mockEnabled: boolean;
    };
  }> {
    const [profiles, history, darkMode, mockEnabled] = await Promise.all([
      this.getItem<ApiProfile[]>('profiles'),
      this.getItem<RequestHistory[]>('history'),
      this.getItem<boolean>('darkMode'),
      this.getItem<boolean>('mockEnabled'),
    ]);

    return {
      profiles: profiles || [],
      history: history || [],
      settings: {
        darkMode: darkMode || false,
        mockEnabled: mockEnabled || false,
      },
    };
  }

  async importData(data: {
    profiles?: ApiProfile[];
    history?: RequestHistory[];
    settings?: {
      darkMode?: boolean;
      mockEnabled?: boolean;
    };
  }): Promise<void> {
    const operations = [];

    if (data.profiles) {
      operations.push(this.setItem('profiles', data.profiles));
    }
    if (data.history) {
      operations.push(this.setItem('history', data.history));
    }
    if (data.settings) {
      if (typeof data.settings.darkMode === 'boolean') {
        operations.push(this.setItem('darkMode', data.settings.darkMode));
      }
      if (typeof data.settings.mockEnabled === 'boolean') {
        operations.push(this.setItem('mockEnabled', data.settings.mockEnabled));
      }
    }

    await Promise.all(operations);
  }
}

export const storageService = new StorageService(); 