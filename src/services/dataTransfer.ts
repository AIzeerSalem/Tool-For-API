import { ApiProfile, RequestHistory } from '../types';
import { storage } from './storage';

interface ExportData {
  profiles: ApiProfile[];
  history: RequestHistory[];
  settings: {
    darkMode: boolean;
    mockEnabled: boolean;
  };
}

export const dataTransfer = {
  exportData: async (): Promise<ExportData> => {
    try {
      const [profiles, history, darkMode, mockEnabled] = await Promise.all([
        storage.getItem<ApiProfile[]>('profiles'),
        storage.getItem<RequestHistory[]>('history'),
        storage.getItem<boolean>('darkMode'),
        storage.getItem<boolean>('mockEnabled'),
      ]);

      const data: ExportData = {
        profiles: profiles || [],
        history: history || [],
        settings: {
          darkMode: darkMode || false,
          mockEnabled: mockEnabled || false,
        },
      };

      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data');
    }
  },

  importData: async (data: Partial<ExportData>): Promise<void> => {
    try {
      const operations: Promise<void>[] = [];

      if (data.profiles) {
        operations.push(storage.setItem('profiles', data.profiles));
      }
      if (data.history) {
        operations.push(storage.setItem('history', data.history));
      }
      if (data.settings) {
        if (typeof data.settings.darkMode === 'boolean') {
          operations.push(storage.setItem('darkMode', data.settings.darkMode));
        }
        if (typeof data.settings.mockEnabled === 'boolean') {
          operations.push(storage.setItem('mockEnabled', data.settings.mockEnabled));
        }
      }

      await Promise.all(operations);
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data');
    }
  },

  downloadExport: async (): Promise<void> => {
    try {
      const data = await dataTransfer.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `api-tool-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading export:', error);
      throw new Error('Failed to download export');
    }
  },

  uploadImport: async (file: File): Promise<void> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;
      await dataTransfer.importData(data);
    } catch (error) {
      console.error('Error uploading import:', error);
      throw new Error('Failed to upload import');
    }
  },
}; 