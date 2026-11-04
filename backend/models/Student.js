const mongoose = require('mongoose');

/**
 * Student Schema
 * Represents college students participating in events.
 */
const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      minlength: [2, 'Student name must be at least 2 characters long']
    },
    rollNo: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    branch: {
      type: String,
      required: [true, 'Branch / Department is required'],
      trim: true
    },
    year: {
      type: String,
      required: [true, 'Academic year is required'],
      enum: {
        values: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
        message: '{VALUE} is not a valid academic year'
      }
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[0-9]{10}$/, 'Phone number must be a 10-digit number']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Student', studentSchema);
