import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiMail, HiOfficeBuilding, HiAcademicCap, HiClock, HiLink, HiBookOpen } from 'react-icons/hi';
import axios from 'axios';

function TeacherDetail() {
  const { teacherId } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeacherData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch teacher data
        const teacherResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/${teacherId}`);
        setTeacher(teacherResponse.data);
        
        // Fetch courses taught by this teacher
        const coursesResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/courses?instructor=${teacherId}`);
        setTeacherCourses(coursesResponse.data);
      } catch (err) {
        console.error('Error fetching teacher data:', err);
        setError('Failed to load teacher information. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherData();
  }, [teacherId]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-secondary"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading teacher information...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !teacher) {
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-red-500 dark:text-red-400">{error || 'Teacher not found'}</p>
          <div className="text-center mt-4">
            <Link 
              to="/teachers"
              className="bg-primary dark:bg-secondary text-white px-4 py-2 rounded-md hover:bg-primary/90 dark:hover:bg-secondary/90"
            >
              Back to Teachers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm mb-8">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <img
                src={teacher.image || 'https://via.placeholder.com/400x400?text=Teacher'}
                alt={teacher.name}
                className="h-96 w-full md:w-96 object-cover"
              />
            </div>
            <div className="p-8">
              <div className="uppercase tracking-wide text-sm text-primary dark:text-secondary font-semibold">
                {teacher.department || teacher.specialization || 'Faculty Member'}
              </div>
              <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {teacher.name}
              </h1>
              <p className="mt-2 text-xl text-gray-600 dark:text-gray-400">
                {teacher.title || 'Instructor'}
              </p>
              
              {/* Quick Info */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <HiMail className="w-5 h-5 mr-2" />
                  <a href={`mailto:${teacher.email}`} className="hover:text-primary dark:hover:text-secondary">
                    {teacher.email}
                  </a>
                </div>
                {teacher.office && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <HiOfficeBuilding className="w-5 h-5 mr-2" />
                    <span>{teacher.office}</span>
                  </div>
                )}
                {teacher.officeHours && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <HiClock className="w-5 h-5 mr-2" />
                    <span>{teacher.officeHours}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Bio */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center">
                <HiBookOpen className="w-6 h-6 mr-2" />
                Biography
              </h2>
              <div className="prose dark:prose-invert">
                <p className="text-gray-600 dark:text-gray-400">
                  {teacher.bio || 'No biography provided.'}
                </p>
              </div>
            </div>

            {/* Education */}
            {teacher.education && teacher.education.length > 0 && (
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
            )}

            {/* Research Interests */}
            {teacher.researchInterests && teacher.researchInterests.length > 0 && (
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
            )}

            {/* Publications */}
            {teacher.publications && teacher.publications.length > 0 && (
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
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1 space-y-8">
            {/* Specializations */}
            {teacher.specializations && teacher.specializations.length > 0 && (
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
            )}

            {/* Courses */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Courses
              </h2>
              {teacherCourses.length > 0 ? (
                <div className="space-y-4">
                  {teacherCourses.map(course => (
                    <Link
                      key={course._id}
                      to={`/course/${course._id}`}
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
              ) : (
                <p className="text-gray-600 dark:text-gray-400 italic">
                  No courses available at this time.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDetail;