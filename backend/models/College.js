const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: [true, 'College code is required (e.g., VGNT)'],
      trim: true,
      uppercase: true,
      unique: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
      default: '',
    },
    about: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'Engineering',
      trim: true,
    },
    type: {
      type: String,
      enum: ['Autonomous', 'University College', 'Affiliated', 'Private', 'Government'],
      default: 'Affiliated',
    },
    affiliation: {
      type: String,
      default: 'Jawaharlal Nehru Technological University Hyderabad (JNTUH)',
    },
    accreditation: {
      type: [String],
      default: [],
    },
    establishmentYear: {
      type: Number,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    state: {
      type: String,
      default: 'Telangana',
    },
    city: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    pincode: {
      type: String,
      default: '',
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    bannerImage: {
      type: String,
      default: '',
    },
    campusImages: {
      type: [String],
      default: [],
    },
    facilities: {
      type: [String],
      default: ['Library', 'Laboratories', 'Sports Complex', 'Wi-Fi Campus', 'Cafeteria', 'Auditorium', 'Placement Cell'],
    },
    approvedStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    placementStats: {
      highestPackage: { type: Number, default: 0 }, // in LPA
      averagePackage: { type: Number, default: 0 }, // in LPA
      placementPercentage: { type: Number, default: 0 },
      topRecruiters: { type: [String], default: [] },
    },
    collegeAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug before save
collegeSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

module.exports = mongoose.model('College', collegeSchema);

