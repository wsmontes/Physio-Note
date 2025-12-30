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
    enum: ['initial-assessment', 'follow-up', 'discharge', 're-evaluation', 'maintenance'],
    default: 'follow-up'
  },
  chiefComplaint: {
    type: String
  },
  // SOAP Note Structure
  assessment: {
    subjective: String,
    objective: String,
    assessment: String,
    plan: String
  },
  // Physiotherapy-specific assessments
  rangeOfMotion: [{
    joint: String,
    movement: String,
    measurement: Number,
    unit: { type: String, default: 'degrees' },
    limitations: String
  }],
  strengthTest: [{
    muscle: String,
    grade: String, // 0-5 scale
    notes: String
  }],
  functionalTests: [{
    testName: String,
    result: String,
    score: Number,
    notes: String
  }],
  posturalAssessment: {
    findings: String,
    deviations: [String]
  },
  gaitAnalysis: {
    findings: String,
    abnormalities: [String]
  },
  // Treatment interventions
  treatments: [{
    name: String,
    description: String,
    sets: Number,
    reps: Number,
    duration: Number,
    intensity: String,
    frequency: String,
    response: String
  }],
  exercises: [{
    name: String,
    type: { type: String, enum: ['strengthening', 'stretching', 'balance', 'aerobic', 'functional'] },
    sets: Number,
    reps: Number,
    duration: Number,
    hold: Number,
    instructions: String,
    homeProgram: { type: Boolean, default: false }
  }],
  modalitiesUsed: [{
    type: { type: String },
    duration: Number,
    settings: String,
    area: String
  }],
  // Pain and progress tracking
  painScale: {
    current: { type: Number, min: 0, max: 10 },
    best: { type: Number, min: 0, max: 10 },
    worst: { type: Number, min: 0, max: 10 },
    location: String
  },
  progressNotes: {
    type: String
  },
  patientResponse: {
    type: String
  },
  goalsProgress: [{
    goal: String,
    status: { type: String, enum: ['not-started', 'in-progress', 'achieved', 'modified'] },
    notes: String
  }],
  // Voice transcription
  audioTranscription: {
    type: String
  },
  audioFileUrl: {
    type: String
  },
  // Follow-up
  nextAppointment: {
    type: Date
  },
  homeExerciseProgram: {
    type: String
  },
  billingCodes: [{
    code: String,
    description: String,
    units: Number
  }],
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);
