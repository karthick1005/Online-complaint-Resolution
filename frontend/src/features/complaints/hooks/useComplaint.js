import { useQuery } from '@tanstack/react-query';
import { complaintAPI } from '@/api';
import { queryKeys } from '@/services/api/queryClient';

/**
 * Custom hook for fetching a single complaint by ID with full details
 * 
 * Features:
 * - Automatic caching (reuses data across components)
 * - Background refetching to keep data fresh
 * - Optimistic updates on mutations
 * 
 * @param {string} complaintId - The complaint ID
 * @param {Object} options - Additional React Query options
 * @returns {Object} { complaint, isLoading, isError, error, refetch }
 */
export const useComplaint = (complaintId, options = {}) => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.complaints.detail(complaintId),
    queryFn: async () => {
      const response = await complaintAPI.getComplaintById(complaintId);
      return response.data;
    },
    // Don't fetch if no ID provided
    enabled: !!complaintId,
    // Refetch every 30 seconds for real-time updates (until WebSocket is implemented)
    refetchInterval: 30 * 1000,
    // This data doesn't go stale quickly - it's specific detail view
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });

  return {
    complaint: data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  };
};

/**
 * Hook for fetching complaint attachments
 */
export const useComplaintAttachments = (complaintId) => {
  return useQuery({
    queryKey: ['complaints', 'attachments', complaintId],
    queryFn: async () => {
      const response = await complaintAPI.getAttachments(complaintId);
      return response.data;
    },
    enabled: !!complaintId,
    staleTime: 10 * 60 * 1000, // Attachments rarely change - 10 min
  });
};

/**
 * Hook for fetching complaint comments/history
 */
export const useComplaintComments = (complaintId) => {
  return useQuery({
    queryKey: ['complaints', 'comments', complaintId],
    queryFn: async () => {
      const response = await complaintAPI.getComments(complaintId);
      return response.data;
    },
    enabled: !!complaintId,
    staleTime: 1 * 60 * 1000, // Comments update frequently - 1 min
  });
};
