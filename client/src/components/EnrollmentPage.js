import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiCheck, HiShieldCheck, HiAcademicCap } from 'react-icons/hi';
import { courseData } from './FeaturedCourses';

function EnrollmentPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const course = courseData.find(c => c.id === parseInt(courseId));

  if (!course) {
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-gray-600 dark:text-gray-400">Course not found</p>
        </div>
      </div>
    );
  }

  const handleEnrollment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      // Redirect to course content after successful enrollment
      navigate(`/course/${courseId}?enrolled=true`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Enrollment Form */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                Complete Your Enrollment
              </h2>

              <form onSubmit={handleEnrollment}>
                {/* Payment Methods */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    Payment Method
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-primary dark:text-secondary"
                      />
                      <span className="ml-3 text-gray-900 dark:text-gray-100">Credit/Debit Card</span>
                    </label>
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600">
                      <input
                        type="radio"
                        name="payment"
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-primary dark:text-secondary"
                      />
                      <span className="ml-3 text-gray-900 dark:text-gray-100">PayPal</span>
                    </label>
                  </div>
                </div>

                {/* Payment Details */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full p-2 border rounded-md dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full p-2 border rounded-md dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          CVC
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full p-2 border rounded-md dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full mt-6 bg-primary dark:bg-secondary text-white font-bold py-3 px-4 rounded transition-colors duration-150 ${
                    isProcessing ? 'opacity-75 cursor-not-allowed' : 'hover:bg-indigo-700 dark:hover:bg-amber-600'
                  }`}
                >
                  {isProcessing ? 'Processing...' : `Pay $${course.price}`}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Order Summary
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{course.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{course.instructor}</p>
                  </div>
                </div>
                <div className="border-t dark:border-gray-700 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Course Price</span>
                    <span className="text-gray-900 dark:text-gray-100">${course.price}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900 dark:text-gray-100">Total</span>
                    <span className="text-primary dark:text-secondary">${course.price}</span>
                  </div>
                </div>
              </div>

              {/* What's Included */}
              <div className="mt-6 pt-6 border-t dark:border-gray-700">
                <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  What's Included
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <HiCheck className="w-5 h-5 text-green-500 mr-2" />
                    Full lifetime access
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <HiAcademicCap className="w-5 h-5 text-green-500 mr-2" />
                    Certificate of completion
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <HiShieldCheck className="w-5 h-5 text-green-500 mr-2" />
                    30-day money-back guarantee
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnrollmentPage;