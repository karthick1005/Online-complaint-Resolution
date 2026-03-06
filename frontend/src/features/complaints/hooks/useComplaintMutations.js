import { useMutation, useQueryClient } from '@tanstack/react-query';
import { complaintAPI } from '@/api';
import { queryKeys, invalidateQueries } from '@/services/api/queryClient';
import { useToast } from '@/context/ToastContext';

/**
 * Hook for creating a new complaint
 * 
 * Features:
 * - Optimistic updates
 * - Automatic cache invalidation
 * - Error handling with rollback
 * - Success/error notifications
 */
export const useCreateComplaint = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ data, files }) => {
      const response = await complaintAPI.createComplaint(data, files);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate complaints list to trigger refetch
      invalidateQueries.complaints();
      invalidateQueries.analytics();
      
      addToast('Complaint created successfully', 'success');
      return data;
    },
    onError: (error) => {
      addToast(error.response?.data?.error || 'Failed to create complaint', 'error');
    },
  });
};

/**
 * Hook for updating complaint status
 */
export const useUpdateComplaintStatus = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status, comment, files }) => {
      const response = await complaintAPI.updateStatus(id, status, comment, files);
      return response.data;
    },
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.complaints.detail(id) });

      // Snapshot previous value
      const previousComplaint = queryClient.getQueryData(queryKeys.complaints.detail(id));

      // Optimistically update
      queryClient.setQueryData(queryKeys.complaints.detail(id), (old) => ({
        ...old,
        status,
        updatedAt: new Date().toISOString(),
      }));

      return { previousComplaint };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousComplaint) {
        queryClient.setQueryData(
          queryKeys.complaints.detail(variables.id),
          context.previousComplaint
        );
      }
      addToast(error.response?.data?.error || 'Failed to update status', 'error');
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      invalidateQueries.complaint(variables.id);
      invalidateQueries.complaints();
      invalidateQueries.analytics();
      
      addToast('Status updated successfully', 'success');
    },
  });
};

/**
 * Hook for assigning complaint to staff
 */
export const useAssignComplaint = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, staffId }) => {
      const response = await complaintAPI.assignComplaint(id, staffId);
      return response.data;
    },
    onSuccess: (data, variables) => {
      invalidateQueries.complaint(variables.id);
      invalidateQueries.complaints();
      
      addToast('Complaint assigned successfully', 'success');
    },
    onError: (error) => {
      addToast(error.response?.data?.error || 'Failed to assign complaint', 'error');
    },
  });
};

/**
 * Hook for adding feedback to complaint
 */
export const useAddFeedback = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, rating, comment }) => {
      const response = await complaintAPI.addFeedback(id, rating, comment);
      return response.data;
    },
    onSuccess: (data, variables) => {
      invalidateQueries.complaint(variables.id);
      invalidateQueries.complaints();
      invalidateQueries.analytics();
      
      addToast('Feedback submitted successfully', 'success');
    },
    onError: (error) => {
      addToast(error.response?.data?.error || 'Failed to submit feedback', 'error');
    },
  });
};

/**
 * Hook for escalating complaint
 */
export const useEscalateComplaint = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, reason }) => {
      const response = await complaintAPI.escalateComplaint(id, reason);
      return response.data;
    },
    onSuccess: (data, variables) => {
      invalidateQueries.complaint(variables.id);
      invalidateQueries.complaints();
      invalidateQueries.analytics();
      
      addToast('Complaint escalated successfully', 'success');
    },
    onError: (error) => {
      addToast(error.response?.data?.error || 'Failed to escalate complaint', 'error');
    },
  });
};

/**
 * Hook for reopening closed complaint
 */
export const useReopenComplaint = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, reason }) => {
      const response = await complaintAPI.reopenComplaint(id, reason);
      return response.data;
    },
    onSuccess: (data, variables) => {
      invalidateQueries.complaint(variables.id);
      invalidateQueries.complaints();
      
      addToast('Complaint reopened successfully', 'success');
    },
    onError: (error) => {
      addToast(error.response?.data?.error || 'Failed to reopen complaint', 'error');
    },
  });
};
