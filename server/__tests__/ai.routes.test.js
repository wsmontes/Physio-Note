/**
 * AI Routes Integration Tests
 * Tests all AI-related API endpoints including agent workflows
 */

const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/user.model');
const Patient = require('../src/models/patient.model');
const Session = require('../src/models/session.model');
const jwt = require('jsonwebtoken');

// Mock OpenAI and external APIs
jest.mock('../src/services/openai.service');
jest.mock('../src/services/icd-api.service');
jest.mock('../src/services/pubmed-api.service');

const openaiService = require('../src/services/openai.service');
const icdApiService = require('../src/services/icd-api.service');
const pubmedApiService = require('../src/services/pubmed-api.service');

describe('AI Routes Integration Tests', () => {
  let authToken;
  let testUser;
  let testPatient;
  let testSession;

  beforeAll(async () => {
    // Create test user
    testUser = await User.create({
      email: 'ai-test@test.com',
      password: 'Test123!',
      firstName: 'AI',
      lastName: 'Tester',
      licenseNumber: 'PT-AI-123'
    });

    // Generate auth token
    authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    // Create test patient
    testPatient = await Patient.create({
      firstName: 'Test',
      lastName: 'Patient',
      dateOfBirth: new Date('1990-01-01'),
      email: 'patient@test.com',
      createdBy: testUser._id
    });

    // Create test session
    testSession = await Session.create({
      patient: testPatient._id,
      therapist: testUser._id,
      date: new Date(),
      type: 'evaluation',
      chiefComplaint: 'Shoulder pain'
    });
  });

  afterAll(async () => {
    await User.deleteOne({ _id: testUser._id });
    await Patient.deleteOne({ _id: testPatient._id });
    await Session.deleteOne({ _id: testSession._id });
  });

  describe('POST /api/ai/agent/generate-exercises', () => {
    beforeEach(() => {
      // Mock ICD-11 response
      icdApiService.searchDiagnosis.mockResolvedValue({
        matches: [{
          code: 'M75.1',
          title: 'Rotator cuff syndrome',
          description: 'Complete or incomplete tear of rotator cuff'
        }]
      });

      // Mock PubMed response
      pubmedApiService.searchArticles.mockResolvedValue({
        articles: [{
          pmid: '12345678',
          title: 'Effectiveness of Exercise for Rotator Cuff',
          authors: ['Smith J', 'Jones A'],
          year: 2023,
          abstract: 'Study shows exercise is effective...'
        }]
      });

      // Mock OpenAI response
      openaiService.generateCompletion.mockResolvedValue({
        content: JSON.stringify({
          plan: 'Create evidence-based exercise program',
          exercises: [{
            name: 'Pendulum Exercise',
            sets: 3,
            reps: 10,
            instructions: 'Lean forward and swing arm gently',
            rationale: 'Reduces pain and improves ROM',
            evidence: 'RCT showed 40% improvement in ROM',
            progressions: ['Increase arc of motion', 'Add light weight'],
            precautions: 'Stop if sharp pain'
          }]
        })
      });
    });

    it('should generate exercises with evidence successfully', async () => {
      const response = await request(app)
        .post('/api/ai/agent/generate-exercises')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: testPatient._id.toString(),
          diagnosis: 'rotator cuff tear',
          impairments: ['ROM deficit: 40%', 'weakness: Grade 3'],
          goals: 'Return to tennis',
          sessionData: { affectedJoint: 'shoulder' }
        })
        .expect(200);

      expect(response.body).toHaveProperty('exercises');
      expect(Array.isArray(response.body.exercises)).toBe(true);
      expect(response.body.exercises.length).toBeGreaterThan(0);

      expect(response.body).toHaveProperty('metadata');
      expect(response.body.metadata).toHaveProperty('evidenceSources');
      expect(response.body.metadata).toHaveProperty('diagnosisCode');
      expect(response.body.metadata).toHaveProperty('validationStatus');
      expect(response.body.metadata).toHaveProperty('agentPlan');

      expect(response.body).toHaveProperty('agentMetadata');
      expect(response.body.agentMetadata).toHaveProperty('task', 'generate_exercises');
      expect(response.body.agentMetadata).toHaveProperty('duration');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/ai/agent/generate-exercises')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing diagnosis
          impairments: ['ROM deficit'],
          goals: 'Improve function'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 without auth token', async () => {
      await request(app)
        .post('/api/ai/agent/generate-exercises')
        .send({
          diagnosis: 'test',
          impairments: [],
          goals: 'test'
        })
        .expect(401);
    });

    it('should handle agent service errors gracefully', async () => {
      openaiService.generateCompletion.mockRejectedValue(
        new Error('OpenAI API error')
      );

      const response = await request(app)
        .post('/api/ai/agent/generate-exercises')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          diagnosis: 'test condition',
          impairments: [],
          goals: 'test goals'
        })
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/ai/agent/soap-note', () => {
    it('should return 501 (not yet implemented)', async () => {
      const response = await request(app)
        .post('/api/ai/agent/soap-note')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          transcription: 'test',
          patientId: testPatient._id.toString()
        })
        .expect(501);

      expect(response.body.message).toContain('Phase 2');
    });
  });

  describe('POST /api/ai/agent/clinical-decision', () => {
    it('should return 501 (not yet implemented)', async () => {
      const response = await request(app)
        .post('/api/ai/agent/clinical-decision')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          diagnosis: 'test',
          symptoms: {}
        })
        .expect(501);

      expect(response.body.message).toContain('Phase 4');
    });
  });

  describe('POST /api/ai/transcribe', () => {
    it('should require authentication', async () => {
      await request(app)
        .post('/api/ai/transcribe')
        .expect(401);
    });

    it('should require audio file', async () => {
      const response = await request(app)
        .post('/api/ai/transcribe')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.message).toContain('audio');
    });
  });

  describe('POST /api/ai/generate-note', () => {
    beforeEach(() => {
      openaiService.generateSOAPNote.mockResolvedValue({
        subjective: 'Patient reports pain',
        objective: 'ROM limited',
        assessment: 'Rotator cuff strain',
        plan: 'Exercise program'
      });
    });

    it('should generate SOAP note from transcription', async () => {
      const response = await request(app)
        .post('/api/ai/generate-note')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          transcription: 'Patient has shoulder pain...',
          context: { patientAge: 45 },
          template: 'soap'
        })
        .expect(200);

      expect(response.body).toHaveProperty('note');
      expect(response.body.note).toHaveProperty('subjective');
      expect(response.body.note).toHaveProperty('objective');
      expect(response.body.note).toHaveProperty('assessment');
      expect(response.body.note).toHaveProperty('plan');
    });

    it('should return 400 for empty transcription', async () => {
      const response = await request(app)
        .post('/api/ai/generate-note')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          transcription: '',
          template: 'soap'
        })
        .expect(400);

      expect(response.body.message).toContain('transcription');
    });
  });

  describe('POST /api/ai/exercise-program', () => {
    beforeEach(() => {
      openaiService.generateExerciseProgram.mockResolvedValue({
        exercises: [{
          name: 'Test Exercise',
          sets: 3,
          reps: 10,
          instructions: 'Do this...'
        }]
      });
    });

    it('should generate exercise program', async () => {
      const response = await request(app)
        .post('/api/ai/exercise-program')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionData: {
            chiefComplaint: 'shoulder pain',
            rangeOfMotion: [{ joint: 'shoulder', measurement: 120 }]
          },
          patientGoals: 'Return to sports'
        })
        .expect(200);

      expect(response.body).toHaveProperty('exercises');
      expect(Array.isArray(response.body.exercises)).toBe(true);
    });
  });

  describe('POST /api/ai/billing-codes', () => {
    beforeEach(() => {
      openaiService.suggestBillingCodes.mockResolvedValue({
        codes: [{
          code: '97110',
          description: 'Therapeutic exercise',
          units: 2
        }]
      });
    });

    it('should suggest billing codes', async () => {
      const response = await request(app)
        .post('/api/ai/billing-codes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionData: {
            treatments: ['therapeutic exercise'],
            duration: 45
          }
        })
        .expect(200);

      expect(response.body).toHaveProperty('codes');
      expect(Array.isArray(response.body.codes)).toBe(true);
    });
  });
});
