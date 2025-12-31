/**
 * Test application setup
 * Creates a minimal Express app for testing without starting the server
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import routes
const authRoutes = require('../src/routes/auth.routes');
const patientRoutes = require('../src/routes/patient.routes');
const sessionRoutes = require('../src/routes/session.routes');
const noteRoutes = require('../src/routes/note.routes');
const aiRoutes = require('../src/routes/ai.routes');
const templateRoutes = require('../src/routes/template.routes');

// Import error handler
const { errorHandler } = require('../src/middleware/errorHandler');

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/templates', templateRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
