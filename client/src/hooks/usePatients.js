import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import patientService from '../services/patient.service';
import { useToast } from '../context/ToastContext';

/**
 * React Query hook for fetching all patients
 */
export function usePatients() {
  const toast = useToast();

  return useQuery({
    queryKey: ['patients'],
    queryFn: patientService.getPatients,
    onError: (error) => {
      toast.error(error.userMessage || 'Failed to load patients');
    },
  });
}

/**
 * React Query hook for fetching a single patient
 */
export function usePatient(patientId) {
  const toast = useToast();

  return useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => patientService.getPatient(patientId),
    enabled: !!patientId,
    onError: (error) => {
      toast.error(error.userMessage || 'Failed to load patient');
    },
  });
}

/**
 * React Query mutation for creating a patient
 */
export function useCreatePatient() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: patientService.createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient created successfully');
    },
    onError: (error) => {
      toast.error(error.userMessage || 'Failed to create patient');
    },
  });
}

/**
 * React Query mutation for updating a patient
 */
export function useUpdatePatient() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ patientId, data }) => patientService.updatePatient(patientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', variables.patientId] });
      toast.success('Patient updated successfully');
    },
    onError: (error) => {
      toast.error(error.userMessage || 'Failed to update patient');
    },
  });
}

/**
 * React Query mutation for deleting a patient
 */
export function useDeletePatient() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: patientService.deletePatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient deleted successfully');
    },
    onError: (error) => {
      toast.error(error.userMessage || 'Failed to delete patient');
    },
  });
}
