import React from 'react';
import { Link } from 'react-router-dom';
import { HiMail, HiPhone, HiLocationMarker, HiClock } from 'react-icons/hi';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white mt-16 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">EduCenter</h3>
            <p className="text-gray-400">Transforming lives through education</p>
            <div className="flex space-x-4 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary dark:hover:text-secondary transition-colors">
                Follow us on Facebook
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary dark:hover:text-secondary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/courses" className="text-gray-400 hover:text-primary dark:hover:text-secondary transition-colors">Courses</Link>
              </li>
              <li>
                <Link to="/teachers" className="text-gray-400 hover:text-primary dark:hover:text-secondary transition-colors">Teachers</Link>
              </li>
              <li>
                <Link to="/performance" className="text-gray-400 hover:text-primary dark:hover:text-secondary transition-colors">Performance</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-primary dark:hover:text-secondary transition-colors">Contact</Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-primary dark:hover:text-secondary transition-colors">Blog</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-400">
                <HiPhone className="w-5 h-5 mr-2 text-primary dark:text-secondary" />
                +1 234 567 8900
              </li>
              <li className="flex items-center text-gray-400">
                <HiMail className="w-5 h-5 mr-2 text-primary dark:text-secondary" />
                info@educenter.com
              </li>
              <li className="flex items-start text-gray-400">
                <HiLocationMarker className="w-5 h-5 mr-2 mt-1 text-primary dark:text-secondary" />
                <span>123 Education St<br />City, Country 12345</span>
              </li>
              <li className="flex items-start text-gray-400">
                <HiClock className="w-5 h-5 mr-2 mt-1 text-primary dark:text-secondary" />
                <span>Mon - Fri: 9:00 AM - 5:00 PM<br />Sat: 10:00 AM - 2:00 PM</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-400 mb-4">Subscribe to our newsletter for updates and special offers.</p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary hover:bg-primary/90 dark:bg-secondary dark:hover:bg-secondary/90 text-white rounded-lg transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400">&copy; {new Date().getFullYear()} EduCenter. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;