import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from './client';
import { useAuthStore } from '@/auth/useAuthStore';

const OWNER = { id: 'owner-1', name: 'Test Owner', email: 'owner@example.com' };

describe('apiClient 401 refresh-and-retry interceptor', () => {
  let apiMock: MockAdapter;
  let globalMock: MockAdapter;

  beforeEach(() => {
    apiMock = new MockAdapter(apiClient);
    globalMock = new MockAdapter(axios);

    useAuthStore.setState({
      token: 'expired-token',
      refreshToken: 'valid-refresh-token',
      owner: OWNER,
      isAuthenticated: true,
      hasHydrated: true,
    });

    // jsdom logs a noisy "not implemented: navigation" error on a real
    // location.href write — stub it so the redirect-on-failure test doesn't
    // require an actual navigation.
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    apiMock.restore();
    globalMock.restore();
  });

  it('retries the original request once after a successful refresh', async () => {
    apiMock.onGet('/pgs').replyOnce(401);
    apiMock
      .onGet('/pgs')
      .replyOnce(200, [{ id: '1', name: 'Green Villa', address: 'x', city: 'y' }]);
    globalMock.onPost(/\/auth\/refresh$/).replyOnce(200, {
      token: 'new-token',
      refreshToken: 'new-refresh-token',
      owner: OWNER,
      expiresIn: 43200,
    });

    const response = await apiClient.get('/pgs');

    expect(response.data).toEqual([{ id: '1', name: 'Green Villa', address: 'x', city: 'y' }]);
    expect(useAuthStore.getState().token).toBe('new-token');
    expect(useAuthStore.getState().refreshToken).toBe('new-refresh-token');

    // The retried request must carry the *new* token, not the expired one.
    const retriedRequest = apiMock.history.get[1];
    expect(retriedRequest?.headers?.Authorization).toBe('Bearer new-token');
  });

  it('clears the session and redirects to /login when refresh also fails', async () => {
    apiMock.onGet('/pgs').reply(401);
    globalMock.onPost(/\/auth\/refresh$/).reply(401);

    await expect(apiClient.get('/pgs')).rejects.toBeTruthy();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('shares a single in-flight refresh across concurrent 401s (no rotated-token race)', async () => {
    // replyOnce handlers are matched in registration order ahead of any
    // persistent handler, so the initial-401/retried-200 pair must be
    // registered in that order for each endpoint.
    apiMock.onGet('/pgs').replyOnce(401);
    apiMock.onGet('/pgs').replyOnce(200, []);
    apiMock.onGet('/guests').replyOnce(401);
    apiMock.onGet('/guests').replyOnce(200, []);

    let refreshCallCount = 0;
    globalMock.onPost(/\/auth\/refresh$/).reply(() => {
      refreshCallCount += 1;
      return [
        200,
        { token: 'new-token', refreshToken: 'rotated-refresh', owner: OWNER, expiresIn: 43200 },
      ];
    });

    await Promise.all([apiClient.get('/pgs'), apiClient.get('/guests')]);

    expect(refreshCallCount).toBe(1);
  });
});
