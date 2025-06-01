import { apiClient } from '../../services/apiClient';
import { ApiProfile, ApiError } from '../../types';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const mockProfile: ApiProfile = {
  id: 'test-profile',
  name: 'Test Profile',
  baseUrl: 'https://api.example.com',
  authType: 'bearer',
  authValue: 'test-token',
  apiKey: 'test-api-key',
  headers: {
    'Custom-Header': 'test-value'
  }
};

const server = setupServer(
  rest.get('https://api.example.com/test', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    const apiKeyHeader = req.headers.get('X-API-Key');
    const customHeader = req.headers.get('Custom-Header');

    if (!authHeader || !apiKeyHeader || !customHeader) {
      return res(ctx.status(401));
    }

    return res(
      ctx.json({ message: 'success' })
    );
  }),

  rest.post('https://api.example.com/test', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ id: 1, ...req.body })
    );
  }),

  rest.get('https://api.example.com/error', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({ message: 'Internal Server Error' })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ApiClient', () => {
  beforeEach(() => {
    apiClient.setProfile(mockProfile);
  });

  describe('request handling', () => {
    it('should make successful GET request with proper headers', async () => {
      const response = await apiClient.get('/test');
      expect(response).toEqual({ message: 'success' });
    });

    it('should make successful POST request with data', async () => {
      const data = { name: 'test' };
      const response = await apiClient.post('/test', data);
      expect(response).toEqual({ id: 1, name: 'test' });
    });

    it('should handle server errors properly', async () => {
      await expect(apiClient.get('/error')).rejects.toThrow(ApiError);
    });

    it('should handle network errors properly', async () => {
      server.use(
        rest.get('https://api.example.com/test', (req, res) => {
          return res.networkError('Failed to connect');
        })
      );

      await expect(apiClient.get('/test')).rejects.toThrow(ApiError);
    });
  });

  describe('retry mechanism', () => {
    it('should retry failed requests', async () => {
      let attempts = 0;
      server.use(
        rest.get('https://api.example.com/retry', (req, res, ctx) => {
          attempts++;
          if (attempts < 3) {
            return res(ctx.status(500));
          }
          return res(ctx.json({ success: true }));
        })
      );

      const response = await apiClient.get('/retry');
      expect(response).toEqual({ success: true });
      expect(attempts).toBe(3);
    });
  });

  describe('request cancellation', () => {
    it('should cancel ongoing requests', async () => {
      const promise = apiClient.get('/test');
      apiClient.cancelRequest('/test');
      await expect(promise).rejects.toThrow('Request cancelled by user');
    });
  });
}); 