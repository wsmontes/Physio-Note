/**
 * OpenAI Integration Tests
 * 
 * Tests REAL interactions with OpenAI API using gpt-5-nano
 * These tests make actual API calls and should be run selectively
 * 
 * Run with: npm test -- --testPathPattern=integration/openai
 */

const fs = require('fs');
const path = require('path');

// Load .env.test first
require('dotenv').config({ path: '.env.test' });

// If API key is placeholder or missing, load from .env
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your-openai-api-key')) {
  require('dotenv').config({ path: '.env', override: true });
}

const OpenAI = require('openai');

describe('OpenAI Integration Tests', () => {
  let openai;
  const MODEL = 'gpt-5-nano';

  beforeAll(() => {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your-openai-api-key')) {
      throw new Error('OPENAI_API_KEY not configured in .env or .env.test');
    }
    
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  });

  describe('API Connection', () => {
    it('should successfully connect to OpenAI with valid API key', async () => {
      const response = await openai.responses.create({
        model: MODEL,
        input: [
          { role: 'developer', content: 'You are a test assistant.' },
          { role: 'user', content: 'Say "test" in one word.' }
        ],
        text: { verbosity: 'medium' }
      });

      expect(response).toBeDefined();
      expect(response.output).toBeDefined();
      expect(Array.isArray(response.output)).toBe(true);
      expect(response.output.length).toBeGreaterThan(0);
    }, 30000);

    it('should extract text from response output structure', async () => {
      const response = await openai.responses.create({
        model: MODEL,
        input: [
          { role: 'developer', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say hello.' }
        ],
        text: { verbosity: 'medium' }
      });

      let extractedText = '';
      for (const item of response.output) {
        if (item.content) {
          for (const content of item.content) {
            if (content.text) {
              extractedText += content.text;
            }
          }
        }
      }

      expect(extractedText).toBeDefined();
      expect(extractedText.length).toBeGreaterThan(0);
      expect(typeof extractedText).toBe('string');
    }, 30000);
  });

  describe('Clinical Content Generation', () => {
    it('should generate exercise recommendations for shoulder pain', async () => {
      const prompt = `Generate 2 evidence-based exercises for rotator cuff syndrome. 
      
      Return ONLY valid JSON in this format:
      {
        "exercises": [
          {
            "name": "Exercise name",
            "category": "Strengthening|Mobility|Stretching",
            "sets": 2,
            "reps": 10,
            "description": "How to perform"
          }
        ]
      }`;

      const response = await openai.responses.create({
        model: MODEL,
        input: [
          { 
            role: 'developer', 
            content: 'You are an expert physiotherapist. Always return valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        text: { verbosity: 'medium' }
      });

      let content = '';
      for (const item of response.output) {
        if (item.content) {
          for (const contentItem of item.content) {
            if (contentItem.text) {
              content += contentItem.text;
            }
          }
        }
      }

      expect(content).toBeDefined();
      
      // Try to parse as JSON
      const parsed = JSON.parse(content);
      expect(parsed).toHaveProperty('exercises');
      expect(Array.isArray(parsed.exercises)).toBe(true);
      expect(parsed.exercises.length).toBeGreaterThanOrEqual(2);
      
      // Validate exercise structure
      const exercise = parsed.exercises[0];
      expect(exercise).toHaveProperty('name');
      expect(exercise).toHaveProperty('category');
      expect(exercise).toHaveProperty('sets');
      expect(exercise).toHaveProperty('reps');
      expect(exercise).toHaveProperty('description');
      
      // Validate clinical appropriateness
      expect(exercise.sets).toBeGreaterThanOrEqual(1);
      expect(exercise.sets).toBeLessThanOrEqual(5);
      expect(exercise.reps).toBeGreaterThanOrEqual(5);
      expect(exercise.reps).toBeLessThanOrEqual(30);
    }, 30000);

    it('should handle multi-step reasoning for complex clinical case', async () => {
      const prompt = `Analyze this patient case and recommend ONE exercise:
      
      Patient: 62-year-old with knee osteoarthritis
      Current strength: Quadriceps 3/5
      Pain: 7/10 with stairs
      Goal: Climb stairs independently
      
      Think step by step:
      1. What muscle group is most important for stair climbing?
      2. What exercise is safe for someone with 3/5 strength?
      3. What dosage is appropriate?
      
      Return JSON:
      {
        "reasoning": "Your step-by-step thinking",
        "exercise": {
          "name": "Exercise name",
          "sets": 2,
          "reps": 10,
          "rationale": "Why this exercise"
        }
      }`;

      const response = await openai.responses.create({
        model: MODEL,
        input: [
          { 
            role: 'developer', 
            content: 'You are a physiotherapy expert. Think carefully and return valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        text: { verbosity: 'medium' }
      });

      let content = '';
      for (const item of response.output) {
        if (item.content) {
          for (const contentItem of item.content) {
            if (contentItem.text) {
              content += contentItem.text;
            }
          }
        }
      }

      const parsed = JSON.parse(content);
      
      expect(parsed).toHaveProperty('reasoning');
      expect(parsed).toHaveProperty('exercise');
      expect(parsed.reasoning.length).toBeGreaterThan(20);
      
      const exercise = parsed.exercise;
      expect(exercise).toHaveProperty('name');
      expect(exercise).toHaveProperty('rationale');
      
      // Exercise should be appropriate for weak quadriceps
      const nameLower = exercise.name.toLowerCase();
      const appropriateExercises = ['quad', 'leg', 'knee', 'sit to stand', 'chair'];
      const isAppropriate = appropriateExercises.some(keyword => 
        nameLower.includes(keyword)
      );
      expect(isAppropriate).toBe(true);
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should handle invalid model name gracefully', async () => {
      await expect(async () => {
        await openai.responses.create({
          model: 'invalid-model-name',
          input: [
            { role: 'user', content: 'test' }
          ],
          text: { verbosity: 'medium' }
        });
      }).rejects.toThrow();
    }, 30000);

    // Note: gpt-5-nano doesn't strictly validate input format
    // It will attempt to process even malformed requests
    // This is expected behavior for this model
  });
});
