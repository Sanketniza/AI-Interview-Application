const Report = require('../models/report.model');
const Interview = require('../models/interview.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const emailUtil = require('../utils/email.util');

/**
 * Generate a report for an interview
 * @route POST /api/report/:interviewId
 * @access Private
 */
exports.generateReport = async (req, res) => {
  try {
    const { interviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID',
      });
    }

    // Check if the interview exists and belongs to the user
    const interview = await Interview.findById(interviewId);
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found',
      });
    }

    if (interview.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to generate report for this interview',
      });
    }

    // Check if interview is completed
    if (interview.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot generate report for incomplete interview',
      });
    }

    // Check if a report already exists
    const existingReport = await Report.findOne({ interview: interviewId });
    
    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'Report already exists for this interview',
        reportId: existingReport._id,
      });
    }

    // In a real application, here you would:
    // 1. Process the interview Q&A using AI
    // 2. Generate insights and feedback
    // For now, we'll create a simplified report structure

    // Generate mock scores and feedback
    const technicalScore = Math.floor(Math.random() * 41) + 60; // 60-100
    const communicationScore = Math.floor(Math.random() * 41) + 60;
    const problemSolvingScore = Math.floor(Math.random() * 41) + 60;
    const overallScore = Math.floor((technicalScore + communicationScore + problemSolvingScore) / 3);

    const newReport = new Report({
      user: req.user.id,
      interview: interviewId,
      jobRole: interview.jobRole,
      companyName: interview.companyName,
      overallScore,
      feedbackSummary: `Your overall performance was ${overallScore >= 80 ? 'excellent' : overallScore >= 70 ? 'good' : 'satisfactory'}.`,
      categoryScores: {
        technical: {
          score: technicalScore,
          feedback: `Your technical knowledge was ${technicalScore >= 80 ? 'strong' : technicalScore >= 70 ? 'adequate' : 'needs improvement'}.`,
        },
        communication: {
          score: communicationScore,
          feedback: `Your communication skills were ${communicationScore >= 80 ? 'excellent' : communicationScore >= 70 ? 'good' : 'need refinement'}.`,
        },
        problemSolving: {
          score: problemSolvingScore,
          feedback: `Your problem solving approach was ${problemSolvingScore >= 80 ? 'highly effective' : problemSolvingScore >= 70 ? 'adequate' : 'needs more structure'}.`,
        },
      },
      improvementAreas: [
        'Consider providing more specific examples',
        'Practice explaining complex concepts simply',
        'Work on structuring answers using the STAR method',
      ],
      strengths: [
        'Good technical foundation',
        'Ability to remain composed under pressure',
        'Clear communication style',
      ],
    });

    await newReport.save();

    // Update the interview with the report reference
    interview.report = newReport._id;
    await interview.save();

    // Get user email and send report email
    const user = await User.findById(req.user.id);
    if (user && user.email) {
      // Send email asynchronously - don't wait for it to complete
      emailUtil.sendReportEmail(user.email, newReport, interview)
        .then(success => {
          if (success) {
            console.log(`Report email sent successfully to ${user.email}`);
          }
        })
        .catch(err => console.error('Error sending report email:', err));
    }

    res.status(201).json({
      success: true,
      message: 'Report generated successfully',
      data: newReport,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message,
    });
  }
};

/**
 * Get all reports for the current user
 * @route GET /api/report
 * @access Private
 */
exports.getReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const reports = await Report.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('jobRole companyName overallScore createdAt');

    const total = await Report.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message,
    });
  }
};

/**
 * Get a single report by ID
 * @route GET /api/report/:id
 * @access Private
 */
exports.getReport = async (req, res) => {
  try {
    const reportId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID',
      });
    }

    const report = await Report.findById(reportId).populate('interview', 'jobRole companyName interviewType status createdAt');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    // Check if user owns this report
    if (report.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to access this report',
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report',
      error: error.message,
    });
  }
};

/**
 * Delete a report
 * @route DELETE /api/report/:id
 * @access Private
 */
exports.deleteReport = async (req, res) => {
  try {
    const reportId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID',
      });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    // Check if user owns this report
    if (report.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this report',
      });
    }

    // Update the related interview to remove report reference
    if (report.interview) {
      await Interview.findByIdAndUpdate(report.interview, { $unset: { report: 1 } });
    }

    // Delete the report
    await Report.findByIdAndDelete(reportId);

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting report',
      error: error.message,
    });
  }
};
