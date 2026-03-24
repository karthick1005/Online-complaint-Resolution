/**
 * User Query Hooks
 * 
 * React Query hooks for user data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { getResponseData, userAPI } from '@/api';
import { queryKeys } from '@/lib/queryClient';

/**
 * Fetch multiple users with filters
 */
export const useUsers = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.users(filters),
    queryFn: () => userAPI.getAllUsers(filters),
    select: (response) => getResponseData(response, []),
    ...options,
  });
};

/**
 * Fetch single user by ID
 */
export const useUser = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => userAPI.getUserById(id),
    select: (response) => getResponseData(response, null),
    enabled: !!id,
    ...options,
  });
};

/**
 * Fetch departments
 */
export const useDepartments = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.departments(),
    queryFn: () => userAPI.getDepartments(),
    select: (response) => getResponseData(response, []),
    staleTime: 15 * 60 * 1000, // Departments change rarely
    ...options,
  });
};
