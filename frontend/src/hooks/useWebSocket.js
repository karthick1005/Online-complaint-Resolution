/**
 * WebSocket Hook
 * 
 * Manages WebSocket connection and real-time updates
 */

import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/context/ToastContext';
import { queryKeys } from '@/lib/queryClient';

export const useWebSocket = () => {
  const socketRef = useRef(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const connect = useCallback(() => {
    if (!user || socketRef.current?.connected) return;

    const token = localStorage.getItem('token');
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

    socketRef.current = io(wsUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Complaint events
    socketRef.current.on('complaint:created', (complaint) => {
      console.log('🔔 New complaint created:', complaint.complaintCode);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.complaints() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats() });
      
      // Show notification
      addToast(`New complaint: ${complaint.complaintCode}`, 'info');
    });

    socketRef.current.on('complaint:assigned', (complaint) => {
      console.log('🔔 Complaint assigned:', complaint.complaintCode);
      
      queryClient.invalidateQueries({ queryKey: queryKeys.complaint(complaint.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.complaints() });
      
      if (complaint.assignedToId === user.id) {
        addToast(`You've been assigned complaint ${complaint.complaintCode}`, 'info');
      }
    });

    socketRef.current.on('complaint:status_updated', (complaint) => {
      console.log('🔔 Complaint status updated:', complaint.complaintCode, complaint.status);
      
      queryClient.invalidateQueries({ queryKey: queryKeys.complaint(complaint.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.complaints() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats() });
      
      if (complaint.userId === user.id || complaint.assignedToId === user.id) {
        addToast(`Complaint ${complaint.complaintCode} updated to ${complaint.status}`, 'info');
      }
    });

    socketRef.current.on('complaint:escalated', (complaint) => {
      console.log('🔔 Complaint escalated:', complaint.complaintCode);
      
      queryClient.invalidateQueries({ queryKey: queryKeys.complaint(complaint.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.complaints() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats() });
      
      addToast(`⚠️ Complaint ${complaint.complaintCode} escalated!`, 'warning');
    });
  }, [user, queryClient, addToast]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (user) {
      connect();
    }
    
    return () => disconnect();
  }, [user, connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    connect,
    disconnect,
  };
};
