import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '../../lib/api/client';
import type {
  RequirementCheckRequest,
  RequirementCheckResponse,
} from '../../types/api';

// Check requirements mutation
export function useCheckRequirements() {
  return useMutation({
    mutationFn: async (data: RequirementCheckRequest): Promise<RequirementCheckResponse> => {
      const response = await apiClient.post<RequirementCheckResponse>(
        '/api/requirements/check',
        data
      );
      return response.data;
    },
  });
}

// Get check result query
export function useGetCheckResult(checkId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['requirementCheck', checkId],
    queryFn: async (): Promise<RequirementCheckResponse> => {
      if (!checkId) {
        throw new Error('Check ID is required');
      }
      const response = await apiClient.get<RequirementCheckResponse>(
        `/api/requirements/check/${checkId}`
      );
      return response.data;
    },
    enabled: enabled && !!checkId,
  });
}

