const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

const createAdminUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/educational-website');
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@eduportal.com' });
        
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create admin user
        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@eduportal.com',
            password: 'admin123456', // Change this in production
            role: 'admin'
        });

        await adminUser.save();
        console.log('Admin user created successfully');
        console.log('Email: admin@eduportal.com');
        console.log('Password: admin123456');
        console.log('Please change the password after first login');
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await mongoose.connection.close();
    }
};

createAdminUser();