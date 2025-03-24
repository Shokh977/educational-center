import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiMail, HiOfficeBuilding, HiAcademicCap, HiClock, HiLink, HiBookOpen } from 'react-icons/hi';
import { teachersData } from './TeachersData';
import { courseData } from './FeaturedCourses';

function TeacherDetail() {
  const { teacherId } = useParams();
  const teacher = teachersData.find(t => t.id === parseInt(teacherId));
  
  if (!teacher) {
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-gray-600 dark:text-gray-400">Teacher not found</p>
        </div>
      </div>
    );
  }

  // Get courses taught by this teacher
  const teacherCourses = courseData.filter(course => teacher.courses.includes(course.id));

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm mb-8">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <img
                src={teacher.image}
                alt={teacher.name}
                className="h-96 w-full md:w-96 object-cover"
              />
            </div>
            <div className="p-8">
              <div className="uppercase tracking-wide text-sm text-primary dark:text-secondary font-semibold">
                {teacher.department}
              </div>
              <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {teacher.name}
              </h1>
              <p className="mt-2 text-xl text-gray-600 dark:text-gray-400">
                {teacher.title}
              </p>
              
              {/* Quick Info */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <HiMail className="w-5 h-5 mr-2" />
                  <a href={`mailto:${teacher.email}`} className="hover:text-primary dark:hover:text-secondary">
                    {teacher.email}
                  </a>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <HiOfficeBuilding className="w-5 h-5 mr-2" />
                  <span>{teacher.office}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <HiClock className="w-5 h-5 mr-2" />
                  <span>{teacher.officeHours}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Education */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center">
                <HiAcademicCap className="w-6 h-6 mr-2" />
                Education
              </h2>
              <ul className="space-y-3">
                {teacher.education.map((edu, index) => (
                  <li 
                    key={index}
                    className="text-gray-600 dark:text-gray-400"
                  >
                    {edu}
                  </li>
                ))}
              </ul>
            </div>

            {/* Research Interests */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center">
                <HiBookOpen className="w-6 h-6 mr-2" />
                Research Interests
              </h2>
              <ul className="space-y-3">
                {teacher.researchInterests.map((interest, index) => (
                  <li 
                    key={index}
                    className="flex items-start text-gray-600 dark:text-gray-400"
                  >
                    <span className="mr-2">•</span>
                    {interest}
                  </li>
                ))}
              </ul>
            </div>

            {/* Publications */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center">
                <HiLink className="w-6 h-6 mr-2" />
                Recent Publications
              </h2>
              <div className="space-y-4">
                {teacher.publications.map((pub, index) => (
                  <div 
                    key={index}
                    className="border-b dark:border-gray-700 last:border-0 pb-4 last:pb-0"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {pub.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {pub.journal} • {pub.year}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1 space-y-8">
            {/* Specializations */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Specializations
              </h2>
              <div className="flex flex-wrap gap-2">
                {teacher.specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Courses */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Courses
              </h2>
              <div className="space-y-4">
                {teacherCourses.map(course => (
                  <Link
                    key={course.id}
                    to={`/course/${course.id}`}
                    className="block p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {course.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span>{course.duration}</span>
                      <span className="mx-2">•</span>
                      <span>{course.level}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDetail;