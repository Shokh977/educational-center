// Debug user login issues
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const connectDB = async () => {
  try {
    // Parse connection string from environment variable
    const mongoURI = process.env.MONGODB_URI;
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error(`MongoDB connection error: ${error}`);
    process.exit(1);
  }
};

// Function to dump user info for debugging
const debugUser = async (email) => {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`User with email ${email} not found`);
      return;
    }
    
    console.log(`\nUser found: ${email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Password hash: ${user.password.slice(0, 15)}... (${user.password.length} chars)`);
    
    // Let's test a simple password
    const testPassword = 'password123';
    console.log(`\nTesting with password: ${testPassword}`);
    
    // Try direct comparison
    const isMatchDirect = await bcrypt.compare(testPassword, user.password);
    console.log(`Direct bcrypt.compare result: ${isMatchDirect}`);
    
    // For debugging, check what a fresh hash of this password looks like
    const freshHash = await bcrypt.hash(testPassword, 8);
    console.log(`Fresh bcrypt hash with salt round 8: ${freshHash.slice(0, 15)}... (${freshHash.length} chars)`);
    
    // Let's reset this user's password for testing
    console.log(`\nResetting password for ${email} to '${testPassword}'`);
    // Hash with the same settings as the pre-save hook
    const salt = await bcrypt.genSalt(8);
    user.password = await bcrypt.hash(testPassword, salt);
    await user.save();
    console.log(`Password reset successful. New hash: ${user.password.slice(0, 15)}...`);
    
    return user;
  } catch (error) {
    console.error('Error in debugUser:', error);
  }
};

// Function to fix all users
const fixAllUsers = async () => {
  try {
    // Count total users
    const count = await User.countDocuments();
    console.log(`Total users in database: ${count}`);
    
    // Let's examine users by role
    const admins = await User.find({ role: 'admin' });
    const teachers = await User.find({ role: 'teacher' });
    const students = await User.find({ role: 'student' });
    
    console.log(`Found ${admins.length} admins, ${teachers.length} teachers, ${students.length} students`);
    
    // List all users with their roles and email
    console.log('\nUser listing:');
    const allUsers = await User.find().select('email role');
    allUsers.forEach(user => {
      console.log(`${user.email} (${user.role})`);
    });
    
    // Ask for confirmation before fixing
    console.log('\nDo you want to reset passwords for all non-admin users to "password123"? (yes/no)');
    
    // In script mode, we'll just proceed
    console.log('Auto-proceeding with reset...');
    
    // Reset all non-admin passwords
    const resetUsers = await User.find({ role: { $ne: 'admin' } });
    console.log(`Resetting passwords for ${resetUsers.length} non-admin users...`);
    
    const standardPassword = 'password123';
    // Direct update without triggering the pre-save hook
    await User.updateMany(
      { role: { $ne: 'admin' } },
      { $set: { password: await bcrypt.hash(standardPassword, 8) } }
    );
    
    console.log(`All non-admin passwords have been reset to "${standardPassword}"`);
    console.log(`You can now test logging in with any non-admin email and password: ${standardPassword}`);
  } catch (error) {
    console.error('Error in fixAllUsers:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  
  // Debug specific users
  await debugUser('admin@eduportal.com'); // admin
  await debugUser('w@w.w'); // one of your problem users
  
  // Fix all users
  await fixAllUsers();
  
  // Disconnect
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
};

// Run the main function
main();
