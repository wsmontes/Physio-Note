import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import templateService from '../services/template.service';
import { useToast } from '../context/ToastContext';

/**
 * Hook to fetch all templates (user's + public)
 */
export function useTemplates() {
  const toast = useToast();
  return useQuery({
    queryKey: ['templates'],
    queryFn: templateService.getTemplates,
    onError: (error) => {
      toast.error(error.userMessage || 'Failed to load templates');
    },
  });
}

/**
 * Hook to fetch a single template
 * @param {string} id - Template ID
 */
export function useTemplate(id) {
  const toast = useToast();
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => templateService.getTemplate(id),
    enabled: !!id,
    onError: (error) => {
      toast.error(error.userMessage || 'Failed to load template');
    },
  });
}

/**
 * Hook to create a new template
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: templateService.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template created successfully');
    },
    onError: (error) => {
      toast.error(error.userMessage || 'Failed to create template');
    },
  });
}

/**
 * Hook to update an existing template
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, data }) => templateService.updateTemplate(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template', variables.id] });
      toast.success('Template updated successfully');
    },
    onError: (error) => {
      toast.error(error.userMessage || 'Failed to update template');
    },
  });
}

/**
 * Hook to delete a template
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: templateService.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template deleted successfully');
    },
    onError: (error) => {
      toast.error(error.userMessage || 'Failed to delete template');
    },
  });
}

/**
 * Hook to clone a template
 */
export function useCloneTemplate() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: templateService.cloneTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template cloned successfully');
    },
    onError: (error) => {
      toast.error(error.userMessage || 'Failed to clone template');
    },
  });
}
