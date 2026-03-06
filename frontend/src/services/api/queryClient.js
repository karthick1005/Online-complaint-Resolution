import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Client Configuration
 * 
 * Global settings for data fetching, caching, and refetching behavior
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes before considering it stale
      staleTime: 5 * 60 * 1000,
      
      // Keep unused data in cache for 10 minutes
      cacheTime: 10 * 60 * 1000,
      
      // Retry failed requests twice with exponential backoff
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Don't refetch on window focus by default (can be overridden per query)
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
      
      // Show errors in console during development
      onError: (error) => {
        console.error('Query Error:', error);
      },
    },
    mutations: {
      // Retry mutations once on network errors
      retry: 1,
      
      // Show errors in console
      onError: (error) => {
        console.error('Mutation Error:', error);
      },
    },
  },
});

/**
 * Query Keys Factory
 * Centralized query key management for consistent caching
 */
export const queryKeys = {
  // Auth
  auth: {
    me: ['auth', 'me'],
  },
  
  // Complaints
  complaints: {
    all: ['complaints'],
    lists: () => ['complaints', 'list'],
    list: (filters) => ['complaints', 'list', filters],
    details: () => ['complaints', 'detail'],
    detail: (id) => ['complaints', 'detail', id],
    staff: ['complaints', 'staff'],
    categories: ['complaints', 'categories'],
  },
  
  // Analytics
  analytics: {
    dashboard: ['analytics', 'dashboard'],
    stats: (filters) => ['analytics', 'stats', filters],
  },
  
  // Users
  users: {
    all: ['users'],
    lists: () => ['users', 'list'],
    list: (filters) => ['users', 'list', filters],
    details: () => ['users', 'detail'],
    detail: (id) => ['users', 'detail', id],
  },
  
  // Departments
  departments: {
    all: ['departments'],
    list: ['departments', 'list'],
    detail: (id) => ['departments', 'detail', id],
  },
};

/**
 * Cache invalidation helpers
 */
export const invalidateQueries = {
  complaints: () => queryClient.invalidateQueries({ queryKey: queryKeys.complaints.all }),
  complaint: (id) => queryClient.invalidateQueries({ queryKey: queryKeys.complaints.detail(id) }),
  users: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  analytics: () => queryClient.invalidateQueries({ queryKey: queryKeys.analytics.dashboard }),
};

/**
 * Prefetch helpers for optimistic loading
 */
export const prefetchQueries = {
  complaint: async (id, fetcher) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.complaints.detail(id),
      queryFn: () => fetcher(id),
    });
  },
};
