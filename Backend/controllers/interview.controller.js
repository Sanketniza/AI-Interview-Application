// Helper to always generate or update a report for an interview
async function generateOrUpdateReport(interview, userId) {
  const Report = require('../models/report.model');
  const interviewId = interview._id;
  const questionsAndAnswers = interview.questionsAndAnswers || [];


  // --- Enhanced feedback logic ---
  // Helper to analyze answer quality
  function analyzeAnswer(answer) {
    if (!answer || answer.trim().length < 10) return 'Needs Improvement';
    if (answer.length > 100 && /\b(result|impact|achieve|deliver|success|metric|quantify)\b/i.test(answer)) return 'Excellent';
    if (answer.length > 50) return 'Good';
    return 'Needs Improvement';
  }

  // Per-question feedback
  let improvementCount = 0, goodCount = 0, excellentCount = 0;
  const questionFeedback = questionsAndAnswers.map(qa => {
    const label = analyzeAnswer(qa.answer);
    if (label === 'Needs Improvement') improvementCount++;
    if (label === 'Good') goodCount++;
    if (label === 'Excellent') excellentCount++;
    return {
      question: qa.question,
      answer: qa.answer,
      feedback: label,
    };
  });

  // Dynamic strengths/areas for improvement
  let strengths = [], areasForImprovement = [];
  if (excellentCount > 0) strengths.push('Provided detailed and impactful answers.');
  if (goodCount > 0) strengths.push('Willingness to answer questions.');
  if (questionsAndAnswers.length > 0) strengths.push('Open to feedback.');

  if (improvementCount > 0) {
    areasForImprovement.push('Provide more detailed and specific answers to demonstrate your understanding and experience.');
    areasForImprovement.push('Use the STAR method (Situation, Task, Action, Result) to structure your responses for clarity and impact.');
    areasForImprovement.push('Quantify your achievements whenever possible to showcase the value you\'ve delivered in past projects.');
    if (interview.companyName) {
      areasForImprovement.push(`Research ${interview.companyName}\'s digital transformation initiatives to align your responses with their specific focus areas.`);
    }
  }

  // Scores (still random for now)
  const technicalScore = Math.floor(Math.random() * 31) + 70;
  const communicationScore = Math.floor(Math.random() * 31) + 70;
  const problemSolvingScore = Math.floor(Math.random() * 31) + 70;
  const overallScore = Math.floor((technicalScore + communicationScore + problemSolvingScore) / 3);

  const reportData = {
    user: userId,
    interview: interviewId,
    status: 'completed',
    overallScore,
    technicalSkills: {
      score: technicalScore,
      feedback: technicalScore >= 80 ? 'Strong technical foundation.' : 'Technical skills can be improved.'
    },
    communicationSkills: {
      score: communicationScore,
      feedback: communicationScore >= 80 ? 'Clear and effective communication.' : 'Work on structuring and clarifying your responses.'
    },
    problemSolvingSkills: {
      score: problemSolvingScore,
      feedback: problemSolvingScore >= 80 ? 'Excellent problem-solving approach.' : 'Try to break down problems more methodically.'
    },
    strengths,
    areasForImprovement,
    questionFeedback
  };

  let report = await Report.findOne({ interview: interviewId });
  if (!report) {
    report = new Report(reportData);
    await report.save();
  } else {
    report.set(reportData);
    await report.save();
  }
  return report;
}
const Interview = require('../models/interview.model');
const Report = require('../models/report.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const reportController = require('./report.controller');

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
    console.log(`Completing interview ${interviewId} for user ${req.user.id}`);
    interview.status = 'completed';
    interview.endTime = Date.now();
    interview.duration = interview.endTime - interview.createdAt;

    interview.reportStatus = 'pending';
    await interview.save();
    console.log(`Interview ${interviewId} successfully marked as completed`);

    // Always generate or update the report with content
    try {
      await generateOrUpdateReport(interview, req.user.id);
      interview.reportStatus = 'generated';
      await interview.save();
      console.log(`Report generated/updated successfully for interview ${interviewId}`);
    } catch (reportError) {
      console.error('Error generating report:', reportError);
      interview.reportStatus = 'failed';
      await interview.save();
    }

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
      .select('jobRole companyName interviewType status reportStatus createdAt endTime duration');

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
 * Generate questions for an interview
 * @route POST /api/interview/:id/questions
 * @access Private
 */
exports.generateQuestions = async (req, res) => {
  try {
    const interviewId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID',
      });
    }

    // Use findById to get interview and check permissions
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
        message: 'Unauthorized to access this interview',
      });
    }
    const domainType = interview.interviewType;
    const jobRole = interview.jobRole;
    let questions = [];
    try {
      const axios = require('axios');
      const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBEfC_-ySH9Thvssmcstn5leMPkjLgv3XU';
      if (!API_KEY) throw new Error('Gemini API key is not configured');
      console.log(`Generating questions for ${jobRole} position in ${domainType} field`);
      const prompt = `Generate 5 professional and diverse interview questions for a ${jobRole} position in the ${domainType} field.\nThese should be challenging questions that test the candidate's knowledge, experience, and problem-solving abilities.\nEnsure the questions are varied and not repetitive.\nReturn ONLY a JSON array of 5 strings containing questions, with no additional text, like this:\n[\"Question 1 text here?\", \"Question 2 text here?\", \"Question 3 text here?\", \"Question 4 text here?\", \"Question 5 text here?\"]`;
      console.log('Sending request to Gemini API...');
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 1024 }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': API_KEY
          }
        }
      );
      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) throw new Error('No content received from Gemini API');
      console.log('Raw response from Gemini:', responseText);
      try {
        if (responseText.trim().startsWith('[') && responseText.trim().endsWith(']')) {
          try {
            const parsedQuestions = JSON.parse(responseText.trim());
            if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
              questions = parsedQuestions;
              console.log('Successfully parsed questions as JSON array:', questions);
            }
          } catch (jsonError) {
            console.error('Failed to parse direct JSON response:', jsonError);
          }
        }
        if (questions.length === 0) {
          const jsonMatch = responseText.match(/\[([\s\S]*?)\]/);
          if (jsonMatch) {
            try {
              const jsonStr = `[${jsonMatch[1]}]`;
              const parsedQuestions = JSON.parse(jsonStr);
              if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
                questions = parsedQuestions;
                console.log('Successfully parsed embedded JSON array:', questions);
              }
            } catch (embeddedJsonError) {
              console.error('Failed to parse embedded JSON:', embeddedJsonError);
            }
          }
        }
        if (questions.length === 0) {
          questions = responseText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && line.length > 10 && !line.startsWith('```') && !line.startsWith('/*') && !line.startsWith('*') && !line.startsWith('//'))
            .map(line => line.replace(/^\d+[\.\)]\s*|^[-*•]\s*|^"|"$|^'|'$/g, '').trim());
          console.log('Parsed questions line by line:', questions);
        }
      } catch (parseError) {
        console.error('Error parsing Gemini API response:', parseError);
        throw new Error('Failed to parse AI response');
      }
    } catch (aiError) {
      console.error('Error generating questions with Gemini API:', aiError.message);
      console.error('Full error details:', JSON.stringify(aiError.response?.data || aiError, null, 2));
    }
    if (!questions || questions.length === 0) {
      console.log('Using complete set of fallback questions due to AI failure');
      questions = [
        `Tell me about your experience with ${jobRole} roles.`,
        `What are the key skills needed for a successful ${jobRole}?`,
        `Describe a challenging problem you solved in the ${domainType} field.`,
        `How do you stay updated with the latest trends in ${domainType}?`,
        `Where do you see yourself in 5 years in the ${domainType} industry?`
      ];
    } else if (questions.length < 5) {
      console.log(`Only received ${questions.length} questions from AI, adding fallback questions`);
      const fallbackQuestions = [
        `Tell me about your experience with ${jobRole} roles.`,
        `What are the key skills needed for a successful ${jobRole}?`,
        `Describe a challenging problem you solved in the ${domainType} field.`,
        `How do you stay updated with the latest trends in ${domainType}?`,
        `Where do you see yourself in 5 years in the ${domainType} industry?`
      ];
      for (let i = questions.length; i < 5; i++) {
        questions.push(fallbackQuestions[i - questions.length]);
      }
    } else if (questions.length > 5) {
      console.log(`Received ${questions.length} questions, limiting to 5`);
      questions = questions.slice(0, 5);
    }
    // Use findByIdAndUpdate for atomic update to avoid VersionError
    const updatedInterview = await Interview.findByIdAndUpdate(
      interviewId,
      { $set: { questions } },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: 'Questions generated successfully',
      data: {
        interviewId: updatedInterview._id,
        questions: updatedInterview.questions,
      },
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating questions',
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
