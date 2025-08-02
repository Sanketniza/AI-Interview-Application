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
  weaknesses: [String],
  overallScore: {
    type: Number,
    min: 0,
    max: 10
  },
  technicalSkills: {
    score: {
      type: Number,
      min: 0,
      max: 10
    },
    feedback: String
  },
  communicationSkills: {
    score: {
      type: Number,
      min: 0,
      max: 10
    },
    feedback: String
  },
  problemSolvingSkills: {
    score: {
      type: Number,
      min: 0,
      max: 10
    },
    feedback: String
  },
  recommendations: String,
  summary: String,
  transcript: String
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
