import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  HiStar, 
  HiChevronDown, 
  HiChevronRight, 
  HiPlay, 
  HiCheck, 
  HiLockClosed,
  HiDownload,
  HiDocumentText,
  HiAcademicCap,
  HiTranslate,
  HiRefresh,
  HiVolumeUp,
  HiOutlineVolumeUp
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

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

// New component for vocabulary cards
function VocabularyCards({ category, isEnrolled }) {
  const [vocabularyWords, setVocabularyWords] = useState([]);
  const [flippedCards, setFlippedCards] = useState({});
  const [isPlaying, setIsPlaying] = useState({});
  const audioRefs = useRef({});
  
  // Languages and their vocabulary words
  const vocabularyByLanguage = {
    "English Language": [
      { word: "Eloquent", definition: "Fluent or persuasive in speaking or writing" },
      { word: "Ambiguous", definition: "Open to more than one interpretation" },
      { word: "Meticulous", definition: "Showing great attention to detail" },
      { word: "Ubiquitous", definition: "Present, appearing, or found everywhere" },
      { word: "Ephemeral", definition: "Lasting for a very short time" },
      { word: "Pragmatic", definition: "Dealing with things sensibly and realistically" },
      { word: "Resilient", definition: "Able to withstand or recover quickly from difficulties" },
      { word: "Diligent", definition: "Having or showing care and conscientiousness" },
      { word: "Verbose", definition: "Using or containing more words than necessary" },
      { word: "Intricate", definition: "Very complicated or detailed" }
    ],
    "Spanish Language": [
      { word: "Amanecer", definition: "Dawn or sunrise" },
      { word: "Desarrollar", definition: "To develop or unfold" },
      { word: "Enhorabuena", definition: "Congratulations" },
      { word: "Aprovechar", definition: "To take advantage of" },
      { word: "Deslumbrante", definition: "Dazzling or brilliant" },
      { word: "Vergüenza", definition: "Shame or embarrassment" },
      { word: "Escalofrío", definition: "Shiver or chill" },
      { word: "Cosquillas", definition: "Tickle or tickling" },
      { word: "Imprescindible", definition: "Essential or indispensable" },
      { word: "Madrugar", definition: "To wake up early" }
    ],
    "Japanese Language": [
      { word: "木漏れ日 (Komorebi)", definition: "Sunlight filtering through trees" },
      { word: "侘寂 (Wabi-sabi)", definition: "Finding beauty in imperfection" },
      { word: "頑張る (Ganbaru)", definition: "To persevere or do one's best" },
      { word: "もったいない (Mottainai)", definition: "Too good to waste" },
      { word: "わびさび (Wabisabi)", definition: "Rustic elegance, quiet taste" },
      { word: "敷居が高い (Shikii ga takai)", definition: "A high threshold (difficult to approach)" },
      { word: "空気を読む (Kuuki wo yomu)", definition: "To read the atmosphere" },
      { word: "おかえり (Okaeri)", definition: "Welcome home" },
      { word: "懐かしい (Natsukashii)", definition: "Nostalgic, fondly remembered" },
      { word: "遠慮 (Enryo)", definition: "Restraint or holding back" }
    ],
    "Korean Language": [
      { word: "정 (Jeong)", definition: "Affection, attachment, or fondness" },
      { word: "눈치 (Nunchi)", definition: "The ability to gauge others' moods" },
      { word: "아리랑 (Arirang)", definition: "Traditional Korean folk song" },
      { word: "화이팅 (Hwaiting)", definition: "Good luck or cheer up" },
      { word: "삼세번 (Samse-bun)", definition: "Third time's the charm" },
      { word: "애교 (Aegyo)", definition: "Cutesy behaviors or actions" },
      { word: "시원하다 (Shiwonhada)", definition: "Refreshing or relieving" },
      { word: "한 (Han)", definition: "A feeling of unresolvable sadness or resentment" },
      { word: "인연 (Inyeon)", definition: "Fateful relationship or connection" },
      { word: "신기하다 (Shinkihada)", definition: "Amazing or fascinating" }
    ],
    "Business English": [
      { word: "Leverage", definition: "Use something to maximum advantage" },
      { word: "Streamline", definition: "Make more efficient or effective" },
      { word: "Stakeholder", definition: "Person with interest or concern in something" },
      { word: "Deliverable", definition: "Tangible or intangible object delivered" },
      { word: "Synergy", definition: "Interaction of elements that produces greater effect" },
      { word: "Paradigm", definition: "Pattern or model" },
      { word: "Benchmark", definition: "Standard by which something can be measured" },
      { word: "Incentivize", definition: "Motivate or encourage someone to do something" },
      { word: "Scalable", definition: "Able to be changed in size or scale" },
      { word: "Agile", definition: "Able to move quickly and easily" }
    ]
  };
  
  // Default words for any category not specifically defined
  const defaultWords = [
    { word: "Vocabulary", definition: "The body of words used in a particular language" },
    { word: "Linguistic", definition: "Relating to language or linguistics" },
    { word: "Expression", definition: "A word or phrase used to convey an idea" },
    { word: "Fluency", definition: "The ability to speak or write a language easily and accurately" },
    { word: "Comprehension", definition: "The ability to understand something" }
  ];

  // Language code mapping for speech synthesis
  const languageCodeMap = {
    "English Language": "en-US",
    "Spanish Language": "es-ES",
    "Japanese Language": "ja-JP",
    "Korean Language": "ko-KR",
    "Business English": "en-US"
  };

  useEffect(() => {
    // Generate 5 random words based on course category
    const generateVocabularyWords = () => {
      const wordsForCategory = vocabularyByLanguage[category] || defaultWords;
      
      // Shuffle array and take first 5 items
      const shuffled = [...wordsForCategory].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 5);
    };
    
    setVocabularyWords(generateVocabularyWords());
  }, [category]);
  
  // Set up audio elements for each word
  useEffect(() => {
    audioRefs.current = {};
    setIsPlaying({});
  }, [vocabularyWords]);
  
  const refreshWords = () => {
    const wordsForCategory = vocabularyByLanguage[category] || defaultWords;
    const shuffled = [...wordsForCategory].sort(() => 0.5 - Math.random());
    setVocabularyWords(shuffled.slice(0, 5));
    setFlippedCards({});
    setIsPlaying({});
  };
  
  const toggleFlip = (index) => {
    setFlippedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const playAudio = (word, index, e) => {
    e.stopPropagation();
    
    // Extract just the word without any parentheses or other characters
    const cleanWord = word.replace(/\s*\(.*?\)\s*/g, '').trim();
    
    // Set playing state
    setIsPlaying(prev => ({ ...prev, [index]: true }));
    
    // Use existing audio reference if available
    if (audioRefs.current[index] && !audioRefs.current[index].error) {
      audioRefs.current[index].play()
        .catch(() => {
          speakWordWithSynthesis(cleanWord, index);
        });
    } else {
      speakWordWithSynthesis(cleanWord, index);
    }
  };
  
  const speakWordWithSynthesis = (word, index) => {
    if (!window.speechSynthesis) {
      console.error("Speech synthesis not supported in this browser");
      setIsPlaying(prev => ({ ...prev, [index]: false }));
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(word);
    
    // Get language code from the category
    const langCode = languageCodeMap[category] || "en-US";
    utterance.lang = langCode;
    
    // Get voices and set a voice that matches the language if available
    let voices = window.speechSynthesis.getVoices();
    
    // If no voices are loaded yet, wait for them to load
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        setVoiceAndSpeak(utterance, voices, langCode, index);
      };
    } else {
      setVoiceAndSpeak(utterance, voices, langCode, index);
    }
  };
  
  const setVoiceAndSpeak = (utterance, voices, langCode, index) => {
    // Find a voice that matches the language
    const voice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
    if (voice) {
      utterance.voice = voice;
    }
    
    // Set event handlers
    utterance.onend = () => {
      setIsPlaying(prev => ({ ...prev, [index]: false }));
    };
    
    utterance.onerror = () => {
      console.error("Speech synthesis error");
      setIsPlaying(prev => ({ ...prev, [index]: false }));
    };
    
    // Speak
    window.speechSynthesis.speak(utterance);
  };
  
  const handleAudioEnded = (index) => {
    setIsPlaying(prev => ({ ...prev, [index]: false }));
  };
  
  const handleAudioError = (word, index) => {
    // If audio fails to load, use speech synthesis instead
    speakWordWithSynthesis(word, index);
  };
  
  if (!isEnrolled) {
    return null; // Only show vocabulary cards for enrolled students
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <HiTranslate className="w-6 h-6 text-primary dark:text-secondary mr-2" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Vocabulary Cards
          </h2>
        </div>
        <button 
          onClick={refreshWords}
          className="flex items-center text-primary dark:text-secondary hover:underline"
        >
          <HiRefresh className="w-5 h-5 mr-1" />
          New Words
        </button>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Click on the cards to reveal their definitions. Click the <HiVolumeUp className="inline w-4 h-4" /> icon to hear pronunciation.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {vocabularyWords.map((item, index) => (
          <div 
            key={index}
            onClick={() => toggleFlip(index)}
            className={`cursor-pointer transition-transform duration-500 transform-gpu ${
              flippedCards[index] ? 'rotate-y-180' : ''
            } perspective-1000 h-40`}
          >
            <div className="relative w-full h-full">
              {/* Front of card */}
              <div 
                className={`absolute w-full h-full rounded-lg flex items-center justify-center shadow-md border-2 border-primary dark:border-secondary bg-indigo-50 dark:bg-gray-700 p-4 transition-opacity duration-500 ${
                  flippedCards[index] ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <h3 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100">
                  {item.word}
                </h3>
                <button 
                  onClick={(e) => playAudio(item.word, index, e)}
                  className={`absolute top-2 right-2 text-primary dark:text-secondary transition-transform duration-200 ${
                    isPlaying[index] ? 'scale-110' : ''
                  }`}
                  title="Play pronunciation"
                >
                  {isPlaying[index] ? (
                    <HiVolumeUp className="w-5 h-5 animate-pulse" />
                  ) : (
                    <HiOutlineVolumeUp className="w-5 h-5" />
                  )}
                </button>
                <audio
                  ref={(el) => {
                    if (el) {
                      audioRefs.current[index] = el;
                      el.addEventListener('ended', () => handleAudioEnded(index));
                      el.addEventListener('error', () => handleAudioError(item.word, index));
                    }
                  }}
                  src={`https://api.dictionaryapi.dev/media/pronunciations/en/${item.word.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim()}.mp3`}
                  preload="none"
                />
              </div>
              
              {/* Back of card */}
              <div 
                className={`absolute w-full h-full rounded-lg flex items-center justify-center shadow-md border-2 border-primary dark:border-secondary bg-primary/10 dark:bg-secondary/10 p-4 transition-opacity duration-500 ${
                  flippedCards[index] ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <p className="text-sm text-center text-gray-700 dark:text-gray-300">{item.definition}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
    <div className="bg-white dark:bg-gray-800/90 rounded-lg p-6 mb-8">
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
              className="flex items-center justify-between p-3 bg-indigo-50/80 dark:bg-gray-700/80 rounded-lg"
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
              className="p-3 bg-indigo-50/80 dark:bg-gray-700/80 rounded-lg"
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
              className="p-3 bg-indigo-50/80 dark:bg-gray-700/80 rounded-lg"
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
    <div className="bg-white dark:bg-gray-800/90 rounded-lg p-6 mb-8">
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

function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [courseSections, setCourseSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [relatedCourses, setRelatedCourses] = useState([]);
  
  // Check if user just completed enrollment
  useEffect(() => {
    if (searchParams.get('enrolled') === 'true') {
      setIsEnrolled(true);
    }
  }, [searchParams]);

  // Fetch course data from the API
  useEffect(() => {
    const fetchCourseData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch course details
        const courseResponse = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/courses/${courseId}`
        );
        setCourse(courseResponse.data);
        
        // Check if user is enrolled (if authenticated)
        if (isAuthenticated && user) {
          try {
            const enrollmentResponse = await axios.get(
              `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/${user.id}/enrollments`,
              {
                headers: { 'x-auth-token': localStorage.getItem('token') }
              }
            );
            
            const enrolledCourses = enrollmentResponse.data || [];
            setIsEnrolled(enrolledCourses.some(c => c._id === courseId));
          } catch (enrollmentError) {
            console.error('Error checking enrollment status:', enrollmentError);
          }
        }
        
        // Fetch course sections and content
        try {
          const sectionsResponse = await axios.get(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/courses/${courseId}/chapters`
          );
          setCourseSections(sectionsResponse.data || []);
        } catch (sectionsError) {
          console.error('Error fetching course sections:', sectionsError);
          // Use mock sections if API fails
          setCourseSections(mockCourseContent.sections);
        }
        
        // Fetch related courses
        if (courseResponse.data.category) {
          try {
            const relatedResponse = await axios.get(
              `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/courses?category=${courseResponse.data.category}&limit=3&exclude=${courseId}`
            );
            setRelatedCourses(relatedResponse.data || []);
          } catch (relatedError) {
            console.error('Error fetching related courses:', relatedError);
          }
        }
        
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Failed to load course information. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourseData();
  }, [courseId, isAuthenticated, user]);

  // Calculate total lectures and completed lectures
  const totalLectures = courseSections.reduce(
    (sum, section) => sum + (section.lectures?.length || 0), 
    0
  );
  const completedLectures = courseSections.reduce(
    (sum, section) => sum + ((section.lectures?.filter(l => l.isCompleted)?.length) || 0),
    0
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-secondary"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading course information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-red-500 dark:text-red-400">{error || 'Course not found'}</p>
          <div className="text-center mt-4">
            <Link 
              to="/courses"
              className="bg-primary dark:bg-secondary text-white px-4 py-2 rounded-md hover:bg-primary/90 dark:hover:bg-secondary/90"
            >
              Browse All Courses
            </Link>
          </div>
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
                <span className="text-xl font-bold text-amber-500">{course.rating || 0}</span>
                <div className="flex items-center ml-2">
                  {[...Array(5)].map((_, i) => (
                    <HiStar
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(course.rating || 0)
                          ? 'text-amber-500'
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-400">
                  ({course.students || 0} students)
                </span>
              </div>
              <p className="text-gray-300 mb-4">
                Created by {course.instructor && (
                  <Link 
                    to={`/teacher/${course.instructor._id}`} 
                    className="hover:text-primary dark:hover:text-secondary"
                  >
                    {course.instructor.name}
                  </Link>
                )}
              </p>
              <div className="flex items-center text-sm text-gray-400">
                <span className="mr-4">{course.duration}</span>
                <span className="mr-4">•</span>
                <span>{course.level}</span>
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <img
                src={course.thumbnail ? 
                  `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${course.thumbnail}` : 
                  'https://via.placeholder.com/640x360?text=Course'
                }
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
                {(course.whatYouWillLearn || mockCourseContent.whatYouWillLearn).map((item, index) => (
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
                {(course.requirements || mockCourseContent.prerequisites).map((prerequisite, index) => (
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
                {(course.description || "").split('\n\n').map((paragraph, index) => (
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

            {/* Vocabulary Cards */}
            <VocabularyCards 
              category={course.category}
              isEnrolled={isEnrolled}
            />

            {/* Related Courses */}
            <div className="bg-white dark:bg-gray-800/90 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                Related Courses
              </h2>
              {relatedCourses.length > 0 ? (
                <div className="space-y-4">
                  {relatedCourses.map(course => (
                    <Link
                      key={course._id}
                      to={`/course/${course._id}`}
                      className="block p-4 border rounded-lg hover:bg-indigo-50/80 dark:hover:bg-gray-700/80 transition-colors duration-150"
                    >
                      <div className="flex items-start">
                        <img
                          src={course.thumbnail ? 
                            `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${course.thumbnail}` : 
                            'https://via.placeholder.com/80x80?text=Course'
                          }
                          alt={course.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="ml-4">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {course.instructor ? course.instructor.name : 'Unknown Instructor'}
                          </p>
                          <div className="flex items-center">
                            <span className="text-amber-500 font-semibold text-sm">
                              {course.rating || "N/A"}
                            </span>
                            <div className="flex items-center ml-1">
                              <HiStar className="w-4 h-4 text-amber-500" />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                              ({course.students || 0} students)
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 italic">
                  No related courses found.
                </p>
              )}
            </div>
          </div>

          {/* Course Content Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Course Content
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {totalLectures} lectures • {courseSections.length} sections
              </div>
              {courseSections.map(section => (
                <CourseSection
                  key={section._id || section.id}
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