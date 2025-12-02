import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { UserResponse } from '../types/api';

// Storage keys
const AUTH_TOKEN_KEY = 'testpulse_auth_token';
const REFRESH_TOKEN_KEY = 'testpulse_refresh_token';
const USER_KEY = 'testpulse_user';

// Atoms with localStorage persistence
export const authTokenAtom = atomWithStorage<string | null>(AUTH_TOKEN_KEY, null);
export const refreshTokenAtom = atomWithStorage<string | null>(REFRESH_TOKEN_KEY, null);
export const userAtom = atomWithStorage<UserResponse | null>(USER_KEY, null);

// Derived atom for authentication status
export const isAuthenticatedAtom = atom(
  (get) => {
    const token = get(authTokenAtom);
    const user = get(userAtom);
    return !!token && !!user;
  }
);

// Helper function to get auth headers
export function getAuthHeaders(get: <T>(atom: typeof authTokenAtom) => T): Record<string, string> {
  const token = get(authTokenAtom);
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

