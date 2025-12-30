const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  medicalHistory: {
    conditions: [String],
    allergies: [String],
    medications: [String],
    surgeries: [String]
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discharged'],
    default: 'active'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for searching
patientSchema.index({ firstName: 'text', lastName: 'text' });

module.exports = mongoose.model('Patient', patientSchema);
