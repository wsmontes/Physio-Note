const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/user.model');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, licenseNumber, specialty, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: { message: 'User already exists' } });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      licenseNumber,
      specialty,
      phone
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: { message: 'Server error during registration', details: error.message } });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ error: { message: 'Invalid email or password' } });
    }
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: { message: 'Server error during login', details: error.message } });
  }
});

module.exports = router;
