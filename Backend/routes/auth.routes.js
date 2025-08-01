const router = require('express').Router();
const authController = require('../controllers/auth.controller');

// Registration route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Email verification route
router.post('/verify-email', authController.verifyEmail);

// Request password reset route
router.post('/forgot-password', authController.forgotPassword);

// Reset password route
router.post('/reset-password', authController.resetPassword);

module.exports = router;
