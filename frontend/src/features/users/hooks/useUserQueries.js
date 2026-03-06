/**
 * User Query Hooks
 * 
 * React Query hooks for user data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { userAPI, departmentAPI } from '@/api';
import { queryKeys } from '@/lib/queryClient';

/**
 * Fetch multiple users with filters
 */
export const useUsers = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.users(filters),
    queryFn: () => userAPI.getAllUsers(filters),
    select: (response) => response.data,
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
    select: (response) => response.data,
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
    select: (response) => response.data,
    staleTime: 15 * 60 * 1000, // Departments change rarely
    ...options,
  });
};
