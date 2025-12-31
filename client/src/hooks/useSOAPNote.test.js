import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSOAPNote } from './useSOAPNote';

describe('useSOAPNote Hook', () => {
  it('initializes with empty values', () => {
    const { result } = renderHook(() => useSOAPNote());
    
    expect(result.current.subjective).toBe('');
    expect(result.current.objective).toBe('');
    expect(result.current.assessment).toBe('');
    expect(result.current.plan).toBe('');
  });

  it('initializes with provided data', () => {
    const initialData = {
      subjective: 'Patient complains of back pain',
      objective: 'ROM limited to 60 degrees',
      assessment: 'Lumbar strain',
      plan: 'Physical therapy 3x per week',
    };

    const { result } = renderHook(() => useSOAPNote(initialData));
    
    expect(result.current.subjective).toBe(initialData.subjective);
    expect(result.current.objective).toBe(initialData.objective);
    expect(result.current.assessment).toBe(initialData.assessment);
    expect(result.current.plan).toBe(initialData.plan);
  });

  it('updates subjective field', () => {
    const { result } = renderHook(() => useSOAPNote());
    
    act(() => {
      result.current.setSubjective('New subjective data');
    });
    expect(result.current.subjective).toBe('New subjective data');
  });

  it('updates objective field', () => {
    const { result } = renderHook(() => useSOAPNote());
    
    act(() => {
      result.current.setObjective('New objective data');
    });
    expect(result.current.objective).toBe('New objective data');
  });

  it('updates assessment field', () => {
    const { result } = renderHook(() => useSOAPNote());
    
    act(() => {
      result.current.setAssessment('New assessment');
    });
    expect(result.current.assessment).toBe('New assessment');
  });

  it('updates plan field', () => {
    const { result } = renderHook(() => useSOAPNote());
    
    act(() => {
      result.current.setPlan('New plan');
    });
    expect(result.current.plan).toBe('New plan');
  });

  it('updates from session data', () => {
    const { result } = renderHook(() => useSOAPNote());
    
    const sessionData = {
      soapNote: {
        subjective: 'Session subjective',
        objective: 'Session objective',
        assessment: 'Session assessment',
        plan: 'Session plan',
      },
    };

    act(() => {
      result.current.updateFromSession(sessionData);
    });
    
    expect(result.current.subjective).toBe('Session subjective');
    expect(result.current.objective).toBe('Session objective');
    expect(result.current.assessment).toBe('Session assessment');
    expect(result.current.plan).toBe('Session plan');
  });

  it('updates from transcription data', () => {
    const { result } = renderHook(() => useSOAPNote());
    
    const transcriptionData = {
      subjective: 'Transcribed subjective',
      objective: 'Transcribed objective',
      assessment: 'Transcribed assessment',
      plan: 'Transcribed plan',
    };

    act(() => {
      result.current.updateFromTranscription(transcriptionData);
    });
    
    expect(result.current.subjective).toBe('Transcribed subjective');
    expect(result.current.objective).toBe('Transcribed objective');
    expect(result.current.assessment).toBe('Transcribed assessment');
    expect(result.current.plan).toBe('Transcribed plan');
  });

  it('converts to session data format', () => {
    const { result } = renderHook(() => useSOAPNote());
    
    act(() => {
      result.current.setSubjective('Test subjective');
      result.current.setObjective('Test objective');
      result.current.setAssessment('Test assessment');
      result.current.setPlan('Test plan');
    });

    const sessionData = result.current.toSessionData();
    
    expect(sessionData).toEqual({
      soapNote: {
        subjective: 'Test subjective',
        objective: 'Test objective',
        assessment: 'Test assessment',
        plan: 'Test plan',
      },
    });
  });

  it('resets all fields', () => {
    const { result } = renderHook(() => useSOAPNote({
      subjective: 'Initial',
      objective: 'Initial',
      assessment: 'Initial',
      plan: 'Initial',
    }));
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.subjective).toBe('');
    expect(result.current.objective).toBe('');
    expect(result.current.assessment).toBe('');
    expect(result.current.plan).toBe('');
  });

  it('handles partial session data', () => {
    const { result } = renderHook(() => useSOAPNote());
    
    const partialData = {
      soapNote: {
        subjective: 'Only subjective',
      },
    };

    act(() => {
      result.current.updateFromSession(partialData);
    });
    
    expect(result.current.subjective).toBe('Only subjective');
    expect(result.current.objective).toBe('');
    expect(result.current.assessment).toBe('');
    expect(result.current.plan).toBe('');
  });

  it('handles empty session data gracefully', () => {
    const { result } = renderHook(() => useSOAPNote());
    
    act(() => {
      result.current.updateFromSession({});
    });
    
    expect(result.current.subjective).toBe('');
    expect(result.current.objective).toBe('');
    expect(result.current.assessment).toBe('');
    expect(result.current.plan).toBe('');
  });
});
