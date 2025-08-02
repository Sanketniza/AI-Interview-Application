// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({ message: 'Validation error', errors });
  }
  
  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({ message: 'Duplicate value entered' });
  }
  
  // JWT authentication error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid authentication token' });
  }
  
  // JWT token expired error
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Authentication token expired' });
  }
  
  // Default error handling
  res.status(err.statusCode || 500).json({
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
};

module.exports = errorHandler;
