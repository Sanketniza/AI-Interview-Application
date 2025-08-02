const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');
const { validateProfileUpdate, validateChangePassword } = require('../middleware/validation.middleware');

// Get user profile
router.get('/profile', auth, userController.getProfile);

// Update user profile
router.put('/profile', auth, validateProfileUpdate, userController.updateProfile);

// Change password
router.put('/change-password', auth, validateChangePassword, userController.changePassword);

module.exports = router;
