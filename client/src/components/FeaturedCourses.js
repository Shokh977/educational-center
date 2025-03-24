import React from 'react';
import { HiStar } from 'react-icons/hi';
import { Link } from 'react-router-dom';

// Import the course data to be shared across components
export const courseData = [
  {
    id: 1,
    title: "Business English Masterclass",
    instructor: "Sarah Thompson",
    rating: 4.8,
    students: 15430,
    price: 89.99,
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&h=400&q=80",
    level: "Intermediate",
    duration: "48 hours",
    category: "English Language"
  },
  {
    id: 2,
    title: "IELTS Preparation Course",
    instructor: "Sarah Thompson",
    rating: 4.9,
    students: 12800,
    price: 94.99,
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&h=400&q=80",
    level: "Advanced",
    duration: "36 hours",
    category: "English Language"
  },
  {
    id: 3,
    title: "Spanish for Beginners",
    instructor: "Carlos Rodriguez",
    rating: 4.7,
    students: 8900,
    price: 79.99,
    image: "https://images.unsplash.com/photo-1518775053278-5a569f0be353?auto=format&fit=crop&w=600&h=400&q=80",
    level: "Beginner",
    duration: "24 hours",
    category: "Spanish Language"
  },
  {
    id: 4,
    title: "Japanese Business Communication",
    instructor: "Yuki Tanaka",
    rating: 4.8,
    students: 6500,
    price: 89.99,
    image: "https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=600&h=400&q=80",
    level: "Intermediate",
    duration: "30 hours",
    category: "Japanese Language"
  },
  {
    id: 5,
    title: "JLPT N5 Preparation Course",
    instructor: "Yuki Tanaka",
    rating: 4.9,
    students: 7200,
    price: 84.99,
    image: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=600&h=400&q=80",
    level: "Beginner",
    duration: "40 hours",
    category: "Japanese Language"
  }
];

const CourseCard = ({ course }) => (
  <div key={course.id} className="bg-indigo-50/80 dark:bg-gray-700 dark:hover:bg-gray-650 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
    <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
    <div className="p-4">
      <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">{course.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{course.instructor}</p>
      <div className="flex items-center mb-2">
        <span className="text-amber-500 font-semibold">{course.rating}</span>
        <div className="flex items-center ml-1">
          {[...Array(5)].map((_, i) => (
            <HiStar key={i} className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'text-amber-500' : 'text-gray-300'}`} />
          ))}
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">({course.students.toLocaleString()})</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-bold text-lg text-primary dark:text-secondary">${course.price}</span>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <span>{course.duration}</span>
          <span>•</span>
          <span>{course.level}</span>
        </div>
      </div>
    </div>
  </div>
);

const FeaturedCourses = () => {
  return (
    <div className="py-16 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Featured Courses</h2>
          <Link 
            to="/courses" 
            className="text-primary dark:text-secondary hover:underline"
          >
            View All Courses
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courseData.slice(0, 6).map(course => (
            <Link key={course.id} to={`/courses?course=${course.id}`}>
              <CourseCard course={course} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedCourses;