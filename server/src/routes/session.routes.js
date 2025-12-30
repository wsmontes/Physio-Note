const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Session = require('../models/session.model');
const Patient = require('../models/patient.model');

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

    res.json(session);
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
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, therapistId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('patientId', 'firstName lastName');

    if (!session) {
      return res.status(404).json({ error: { message: 'Session not found' } });
    }

    res.json(session);
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: { message: 'Error updating session' } });
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
