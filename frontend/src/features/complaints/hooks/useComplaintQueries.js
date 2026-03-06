/**
 * Complaint Query Hooks
 * 
 * React Query hooks for complaint data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { complaintAPI } from '@/api';
import { queryKeys } from '@/lib/queryClient';

/**
 * Fetch multiple complaints with filters
 */
export const useComplaints = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.complaints(filters),
    queryFn: () => complaintAPI.getComplaints(filters),
    select: (response) => response.data,
    ...options,
  });
};

/**
 * Fetch single complaint by ID
 */
export const useComplaint = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.complaint(id),
    queryFn: () => complaintAPI.getComplaintById(id),
    select: (response) => response.data,
    enabled: !!id, // Only fetch if ID exists
    ...options,
  });
};

/**
 * Fetch complaint history
 */
export const useComplaintHistory = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.complaintHistory(id),
    queryFn: async () => {
      const response = await complaintAPI.getComplaintById(id);
      return response.data.history;
    },
    enabled: !!id,
    ...options,
  });
};

/**
 * Fetch complaint attachments
 */
export const useComplaintAttachments = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.complaintAttachments(id),
    queryFn: () => complaintAPI.getAttachments(id),
    select: (response) => response.data,
    enabled: !!id,
    ...options,
  });
};

/**
 * Fetch available staff for assignment
 */
export const useStaff = (options = {}) => {
  return useQuery({
    queryKey: ['staff'],
    queryFn: () => complaintAPI.getStaff(),
    select: (response) => response.data,
    staleTime: 10 * 60 * 1000, // Staff list changes less frequently
    ...options,
  });
};
