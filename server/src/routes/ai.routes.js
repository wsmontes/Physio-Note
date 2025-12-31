const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth.middleware');
const openaiService = require('../services/openai.service');
const { getAgent } = require('../services/ai-agent.service');
const progressStream = require('../services/progress-stream.service');

// Configure multer for audio file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  }
});

// @route   POST /api/ai/transcribe
// @desc    Transcribe audio file using Whisper
// @access  Private
router.post('/transcribe', protect, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'No audio file provided' } });
    }

    const transcription = await openaiService.transcribeAudio(
      req.file.buffer,
      req.file.originalname
    );

    res.json({
      transcription,
      duration: req.body.duration || null,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: { message: 'Failed to transcribe audio', details: error.message } });
  }
});

// @route   POST /api/ai/generate-note
// @desc    Generate structured SOAP note from transcription
// @access  Private
router.post('/generate-note', protect, async (req, res) => {
  try {
    const { transcription, context, template } = req.body;

    if (!transcription) {
      return res.status(400).json({ error: { message: 'Transcription text is required' } });
    }

    const note = await openaiService.generateSOAPNote(
      transcription,
      context || {},
      template || 'soap'
    );

    res.json({
      note,
      generatedBy: 'gpt-5-nano',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Note generation error:', error);
    res.status(500).json({ error: { message: 'Failed to generate note', details: error.message } });
  }
});

// @route   POST /api/ai/exercise-program
// @desc    Generate home exercise program
// @access  Private
router.post('/exercise-program', protect, async (req, res) => {
  try {
    const { sessionData, patientGoals } = req.body;

    if (!sessionData) {
      return res.status(400).json({ error: { message: 'Session data is required' } });
    }

    const exercises = await openaiService.generateExercisePrescription(
      sessionData,
      patientGoals || 'Improve function and reduce pain'
    );

    res.json({
      exercises,
      generatedBy: 'gpt-5-nano',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Exercise program generation error:', error);
    res.status(500).json({ error: { message: 'Failed to generate exercise program', details: error.message } });
  }
});

// @route   POST /api/ai/billing-codes
// @desc    Suggest billing codes for session
// @access  Private
router.post('/billing-codes', protect, async (req, res) => {
  try {
    const { sessionData } = req.body;

    if (!sessionData) {
      return res.status(400).json({ error: { message: 'Session data is required' } });
    }

    const billingCodes = await openaiService.suggestBillingCodes(sessionData);

    res.json({
      billingCodes,
      generatedBy: 'gpt-5-nano',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Billing code suggestion error:', error);
    res.status(500).json({ error: { message: 'Failed to suggest billing codes', details: error.message } });
  }
});

// @route   POST /api/ai/extract-physio-data
// @desc    Extract physiotherapy-specific data from transcription
// @access  Private
router.post('/extract-physio-data', protect, async (req, res) => {
  try {
    const { transcription } = req.body;

    if (!transcription) {
      return res.status(400).json({ error: { message: 'Transcription text is required' } });
    }

    const physioData = await openaiService.extractPhysiotherapyData(transcription);

    res.json({
      physioData,
      generatedBy: 'gpt-5-nano',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Physio data extraction error:', error);
    res.status(500).json({ error: { message: 'Failed to extract physiotherapy data', details: error.message } });
  }
});

// @route   POST /api/ai/transcribe-and-generate
// @desc    Combined endpoint: transcribe audio and generate note
// @access  Private
router.post('/transcribe-and-generate', protect, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'No audio file provided' } });
    }

    // Step 1: Transcribe
    const transcription = await openaiService.transcribeAudio(
      req.file.buffer,
      req.file.originalname
    );

    // Step 2: Generate note
    const context = req.body.context ? JSON.parse(req.body.context) : {};
    const template = req.body.template || 'soap';
    
    const note = await openaiService.generateSOAPNote(
      transcription,
      context,
      template
    );

    res.json({
      transcription,
      note,
      generatedBy: {
        transcription: 'whisper-1',
        note: 'gpt-5-nano'
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Combined transcription and generation error:', error);
    res.status(500).json({ error: { message: 'Failed to process audio', details: error.message } });
  }
});

// ============================================
// AGENTIC AI ENDPOINTS
// Multi-step workflows with evidence integration
// ============================================

// @route   GET /api/ai/agent/progress/:sessionId
// @desc    Server-Sent Events stream for AI Agent progress
// @access  Private
router.get('/agent/progress/:sessionId', protect, (req, res) => {
  const { sessionId } = req.params;
  progressStream.registerStream(sessionId, res, req);
});

// @route   POST /api/ai/agent/generate-exercises
// @desc    Agent-based exercise generation with evidence and validation
// @access  Private
router.post('/agent/generate-exercises', protect, async (req, res) => {
  try {
    const { patientId, diagnosis, impairments, goals, sessionData } = req.body;

    if (!diagnosis && !impairments) {
      return res.status(400).json({ 
        error: { message: 'Either diagnosis or impairments must be provided' } 
      });
    }

    // Generate unique session ID for progress tracking
    const sessionId = `exercise-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Send session ID immediately so client can connect to SSE
    res.json({
      sessionId,
      status: 'processing',
      message: 'Exercise generation started. Connect to /api/ai/agent/progress/:sessionId for real-time updates.'
    });

    // Execute agent asynchronously with progress tracking
    setImmediate(async () => {
      try {
        progressStream.emit(sessionId, {
          type: 'start',
          message: 'AI Agent starting exercise generation workflow'
        });

        const agent = getAgent();
        const result = await agent.execute('generate_exercises', {
          patientId,
          diagnosis,
          impairments: impairments || [],
          goals: goals || 'Improve function and reduce pain',
          sessionData: sessionData || {},
          progressCallback: (event) => {
            progressStream.emit(sessionId, event);
          }
        });

        // Emit completion event
        progressStream.emitComplete(sessionId, {
          exerciseCount: result.exercises?.length || 0,
          evidenceCount: result.metadata?.evidenceSources?.length || 0,
          duration: result.metadata?.totalDuration || 0
        });

        // Close stream after a delay to ensure client receives completion
        setTimeout(() => progressStream.closeStream(sessionId), 2000);
      } catch (error) {
        console.error('Exercise agent error:', error);
        progressStream.emitError(sessionId, error);
        setTimeout(() => progressStream.closeStream(sessionId), 2000);
      }
    });
  } catch (error) {
    console.error('Exercise agent error:', error);
    res.status(500).json({ 
      error: { 
        message: 'Failed to start exercise generation', 
        details: error.message 
      } 
    });
  }
});

// @route   POST /api/ai/agent/soap-note
// @desc    Agent-based SOAP note with diagnosis verification
// @access  Private
router.post('/agent/soap-note', protect, async (req, res) => {
  try {
    const { transcription, patientId, templateType } = req.body;

    if (!transcription) {
      return res.status(400).json({ 
        error: { message: 'Transcription text is required' } 
      });
    }

    const agent = getAgent();
    const result = await agent.execute('generate_soap_note', {
      transcription,
      patientId,
      templateType: templateType || 'soap'
    });

    res.json({
      ...result,
      generatedBy: 'ai-agent (gpt-5-nano)',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('SOAP agent error:', error);
    
    // Check if this is a "not yet implemented" error
    if (error.message.includes('not yet implemented')) {
      return res.status(501).json({ 
        error: { 
          message: 'SOAP Note Agent coming in Phase 2',
          details: 'Use /api/ai/generate-note for now' 
        } 
      });
    }
    
    res.status(500).json({ 
      error: { 
        message: 'Failed to generate SOAP note', 
        details: error.message 
      } 
    });
  }
});

// @route   POST /api/ai/agent/clinical-decision
// @desc    Real-time clinical decision support with evidence
// @access  Private
router.post('/agent/clinical-decision', protect, async (req, res) => {
  try {
    const { diagnosis, symptoms, testResults, questionType } = req.body;

    if (!diagnosis || !questionType) {
      return res.status(400).json({ 
        error: { message: 'Diagnosis and questionType are required' } 
      });
    }

    const agent = getAgent();
    const result = await agent.execute('clinical_decision_support', {
      diagnosis,
      symptoms: symptoms || {},
      testResults: testResults || {},
      questionType
    });

    res.json({
      ...result,
      generatedBy: 'ai-agent (gpt-5-nano)',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Clinical decision agent error:', error);
    
    // Check if this is a "not yet implemented" error
    if (error.message.includes('not yet implemented')) {
      return res.status(501).json({ 
        error: { 
          message: 'Clinical Decision Support Agent coming in Phase 4',
          details: 'Feature in development' 
        } 
      });
    }
    
    res.status(500).json({ 
      error: { 
        message: 'Failed to provide clinical recommendation', 
        details: error.message 
      } 
    });
  }
});

module.exports = router;
