// filepath: c:\Users\uphil\educational-website\server\scripts\resetAdminPassword.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('MongoDB URI:', process.env.MONGODB_URI || 'Not set');
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/educational-website';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return false;
  }
};

// Reset admin password directly in database
const resetAdminPassword = async () => {
  try {
    const connected = await connectDB();
    if (!connected) {
      console.error('Failed to connect to the database');
      return;
    }

    // Access the users collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Define admin email and new password
    const adminEmail = 'admin@eduportal.com';
    const newPassword = 'admin123'; // Simple password for testing
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update admin password directly in the database (bypass any model hooks)
    const result = await usersCollection.updateOne(
      { email: adminEmail },
      { 
        $set: { 
          password: hashedPassword,
          // Make sure role is set correctly
          role: 'admin',
          // Also ensure the account is active
          isActive: true
        }
      }
    );
    
    if (result.matchedCount === 0) {
      console.log(`No admin user found with email ${adminEmail}`);
      
      // Create admin user if not exists
      console.log('Creating new admin user...');
      
      const insertResult = await usersCollection.insertOne({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        createdAt: new Date()
      });
      
      if (insertResult.acknowledged) {
        console.log('✅ Admin user created successfully');
      } else {
        console.log('❌ Failed to create admin user');
      }
    } else if (result.modifiedCount > 0) {
      console.log(`✅ Admin password updated successfully`);
    } else {
      console.log(`⚠️ Admin user found but password was not changed (might be the same password)`);
    }
    
    // Verify the admin account
    const admin = await usersCollection.findOne({ email: adminEmail });
    
    if (admin) {
      console.log('\n----- ADMIN ACCOUNT INFO -----');
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Password hash:', admin.password.substring(0, 15) + '...');
      
      // Test password verification
      const testPassword = 'admin123';
      const isMatch = await bcrypt.compare(testPassword, admin.password);
      console.log('Password verification test:', isMatch ? '✅ PASS' : '❌ FAIL');
      
      console.log('\n----- LOGIN CREDENTIALS -----');
      console.log('Email: admin@eduportal.com');
      console.log('Password: admin123');
    } else {
      console.log('❌ Admin user not found after update/creation');
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error resetting admin password:', error);
  }
};

// Run the function
resetAdminPassword().catch(err => {
  console.error('Unhandled error in script:', err);
  process.exit(1);
});
