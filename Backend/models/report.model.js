const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true
  },
  strengths: [String],
  areasForImprovement: [String],  // Changed from weaknesses to match frontend
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  technicalSkills: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    feedback: String
  },
  communicationSkills: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    feedback: String
  },
  problemSolvingSkills: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    feedback: String
  },
  questionFeedback: [
    {
      question: String,
      answer: String,
      feedback: String,
      score: {
        type: Number,
        min: 0,
        max: 100
      }
    }
  ],
  recommendations: String,
  summary: String,
  transcript: String
}, { timestamps: true });

// Create indexes for better performance
reportSchema.index({ user: 1 });
reportSchema.index({ interview: 1 }, { unique: true });
reportSchema.index({ createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
