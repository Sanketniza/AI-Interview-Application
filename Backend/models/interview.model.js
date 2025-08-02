const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  questions: [
    {
      question: {
        type: String,
        required: true
      },
      answer: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  feedback: {
    strengths: [String],
    weaknesses: [String],
    overallScore: {
      type: Number,
      min: 0,
      max: 10
    },
    recommendation: String,
    summary: String
  },
  duration: {
    type: Number,  // in minutes
    default: 0
  },
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'cancelled'],
    default: 'ongoing'
  },
  completedAt: Date
}, { timestamps: true });

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;
