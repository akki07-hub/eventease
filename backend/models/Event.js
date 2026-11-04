const mongoose = require('mongoose');

/**
 * Event Schema
 * Represents college events, workshops, cultural fests, seminars, and sports meets.
 */
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [3, 'Event title must be at least 3 characters long']
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Event category is required'],
      enum: {
        values: ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Academic', 'Other'],
        message: '{VALUE} is not a valid event category'
      },
      default: 'Technical'
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
      validate: {
        validator: function (val) {
          return val instanceof Date && !isNaN(val.getTime());
        },
        message: 'Invalid event date provided'
      }
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required (e.g. 10:00 AM)'],
      trim: true
    },
    endTime: {
      type: String,
      required: [true, 'End time is required (e.g. 01:00 PM)'],
      trim: true
    },
    capacity: {
      type: Number,
      required: [true, 'Event capacity is required'],
      min: [1, 'Capacity must be at least 1 seat']
    },
    organizer: {
      type: String,
      required: [true, 'Organizer name or department is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Virtual field or helper to format date
eventSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};

module.exports = mongoose.model('Event', eventSchema);
