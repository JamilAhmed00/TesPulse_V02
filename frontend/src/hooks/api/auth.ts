import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../lib/api/client';
import {
  authTokenAtom,
  refreshTokenAtom,
  userAtom,
} from '../../store/auth';
import { useGetStudentByUser } from './students';
import type {
  UserSignup,
  UserLogin,
  TokenResponse,
  UserResponse,
  RefreshTokenRequest,
  PasswordChange,
} from '../../types/api';

// Signup mutation
export function useSignup() {
  const navigate = useNavigate();
  const setAuthToken = useSetAtom(authTokenAtom);
  const setRefreshToken = useSetAtom(refreshTokenAtom);
  const setUser = useSetAtom(userAtom);

  return useMutation({
    mutationFn: async (data: UserSignup): Promise<{ user: UserResponse; tokens: TokenResponse }> => {
      // Sign up
      const userResponse = await apiClient.post<UserResponse>('/api/auth/signup', data);
      
      // Automatically sign in after signup
      const tokenResponse = await apiClient.post<TokenResponse>('/api/auth/signin', {
        email: data.email,
        password: data.password,
      });
      
      // Set tokens temporarily for the next request
      setAuthToken(tokenResponse.data.access_token);
      setRefreshToken(tokenResponse.data.refresh_token);
      
      return {
        user: userResponse.data,
        tokens: tokenResponse.data,
      };
    },
    onSuccess: (data) => {
      // Store tokens and user
      setAuthToken(data.tokens.access_token);
      setRefreshToken(data.tokens.refresh_token);
      setUser(data.user);
      // Redirect to registration form (new users need to complete registration)
      navigate('/register');
    },
  });
}

// Signin mutation
export function useSignin() {
  const navigate = useNavigate();
  const setAuthToken = useSetAtom(authTokenAtom);
  const setRefreshToken = useSetAtom(refreshTokenAtom);
  const setUser = useSetAtom(userAtom);

  return useMutation({
    mutationFn: async (data: UserLogin): Promise<{ tokens: TokenResponse; user: UserResponse }> => {
      // Sign in
      const tokenResponse = await apiClient.post<TokenResponse>('/api/auth/signin', data);
      
      // Set tokens temporarily for the next request
      setAuthToken(tokenResponse.data.access_token);
      setRefreshToken(tokenResponse.data.refresh_token);
      
      // Fetch user info
      const userResponse = await apiClient.get<UserResponse>('/api/auth/me');
      
      return {
        tokens: tokenResponse.data,
        user: userResponse.data,
      };
    },
    onSuccess: async (data) => {
      // Store tokens and user
      setAuthToken(data.tokens.access_token);
      setRefreshToken(data.tokens.refresh_token);
      setUser(data.user);
      
      // Check if student profile exists
      try {
        const studentResponse = await apiClient.get('/api/students/me');
        // Student profile exists, go to dashboard
        navigate('/dashboard');
      } catch (error: unknown) {
        const err = error as { response?: { status?: number } };
        // If 404, no student profile exists, redirect to registration
        if (err?.response?.status === 404) {
          navigate('/register');
        } else {
          // Other error, still go to dashboard (let user handle it)
          navigate('/dashboard');
        }
      }
    },
    onError: () => {
      // Clear tokens on error
      setAuthToken(null);
      setRefreshToken(null);
      setUser(null);
    },
  });
}

// Refresh token mutation
export function useRefreshToken() {
  const setAuthToken = useSetAtom(authTokenAtom);
  const setRefreshToken = useSetAtom(refreshTokenAtom);

  return useMutation({
    mutationFn: async (data: RefreshTokenRequest): Promise<TokenResponse> => {
      const response = await apiClient.post<TokenResponse>('/api/auth/refresh', data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuthToken(data.access_token);
      if (data.refresh_token) {
        setRefreshToken(data.refresh_token);
      }
    },
  });
}

// Logout mutation
export function useLogout() {
  const navigate = useNavigate();
  const clearAuthFn = useSetAtom(authTokenAtom);
  const setRefreshToken = useSetAtom(refreshTokenAtom);
  const setUser = useSetAtom(userAtom);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (refreshToken: string): Promise<void> => {
      await apiClient.post('/api/auth/logout', { refresh_token: refreshToken });
    },
    onSuccess: () => {
      // Clear all auth state
      clearAuthFn(null);
      setRefreshToken(null);
      setUser(null);
      
      // Clear all query cache
      queryClient.clear();
      
      // Redirect to login
      navigate('/login');
    },
    onError: () => {
      // Even if logout fails, clear local state
      clearAuthFn(null);
      setRefreshToken(null);
      setUser(null);
      queryClient.clear();
      navigate('/login');
    },
  });
}

// Get current user query
export function useGetCurrentUser() {
  const setUser = useSetAtom(userAtom);

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async (): Promise<UserResponse> => {
      const response = await apiClient.get<UserResponse>('/api/auth/me');
      return response.data;
    },
    onSuccess: (data) => {
      setUser(data);
    },
    retry: false,
    enabled: false, // Don't auto-fetch, use refetch() when needed
  });
}

// Change password mutation
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: PasswordChange): Promise<{ message: string }> => {
      const response = await apiClient.put<{ message: string }>('/api/auth/me/password', data);
      return response.data;
    },
  });
}

