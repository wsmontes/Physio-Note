const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['soap', 'progress', 'evaluation', 'discharge', 'custom'],
    default: 'soap'
  },
  structure: {
    sections: [{
      name: {
        type: String,
        required: true
      },
      label: {
        type: String,
        required: true
      },
      placeholder: String,
      defaultContent: String,
      order: Number,
      required: {
        type: Boolean,
        default: false
      }
    }]
  },
  promptInstructions: {
    type: String,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  specialty: {
    type: String,
    enum: ['general', 'orthopedic', 'sports', 'neurological', 'pediatric', 'geriatric', 'cardiopulmonary'],
    default: 'general'
  },
  tags: [String],
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
templateSchema.index({ userId: 1, name: 1 });
templateSchema.index({ isPublic: 1, specialty: 1 });

module.exports = mongoose.model('Template', templateSchema);
