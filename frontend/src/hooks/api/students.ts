import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/api/client';
import type {
  StudentCreate,
  StudentUpdate,
  StudentResponse,
  StudentListResponse,
  EducationBoardResultRequest,
  EducationBoardResultResponse,
} from '../../types/api';

// Create student mutation
export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StudentCreate): Promise<StudentResponse> => {
      const response = await apiClient.post<StudentResponse>('/api/students', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate students list to refetch
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

// Get student query
export function useGetStudent(studentId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['student', studentId],
    queryFn: async (): Promise<StudentResponse> => {
      if (!studentId) {
        throw new Error('Student ID is required');
      }
      const response = await apiClient.get<StudentResponse>(`/api/students/${studentId}`);
      return response.data;
    },
    enabled: enabled && !!studentId,
  });
}

// Get student profile for current authenticated user
export function useGetStudentByUser(enabled: boolean = true) {
  return useQuery({
    queryKey: ['student', 'me'],
    queryFn: async (): Promise<StudentResponse | null> => {
      try {
        const response = await apiClient.get<StudentResponse>('/api/students/me');
        return response.data;
      } catch (error: unknown) {
        const err = error as { response?: { status?: number } };
        // Return null if 404 (no student profile), throw other errors
        if (err?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled,
    retry: false, // Don't retry on 404
  });
}

// Update student mutation
export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      data,
    }: {
      studentId: string;
      data: StudentUpdate;
    }): Promise<StudentResponse> => {
      const response = await apiClient.put<StudentResponse>(
        `/api/students/${studentId}`,
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate specific student and list
      queryClient.invalidateQueries({ queryKey: ['student', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

// List students query with pagination
export function useListStudents(
  page: number = 1,
  pageSize: number = 20,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['students', page, pageSize],
    queryFn: async (): Promise<StudentListResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      const response = await apiClient.get<StudentListResponse>(
        `/api/students?${params.toString()}`
      );
      return response.data;
    },
    enabled,
  });
}

// Fetch Education Board result mutation
export function useFetchEducationBoardResult() {
  return useMutation({
    mutationFn: async (
      data: EducationBoardResultRequest
    ): Promise<EducationBoardResultResponse> => {
      const response = await apiClient.post<EducationBoardResultResponse>(
        '/api/students/fetch-education-board-result',
        data
      );
      return response.data;
    },
  });
}

