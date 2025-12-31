import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePhysioData } from './usePhysioData';

describe('usePhysioData Hook', () => {
  it('initializes with empty values', () => {
    const { result } = renderHook(() => usePhysioData());
    
    expect(result.current.painScale).toEqual({
      current: '',
      best: '',
      worst: '',
      location: '',
    });
    expect(result.current.rangeOfMotion).toEqual([]);
    expect(result.current.strengthTest).toEqual([]);
    expect(result.current.exercises).toEqual([]);
    expect(result.current.modalitiesUsed).toBe('');
    expect(result.current.billingCodes).toBe('');
  });

  it('initializes with provided data', () => {
    const initialData = {
      painScale: { current: '7', best: '3', worst: '9', location: 'Lower back' },
      rangeOfMotion: [{ joint: 'Lumbar', movement: 'Flexion', degrees: '60°' }],
      strengthTest: [{ muscle: 'Hip flexors', grade: '4/5' }],
      exercises: [{ name: 'Bridge', sets: '3', reps: '10', instructions: 'Hold 5 sec' }],
      modalitiesUsed: 'Heat therapy, TENS',
      billingCodes: '97110, 97112',
    };

    const { result } = renderHook(() => usePhysioData(initialData));
    
    expect(result.current.painScale).toEqual(initialData.painScale);
    expect(result.current.rangeOfMotion).toEqual(initialData.rangeOfMotion);
    expect(result.current.strengthTest).toEqual(initialData.strengthTest);
    expect(result.current.exercises).toEqual(initialData.exercises);
    expect(result.current.modalitiesUsed).toBe(initialData.modalitiesUsed);
    expect(result.current.billingCodes).toBe(initialData.billingCodes);
  });

  it('updates pain scale', () => {
    const { result } = renderHook(() => usePhysioData());
    
    const newPainScale = { current: '5', best: '2', worst: '8', location: 'Right knee' };
    act(() => {
      result.current.setPainScale(newPainScale);
    });
    
    expect(result.current.painScale).toEqual(newPainScale);
  });

  it('adds ROM entry', () => {
    const { result } = renderHook(() => usePhysioData());
    
    const romEntry = { joint: 'Shoulder', movement: 'Abduction', degrees: '120°' };
    act(() => {
      result.current.addROMEntry(romEntry);
    });
    
    expect(result.current.rangeOfMotion).toHaveLength(1);
    expect(result.current.rangeOfMotion[0]).toEqual(romEntry);
  });

  it('removes ROM entry', () => {
    const initialData = {
      rangeOfMotion: [
        { joint: 'Shoulder', movement: 'Abduction', degrees: '120°' },
        { joint: 'Hip', movement: 'Flexion', degrees: '90°' },
      ],
    };

    const { result } = renderHook(() => usePhysioData(initialData));
    
    act(() => {
      result.current.removeROMEntry(0);
    });
    
    expect(result.current.rangeOfMotion).toHaveLength(1);
    expect(result.current.rangeOfMotion[0].joint).toBe('Hip');
  });

  it('adds strength test entry', () => {
    const { result } = renderHook(() => usePhysioData());
    
    const strengthEntry = { muscle: 'Quadriceps', grade: '5/5' };
    act(() => {
      result.current.addStrengthEntry(strengthEntry);
    });
    
    expect(result.current.strengthTest).toHaveLength(1);
    expect(result.current.strengthTest[0]).toEqual(strengthEntry);
  });

  it('removes strength test entry', () => {
    const initialData = {
      strengthTest: [
        { muscle: 'Quadriceps', grade: '5/5' },
        { muscle: 'Hamstrings', grade: '4/5' },
      ],
    };

    const { result } = renderHook(() => usePhysioData(initialData));
    
    act(() => {
      result.current.removeStrengthEntry(1);
    });
    
    expect(result.current.strengthTest).toHaveLength(1);
    expect(result.current.strengthTest[0].muscle).toBe('Quadriceps');
  });

  it('adds exercise', () => {
    const { result } = renderHook(() => usePhysioData());
    
    const exercise = { name: 'Squat', sets: '3', reps: '15', instructions: 'Proper form' };
    act(() => {
      result.current.addExercise(exercise);
    });
    
    expect(result.current.exercises).toHaveLength(1);
    expect(result.current.exercises[0]).toEqual(exercise);
  });

  it('removes exercise', () => {
    const initialData = {
      exercises: [
        { name: 'Squat', sets: '3', reps: '15', instructions: 'Proper form' },
        { name: 'Lunge', sets: '3', reps: '10', instructions: 'Alternate legs' },
      ],
    };

    const { result } = renderHook(() => usePhysioData(initialData));
    
    act(() => {
      result.current.removeExercise(0);
    });
    
    expect(result.current.exercises).toHaveLength(1);
    expect(result.current.exercises[0].name).toBe('Lunge');
  });

  it('updates from AI extracted data', () => {
    const { result } = renderHook(() => usePhysioData());
    
    const aiData = {
      painScale: { current: '6', best: '2', worst: '8', location: 'Neck' },
      rangeOfMotion: [{ joint: 'Cervical', movement: 'Rotation', degrees: '70°' }],
      strengthTest: [{ muscle: 'Trapezius', grade: '4/5' }],
      exercises: [{ name: 'Chin tucks', sets: '3', reps: '10', instructions: 'Hold 5 sec' }],
      modalitiesUsed: 'Ice, Electrical stimulation',
      billingCodes: '97110',
    };

    act(() => {
      result.current.updateFromAI(aiData);
    });
    
    expect(result.current.painScale).toEqual(aiData.painScale);
    expect(result.current.rangeOfMotion).toEqual(aiData.rangeOfMotion);
    expect(result.current.strengthTest).toEqual(aiData.strengthTest);
    expect(result.current.exercises).toEqual(aiData.exercises);
    expect(result.current.modalitiesUsed).toBe(aiData.modalitiesUsed);
    expect(result.current.billingCodes).toBe(aiData.billingCodes);
  });

  it('converts to session data format', () => {
    const { result } = renderHook(() => usePhysioData());
    
    act(() => {
      result.current.setPainScale({ current: '5', best: '2', worst: '8', location: 'Knee' });
      result.current.setModalitiesUsed('Heat therapy');
      result.current.setBillingCodes('97110');
    });

    const sessionData = result.current.toSessionData();
    
    expect(sessionData).toHaveProperty('painScale');
    expect(sessionData).toHaveProperty('rangeOfMotion');
    expect(sessionData).toHaveProperty('strengthTest');
    expect(sessionData).toHaveProperty('exercises');
    expect(sessionData).toHaveProperty('modalitiesUsed');
    expect(sessionData).toHaveProperty('billingCodes');
  });

  it('handles partial AI data', () => {
    const { result } = renderHook(() => usePhysioData());
    
    const partialAIData = {
      painScale: { current: '6', location: 'Shoulder' },
      rangeOfMotion: [{ joint: 'Shoulder', movement: 'Abduction' }],
    };

    act(() => {
      result.current.updateFromAI(partialAIData);
    });
    
    expect(result.current.painScale.current).toBe('6');
    expect(result.current.painScale.location).toBe('Shoulder');
    expect(result.current.rangeOfMotion).toHaveLength(1);
  });
});
