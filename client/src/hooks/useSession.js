import { useState, useCallback } from 'react';
import sessionService from '../services/session.service';
import { useToast } from '../context/ToastContext';

/**
 * Custom hook for managing session data
 */
export function useSession(sessionId) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchSession = useCallback(async () => {
    if (!sessionId || sessionId === 'new') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await sessionService.getSession(sessionId);
      setSession(data);
    } catch (error) {
      console.error('Error fetching session:', error);
      toast.error(error.userMessage || 'Failed to load session data');
    } finally {
      setLoading(false);
    }
  }, [sessionId, toast]);

  const updateSession = useCallback(async (sessionData) => {
    try {
      setSaving(true);
      const updated = await sessionService.updateSession(sessionId, sessionData);
      setSession(updated);
      toast.success('Session saved successfully');
      return updated;
    } catch (error) {
      console.error('Error updating session:', error);
      toast.error(error.userMessage || 'Failed to save session');
      throw error;
    } finally {
      setSaving(false);
    }
  }, [sessionId, toast]);

  const createSession = useCallback(async (sessionData) => {
    try {
      setSaving(true);
      const created = await sessionService.createSession(sessionData);
      setSession(created);
      toast.success('Session created successfully');
      return created;
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error(error.userMessage || 'Failed to create session');
      throw error;
    } finally {
      setSaving(false);
    }
  }, [toast]);

  return {
    session,
    loading,
    saving,
    fetchSession,
    updateSession,
    createSession,
    setSession,
  };
}
