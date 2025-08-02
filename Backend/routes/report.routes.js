const express = require('express');
const reportController = require('../controllers/report.controller');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

// Protect all routes with authentication
router.use(authMiddleware);

// Generate a report for an interview
router.post('/:interviewId', reportController.generateReport);

// Get all reports for current user
router.get('/', reportController.getReports);

// Get a specific report by ID
router.get('/:id', reportController.getReport);

// Delete a report
router.delete('/:id', reportController.deleteReport);

module.exports = router;
