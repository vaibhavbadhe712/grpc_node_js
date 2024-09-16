const jwt = require('jsonwebtoken');

// Utility for JWT Token Management
const jwtUtil = {
  generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  },
  
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
};

module.exports = jwtUtil;
