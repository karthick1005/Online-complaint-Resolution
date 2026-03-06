import { useQuery } from '@tanstack/react-query';
import { complaintAPI, departmentAPI, categoryAPI } from '@/api';
import { queryKeys } from '@/services/api/queryClient';

/**
 * Hook for fetching staff list (for complaint assignment)
 */
export const useStaff = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.complaints.staff,
    queryFn: async () => {
      const response = await complaintAPI.getStaff();
      return response.data.data || [];
    },
    // Staff list doesn't change frequently
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook for fetching departments
 */
export const useDepartments = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.departments.list,
    queryFn: async () => {
      const response = await departmentAPI.getDepartments();
      return response.data || [];
    },
    // Departments rarely change - cache aggressively
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook for fetching categories
 */
export const useCategories = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.complaints.categories,
    queryFn: async () => {
      const response = await categoryAPI.getCategories();
      return response.data.data || [];
    },
    // Categories rarely change
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
    ...options,
  });
};
