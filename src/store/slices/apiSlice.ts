import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ApiProfile, ApiRequest, ApiResponse } from '../../types';
import { storageService } from '../../services';

interface ApiState {
  profiles: ApiProfile[];
  currentProfile: ApiProfile | null;
  history: Array<{
    request: ApiRequest;
    response: ApiResponse;
    timestamp: number;
  }>;
  isLoading: boolean;
  error: string | null;
  settings: {
    darkMode: boolean;
    cacheEnabled: boolean;
    cacheTTL: number;
  };
}

// Load initial state from storage
const initialState: ApiState = {
  profiles: storageService.getProfiles(),
  currentProfile: null,
  history: storageService.getHistory(),
  isLoading: false,
  error: null,
  settings: storageService.getSettings(),
};

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    setProfiles: (state, action: PayloadAction<ApiProfile[]>) => {
      state.profiles = action.payload;
      storageService.saveProfile(action.payload[action.payload.length - 1]);
    },
    setCurrentProfile: (state, action: PayloadAction<ApiProfile | null>) => {
      state.currentProfile = action.payload;
    },
    addToHistory: (state, action: PayloadAction<{ request: ApiRequest; response: ApiResponse }>) => {
      const historyItem = {
        ...action.payload,
        timestamp: Date.now(),
      };
      state.history.unshift(historyItem);
      storageService.addHistoryItem(action.payload.request, action.payload.response);
    },
    clearHistory: (state) => {
      state.history = [];
      storageService.clearHistory();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateSettings: (state, action: PayloadAction<Partial<ApiState['settings']>>) => {
      state.settings = { ...state.settings, ...action.payload };
      storageService.updateSettings(action.payload);
    },
  },
});

export const {
  setProfiles,
  setCurrentProfile,
  addToHistory,
  clearHistory,
  setLoading,
  setError,
  updateSettings,
} = apiSlice.actions;

export default apiSlice.reducer; 