import { useQuery } from '@tanstack/react-query';
import apiClient from '../../lib/api/client';
import type {
  ResultResponse,
  ResultsListResponse,
} from '../../types/api';

// Get single result query
export function useGetResult(resultId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['result', resultId],
    queryFn: async (): Promise<ResultResponse> => {
      if (!resultId) {
        throw new Error('Result ID is required');
      }
      const response = await apiClient.get<ResultResponse>(`/api/results/results/${resultId}`);
      return response.data;
    },
    enabled: enabled && !!resultId,
  });
}

// List results query with pagination
export function useListResults(
  page: number = 1,
  pageSize: number = 20,
  status?: string | null,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['results', page, pageSize, status],
    queryFn: async (): Promise<ResultsListResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (status) {
        params.append('status', status);
      }
      const response = await apiClient.get<ResultsListResponse>(
        `/api/results/results?${params.toString()}`
      );
      return response.data;
    },
    enabled,
  });
}

