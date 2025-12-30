const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  type: {
    type: String,
    enum: ['initial-assessment', 'follow-up', 'discharge', 'other'],
    default: 'follow-up'
  },
  chiefComplaint: {
    type: String
  },
  assessment: {
    subjective: String,
    objective: String,
    assessment: String,
    plan: String
  },
  treatments: [{
    name: String,
    description: String,
    sets: Number,
    reps: Number,
    duration: Number
  }],
  progressNotes: {
    type: String
  },
  painScale: {
    type: Number,
    min: 0,
    max: 10
  },
  nextAppointment: {
    type: Date
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);
