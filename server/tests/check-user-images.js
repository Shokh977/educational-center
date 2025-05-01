const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/educational-website';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
}

// Check user profile images
async function checkUserProfileImages() {
  try {
    await connectDB();
    
    // Find all users
    const users = await User.find().select('name email profileImage');
    
    console.log(`Found ${users.length} users in the database\n`);
    
    // Check each user for profile image
    users.forEach((user, index) => {
      console.log(`User ${index + 1}: ${user.name} (${user.email})`);
      if (user.profileImage) {
        console.log(`✅ Has profile image: ${user.profileImage}`);
      } else {
        console.log('❌ No profile image set');
      }
      console.log('---');
    });
    
    // Count users with profile images
    const usersWithImages = users.filter(user => user.profileImage);
    console.log(`\nSummary: ${usersWithImages.length} out of ${users.length} users have profile images set.`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error checking user profile images:', error);
  }
}

// Run the check
checkUserProfileImages();
