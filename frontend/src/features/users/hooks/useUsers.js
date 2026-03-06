import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '@/api';
import { queryKeys, invalidateQueries } from '@/services/api/queryClient';
import { useToast } from '@/context/ToastContext';

/**
 * Hook for fetching users list with filters
 */
export const useUsers = (filters = {}, options = {}) => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: async () => {
      const response = await userAPI.getAllUsers(filters);
      return response.data.users || [];
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

  return {
    users: data || [],
    isLoading,
    isError,
    error,
    refetch,
  };
};

/**
 * Hook for fetching single user
 */
export const useUser = (userId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: async () => {
      const response = await userAPI.getUserById(userId);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook for creating user
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async (userData) => {
      const response = await userAPI.createUser(userData);
      return response.data;
    },
    onSuccess: () => {
      invalidateQueries.users();
      addToast('User created successfully', 'success');
    },
    onError: (error) => {
      addToast(error.response?.data?.error || 'Failed to create user', 'error');
    },
  });
};

/**
 * Hook for updating user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await userAPI.updateUser(id, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
      invalidateQueries.users();
      addToast('User updated successfully', 'success');
    },
    onError: (error) => {
      addToast(error.response?.data?.error || 'Failed to update user', 'error');
    },
  });
};

/**
 * Hook for deleting user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async (userId) => {
      const response = await userAPI.deleteUser(userId);
      return response.data;
    },
    onSuccess: () => {
      invalidateQueries.users();
      addToast('User deleted successfully', 'success');
    },
    onError: (error) => {
      addToast(error.response?.data?.error || 'Failed to delete user', 'error');
    },
  });
};
