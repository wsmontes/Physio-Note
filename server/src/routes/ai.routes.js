const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth.middleware');
const openaiService = require('../services/openai.service');

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

module.exports = router;
