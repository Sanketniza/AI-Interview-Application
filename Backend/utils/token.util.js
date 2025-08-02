const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for authentication
 * @param {Object} payload - Data to include in the token
 * @param {String} expiresIn - Token expiry (default: '1d')
 * @returns {String} JWT token
 */
exports.generateToken = (payload, expiresIn = '1d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn
  });
};

/**
 * Verify a JWT token
 * @param {String} token - The token to verify
 * @returns {Object|null} The decoded payload or null if invalid
 */
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Generate a reset password token
 * @param {Object} payload - Data to include in the token
 * @returns {String} JWT token with short expiry
 */
exports.generateResetToken = (payload) => {
  // Short expiry for password reset (1 hour)
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
};

/**
 * Generate an email verification token
 * @param {Object} payload - Data to include in the token
 * @returns {String} JWT token with short expiry
 */
exports.generateVerificationToken = (payload) => {
  // Short expiry for email verification (1 hour)
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
};
