/**
 * React Query Client Configuration
 * 
 * Centralized configuration for data fetching, caching, and state management
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh
      cacheTime: 10 * 60 * 1000, // 10 minutes - cache retained
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch on reconnect
      onError: (error) => {
        console.error('Query error:', error);
      },
    },
    mutations: {
      retry: 0, // Don't retry mutations
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

/**
 * Query key factory for consistent cache keys
 */
export const queryKeys = {
  // Auth
  currentUser: ['auth', 'me'],

  // Complaints
  complaints: (filters) => ['complaints', filters],
  complaint: (id) => ['complaint', id],
  complaintHistory: (id) => ['complaint', id, 'history'],
  complaintAttachments: (id) => ['complaint', id, 'attachments'],

  // Dashboard
  dashboardStats: () => ['dashboardStats'],

  // Users
  users: (filters) => ['users', filters],
  user: (id) => ['user', id],

  // Departments
  departments: () => ['departments'],
  department: (id) => ['department', id],

  // Categories
  categories: () => ['categories'],
  categoriesByDepartment: (deptId) => ['categories', 'department', deptId],

  // Analytics
  analytics: (type) => ['analytics', type],
};
