import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/api/client';
import type {
  ApplicationCreate,
  ApplicationUpdate,
  ApplicationResponse,
  ApplicationListResponse,
} from '../../types/api';

// Create application mutation
export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ApplicationCreate): Promise<ApplicationResponse> => {
      const response = await apiClient.post<ApplicationResponse>('/api/applications', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate applications list to refetch
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

// Get application query
export function useGetApplication(applicationId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['application', applicationId],
    queryFn: async (): Promise<ApplicationResponse> => {
      if (!applicationId) {
        throw new Error('Application ID is required');
      }
      const response = await apiClient.get<ApplicationResponse>(
        `/api/applications/${applicationId}`
      );
      return response.data;
    },
    enabled: enabled && !!applicationId,
  });
}

// Update application mutation
export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: ApplicationUpdate;
    }): Promise<ApplicationResponse> => {
      const response = await apiClient.put<ApplicationResponse>(
        `/api/applications/${applicationId}`,
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate specific application and list
      queryClient.invalidateQueries({ queryKey: ['application', variables.applicationId] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

// Submit application mutation
export function useSubmitApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string): Promise<ApplicationResponse> => {
      const response = await apiClient.post<ApplicationResponse>(
        `/api/applications/${applicationId}/submit`
      );
      return response.data;
    },
    onSuccess: (data, applicationId) => {
      // Invalidate specific application and list
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

// List applications query with filters and pagination
export function useListApplications(
  filters?: {
    studentId?: string | null;
    circularId?: string | null;
    status?: string | null;
  },
  page: number = 1,
  pageSize: number = 20,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['applications', filters, page, pageSize],
    queryFn: async (): Promise<ApplicationListResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (filters?.studentId) {
        params.append('student_id', filters.studentId);
      }
      if (filters?.circularId) {
        params.append('circular_id', filters.circularId);
      }
      if (filters?.status) {
        params.append('status', filters.status);
      }
      const response = await apiClient.get<ApplicationListResponse>(
        `/api/applications?${params.toString()}`
      );
      return response.data;
    },
    enabled,
  });
}

