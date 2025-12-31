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
    joint: {
      type: String,
      enum: ['shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle', 'cervicalSpine', 'lumbarSpine', 'thoracicSpine']
    },
    side: {
      type: String,
      enum: ['left', 'right', 'bilateral']
    },
    movement: String, // specific to joint (flexion, extension, etc.)
    measurement: {
      type: Number,
      min: 0,
      max: 360
    },
    normalRange: Number, // reference value for comparison
    painLevel: {
      type: Number,
      min: 0,
      max: 10
    },
    notes: String
  }],
  muscleStrength: [{
    muscleGroup: String, // e.g., 'shoulder flexors', 'knee extensors'
    region: {
      type: String,
      enum: ['shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle', 'neck', 'trunk']
    },
    side: {
      type: String,
      enum: ['left', 'right', 'bilateral']
    },
    grade: {
      type: String,
      enum: ['0', '1', '2-', '2', '2+', '3-', '3', '3+', '4-', '4', '4+', '5']
    },
    testPosition: {
      type: String,
      enum: ['supine', 'prone', 'sidelying', 'sitting', 'standing', 'gravityEliminated']
    },
    notes: String
  }],
  specialTests: [{
    testId: String, // reference to special-tests.js library
    testName: String,
    bodyRegion: String,
    side: {
      type: String,
      enum: ['left', 'right', 'bilateral']
    },
    result: {
      type: String,
      enum: ['positive', 'negative', 'inconclusive']
    },
    findings: String, // specific observations during test
    clinicalRelevance: String // what this indicates
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
  // Enhanced billing documentation
  billing: {
    diagnoses: [{
      icd10Code: String,
      description: String,
      isPrimary: { type: Boolean, default: false },
      onset: Date,
      status: {
        type: String,
        enum: ['acute', 'chronic', 'resolving', 'stable']
      }
    }],
    cptCodes: [{
      code: String,
      description: String,
      minutes: Number, // actual time spent
      units: Number, // billable units
      modifiers: [String], // e.g., ['GP'], ['59']
      notes: String
    }],
    totalMinutes: Number,
    totalUnits: Number,
    evaluationType: {
      type: String,
      enum: ['97161', '97162', '97163', '97164'] // low, mod, high complexity, re-eval
    }
  },
  // Legacy billing codes field (keep for backward compatibility)
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
