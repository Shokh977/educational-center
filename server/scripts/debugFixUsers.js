// Debug user accounts and fix password issue
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const debugAndFixUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/educational-website');
        console.log('Connected to MongoDB');
        
        // Find our test accounts
        const student = await User.findOne({ email: 'student@eduportal.com' });
        const teacher = await User.findOne({ email: 'teacher@eduportal.com' });
        
        console.log('\n----- CURRENT USER DATA -----');
        
        if (student) {
            console.log('Student account found:');
            console.log('- Email:', student.email);
            console.log('- Password hash length:', student.password.length);
            console.log('- Role:', student.role);
        } else {
            console.log('Student account not found');
        }
        
        if (teacher) {
            console.log('\nTeacher account found:');
            console.log('- Email:', teacher.email);
            console.log('- Password hash length:', teacher.password.length);
            console.log('- Role:', teacher.role);
        } else {
            console.log('\nTeacher account not found');
        }
        
        // Create new plaintext password
        const plainPassword = 'Test123456';
        
        // Hash the password the same way the login route will check it
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        
        console.log('\n----- FIXING USER ACCOUNTS -----');
        console.log('Using direct database update to bypass pre-save hooks');
        
        // Update student account with direct database operation
        if (student) {
            const result = await User.updateOne(
                { _id: student._id },
                { $set: { password: hashedPassword } }
            );
            
            console.log('Student password updated:', result.modifiedCount === 1 ? 'Success' : 'Failed');
        }
        
        // Update teacher account with direct database operation
        if (teacher) {
            const result = await User.updateOne(
                { _id: teacher._id },
                { $set: { password: hashedPassword } }
            );
            
            console.log('Teacher password updated:', result.modifiedCount === 1 ? 'Success' : 'Failed');
        }
        
        console.log('\n----- TEST THESE CREDENTIALS -----');
        console.log('Student: student@eduportal.com / Test123456');
        console.log('Teacher: teacher@eduportal.com / Test123456');
        
        // Verify the updates worked
        console.log('\n----- VERIFYING UPDATES -----');
        
        const updatedStudent = await User.findOne({ email: 'student@eduportal.com' });
        const updatedTeacher = await User.findOne({ email: 'teacher@eduportal.com' });
        
        if (updatedStudent) {
            console.log('Student password hash updated. New length:', updatedStudent.password.length);
            
            // Test if bcrypt.compare would work with this hash
            const studentMatch = await bcrypt.compare(plainPassword, updatedStudent.password);
            console.log('Password verification test:', studentMatch ? 'PASS' : 'FAIL');
        }
        
        if (updatedTeacher) {
            console.log('\nTeacher password hash updated. New length:', updatedTeacher.password.length);
            
            // Test if bcrypt.compare would work with this hash
            const teacherMatch = await bcrypt.compare(plainPassword, updatedTeacher.password);
            console.log('Password verification test:', teacherMatch ? 'PASS' : 'FAIL');
        }
        
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
        
    } catch (error) {
        console.error('Error debugging/fixing user accounts:', error);
    }
};

// Run the function
debugAndFixUsers();
