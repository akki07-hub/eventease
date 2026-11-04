const mongoose = require('mongoose');

/**
 * Middleware to validate MongoDB ObjectId parameters
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid identifier format provided: '${id}'`
      });
    }
    next();
  };
};

module.exports = {
  validateObjectId
};
