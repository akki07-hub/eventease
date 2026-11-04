const mongoose = require('mongoose');

/**
 * Registration Schema
 * Represents a student's registration for a specific event.
 * Links Event and Student collections via ObjectIds.
 */
const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required']
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required']
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: {
        values: ['Registered', 'Cancelled'],
        message: '{VALUE} is not a valid status (must be Registered or Cancelled)'
      },
      default: 'Registered'
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure uniqueness per student and event
registrationSchema.index({ eventId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
