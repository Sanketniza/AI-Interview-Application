const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { 
  validateRegister, 
  validateLogin, 
  validateEmailVerification, 
  validateForgotPassword, 
  validateResetPassword 
} = require('../middleware/validation.middleware');

// Registration route
router.post('/register', validateRegister, authController.register);

// Login route
router.post('/login', validateLogin, authController.login);

// Email verification route
router.post('/verify-email', validateEmailVerification, authController.verifyEmail);

// Request password reset route
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);

// Reset password route
router.post('/reset-password', validateResetPassword, authController.resetPassword);

module.exports = router;
