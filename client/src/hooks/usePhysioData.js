import { useState, useCallback } from 'react';

/**
 * Custom hook for managing physiotherapy-specific data
 */
export function usePhysioData(initialData = {}) {
  const [painScale, setPainScale] = useState(
    initialData.painScale || { current: '', best: '', worst: '', location: '' }
  );
  const [rangeOfMotion, setRangeOfMotion] = useState(initialData.rangeOfMotion || []);
  const [strengthTest, setStrengthTest] = useState(initialData.strengthTest || []);
  const [exercises, setExercises] = useState(initialData.exercises || []);
  const [modalitiesUsed, setModalitiesUsed] = useState(initialData.modalitiesUsed || '');
  const [billingCodes, setBillingCodes] = useState(initialData.billingCodes || '');

  const updateFromSession = useCallback((sessionData) => {
    if (sessionData.painScale) setPainScale(sessionData.painScale);
    if (sessionData.rangeOfMotion) setRangeOfMotion(sessionData.rangeOfMotion);
    if (sessionData.strengthTest) setStrengthTest(sessionData.strengthTest);
    if (sessionData.exercises) setExercises(sessionData.exercises);
    if (sessionData.modalitiesUsed) setModalitiesUsed(sessionData.modalitiesUsed);
    if (sessionData.billingCodes) setBillingCodes(sessionData.billingCodes);
  }, []);

  const updateFromAI = useCallback((extractedData) => {
    // Update pain scale if extracted
    if (extractedData.painScale) {
      setPainScale(prev => ({
        ...prev,
        ...extractedData.painScale,
      }));
    }

    // Add ROM entries if extracted
    if (extractedData.rangeOfMotion && extractedData.rangeOfMotion.length > 0) {
      setRangeOfMotion(prev => [...prev, ...extractedData.rangeOfMotion]);
    }

    // Add strength test entries if extracted
    if (extractedData.strengthTest && extractedData.strengthTest.length > 0) {
      setStrengthTest(prev => [...prev, ...extractedData.strengthTest]);
    }

    // Add exercises if extracted
    if (extractedData.exercises && extractedData.exercises.length > 0) {
      setExercises(prev => [...prev, ...extractedData.exercises]);
    }

    // Add modalities if extracted
    if (extractedData.modalitiesUsed) {
      setModalitiesUsed(extractedData.modalitiesUsed);
    }

    // Add billing codes if extracted
    if (extractedData.billingCodes) {
      setBillingCodes(extractedData.billingCodes);
    }
  }, []);

  const addROMEntry = useCallback((entry) => {
    setRangeOfMotion(prev => [...prev, entry]);
  }, []);

  const removeROMEntry = useCallback((index) => {
    setRangeOfMotion(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addStrengthEntry = useCallback((entry) => {
    setStrengthTest(prev => [...prev, entry]);
  }, []);

  const removeStrengthEntry = useCallback((index) => {
    setStrengthTest(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addExercise = useCallback((exercise) => {
    setExercises(prev => [...prev, exercise]);
  }, []);

  const removeExercise = useCallback((index) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  }, []);

  const toSessionData = useCallback(() => {
    return {
      painScale,
      rangeOfMotion,
      strengthTest,
      exercises,
      modalitiesUsed,
      billingCodes,
    };
  }, [painScale, rangeOfMotion, strengthTest, exercises, modalitiesUsed, billingCodes]);

  return {
    painScale,
    setPainScale,
    rangeOfMotion,
    setRangeOfMotion,
    addROMEntry,
    removeROMEntry,
    strengthTest,
    setStrengthTest,
    addStrengthEntry,
    removeStrengthEntry,
    exercises,
    setExercises,
    addExercise,
    removeExercise,
    modalitiesUsed,
    setModalitiesUsed,
    billingCodes,
    setBillingCodes,
    updateFromSession,
    updateFromAI,
    toSessionData,
  };
}
