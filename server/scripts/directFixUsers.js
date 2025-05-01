// Fix login issues with direct database updates
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

// Direct connection to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/educational-website';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB directly');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// Fix the users without using the User model
const fixUsersDirectly = async () => {
  try {
    await connectDB();
    
    // Access the users collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Create test password with bcrypt
    console.log('Generating test password hash...');
    const testPassword = 'Password123!';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    // Update student account directly in the database
    console.log('Updating student account...');
    const studentResult = await usersCollection.updateOne(
      { email: 'student@eduportal.com' },
      { 
        $set: { 
          password: hashedPassword,
          name: 'Test Student',
          role: 'student'
        },
        $setOnInsert: {
          email: 'student@eduportal.com',
          createdAt: new Date(),
          isActive: true
        }
      },
      { upsert: true }
    );
    
    if (studentResult.modifiedCount > 0 || studentResult.upsertedCount > 0) {
      console.log('✅ Student account fixed successfully');
    } else {
      console.log('⚠️ Student account was found but not modified');
    }
    
    // Update teacher account directly in the database
    console.log('Updating teacher account...');
    const teacherResult = await usersCollection.updateOne(
      { email: 'teacher@eduportal.com' },
      { 
        $set: { 
          password: hashedPassword,
          name: 'Test Teacher',
          role: 'teacher'
        },
        $setOnInsert: {
          email: 'teacher@eduportal.com',
          createdAt: new Date(),
          isActive: true
        }
      },
      { upsert: true }
    );
    
    if (teacherResult.modifiedCount > 0 || teacherResult.upsertedCount > 0) {
      console.log('✅ Teacher account fixed successfully');
    } else {
      console.log('⚠️ Teacher account was found but not modified');
    }
    
    // Verify the updates by getting the users
    const student = await usersCollection.findOne({ email: 'student@eduportal.com' });
    const teacher = await usersCollection.findOne({ email: 'teacher@eduportal.com' });
    
    console.log('\nVerification:');
    console.log('Student account exists:', !!student);
    console.log('Teacher account exists:', !!teacher);
    
    // Test password verification
    console.log('\nTesting password verification:');
    if (student) {
      const studentMatch = await bcrypt.compare(testPassword, student.password);
      console.log('Student password verification:', studentMatch ? '✅ Works' : '❌ Failed');
    }
    
    if (teacher) {
      const teacherMatch = await bcrypt.compare(testPassword, teacher.password);
      console.log('Teacher password verification:', teacherMatch ? '✅ Works' : '❌ Failed');
    }
    
    console.log('\n📝 Login credentials:');
    console.log('Student: student@eduportal.com / Password123!');
    console.log('Teacher: teacher@eduportal.com / Password123!');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Error fixing users:', error);
  }
};

// Run the function
fixUsersDirectly();
