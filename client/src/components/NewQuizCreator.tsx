import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineCheck, HiExclamation } from 'react-icons/hi';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizCreatorProps {
  onQuizCreated: (quiz: { title: string; description: string; questions: QuizQuestion[] }) => void;
  initialTitle?: string;
  initialDescription?: string;
  chapterId?: string;
}

const NewQuizCreator: React.FC<QuizCreatorProps> = ({ 
  onQuizCreated, 
  initialTitle = '',
  initialDescription = '',
  chapterId
}) => {
  const { token } = useAuth();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [questions, setQuestions] = useState<QuizQuestion[]>([{
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  }]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].correctAnswer = optionIndex;
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      setError('A quiz must have at least one question');
      return;
    }
    
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options.length < 8) {
      updatedQuestions[questionIndex].options.push('');
      setQuestions(updatedQuestions);
    } else {
      setError('Maximum 8 options per question');
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    const currentOptions = updatedQuestions[questionIndex].options;
    
    if (currentOptions.length <= 2) {
      setError('A question must have at least 2 options');
      return;
    }
    
    // Update correct answer if needed
    if (updatedQuestions[questionIndex].correctAnswer === optionIndex) {
      updatedQuestions[questionIndex].correctAnswer = 0;
    } else if (updatedQuestions[questionIndex].correctAnswer > optionIndex) {
      updatedQuestions[questionIndex].correctAnswer -= 1;
    }
    
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuestions(updatedQuestions);
  };

  const createQuiz = async () => {
    // Validate quiz
    if (!title.trim()) {
      setError('Quiz title is required');
      return;
    }
    
    let isValid = true;
    questions.forEach((question, qIndex) => {
      if (!question.question.trim()) {
        setError(`Question ${qIndex + 1} is empty`);
        isValid = false;
      }
      
      question.options.forEach((option, oIndex) => {
        if (!option.trim()) {
          setError(`Option ${oIndex + 1} in question ${qIndex + 1} is empty`);
          isValid = false;
        }
      });
    });
    
    if (!isValid) return;

    // If a chapterId is provided, submit directly to the API
    if (chapterId) {
      setIsSubmitting(true);
      setError(null);
      
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/chapters/${chapterId}/quiz`,
          {
            title,
            description,
            questions
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'x-auth-token': token
            }
          }
        );
        
        // Call the callback with the quiz data
        onQuizCreated({
          title,
          description,
          questions
        });
        
        // Reset the form
        setTitle('');
        setDescription('');
        setQuestions([{
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        }]);
        setError(null);
      } catch (err: any) {
        console.error('Error creating quiz:', err);
        setError(err.response?.data?.message || 'Failed to create quiz');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Just call the callback with the quiz data
      onQuizCreated({
        title,
        description,
        questions
      });
      
      // Reset the form
      setTitle('');
      setDescription('');
      setQuestions([{
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }]);
      setError(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Create Quiz</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="quiz-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Quiz Title
          </label>
          <input
            type="text"
            id="quiz-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter quiz title"
            className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary"
          />
        </div>
        
        <div>
          <label htmlFor="quiz-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="quiz-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter quiz description"
            rows={2}
            className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary"
          />
        </div>
        
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-base font-medium text-gray-800 dark:text-gray-200">Questions</h4>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-primary dark:text-secondary hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <HiOutlinePlus className="mr-1 h-4 w-4" />
              Add Question
            </button>
          </div>
          
          {questions.map((question, qIndex) => (
            <div 
              key={qIndex} 
              className="p-4 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700"
            >
              <div className="flex justify-between items-start mb-3">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Question {qIndex + 1}
                </h5>
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-500 hover:text-red-700"
                >
                  <HiOutlineTrash className="h-4 w-4" />
                </button>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  value={question.question}
                  onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                  placeholder="Enter your question"
                  className="w-full rounded-md border dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:outline-none focus:ring-primary dark:focus:ring-secondary"
                />
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300">Options</h6>
                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    className="inline-flex items-center px-2 py-1 text-xs border border-transparent rounded text-primary dark:text-secondary hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <HiOutlinePlus className="mr-1 h-3 w-3" />
                    Add Option
                  </button>
                </div>
                
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => handleCorrectAnswerChange(qIndex, oIndex)}
                      className={`mr-2 h-5 w-5 rounded-full border flex items-center justify-center ${
                        question.correctAnswer === oIndex 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-gray-300 dark:border-gray-500'
                      }`}
                    >
                      {question.correctAnswer === oIndex && <HiOutlineCheck className="h-4 w-4" />}
                    </button>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                      placeholder={`Option ${oIndex + 1}`}
                      className="flex-1 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1 text-sm focus:outline-none focus:ring-primary dark:focus:ring-secondary"
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(qIndex, oIndex)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Select the circle next to the correct answer
              </div>
            </div>
          ))}
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md flex items-center">
            <HiExclamation className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={createQuiz}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary dark:bg-secondary hover:bg-primary/90 dark:hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-secondary"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : 'Create Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewQuizCreator;
