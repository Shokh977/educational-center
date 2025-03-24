const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Course = require('../models/Course');
const User = require('../models/User');
const SuccessStory = require('../models/SuccessStory');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Sample course data
const coursesData = [
  {
    title: 'Introduction to English Grammar',
    description: 'A comprehensive introduction to English grammar rules and usage for beginners.',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&h=400&q=80',
    price: 49.99,
    duration: '8 weeks',
    level: 'beginner',
    category: 'English Language',
    rating: 4.7,
    students: 1243,
    featured: true,
    status: 'active'
  },
  {
    title: 'Advanced English Conversation',
    description: 'Take your English speaking skills to the next level with advanced conversation techniques.',
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&h=400&q=80',
    price: 69.99,
    duration: '10 weeks',
    level: 'advanced',
    category: 'English Language',
    rating: 4.9,
    students: 876,
    featured: true,
    status: 'active'
  },
  {
    title: 'IELTS Preparation Course',
    description: 'Comprehensive preparation for all sections of the IELTS exam with practice tests.',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&h=400&q=80',
    price: 89.99,
    duration: '12 weeks',
    level: 'intermediate',
    category: 'English Language',
    rating: 4.8,
    students: 1567,
    featured: true,
    status: 'active'
  },
  {
    title: 'Business English for Professionals',
    description: 'Learn essential English vocabulary and communication skills for business environments.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&h=400&q=80',
    price: 79.99,
    duration: '8 weeks',
    level: 'intermediate',
    category: 'Business English',
    rating: 4.6,
    students: 923,
    featured: true,
    status: 'active'
  },
  {
    title: 'Korean for Beginners',
    description: 'Start your journey to learn Korean language with this beginner-friendly course.',
    image: 'https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7?auto=format&fit=crop&w=600&h=400&q=80',
    price: 59.99,
    duration: '10 weeks',
    level: 'beginner',
    category: 'Korean Language',
    rating: 4.5,
    students: 752,
    featured: true,
    status: 'active'
  },
  {
    title: 'Japanese Language Essentials',
    description: 'Master the basics of Japanese language including speaking, reading, and writing.',
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&h=400&q=80',
    price: 64.99,
    duration: '12 weeks',
    level: 'beginner',
    category: 'Japanese Language',
    rating: 4.7,
    students: 654,
    featured: true,
    status: 'active'
  },
  {
    title: 'Spanish for Travelers',
    description: 'Learn essential Spanish phrases and vocabulary for travel and basic conversations.',
    image: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&h=400&q=80',
    price: 49.99,
    duration: '6 weeks',
    level: 'beginner',
    category: 'Spanish Language',
    rating: 4.6,
    students: 845,
    featured: false,
    status: 'active'
  },
  {
    title: 'Intermediate Spanish Grammar',
    description: 'Expand your Spanish grammar knowledge and vocabulary with this comprehensive course.',
    image: 'https://images.unsplash.com/photo-1490131784822-b4626a8ec96a?auto=format&fit=crop&w=600&h=400&q=80',
    price: 69.99,
    duration: '10 weeks',
    level: 'intermediate',
    category: 'Spanish Language',
    rating: 4.7,
    students: 612,
    featured: false,
    status: 'active'
  }
];

// Sample teacher data
const teachersData = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@example.com',
    password: 'password123',
    role: 'teacher',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    title: 'Senior English Instructor',
    department: 'English Language',
    featured: true
  },
  {
    name: 'Prof. David Kim',
    email: 'david.kim@example.com',
    password: 'password123',
    role: 'teacher',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    title: 'Korean Language Expert',
    department: 'Asian Languages',
    featured: true
  },
  {
    name: 'Dr. Mei Li',
    email: 'mei.li@example.com',
    password: 'password123',
    role: 'teacher',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80',
    title: 'Test Preparation Specialist',
    department: 'Test Preparation',
    featured: true
  }
];

// Sample top students data
const studentsData = [
  {
    name: 'Emma Thompson',
    email: 'emma.thompson@example.com',
    password: 'password123',
    role: 'student',
    grade: 'A+',
    gpa: 4.0,
    examScore: 98,
    achievements: ['IELTS Score: 8.5', 'Top Performer Award']
  },
  {
    name: 'Ryu Tanaka',
    email: 'ryu.tanaka@example.com',
    password: 'password123',
    role: 'student',
    grade: 'A',
    gpa: 3.9,
    examScore: 96,
    achievements: ['TOPIK Level 6', 'Excellence in Language']
  },
  {
    name: 'Carlos Rodriguez',
    email: 'carlos.rodriguez@example.com',
    password: 'password123',
    role: 'student',
    grade: 'A',
    gpa: 3.8,
    examScore: 94,
    achievements: ['Business English Certification', 'Most Improved']
  }
];

// Sample success stories
const successStoriesData = [
  {
    name: 'James Wilson',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    university: 'Oxford University',
    story: 'After completing the IELTS Preparation Course, I scored 8.0 and got accepted into Oxford University. The course strategies were invaluable for my success.',
    achievement: 'IELTS 8.0 and Oxford Admission',
    featured: true
  },
  {
    name: 'Min-ji Park',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
    university: 'Seoul National University',
    story: 'The Korean language program helped me achieve TOPIK level 6 in just 8 months. The instructors were amazing and provided personalized feedback that made all the difference.',
    achievement: 'TOPIK Level 6 Certification',
    featured: true
  }
];

// Function to seed database
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/educational-website';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await Course.deleteMany({});
    await User.deleteMany({ role: { $in: ['teacher', 'student'] } });
    await SuccessStory.deleteMany({});
    
    console.log('Database cleared. Starting to seed data...');
    
    // Create teachers
    console.log('Creating teachers...');
    const teachers = await Promise.all(
      teachersData.map(async teacherData => {
        const hashedPassword = await bcrypt.hash(teacherData.password, 10);
        return new User({
          ...teacherData,
          password: hashedPassword
        });
      })
    );
    
    const createdTeachers = await User.insertMany(teachers);
    console.log(`${createdTeachers.length} teachers created`);
    
    // Create courses and assign instructors
    console.log('Creating courses...');
    const courses = coursesData.map((course, index) => {
      const teacherIndex = index % createdTeachers.length;
      return new Course({
        ...course,
        instructor: createdTeachers[teacherIndex]._id
      });
    });
    
    const createdCourses = await Course.insertMany(courses);
    console.log(`${createdCourses.length} courses created`);
    
    // Create students
    console.log('Creating students...');
    const students = await Promise.all(
      studentsData.map(async studentData => {
        const hashedPassword = await bcrypt.hash(studentData.password, 10);
        return new User({
          ...studentData,
          password: hashedPassword
        });
      })
    );
    
    const createdStudents = await User.insertMany(students);
    console.log(`${createdStudents.length} students created`);
    
    // Create success stories
    console.log('Creating success stories...');
    const successStories = successStoriesData.map(story => new SuccessStory(story));
    await SuccessStory.insertMany(successStories);
    console.log(`${successStories.length} success stories created`);
    
    console.log('Database seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the seed function
seedDatabase();