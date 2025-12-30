const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Note = require('../models/note.model');
const Session = require('../models/session.model');

// @route   GET /api/notes
// @desc    Get all notes for logged-in therapist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const notes = await Note.find({ therapistId: req.user._id })
      .populate('patientId', 'firstName lastName')
      .populate('sessionId', 'date type')
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: { message: 'Error fetching notes' } });
  }
});

// @route   GET /api/notes/session/:sessionId
// @desc    Get all notes for a specific session
// @access  Private
router.get('/session/:sessionId', protect, async (req, res) => {
  try {
    const notes = await Note.find({
      sessionId: req.params.sessionId,
      therapistId: req.user._id
    })
      .populate('patientId', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Error fetching session notes:', error);
    res.status(500).json({ error: { message: 'Error fetching session notes' } });
  }
});

// @route   GET /api/notes/:id
// @desc    Get single note
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      therapistId: req.user._id
    })
      .populate('patientId', 'firstName lastName')
      .populate('sessionId', 'date type');

    if (!note) {
      return res.status(404).json({ error: { message: 'Note not found' } });
    }

    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: { message: 'Error fetching note' } });
  }
});

// @route   POST /api/notes
// @desc    Create new note
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    // Verify session belongs to therapist
    const session = await Session.findOne({
      _id: req.body.sessionId,
      therapistId: req.user._id
    });

    if (!session) {
      return res.status(404).json({ error: { message: 'Session not found' } });
    }

    const note = await Note.create({
      ...req.body,
      therapistId: req.user._id,
      patientId: session.patientId
    });

    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: { message: 'Error creating note' } });
  }
});

// @route   PUT /api/notes/:id
// @desc    Update note
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, therapistId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('patientId', 'firstName lastName')
      .populate('sessionId', 'date type');

    if (!note) {
      return res.status(404).json({ error: { message: 'Note not found' } });
    }

    res.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: { message: 'Error updating note' } });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete note
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      therapistId: req.user._id
    });

    if (!note) {
      return res.status(404).json({ error: { message: 'Note not found' } });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: { message: 'Error deleting note' } });
  }
});

module.exports = router;
