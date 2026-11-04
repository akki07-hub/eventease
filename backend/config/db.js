const mongoose = require('mongoose');

/**
 * Connect to MongoDB using Mongoose.
 * Centralized database connection logic with proper event logging.
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventease';
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`[EventEase Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[EventEase Database Error] Failed to connect to MongoDB: ${error.message}`);
    console.warn(`[EventEase Database Tip] Make sure MongoDB is running locally (e.g., mongod or MongoDB Compass) or update MONGODB_URI in backend/.env to your MongoDB Atlas connection string.`);
  }
};

module.exports = connectDB;
