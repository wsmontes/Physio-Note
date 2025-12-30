const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
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
  type: {
    type: String,
    enum: ['soap', 'narrative', 'progress', 'discharge', 'other'],
    default: 'soap'
  },
  content: {
    type: String,
    required: true
  },
  transcription: {
    type: String // Original voice-to-text transcription
  },
  aiSuggestions: [{
    type: String
  }],
  tags: [{
    type: String
  }],
  isFinalized: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);
