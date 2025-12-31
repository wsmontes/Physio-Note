const openaiService = require('../src/services/openai.service');

// Mock OpenAI API
jest.mock('openai');

describe('OpenAI Service Unit Tests', () => {
  describe('extractPhysiotherapyData', () => {
    it('should extract physiotherapy data from transcription', async () => {
      const transcription = `
        Patient reports lower back pain, current pain level is 7 out of 10.
        Pain is worst in the morning at 9/10 and best in the evening at 3/10.
        Located in the lumbar region.
        
        Range of motion: Lumbar flexion 60 degrees, extension 20 degrees.
        
        Strength testing: Hip flexors 4/5, gluteus maximus 4/5.
        
        Exercises prescribed: Bridge exercise 3 sets of 10 reps, 
        Cat-cow stretch 2 sets of 15 reps.
        
        Modalities used: Heat therapy, TENS unit.
        
        Billing codes: 97110 therapeutic exercise, 97112 neuromuscular reeducation.
      `;

      const result = await openaiService.extractPhysiotherapyData(transcription);

      expect(result).toHaveProperty('painScale');
      expect(result.painScale).toHaveProperty('current');
      expect(result.painScale).toHaveProperty('location');
      
      expect(result).toHaveProperty('rangeOfMotion');
      expect(Array.isArray(result.rangeOfMotion)).toBe(true);
      
      expect(result).toHaveProperty('strengthTest');
      expect(Array.isArray(result.strengthTest)).toBe(true);
      
      expect(result).toHaveProperty('exercises');
      expect(Array.isArray(result.exercises)).toBe(true);
      
      expect(result).toHaveProperty('modalitiesUsed');
      expect(result).toHaveProperty('billingCodes');
    });

    it('should handle empty transcription', async () => {
      const result = await openaiService.extractPhysiotherapyData('');

      expect(result).toHaveProperty('painScale');
      expect(result).toHaveProperty('rangeOfMotion');
      expect(result).toHaveProperty('strengthTest');
      expect(result).toHaveProperty('exercises');
    });

    it('should handle transcription with minimal data', async () => {
      const transcription = 'Patient has some back pain.';

      const result = await openaiService.extractPhysiotherapyData(transcription);

      expect(result).toHaveProperty('painScale');
      expect(result.painScale.location).toContain('back');
    });
  });

  describe('transcribeAudio', () => {
    it('should transcribe audio file', async () => {
      const mockAudioBuffer = Buffer.from('fake audio data');
      
      const result = await openaiService.transcribeAudio(mockAudioBuffer);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle invalid audio data', async () => {
      await expect(
        openaiService.transcribeAudio(null)
      ).rejects.toThrow();
    });
  });

  describe('generateSOAPNote', () => {
    it('should generate SOAP note from transcription', async () => {
      const transcription = `
        Patient reports lower back pain that started 3 days ago.
        Examination shows limited range of motion.
        Assessment indicates lumbar strain.
        Plan: Physical therapy 3 times per week.
      `;

      const result = await openaiService.generateSOAPNote(transcription);

      expect(result).toHaveProperty('subjective');
      expect(result).toHaveProperty('objective');
      expect(result).toHaveProperty('assessment');
      expect(result).toHaveProperty('plan');
      
      expect(result.subjective).toBeTruthy();
      expect(result.objective).toBeTruthy();
      expect(result.assessment).toBeTruthy();
      expect(result.plan).toBeTruthy();
    });

    it('should handle empty transcription', async () => {
      const result = await openaiService.generateSOAPNote('');

      expect(result).toHaveProperty('subjective');
      expect(result).toHaveProperty('objective');
      expect(result).toHaveProperty('assessment');
      expect(result).toHaveProperty('plan');
    });
  });

  describe('error handling', () => {
    it('should handle OpenAI API errors gracefully', async () => {
      // Mock API error
      const mockError = new Error('OpenAI API Error');
      
      await expect(
        openaiService.extractPhysiotherapyData('test')
      ).rejects.toThrow();
    });

    it('should handle rate limit errors', async () => {
      // Mock rate limit error
      const mockError = new Error('Rate limit exceeded');
      mockError.status = 429;
      
      await expect(
        openaiService.transcribeAudio(Buffer.from('test'))
      ).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      // Mock timeout
      const mockError = new Error('Request timeout');
      mockError.code = 'ETIMEDOUT';
      
      await expect(
        openaiService.generateSOAPNote('test')
      ).rejects.toThrow();
    });
  });

  describe('data validation', () => {
    it('should validate pain scale values', async () => {
      const transcription = 'Pain level is 15 out of 10'; // Invalid
      
      const result = await openaiService.extractPhysiotherapyData(transcription);
      
      // Should normalize to valid range or handle gracefully
      expect(result.painScale.current).toBeDefined();
    });

    it('should validate ROM degrees format', async () => {
      const transcription = 'Shoulder flexion: 180 degrees';
      
      const result = await openaiService.extractPhysiotherapyData(transcription);
      
      expect(result.rangeOfMotion).toHaveLength(1);
      expect(result.rangeOfMotion[0]).toHaveProperty('degrees');
    });

    it('should validate strength grade format', async () => {
      const transcription = 'Quadriceps strength 5/5';
      
      const result = await openaiService.extractPhysiotherapyData(transcription);
      
      expect(result.strengthTest).toHaveLength(1);
      expect(result.strengthTest[0].grade).toMatch(/^\d\/5$/);
    });
  });
});
