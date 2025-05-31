import { ApiProfile } from '../types';

// Simple encryption key (in production, this should be properly managed)
const ENCRYPTION_KEY = 'your-secret-key';

// Helper functions for encryption
const encrypt = (text: string): string => {
  const textToChars = (text: string): number[] => text.split('').map(c => c.charCodeAt(0));
  const byteHex = (n: number): string => ("0" + Number(n).toString(16)).substr(-2);
  const applySaltToChar = (code: number[]): number => {
    return textToChars(ENCRYPTION_KEY).reduce((a, b) => a ^ b, code[0]);
  };

  return text
    .split('')
    .map(c => [c.charCodeAt(0)])
    .map(applySaltToChar)
    .map(byteHex)
    .join('');
};

const decrypt = (encoded: string): string => {
  const textToChars = (text: string): number[] => text.split('').map(c => c.charCodeAt(0));
  const applySaltToChar = (code: number): number => {
    return textToChars(ENCRYPTION_KEY).reduce((a, b) => a ^ b, code);
  };
  
  return encoded
    .match(/.{1,2}/g)!
    .map(hex => parseInt(hex, 16))
    .map(applySaltToChar)
    .map(charCode => String.fromCharCode(charCode))
    .join('');
};

// Helper to determine if a value needs encryption
const needsEncryption = (key: string, value: unknown): boolean => {
  if (key === 'profiles') {
    return false; // We'll handle profile encryption separately
  }
  return key.includes('auth') || key.includes('key') || key.includes('token');
};

// Helper to encrypt/decrypt profiles
const processProfiles = (profiles: ApiProfile[], shouldEncrypt: boolean): ApiProfile[] => {
  return profiles.map(profile => ({
    ...profile,
    authValue: profile.authValue 
      ? shouldEncrypt 
        ? window.btoa(profile.authValue)
        : window.atob(profile.authValue)
      : undefined,
    apiKey: profile.apiKey
      ? shouldEncrypt
        ? window.btoa(profile.apiKey)
        : window.atob(profile.apiKey)
      : undefined,
  }));
};

interface StorageService {
  getItem: <T>(key: string) => Promise<T | null>;
  setItem: <T>(key: string, value: T) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

export const storage: StorageService = {
  getItem: async <T>(key: string): Promise<T | null> => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      let value: T;
      
      if (key === 'profiles') {
        // Handle profiles specially
        const profiles = JSON.parse(item);
        value = processProfiles(profiles, false) as T;
      } else {
        // Handle other data
        const decrypted = needsEncryption(key, item) ? decrypt(item) : item;
        value = JSON.parse(decrypted);
      }

      return value;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },

  setItem: async <T>(key: string, value: T): Promise<void> => {
    try {
      let storageValue: string;
      
      if (key === 'profiles') {
        // Handle profiles specially
        const profiles = processProfiles(value as ApiProfile[], true);
        storageValue = JSON.stringify(profiles);
      } else {
        // Handle other data
        storageValue = JSON.stringify(value);
        if (needsEncryption(key, value)) {
          storageValue = encrypt(storageValue);
        }
      }

      localStorage.setItem(key, storageValue);
    } catch (error) {
      console.error('Error writing to storage:', error);
      throw error;
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
      throw error;
    }
  },

  clear: async (): Promise<void> => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },
}; 