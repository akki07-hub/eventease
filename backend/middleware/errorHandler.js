/**
 * Centralized Error Handling Middleware
 * Formats errors into clean, readable JSON responses for API consumers.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format for ${err.path}: ${err.value}`;
  }

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(', ');
  }

  // Handle MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const duplicateFields = Object.keys(err.keyValue || {}).join(', ');
    message = `Duplicate value entered for: ${duplicateFields}. Please use a unique value.`;
  }

  // Handle MongoDB Connection / ServerSelectionError
  if (err.name === 'MongooseServerSelectionError' || (err.message && err.message.includes('buffering timed out'))) {
    statusCode = 503;
    message = 'Database connection is currently unavailable. Please verify MongoDB is running or configure MONGODB_URI in backend/.env.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
