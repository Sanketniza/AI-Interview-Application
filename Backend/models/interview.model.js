const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobRole: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    default: 'Practice Interview',
    trim: true
  },
  interviewType: {
    type: String,
    required: true,
    trim: true
  },
  // Array of questions generated for this interview
  questions: [String],
  // Detailed questions and answers during the interview
  questionsAndAnswers: [
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
  duration: {
    type: Number, // in milliseconds
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'cancelled'],
    default: 'in-progress'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date
}, { timestamps: true });

// Create indexes for better performance
interviewSchema.index({ user: 1 });
interviewSchema.index({ status: 1 });
interviewSchema.index({ company: 1, role: 1 });
interviewSchema.index({ createdAt: -1 });

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;
