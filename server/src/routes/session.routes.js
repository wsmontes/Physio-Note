const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Session = require('../models/session.model');
const Patient = require('../models/patient.model');
const Note = require('../models/note.model');

// @route   GET /api/sessions
// @desc    Get all sessions for logged-in therapist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ therapistId: req.user._id })
      .populate('patientId', 'firstName lastName')
      .sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: { message: 'Error fetching sessions' } });
  }
});

// @route   GET /api/sessions/patient/:patientId
// @desc    Get all sessions for a specific patient
// @access  Private
router.get('/patient/:patientId', protect, async (req, res) => {
  try {
    const sessions = await Session.find({
      patientId: req.params.patientId,
      therapistId: req.user._id
    })
      .populate('patientId', 'firstName lastName')
      .sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching patient sessions:', error);
    res.status(500).json({ error: { message: 'Error fetching patient sessions' } });
  }
});

// @route   GET /api/sessions/:id
// @desc    Get single session
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      therapistId: req.user._id
    }).populate('patientId', 'firstName lastName');

    if (!session) {
      return res.status(404).json({ error: { message: 'Session not found' } });
    }

    // Transform nested assessment to flat structure for client
    const sessionData = session.toObject();
    if (sessionData.assessment && typeof sessionData.assessment === 'object' && !Array.isArray(sessionData.assessment)) {
      sessionData.subjective = sessionData.assessment.subjective || '';
      sessionData.objective = sessionData.assessment.objective || '';
      const assessmentValue = sessionData.assessment.assessment || '';
      sessionData.plan = sessionData.assessment.plan || '';
      sessionData.assessment = assessmentValue;
    }

    res.json(sessionData);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: { message: 'Error fetching session' } });
  }
});

// @route   POST /api/sessions
// @desc    Create new session
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    // Verify patient belongs to therapist
    const patient = await Patient.findOne({
      _id: req.body.patientId,
      therapistId: req.user._id
    });

    if (!patient) {
      return res.status(404).json({ error: { message: 'Patient not found' } });
    }

    const session = await Session.create({
      ...req.body,
      therapistId: req.user._id
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: { message: 'Error creating session' } });
  }
});

// @route   PUT /api/sessions/:id
// @desc    Update session
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    console.log('Updating session:', req.params.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Transform SOAP fields if they exist as top-level properties
    const updateData = { ...req.body };
    if (req.body.subjective || req.body.objective || req.body.assessment || req.body.plan) {
      updateData.assessment = {
        subjective: req.body.subjective,
        objective: req.body.objective,
        assessment: req.body.assessment,
        plan: req.body.plan
      };
      // Remove the top-level SOAP fields
      delete updateData.subjective;
      delete updateData.objective;
      delete updateData.plan;
      // Keep req.body.assessment but it will be overwritten by the nested object
    }
    
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, therapistId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    ).populate('patientId', 'firstName lastName');

    if (!session) {
      return res.status(404).json({ error: { message: 'Session not found' } });
    }

    // Auto-create or update note if SOAP data exists
    if (session.assessment?.subjective || session.assessment?.objective || session.assessment?.assessment || session.assessment?.plan) {
      try {
        // Combine SOAP fields into content string
        const content = `SUBJECTIVE:\n${session.assessment.subjective || 'N/A'}\n\nOBJECTIVE:\n${session.assessment.objective || 'N/A'}\n\nASSESSMENT:\n${session.assessment.assessment || 'N/A'}\n\nPLAN:\n${session.assessment.plan || 'N/A'}`;
        
        const noteData = {
          patientId: session.patientId._id || session.patientId, // Handle populated or ID-only
          sessionId: session._id,
          therapistId: req.user._id,
          type: 'soap',
          content: content,
          transcription: session.audioTranscription || ''
        };

        // Check if note already exists for this session
        const existingNote = await Note.findOne({ sessionId: session._id });
        
        if (existingNote) {
          await Note.findByIdAndUpdate(existingNote._id, noteData);
        } else {
          await Note.create(noteData);
        }
      } catch (noteError) {
        console.error('Error creating/updating note:', noteError);
        // Don't fail the session update if note creation fails
      }
    }

    res.json(session);
  } catch (error) {
    console.error('Error updating session:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ error: { message: 'Error updating session', details: error.message } });
  }
});

// @route   DELETE /api/sessions/:id
// @desc    Delete session
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({
      _id: req.params.id,
      therapistId: req.user._id
    });

    if (!session) {
      return res.status(404).json({ error: { message: 'Session not found' } });
    }

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: { message: 'Error deleting session' } });
  }
});

module.exports = router;
