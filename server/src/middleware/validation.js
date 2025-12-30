const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation middleware to check for validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array(),
      },
    });
  }
  next();
};

/**
 * Validation rules for different resources
 */

// Patient validation
const patientValidation = {
  create: [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('phone').optional().matches(/^[\d\s\-\(\)\+]+$/).withMessage('Invalid phone format'),
    body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
    body('gender').optional().isIn(['male', 'female', 'other', '']).withMessage('Invalid gender'),
    validate,
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid patient ID'),
    body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('phone').optional().matches(/^[\d\s\-\(\)\+]+$/).withMessage('Invalid phone format'),
    body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
    body('gender').optional().isIn(['male', 'female', 'other', '']).withMessage('Invalid gender'),
    validate,
  ],
  getById: [
    param('id').isMongoId().withMessage('Invalid patient ID'),
    validate,
  ],
};

// Session validation
const sessionValidation = {
  create: [
    body('patientId').isMongoId().withMessage('Invalid patient ID'),
    body('type').isIn(['initial', 'follow-up', 're-evaluation']).withMessage('Invalid session type'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('duration').optional().isInt({ min: 1, max: 480 }).withMessage('Duration must be between 1 and 480 minutes'),
    validate,
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid session ID'),
    body('subjective').optional().isString().withMessage('Subjective must be a string'),
    body('objective').optional().isString().withMessage('Objective must be a string'),
    body('assessment').optional().isString().withMessage('Assessment must be a string'),
    body('plan').optional().isString().withMessage('Plan must be a string'),
    body('status').optional().isIn(['scheduled', 'in-progress', 'completed', 'cancelled']).withMessage('Invalid status'),
    validate,
  ],
  getById: [
    param('id').isMongoId().withMessage('Invalid session ID'),
    validate,
  ],
};

// Note validation
const noteValidation = {
  create: [
    body('sessionId').isMongoId().withMessage('Invalid session ID'),
    body('type').isIn(['soap', 'progress', 'discharge', 'other']).withMessage('Invalid note type'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    validate,
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid note ID'),
    body('content').optional().trim().notEmpty().withMessage('Content cannot be empty'),
    validate,
  ],
  getById: [
    param('id').isMongoId().withMessage('Invalid note ID'),
    validate,
  ],
};

// Auth validation
const authValidation = {
  register: [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    validate,
  ],
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
};

module.exports = {
  validate,
  patientValidation,
  sessionValidation,
  noteValidation,
  authValidation,
};
