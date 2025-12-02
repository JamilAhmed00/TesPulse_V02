import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '../../lib/api/client';
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  JobStatusResponse,
} from '../../types/api';

// Create analysis job mutation
export function useCreateAnalysisJob() {
  return useMutation({
    mutationFn: async (data: AnalyzeRequest): Promise<AnalyzeResponse> => {
      const response = await apiClient.post<AnalyzeResponse>('/api/analyze/analyze', data);
      return response.data;
    },
  });
}

// Get job status query with polling for pending jobs
export function useGetJobStatus(jobId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['jobStatus', jobId],
    queryFn: async (): Promise<JobStatusResponse> => {
      if (!jobId) {
        throw new Error('Job ID is required');
      }
      const response = await apiClient.get<JobStatusResponse>(`/api/analyze/analyze/${jobId}`);
      return response.data;
    },
    enabled: enabled && !!jobId,
    refetchInterval: (query) => {
      // Poll every 2 seconds if job is pending or processing
      const data = query.state.data;
      if (data && (data.status === 'pending' || data.status === 'processing')) {
        return 2000;
      }
      // Stop polling if completed or failed
      return false;
    },
  });
}

