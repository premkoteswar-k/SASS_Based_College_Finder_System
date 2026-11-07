const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'College reference is required'],
    },
    name: {
      type: String,
      required: [true, 'Course name is required (e.g. Computer Science & Engineering)'],
      trim: true,
    },
    degree: {
      type: String,
      default: 'B.Tech',
      trim: true,
    },
    specialization: {
      type: String,
      trim: true,
      default: '',
    },
    duration: {
      type: String,
      default: '4 Years',
    },
    durationYears: {
      type: Number,
      default: 4,
    },
    intake: {
      type: Number,
      default: 60,
    },
    feePerYear: {
      type: Number,
      required: [true, 'Annual fee is required'],
    },
    eligibility: {
      type: String,
      default: '10+2 with Mathematics, Physics, and Chemistry (TS EAMCET qualified)',
    },
    examAccepted: {
      type: String,
      default: 'TS EAMCET / JEE Main',
    },
    description: {
      type: String,
      default: '',
    },
    approvedStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Course', courseSchema);

