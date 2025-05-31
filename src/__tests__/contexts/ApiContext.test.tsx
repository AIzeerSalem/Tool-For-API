import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiProvider, useApi } from '../../contexts/ApiContext';
import { ApiProfile, ApiRequest, ApiResponse } from '../../types';

// Mock storage service
jest.mock('../../services/storage', () => ({
  storage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

// Mock components for testing hooks
const TestComponent: React.FC = () => {
  const api = useApi();
  return (
    <div>
      <button onClick={() => api.toggleDarkMode()}>Toggle Theme</button>
      <button onClick={() => api.toggleMockApi()}>Toggle Mock</button>
      <div data-testid="dark-mode">{api.isDarkMode.toString()}</div>
      <div data-testid="mock-enabled">{api.isMockEnabled.toString()}</div>
    </div>
  );
};

describe('ApiContext', () => {
  const mockProfile: ApiProfile = {
    id: 'test-profile',
    name: 'Test Profile',
    baseUrl: 'https://api.example.com',
    authType: 'bearer',
    authValue: 'test-token',
    apiKey: 'test-api-key',
    headers: {}
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should provide context values', () => {
    render(
      <ApiProvider>
        <TestComponent />
      </ApiProvider>
    );

    expect(screen.getByTestId('dark-mode')).toHaveTextContent('false');
    expect(screen.getByTestId('mock-enabled')).toHaveTextContent('false');
  });

  it('should toggle dark mode', async () => {
    render(
      <ApiProvider>
        <TestComponent />
      </ApiProvider>
    );

    const button = screen.getByText('Toggle Theme');
    await act(async () => {
      userEvent.click(button);
    });

    expect(screen.getByTestId('dark-mode')).toHaveTextContent('true');
    expect(localStorage.getItem('darkMode')).toBe('true');
  });

  it('should toggle mock API', async () => {
    render(
      <ApiProvider>
        <TestComponent />
      </ApiProvider>
    );

    const button = screen.getByText('Toggle Mock');
    await act(async () => {
      userEvent.click(button);
    });

    expect(screen.getByTestId('mock-enabled')).toHaveTextContent('true');
    expect(localStorage.getItem('mockEnabled')).toBe('true');
  });

  describe('Profile Management', () => {
    const TestProfileComponent: React.FC = () => {
      const api = useApi();
      return (
        <div>
          <button onClick={() => api.addProfile(mockProfile)}>Add Profile</button>
          <button onClick={() => api.deleteProfile(mockProfile.id)}>Delete Profile</button>
        </div>
      );
    };

    it('should add and delete profiles', async () => {
      const { storage } = require('../../services/storage');
      render(
        <ApiProvider>
          <TestProfileComponent />
        </ApiProvider>
      );

      // Add profile
      await act(async () => {
        userEvent.click(screen.getByText('Add Profile'));
      });

      expect(storage.setItem).toHaveBeenCalledWith('profiles', [mockProfile]);

      // Delete profile
      await act(async () => {
        userEvent.click(screen.getByText('Delete Profile'));
      });

      expect(storage.setItem).toHaveBeenCalledWith('profiles', []);
    });
  });

  describe('Request History', () => {
    const mockRequest: ApiRequest = {
      id: 'test-request',
      method: 'GET',
      url: 'https://api.example.com/test',
      timestamp: Date.now()
    };

    const mockResponse: ApiResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: { success: true },
      timestamp: Date.now()
    };

    const TestHistoryComponent: React.FC = () => {
      const api = useApi();
      return (
        <div>
          <button onClick={() => api.clearHistory()}>Clear History</button>
          <button onClick={() => api.deleteHistoryItem(mockRequest.id)}>Delete Item</button>
        </div>
      );
    };

    it('should manage request history', async () => {
      const { storage } = require('../../services/storage');
      storage.getItem.mockResolvedValue([{ request: mockRequest, response: mockResponse }]);

      render(
        <ApiProvider>
          <TestHistoryComponent />
        </ApiProvider>
      );

      await waitFor(() => {
        expect(storage.getItem).toHaveBeenCalledWith('history');
      });

      // Clear history
      await act(async () => {
        userEvent.click(screen.getByText('Clear History'));
      });

      expect(storage.setItem).toHaveBeenCalledWith('history', []);
    });
  });
}); 