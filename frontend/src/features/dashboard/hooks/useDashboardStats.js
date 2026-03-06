import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '@/api';
import { queryKeys } from '@/services/api/queryClient';

/**
 * Hook for fetching dashboard statistics
 * 
 * Features:
 * - Aggressive caching (stats don't change frequently)
 * - Background refetching
 * - Role-based filtering
 * 
 * @param {Object} options - Additional React Query options
 * @returns {Object} { stats, isLoading, isError, error, refetch }
 */
export const useDashboardStats = (options = {}) => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.analytics.dashboard,
    queryFn: async () => {
      const response = await analyticsAPI.getDashboardStats();
      return response.data;
    },
    // Stats are relatively static - cache for 3 minutes
    staleTime: 3 * 60 * 1000,
    // Keep in cache for 10 minutes
    cacheTime: 10 * 60 * 1000,
    // Refetch every 5 minutes in background
    refetchInterval: 5 * 60 * 1000,
    ...options,
  });

  return {
    stats: data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  };
};

/**
 * Hook for custom analytics queries with filters
 */
export const useAnalytics = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.analytics.stats(filters),
    queryFn: async () => {
      const response = await analyticsAPI.getDashboardStats(filters);
      return response.data;
    },
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};
