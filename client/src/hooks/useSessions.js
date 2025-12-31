import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import sessionService from '../services/session.service';
import { useToast } from '../context/ToastContext';

/**
 * React Query hook for fetching all sessions
 */
export function useSessions() {
  const toast = useToast();

  return useQuery({
    queryKey: ['sessions'],
    queryFn: sessionService.getSessions,
    onError: (error) => {
      toast.error(error.userMessage || 'Failed to load sessions');
    },
  });
}

/**
 * React Query hook for fetching a single session
 */
export function useSession(sessionId) {
  const toast = useToast();

  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionService.getSession(sessionId),
    enabled: !!sessionId,
    onError: (error) => {
      toast.error(error.userMessage || 'Failed to load session');
    },
  });
}

/**
 * React Query mutation for creating a session
 */
export function useCreateSession() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: sessionService.createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session created successfully');
    },
    onError: (error) => {
      toast.error(error.userMessage || 'Failed to create session');
    },
  });
}

/**
 * React Query mutation for updating a session
 */
export function useUpdateSession() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ sessionId, data }) => sessionService.updateSession(sessionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session', variables.sessionId] });
      toast.success('Session updated successfully');
    },
    onError: (error) => {
      toast.error(error.userMessage || 'Failed to update session');
    },
  });
}

/**
 * React Query mutation for deleting a session
 */
export function useDeleteSession() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: sessionService.deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session deleted successfully');
    },
    onError: (error) => {
      toast.error(error.userMessage || 'Failed to delete session');
    },
  });
}
