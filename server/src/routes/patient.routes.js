const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Patient = require('../models/patient.model');

// @route   GET /api/patients
// @desc    Get all patients for logged-in therapist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const patients = await Patient.find({ therapistId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: { message: 'Error fetching patients' } });
  }
});

// @route   GET /api/patients/:id
// @desc    Get single patient
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      therapistId: req.user._id
    });

    if (!patient) {
      return res.status(404).json({ error: { message: 'Patient not found' } });
    }

    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: { message: 'Error fetching patient' } });
  }
});

// @route   POST /api/patients
// @desc    Create new patient
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const patient = await Patient.create({
      ...req.body,
      therapistId: req.user._id
    });

    res.status(201).json(patient);
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ error: { message: 'Error creating patient' } });
  }
});

// @route   PUT /api/patients/:id
// @desc    Update patient
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, therapistId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ error: { message: 'Patient not found' } });
    }

    res.json(patient);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: { message: 'Error updating patient' } });
  }
});

// @route   DELETE /api/patients/:id
// @desc    Delete patient
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({
      _id: req.params.id,
      therapistId: req.user._id
    });

    if (!patient) {
      return res.status(404).json({ error: { message: 'Patient not found' } });
    }

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: { message: 'Error deleting patient' } });
  }
});

module.exports = router;
