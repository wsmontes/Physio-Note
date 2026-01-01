import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as aiService from '../../services/ai.service';
import axiosInstance from '../../services/axios.config';

// Mock axios config
vi.mock('../../services/axios.config', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

describe('AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    localStorage.setItem('user', JSON.stringify({ token: 'test-token' }));
  });

  describe('transcribeAudio', () => {
    it('should send audio file for transcription', async () => {
      const mockResponse = {
        data: {
          transcription: 'Patient reports lower back pain for 3 days'
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const audioBlob = new Blob(['audio'], { type: 'audio/mp3' });
      const duration = 120;

      const result = await aiService.transcribeAudio(audioBlob, duration);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        'ai/transcribe',
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data'
          }),
          timeout: 45000
        })
      );

      expect(result).toEqual({ transcription: 'Patient reports lower back pain for 3 days' });
    });

    it('should handle transcription errors', async () => {
      axiosInstance.post.mockRejectedValue(new Error('Transcription failed'));

      const audioBlob = new Blob(['audio'], { type: 'audio/mp3' });

      await expect(aiService.transcribeAudio(audioBlob, 120))
        .rejects.toThrow('Transcription failed');
    });
  });

  describe('generateNote', () => {
    it('should generate SOAP note from transcription', async () => {
      const mockResponse = {
        data: {
          note: {
            subjective: 'Patient complains of lower back pain',
            objective: 'ROM limited to 45 degrees',
            assessment: 'Acute lower back strain',
            plan: 'Manual therapy and exercise program'
          }
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const transcription = 'Patient reports lower back pain';
      const context = { patientName: 'John Doe' };
      const template = 'soap';

      const result = await aiService.generateNote(transcription, context, template);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        'ai/generate-note',
        {
          transcription,
          context,
          template
        },
        expect.objectContaining({
          timeout: 60000
        })
      );

      expect(result.note).toHaveProperty('subjective');
      expect(result.note).toHaveProperty('objective');
    });
  });

  describe('generateExerciseProgram', () => {
    it('should generate exercise recommendations', async () => {
      const mockResponse = {
        data: {
          exercises: [
            {
              type: 'Lumbar Flexion',
              sets: 3,
              reps: 10,
              instructions: 'Perform slowly',
              homeProgram: true
            }
          ]
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const sessionData = {
        diagnosis: 'Lower back pain',
        currentExercises: []
      };
      const patientGoals = 'Return to running';

      const result = await aiService.generateExerciseProgram(sessionData, patientGoals);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        'ai/exercise-program',
        { sessionData, patientGoals },
        expect.any(Object)
      );

      expect(result.exercises).toHaveLength(1);
      expect(result.exercises[0]).toHaveProperty('type', 'Lumbar Flexion');
    });
  });

  describe('suggestBillingCodes', () => {
    it('should suggest appropriate billing codes', async () => {
      const mockResponse = {
        data: {
          codes: ['97110', '97140', '97530']
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const sessionData = {
        treatments: ['Manual Therapy', 'Therapeutic Exercise'],
        sessionType: 'follow-up',
        duration: 60
      };

      const result = await aiService.suggestBillingCodes(sessionData);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        'ai/billing-codes',
        { sessionData },
        expect.any(Object)
      );

      expect(result.codes).toHaveLength(3);
      expect(result.codes).toContain('97110');
    });
  });

  describe('transcribeAndGenerate', () => {
    it('should transcribe and generate note in one call', async () => {
      const mockResponse = {
        data: {
          transcription: 'Patient reports pain',
          note: {
            subjective: 'Patient complains of pain',
            objective: 'ROM limited',
            assessment: 'Acute strain',
            plan: 'Manual therapy'
          }
        }
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const audioBlob = new Blob(['audio'], { type: 'audio/mp3' });
      const context = { patientName: 'John Doe' };
      const template = 'soap';
      const duration = 120;

      const result = await aiService.transcribeAndGenerate(
        audioBlob,
        context,
        template,
        duration
      );

      expect(result).toHaveProperty('transcription');
      expect(result).toHaveProperty('note');
      expect(result.note).toHaveProperty('subjective');
    });
  });
});
