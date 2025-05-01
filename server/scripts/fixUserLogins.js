// Fix user login issues
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// Reset all user passwords to a standard password
const resetAllPasswords = async () => {
  try {
    // Find all non-admin users
    const users = await User.find({ role: { $ne: 'admin' } });
    console.log(`Found ${users.length} non-admin users to reset`);
    
    let successCount = 0;
    
    // Set a standard password for all users
    const standardPassword = 'password123';
    
    // Update each user
    for (const user of users) {
      try {
        // Set the new password directly
        user.password = standardPassword; // Will be hashed by pre-save hook
        await user.save();
        console.log(`Reset password for ${user.email} (${user.role})`);
        successCount++;
      } catch (error) {
        console.error(`Failed to reset password for ${user.email}:`, error.message);
      }
    }
    
    console.log(`Successfully reset ${successCount} out of ${users.length} user passwords`);
    console.log(`All users can now log in with password: ${standardPassword}`);
    
    return true;
  } catch (error) {
    console.error('Error resetting passwords:', error);
    return false;
  }
};

// Display user info and status
const listUsers = async () => {
  try {
    const users = await User.find().select('name email role');
    console.log('\nUser listing:');
    users.forEach(user => {
      console.log(`${user.email} (${user.role}) - ${user.name}`);
    });
    return users.length;
  } catch (error) {
    console.error('Error listing users:', error);
    return 0;
  }
};

// Main function
const main = async () => {
  if (await connectDB()) {
    const count = await listUsers();
    console.log(`Total users: ${count}`);
    
    await resetAllPasswords();
    
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
main();
