const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating between 1 and 5 is required'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
    },
    comment: {
      type: String,
      required: [true, 'Review content is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
  },
  {
    timestamps: true,
  }
);

// Update college rating aggregate on review save/remove
reviewSchema.statics.calculateAverageRating = async function (collegeId) {
  const stats = await this.aggregate([
    { $match: { college: collegeId, status: 'approved' } },
    {
      $group: {
        _id: '$college',
        avgRating: { $avg: '$rating' },
        reviewsCount: { $sum: 1 },
      },
    },
  ]);

  const College = mongoose.model('College');
  if (stats.length > 0) {
    await College.findByIdAndUpdate(collegeId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewsCount: stats[0].reviewsCount,
    });
  } else {
    await College.findByIdAndUpdate(collegeId, {
      rating: 0,
      reviewsCount: 0,
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.college);
});

module.exports = mongoose.model('Review', reviewSchema);

