import { useState, useCallback } from 'react';
import patientService from '../services/patient.service';
import { useToast } from '../context/ToastContext';

/**
 * Custom hook for fetching and managing patient data
 */
export function usePatient(patientId) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchPatient = useCallback(async (id = patientId) => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await patientService.getPatient(id);
      setPatient(data);
      return data;
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast.error(error.userMessage || 'Failed to load patient data');
      return null;
    } finally {
      setLoading(false);
    }
  }, [patientId, toast]);

  return {
    patient,
    loading,
    fetchPatient,
    setPatient,
  };
}
