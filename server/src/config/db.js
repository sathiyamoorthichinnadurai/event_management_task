const mongoose = require('mongoose');

/**
 * Connect to MongoDB instance using Mongoose.
 * Connects to process.env.MONGODB_URI or default local URI.
 * Strictly sanitizes logs to ensure no passwords or credentials are ever exposed.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[MongoDB] Database connection established successfully.`);
    return conn;
  } catch (error) {
    // Never log raw connection URI or error messages that might contain embedded credentials
    console.error('[MongoDB Error] Failed to connect to database. Please verify MONGODB_URI configuration.');
    throw new Error('Database connection failed');
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
};

module.exports = { connectDB, disconnectDB };
