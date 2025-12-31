import { useState, useCallback } from 'react';

/**
 * Custom hook for managing SOAP note sections
 */
export function useSOAPNote(initialData = {}) {
  const [subjective, setSubjective] = useState(initialData.subjective || '');
  const [objective, setObjective] = useState(initialData.objective || '');
  const [assessment, setAssessment] = useState(initialData.assessment || '');
  const [plan, setPlan] = useState(initialData.plan || '');

  const updateFromSession = useCallback((sessionData) => {
    const soapNote = sessionData.soapNote || {};
    if (soapNote.subjective !== undefined) setSubjective(soapNote.subjective);
    if (soapNote.objective !== undefined) setObjective(soapNote.objective);
    if (soapNote.assessment !== undefined) setAssessment(soapNote.assessment);
    if (soapNote.plan !== undefined) setPlan(soapNote.plan);
  }, []);

  const updateFromTranscription = useCallback((parsedData) => {
    if (parsedData.subjective) setSubjective(parsedData.subjective);
    if (parsedData.objective) setObjective(parsedData.objective);
    if (parsedData.assessment) setAssessment(parsedData.assessment);
    if (parsedData.plan) setPlan(parsedData.plan);
  }, []);

  const toSessionData = useCallback(() => {
    return {
      soapNote: {
        subjective,
        objective,
        assessment,
        plan,
      },
    };
  }, [subjective, objective, assessment, plan]);

  const reset = useCallback(() => {
    setSubjective('');
    setObjective('');
    setAssessment('');
    setPlan('');
  }, []);

  return {
    subjective,
    setSubjective,
    objective,
    setObjective,
    assessment,
    setAssessment,
    plan,
    setPlan,
    updateFromSession,
    updateFromTranscription,
    toSessionData,
    reset,
  };
}
