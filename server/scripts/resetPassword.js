// resetPassword.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import the User model
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Reset password function
const resetPassword = async (email, newPassword) => {
  try {
    // Find the user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`User with email ${email} not found`);
      return false;
    }
    
    // Update the user's password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();
    
    console.log(`Password for ${email} has been updated successfully`);
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    return false;
  }
};

// Main function
const main = async () => {
  await connectDB();
  
  // Change these values to reset the password
  const email = 'w@w.w';
  const newPassword = 'wwwwww';
  
  await resetPassword(email, newPassword);
  
  // Disconnect from MongoDB
  mongoose.disconnect();
  console.log('Disconnected from MongoDB');
};

// Run the main function
main();
