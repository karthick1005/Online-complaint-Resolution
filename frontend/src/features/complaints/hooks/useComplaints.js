import { useQuery } from '@tanstack/react-query';
import { complaintAPI } from '@/api';
import { queryKeys } from '@/services/api/queryClient';

/**
 * Custom hook for fetching complaints list with filters and pagination
 * 
 * Features:
 * - Automatic caching and background refetching
 * - Loading and error states
 * - Optimized refetching on filter changes
 * 
 * @param {Object} filters - Filter options (status, priority, departmentId, etc.)
 * @param {Object} options - Additional React Query options
 * @returns {Object} { complaints, isLoading, isError, error, refetch }
 */
export const useComplaints = (filters = {}, options = {}) => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.complaints.list(filters),
    queryFn: async () => {
      const response = await complaintAPI.getComplaints(filters);
      return response.data.data || [];
    },
    // Keep previous data while fetching new filtered results
    keepPreviousData: true,
    // Refetch when filters change (handled automatically by query key)
    enabled: true,
    // Override default staleTime if needed
    staleTime: filters.status ? 2 * 60 * 1000 : 5 * 60 * 1000, // 2 min for filtered, 5 min for all
    ...options,
  });

  return {
    complaints: data || [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  };
};

/**
 * Hook for infinite scroll complaints (future enhancement)
 */
export const useInfiniteComplaints = (filters = {}) => {
  // TODO: Implement infinite query for large datasets
  // Will use useInfiniteQuery from React Query
};
