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
    console.log(`Completing interview ${interviewId} for user ${req.user.id}`);
    interview.status = 'completed';
    interview.endTime = Date.now();
    interview.duration = interview.endTime - interview.createdAt;

    await interview.save();
    console.log(`Interview ${interviewId} successfully marked as completed`);

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

    // Generate questions based on domain and role
    const domainType = interview.interviewType;
    const jobRole = interview.jobRole;
    
    let questions = [];
    
    try {
      // Try to generate questions using Gemini API
      const axios = require('axios');
      
      // Use environment variable or fallback to hardcoded key (not recommended for production)
      const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyD16ZU7DPoL7tRDDeu-ZtIH0PqAnTunoc8';
      
      if (!API_KEY) {
        throw new Error('Gemini API key is not configured');
      }
      
      // Logging the job role and domain for debugging
      console.log(`Generating questions for ${jobRole} position in ${domainType} field`);
      
      const prompt = `Generate 5 professional and diverse interview questions for a ${jobRole} position in the ${domainType} field. 
      These should be challenging questions that test the candidate's knowledge, experience, and problem-solving abilities.
      Ensure the questions are varied and not repetitive.
      Return ONLY a JSON array of 5 strings containing questions, with no additional text, like this:
      ["Question 1 text here?", "Question 2 text here?", "Question 3 text here?", "Question 4 text here?", "Question 5 text here?"]`;
      
      console.log('Sending request to Gemini API...');
      
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 1024
          }
        },
        {
          params: {
            key: API_KEY
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Parse the response
      console.log('Received response from Gemini API');
      
      if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
        console.error('Invalid response structure from Gemini API:', JSON.stringify(response.data, null, 2));
        throw new Error('Invalid response from Gemini API');
      }
      
      if (!responseText) {
        console.error('No response text received from Gemini API');
        throw new Error('No content received from Gemini API');
      }
      
      console.log('Raw response from Gemini:', responseText);
      
      // Try to extract JSON array from the text
      try {
        // First, check if the response is already a valid JSON array
        if (responseText.trim().startsWith('[') && responseText.trim().endsWith(']')) {
          try {
            const parsedQuestions = JSON.parse(responseText.trim());
            if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
              questions = parsedQuestions;
              console.log('Successfully parsed questions as JSON array:', questions);
            }
          } catch (jsonError) {
            console.error('Failed to parse direct JSON response:', jsonError);
            // Continue to next approach
          }
        }
        
        // If not parsed as JSON array yet, try to find JSON array in the text
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
              // Continue to next approach
            }
          }
        }
        
        // If still no questions, try line-by-line parsing
        if (questions.length === 0) {
          questions = responseText
            .split('\n')
            .map(line => line.trim())
            .filter(line => {
              // Filter out empty lines, code fence markers, and very short lines
              return line && 
                     line.length > 10 && 
                     !line.startsWith('```') && 
                     !line.startsWith('/*') && 
                     !line.startsWith('*') && 
                     !line.startsWith('//');
            })
            .map(line => {
              // Remove numbers, quotes, and other formatting
              return line.replace(/^\d+[\.\)]\s*|^[-*•]\s*|^"|"$|^'|'$/g, '').trim();
            });
          
          console.log('Parsed questions line by line:', questions);
        }
      } catch (parseError) {
        console.error('Error parsing Gemini API response:', parseError);
        throw new Error('Failed to parse AI response');
      }
    } catch (aiError) {
      console.error('Error generating questions with Gemini API:', aiError.message);
      console.error('Full error details:', JSON.stringify(aiError.response?.data || aiError, null, 2));
      // Fallback to default questions will happen below
    }
    
    // Use fallback questions if API call failed or didn't return valid questions
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
      // Add fallback questions if we don't have enough
      const fallbackQuestions = [
        `Tell me about your experience with ${jobRole} roles.`,
        `What are the key skills needed for a successful ${jobRole}?`,
        `Describe a challenging problem you solved in the ${domainType} field.`,
        `How do you stay updated with the latest trends in ${domainType}?`,
        `Where do you see yourself in 5 years in the ${domainType} industry?`
      ];
      
      // Add missing questions
      for (let i = questions.length; i < 5; i++) {
        questions.push(fallbackQuestions[i - questions.length]);
      }
    } else if (questions.length > 5) {
      console.log(`Received ${questions.length} questions, limiting to 5`);
      // Limit to 5 questions if we have more
      questions = questions.slice(0, 5);
    }
    
    // Update interview with generated questions
    console.log('Saving final set of questions:', questions);
    interview.questions = questions;
    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Questions generated successfully',
      data: {
        interviewId: interview._id,
        questions: interview.questions,
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
