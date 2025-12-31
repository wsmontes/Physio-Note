import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import noteService from '../services/note.service';
import { useToast } from '../context/ToastContext';

/**
 * React Query hook for fetching all notes
 */
export function useNotes() {
  const toast = useToast();

  return useQuery({
    queryKey: ['notes'],
    queryFn: noteService.getNotes,
    onError: (error) => {
      toast.error(error.userMessage || 'Failed to load notes');
    },
  });
}

/**
 * React Query hook for fetching a single note
 */
export function useNote(noteId) {
  const toast = useToast();

  return useQuery({
    queryKey: ['note', noteId],
    queryFn: () => noteService.getNote(noteId),
    enabled: !!noteId,
    onError: (error) => {
      toast.error(error.userMessage || 'Failed to load note');
    },
  });
}

/**
 * React Query mutation for creating a note
 */
export function useCreateNote() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: noteService.createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note created successfully');
    },
    onError: (error) => {
      toast.error(error.userMessage || 'Failed to create note');
    },
  });
}

/**
 * React Query mutation for updating a note
 */
export function useUpdateNote() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ noteId, data }) => noteService.updateNote(noteId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', variables.noteId] });
      toast.success('Note updated successfully');
    },
    onError: (error) => {
      toast.error(error.userMessage || 'Failed to update note');
    },
  });
}

/**
 * React Query mutation for deleting a note
 */
export function useDeleteNote() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: noteService.deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note deleted successfully');
    },
    onError: (error) => {
      toast.error(error.userMessage || 'Failed to delete note');
    },
  });
}
