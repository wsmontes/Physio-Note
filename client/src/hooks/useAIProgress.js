import { useState, useCallback } from 'react';

/**
 * Hook for managing AI Agent progress modal
 * Returns state and controls for showing/hiding the progress modal
 */
export const useAIProgress = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const startProgress = useCallback((newSessionId) => {
    setSessionId(newSessionId);
    setIsOpen(true);
  }, []);

  const closeProgress = useCallback(() => {
    setIsOpen(false);
    setSessionId(null);
  }, []);

  return {
    isOpen,
    sessionId,
    startProgress,
    closeProgress
  };
};
