import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { apiClient } from '../services/apiClient';
import {
  setProfiles,
  setCurrentProfile,
  addToHistory,
} from '../store/slices/apiSlice';
import type { RootState } from '../store';
import { ApiProfile, ApiRequest, ApiResponse, ApiError, HttpMethod } from '../types/api';

export const useApi = () => {
  const dispatch = useDispatch();
  const {
    profiles,
    currentProfile,
    history,
  } = useSelector((state: RootState) => state.api);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const makeRequest = useCallback(
    async (
      method: HttpMethod,
      endpoint: string,
      data?: unknown,
      params?: Record<string, unknown>
    ): Promise<ApiResponse> => {
      setLoading(true);
      setError(null);

      try {
        const request: ApiRequest = {
          id: Date.now().toString(),
          method,
          url: endpoint,
          data,
          params,
          timestamp: Date.now(),
        };

        const response = await apiClient.request(request);
        dispatch(addToHistory({ request, response }));
        return response;
      } catch (err) {
        let apiError: ApiError;
        
        if (err instanceof ApiError) {
          apiError = err;
        } else if (err instanceof Error) {
          apiError = new ApiError(err.message, 'NETWORK_ERROR');
        } else {
          apiError = new ApiError('Unknown error occurred', 'NETWORK_ERROR');
        }

        setError(apiError);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  const setApiProfiles = useCallback((profiles: ApiProfile[]) => {
    dispatch(setProfiles(profiles));
  }, [dispatch]);

  const selectProfile = useCallback((profile: ApiProfile | null) => {
    dispatch(setCurrentProfile(profile));
    if (profile) {
      apiClient.setProfile(profile);
    }
  }, [dispatch]);

  const get = useCallback(
    (endpoint: string, params?: Record<string, unknown>) => 
      makeRequest('GET', endpoint, undefined, params),
    [makeRequest]
  );

  const post = useCallback(
    (endpoint: string, data?: unknown) => 
      makeRequest('POST', endpoint, data),
    [makeRequest]
  );

  const put = useCallback(
    (endpoint: string, data?: unknown) => 
      makeRequest('PUT', endpoint, data),
    [makeRequest]
  );

  const del = useCallback(
    (endpoint: string) => 
      makeRequest('DELETE', endpoint),
    [makeRequest]
  );

  return {
    // State
    profiles,
    currentProfile,
    history,
    loading,
    error,

    // Actions
    setProfiles: setApiProfiles,
    selectProfile,

    // Request methods
    request: makeRequest,
    get,
    post,
    put,
    delete: del,
  };
}; 