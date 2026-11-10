const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    summary: {
      type: String,
      required: [true, 'Event summary is required'],
      trim: true,
      maxlength: [300, 'Summary cannot exceed 300 characters'],
    },
    description: {
      type: String,
      required: [true, 'Full description is required'],
      trim: true,
    },
    bannerUrl: {
      type: String,
      required: [true, 'Banner image URL is required'],
      trim: true,
      default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    },
    startDate: {
      type: Date,
      required: [true, 'Event start date/time is required'],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, 'Event end date/time is required'],
    },
    format: {
      type: String,
      enum: {
        values: ['online', 'in-person'],
        message: 'Format must be either "online" or "in-person"',
      },
      required: [true, 'Event format is required'],
      default: 'in-person',
      index: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue address or online meeting link is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Technology', 'Design', 'Business', 'Marketing', 'Workshop', 'Conference', 'Other'],
        message: '{VALUE} is not a supported category',
      },
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    targetAudience: {
      type: String,
      required: [true, 'Target audience is required'],
      trim: true,
      default: 'Open to all interested participants',
    },
    registrationUrl: {
      type: String,
      required: [true, 'Registration URL is required'],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Event must have an assigned admin creator'],
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    bookings: [bookingSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound text index for fast search across title, summary, and tags
eventSchema.index(
  {
    title: 'text',
    summary: 'text',
    tags: 'text',
  },
  {
    weights: {
      title: 10,
      tags: 5,
      summary: 2,
    },
    name: 'EventTextSearchIndex',
  }
);

// Filtering indexes
eventSchema.index({ isActive: 1, status: 1, startDate: 1 });
eventSchema.index({ category: 1, format: 1, startDate: 1 });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
