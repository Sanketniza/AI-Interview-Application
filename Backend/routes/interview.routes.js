const express = require('express');
const interviewController = require('../controllers/interview.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validateStartInterview, validateQuestionAnswer } = require('../middleware/validation.middleware');
const router = express.Router();

// Protect all routes with authentication
router.use(authMiddleware);

// Create a new interview
router.post('/', validateStartInterview, interviewController.startInterview);

// Generate questions for an interview
router.post('/:id/questions', interviewController.generateQuestions);

// Save question and answer to an interview
router.put('/:id/question', validateQuestionAnswer, interviewController.saveQuestionAnswer);

// Complete an interview
router.put('/:id/complete', interviewController.completeInterview);

// Get all interviews for current user
router.get('/', interviewController.getInterviews);

// Get a specific interview by ID
router.get('/:id', interviewController.getInterview);

// Delete an interview
router.delete('/:id', interviewController.deleteInterview);

module.exports = router;
