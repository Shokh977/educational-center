const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connection options
    const options = {
      // Removing deprecated options
      // serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true
    };

    // Parse connection string from environment variable
    const mongoURI = process.env.MONGODB_URI;
    
    // Connect to MongoDB with simplified connection string
    const conn = await mongoose.connect(mongoURI, options);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Set up connection event handlers
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error}`);
    // Log full error details for debugging
    console.error(error);
    // Instead of exiting, we'll throw the error to be handled by the caller
    throw error;
  }
};

module.exports = connectDB;
