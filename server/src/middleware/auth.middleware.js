const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // For SSE connections, check query string (EventSource can't send custom headers)
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ error: { message: 'Not authorized, no token provided' } });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ error: { message: 'User not found' } });
    }

    if (!req.user.isActive) {
      return res.status(401).json({ error: { message: 'User account is inactive' } });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: { message: 'Not authorized, token failed' } });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: { message: 'Access denied: Admin only' } });
  }
};

module.exports = { protect, adminOnly };
