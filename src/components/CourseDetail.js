import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  HiStar, 
  HiChevronDown, 
  HiChevronRight, 
  HiPlay, 
  HiCheck, 
  HiLockClosed,
  HiDownload,
  HiDocumentText,
  HiQuestionMarkCircle,
  HiAcademicCap
} from 'react-icons/hi';
import { courseData } from './FeaturedCourses';

// Enhanced mock course content data
const mockCourseContent = {
  sections: [
    {
      id: 1,
      title: "Introduction to the Course",
      duration: "45 minutes",
      lectures: [
        {
          id: 1,
          title: "Welcome to the Course",
          duration: "5:20",
          isCompleted: true,
          isFree: true,
          type: "video"
        },
        {
          id: 2,
          title: "Course Overview",
          duration: "10:15",
          isCompleted: false,
          isFree: true,
          type: "video"
        },
        {
          id: 3,
          title: "Setting Up Your Environment",
          duration: "15:30",
          isCompleted: false,
          isFree: false,
          type: "video"
        }
      ]
    },
    {
      id: 2,
      title: "Basic Concepts",
      duration: "1.5 hours",
      lectures: [
        {
          id: 4,
          title: "Core Principles",
          duration: "20:10",
          isCompleted: false,
          isFree: false,
          type: "video"
        },
        {
          id: 5,
          title: "Practical Exercise 1",
          duration: "30:00",
          isCompleted: false,
          isFree: false,
          type: "exercise"
        }
      ]
    },
    {
      id: 3,
      title: "Advanced Topics",
      duration: "2 hours",
      lectures: [
        {
          id: 6,
          title: "Advanced Techniques",
          duration: "25:15",
          isCompleted: false,
          isFree: false,
          type: "video"
        },
        {
          id: 7,
          title: "Real-world Applications",
          duration: "40:20",
          isCompleted: false,
          isFree: false,
          type: "video"
        }
      ]
    }
  ],
  prerequisites: [
    "Basic understanding of programming concepts",
    "Familiarity with JavaScript (for web development courses)",
    "A computer with internet access",
    "Text editor or IDE installed"
  ],
  whatYouWillLearn: [
    "Master the fundamentals of the subject",
    "Build real-world projects",
    "Understand best practices and patterns",
    "Deploy applications to production"
  ],
  description: `This comprehensive course will take you from beginner to advanced level. 
    You'll learn through practical examples and hands-on projects. By the end of this course, 
    you'll have the skills and confidence to build your own applications.
    
    The course is constantly updated with new content and exercises to keep up with the latest industry trends.
    You'll get lifetime access to all course materials, including:
    - HD Video lectures
    - Downloadable resources
    - Access to our student community
    - Certificate of completion
    
    Join thousands of students who have already transformed their careers through this course!`,
  courseMaterials: {
    documents: [
      { id: 1, name: "Course Handbook.pdf", size: "2.4 MB", type: "pdf" },
      { id: 2, name: "Exercise Solutions.pdf", size: "1.8 MB", type: "pdf" },
      { id: 3, name: "Project Guidelines.pdf", size: "1.2 MB", type: "pdf" }
    ],
    assignments: [
      { id: 1, name: "Project 1: Basic Implementation", deadline: "Week 2" },
      { id: 2, name: "Project 2: Advanced Features", deadline: "Week 4" },
      { id: 3, name: "Final Project", deadline: "Week 8" }
    ],
    quizzes: [
      { id: 1, name: "Module 1 Quiz", questions: 10, timeLimit: "20 minutes" },
      { id: 2, name: "Module 2 Quiz", questions: 15, timeLimit: "30 minutes" },
      { id: 3, name: "Final Assessment", questions: 30, timeLimit: "60 minutes" }
    ]
  },
  certificate: {
    requirements: [
      "Complete all course lectures",
      "Score at least 70% on all quizzes",
      "Submit and pass all assignments",
      "Complete the final project"
    ]
  }
};

function CourseProgress({ totalLectures, completedLectures }) {
  const progress = (completedLectures / totalLectures) * 100;
  return (
    <div className="mt-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 dark:text-gray-400">{Math.round(progress)}% complete</span>
        <span className="text-gray-600 dark:text-gray-400">{completedLectures}/{totalLectures} lectures</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-primary dark:bg-secondary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

function CourseSection({ section, isEnrolled }) {
  const [isOpen, setIsOpen] = useState(false);
  const completedLectures = section.lectures.filter(lecture => lecture.isCompleted).length;

  return (
    <div className="border dark:border-gray-700 rounded-lg mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
      >
        <div className="flex items-center">
          {isOpen ? (
            <HiChevronDown className="w-5 h-5 mr-2" />
          ) : (
            <HiChevronRight className="w-5 h-5 mr-2" />
          )}
          <div className="text-left">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{section.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {section.duration} • {section.lectures.length} lectures
            </p>
          </div>
        </div>
        {isEnrolled && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {completedLectures}/{section.lectures.length}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="border-t dark:border-gray-700">
          {section.lectures.map(lecture => (
            <div
              key={lecture.id}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="flex items-center">
                {lecture.isCompleted ? (
                  <HiCheck className="w-5 h-5 text-green-500 mr-2" />
                ) : lecture.isFree || isEnrolled ? (
                  <HiPlay className="w-5 h-5 text-gray-400 mr-2" />
                ) : (
                  <HiLockClosed className="w-5 h-5 text-gray-400 mr-2" />
                )}
                <span className="text-gray-900 dark:text-gray-100">{lecture.title}</span>
                {lecture.isFree && !isEnrolled && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Free</span>
                )}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{lecture.duration}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CourseMaterials({ materials, isEnrolled }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Course Materials
      </h2>

      {/* Documents */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Downloadable Resources
        </h3>
        <div className="space-y-3">
          {materials.documents.map(doc => (
            <div 
              key={doc.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center">
                <HiDocumentText className="w-5 h-5 text-gray-500 mr-3" />
                <span className="text-gray-900 dark:text-gray-100">{doc.name}</span>
                <span className="ml-2 text-sm text-gray-500">({doc.size})</span>
              </div>
              {isEnrolled ? (
                <button className="text-primary dark:text-secondary hover:underline flex items-center">
                  <HiDownload className="w-5 h-5 mr-1" />
                  Download
                </button>
              ) : (
                <HiLockClosed className="w-5 h-5 text-gray-400" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Assignments */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Projects & Assignments
        </h3>
        <div className="space-y-3">
          {materials.assignments.map(assignment => (
            <div 
              key={assignment.id}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {assignment.name}
                  </h4>
                  <p className="text-sm text-gray-500">Due: {assignment.deadline}</p>
                </div>
                {!isEnrolled && <HiLockClosed className="w-5 h-5 text-gray-400" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quizzes */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Quizzes & Assessments
        </h3>
        <div className="space-y-3">
          {materials.quizzes.map(quiz => (
            <div 
              key={quiz.id}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {quiz.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {quiz.questions} questions • {quiz.timeLimit}
                  </p>
                </div>
                {!isEnrolled && <HiLockClosed className="w-5 h-5 text-gray-400" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Certificate({ requirements, isEnrolled }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
      <div className="flex items-center mb-6">
        <HiAcademicCap className="w-8 h-8 text-primary dark:text-secondary mr-3" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Course Certificate
        </h2>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Complete the following requirements to earn your certificate:
      </p>
      <ul className="space-y-3">
        {requirements.map((req, index) => (
          <li key={index} className="flex items-center">
            <HiCheck className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-gray-700 dark:text-gray-300">{req}</span>
          </li>
        ))}
      </ul>
      {!isEnrolled && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Enroll in this course to start earning your certificate
        </p>
      )}
    </div>
  );
}

function RelatedCourses({ currentCourseId, category }) {
  const relatedCourses = courseData
    .filter(course => course.category === category && course.id !== currentCourseId)
    .slice(0, 3);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Related Courses
      </h2>
      <div className="space-y-4">
        {relatedCourses.map(course => (
          <Link
            key={course.id}
            to={`/course/${course.id}`}
            className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
          >
            <div className="flex items-start">
              <img
                src={course.image}
                alt={course.title}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="ml-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {course.instructor}
                </p>
                <div className="flex items-center">
                  <span className="text-amber-500 font-semibold text-sm">
                    {course.rating}
                  </span>
                  <div className="flex items-center ml-1">
                    <HiStar className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    ({course.students.toLocaleString()} students)
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isEnrolled, setIsEnrolled] = useState(false);
  
  // Check if user just completed enrollment
  useEffect(() => {
    if (searchParams.get('enrolled') === 'true') {
      setIsEnrolled(true);
    }
  }, [searchParams]);

  // Find the course from our data
  const course = courseData.find(c => c.id === parseInt(courseId));

  // Calculate total lectures and completed lectures
  const totalLectures = mockCourseContent.sections.reduce(
    (sum, section) => sum + section.lectures.length, 
    0
  );
  const completedLectures = mockCourseContent.sections.reduce(
    (sum, section) => sum + section.lectures.filter(l => l.isCompleted).length,
    0
  );

  if (!course) {
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-gray-600 dark:text-gray-400">Course not found</p>
        </div>
      </div>
    );
  }

  const handleEnrollClick = () => {
    navigate(`/enroll/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg">
      {/* Course Header */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              <div className="flex items-center mb-4">
                <span className="text-xl font-bold text-amber-500">{course.rating}</span>
                <div className="flex items-center ml-2">
                  {[...Array(5)].map((_, i) => (
                    <HiStar
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(course.rating)
                          ? 'text-amber-500'
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-400">
                  ({course.students.toLocaleString()} students)
                </span>
              </div>
              <p className="text-gray-300 mb-4">
                Created by <Link to={`/teacher/${course.instructorId}`} className="hover:text-primary dark:hover:text-secondary">{course.instructor}</Link>
              </p>
              <div className="flex items-center text-sm text-gray-400">
                <span className="mr-4">{course.duration}</span>
                <span className="mr-4">•</span>
                <span>{course.level}</span>
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <img
                src={course.image}
                alt={course.title}
                className="w-full rounded-lg mb-4"
              />
              <div className="text-3xl font-bold mb-4">${course.price}</div>
              <button
                onClick={handleEnrollClick}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded transition-colors duration-150"
              >
                {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
              </button>
              {isEnrolled && (
                <CourseProgress
                  totalLectures={totalLectures}
                  completedLectures={completedLectures}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {/* What You'll Learn */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                What You'll Learn
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {mockCourseContent.whatYouWillLearn.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <HiCheck className="w-5 h-5 text-green-500 mr-2 mt-1" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prerequisites */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Prerequisites
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                {mockCourseContent.prerequisites.map((prerequisite, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300">
                    {prerequisite}
                  </li>
                ))}
              </ul>
            </div>

            {/* Course Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Description
              </h2>
              <div className="prose dark:prose-invert">
                {mockCourseContent.description.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 dark:text-gray-300">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Course Materials */}
            <CourseMaterials 
              materials={mockCourseContent.courseMaterials}
              isEnrolled={isEnrolled}
            />

            {/* Certificate */}
            <Certificate 
              requirements={mockCourseContent.certificate.requirements}
              isEnrolled={isEnrolled}
            />

            {/* Related Courses */}
            <RelatedCourses
              currentCourseId={parseInt(courseId)}
              category={course.category}
            />
          </div>

          {/* Course Content Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Course Content
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {totalLectures} lectures • {mockCourseContent.sections.reduce(
                  (total, section) => total + parseFloat(section.duration),
                  0
                )} hours total
              </div>
              {mockCourseContent.sections.map(section => (
                <CourseSection
                  key={section.id}
                  section={section}
                  isEnrolled={isEnrolled}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;