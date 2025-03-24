import React, { useState, FormEvent, ChangeEvent } from 'react';
import { HiMail, HiPhone, HiLocationMarker, HiClock, HiChat, HiGlobe, HiPaperAirplane, HiCheck } from 'react-icons/hi';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Form submitted:', formData);
    
    setIsSubmitting(false);
    setSubmitSuccess(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitSuccess(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'chat':
        // In a real app, this would initialize a chat widget
        window.open('https://wa.me/1234567890', '_blank'); // Example WhatsApp link
        break;
      case 'directions':
        // Open Google Maps with your location
        window.open('https://www.google.com/maps/search/?api=1&query=123+Education+St,City,Country', '_blank');
        break;
      case 'email':
        // Open default email client
        window.open('mailto:info@educenter.com?subject=Inquiry%20about%20courses', '_blank');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg">
      {/* Hero Section */}
      <div className="bg-indigo-50 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 sm:text-5xl mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Have questions about our courses? Want to learn more about our teaching methods? We're here to help!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Contact Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: <HiChat className="w-8 h-8" />,
              title: "Chat with Us",
              description: "Get instant answers during business hours",
              action: "Start Chat",
              onClick: () => handleQuickAction('chat'),
              color: "text-blue-500"
            },
            {
              icon: <HiGlobe className="w-8 h-8" />,
              title: "Visit Our Center",
              description: "Come see our facilities in person",
              action: "Get Directions",
              onClick: () => handleQuickAction('directions'),
              color: "text-green-500"
            },
            {
              icon: <HiMail className="w-8 h-8" />,
              title: "Email Support",
              description: "We'll respond within 24 hours",
              action: "Send Email",
              onClick: () => handleQuickAction('email'),
              color: "text-purple-500"
            }
          ].map((item, index) => (
            <div key={index} className="bg-white text-center dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col items-center">
              <div className={`${item.color} mb-4`}>{item.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {item.description}
              </p>
              <button 
                onClick={item.onClick}
                className="text-primary dark:text-secondary hover:underline flex items-center"
              >
                {item.action}
                <HiPaperAirplane className="w-4 h-4 ml-2 transform rotate-90" />
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Contact Information
            </h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-indigo-50 dark:bg-gray-700 rounded-lg">
                    <HiLocationMarker className="w-6 h-6 text-primary dark:text-secondary" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Our Location</h3>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">
                    123 Education St<br />
                    City, Country 12345
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-indigo-50 dark:bg-gray-700 rounded-lg">
                    <HiPhone className="w-6 h-6 text-primary dark:text-secondary" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Phone</h3>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">
                    +1 234 567 8900<br />
                    +1 234 567 8901
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-indigo-50 dark:bg-gray-700 rounded-lg">
                    <HiMail className="w-6 h-6 text-primary dark:text-secondary" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Email</h3>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">
                    info@educenter.com<br />
                    support@educenter.com
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-indigo-50 dark:bg-gray-700 rounded-lg">
                    <HiClock className="w-6 h-6 text-primary dark:text-secondary" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Business Hours</h3>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">
                    Monday - Friday: 9:00 AM - 5:00 PM<br />
                    Saturday: 10:00 AM - 2:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                  placeholder="Your message here..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center px-6 py-3 rounded-lg text-white transition-all duration-300 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : submitSuccess
                    ? 'bg-green-500'
                    : 'bg-primary hover:bg-primary/90 dark:bg-secondary dark:hover:bg-secondary/90'
                }`}
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Sending...</span>
                ) : submitSuccess ? (
                  <span className="flex items-center">
                    Message Sent
                    <HiCheck className="w-5 h-5 ml-2" />
                  </span>
                ) : (
                  <span className="flex items-center">
                    Send Message
                    <HiPaperAirplane className="w-5 h-5 ml-2 transform rotate-90" />
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
