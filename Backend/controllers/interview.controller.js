const Interview = require('../models/interview.model');
const Report = require('../models/report.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

/**
 * Start a new interview session
 * @route POST /api/interview
 * @access Private
 */
exports.startInterview = async (req, res) => {
  try {
    const { jobRole, companyName, interviewType } = req.body;

    if (!jobRole || !interviewType) {
      return res.status(400).json({
        success: false,
        message: 'Job role and interview type are required',
      });
    }

    const newInterview = new Interview({
      user: req.user.id,
      jobRole,
      companyName,
      interviewType,
      status: 'in-progress',
    });

    await newInterview.save();

    res.status(201).json({
      success: true,
      message: 'Interview session created',
      data: newInterview,
    });
  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting interview session',
      error: error.message,
    });
  }
};

/**
 * Save interview question and answer
 * @route PUT /api/interview/:id/question
 * @access Private
 */
exports.saveQuestionAnswer = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const interviewId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID',
      });
    }

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Question and answer are required',
      });
    }

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    // Check if user owns this interview
    if (interview.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to access this interview',
      });
    }

    // Add new question and answer
    interview.questionsAndAnswers.push({
      question,
      answer,
      timestamp: Date.now(),
    });

    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Question and answer saved',
      data: interview,
    });
  } catch (error) {
    console.error('Error saving question and answer:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving question and answer',
      error: error.message,
    });
  }
};

/**
 * Complete interview session
 * @route PUT /api/interview/:id/complete
 * @access Private
 */
exports.completeInterview = async (req, res) => {
  try {
    const interviewId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID',
      });
    }

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    // Check if user owns this interview
    if (interview.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to access this interview',
      });
    }

    // Update interview status to completed
    interview.status = 'completed';
    interview.endTime = Date.now();
    interview.duration = interview.endTime - interview.createdAt;

    await interview.save();

    // Here you would typically trigger report generation
    // This could be a background process in a production app

    res.status(200).json({
      success: true,
      message: 'Interview completed',
      data: {
        interviewId: interview._id,
        status: interview.status,
        duration: interview.duration,
      },
    });
  } catch (error) {
    console.error('Error completing interview:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing interview session',
      error: error.message,
    });
  }
};

/**
 * Get all interviews for the current user
 * @route GET /api/interview
 * @access Private
 */
exports.getInterviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const interviews = await Interview.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('jobRole companyName interviewType status createdAt endTime duration');

    const total = await Interview.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      data: interviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching interviews',
      error: error.message,
    });
  }
};

/**
 * Get a single interview by ID
 * @route GET /api/interview/:id
 * @access Private
 */
exports.getInterview = async (req, res) => {
  try {
    const interviewId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID',
      });
    }

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    // Check if user owns this interview
    if (interview.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to access this interview',
      });
    }

    res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    console.error('Error fetching interview:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching interview',
      error: error.message,
    });
  }
};

/**
 * Delete an interview
 * @route DELETE /api/interview/:id
 * @access Private
 */
exports.deleteInterview = async (req, res) => {
  try {
    const interviewId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID',
      });
    }

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    // Check if user owns this interview
    if (interview.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this interview',
      });
    }

    // Delete related reports first
    await Report.deleteMany({ interview: interviewId });
    
    // Delete the interview
    await Interview.findByIdAndDelete(interviewId);

    res.status(200).json({
      success: true,
      message: 'Interview and related reports deleted',
    });
  } catch (error) {
    console.error('Error deleting interview:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting interview',
      error: error.message,
    });
  }
};
