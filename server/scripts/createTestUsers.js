// Create test student and teacher accounts
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const createTestUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/educational-website');
        console.log('Connected to MongoDB');
        
        // Check if test accounts already exist
        const existingStudent = await User.findOne({ email: 'student@eduportal.com' });
        const existingTeacher = await User.findOne({ email: 'teacher@eduportal.com' });        
        // Create test accounts with known passwords
        const testPassword = 'Password123!';
        const hashedPassword = await bcrypt.hash(testPassword, 8); // Changed from 10 to 8 to match User model
        // Create student if doesn't exist
        if (!existingStudent) {
            const studentUser = new User({
                name: 'Test Student',
                email: 'student@eduportal.com',
                password: hashedPassword,
                role: 'student'
            });
            
            await studentUser.save();
            console.log('Test student account created successfully');
            console.log('Email: student@eduportal.com');
            console.log('Password: Password123!');
        } else {
            console.log('Test student account already exists');
            // Update password to known value
            existingStudent.password = hashedPassword;
            await existingStudent.save();
            console.log('Student password reset to: Password123!');
        }
        
        // Create teacher if doesn't exist
        if (!existingTeacher) {
            const teacherUser = new User({
                name: 'Test Teacher',
                email: 'teacher@eduportal.com',
                password: hashedPassword,
                role: 'teacher'
            });
            
            await teacherUser.save();
            console.log('Test teacher account created successfully');
            console.log('Email: teacher@eduportal.com');
            console.log('Password: Password123!');
        } else {
            console.log('Test teacher account already exists');
            // Update password to known value
            existingTeacher.password = hashedPassword;
            await existingTeacher.save();
            console.log('Teacher password reset to: Password123!');
        }
        
        console.log('\nYou can now use these test accounts to verify login functionality');
        
        // Disconnect from the database
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        
    } catch (error) {
        console.error('Error creating test accounts:', error);
    }
};

// Run the function
createTestUsers();
