import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiCalendar, HiUser, HiTag, HiSearch } from 'react-icons/hi';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  category: string;
  tags: string[];
  image: string;
  slug: string;
}

const Blog: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Mock data - In a real app, this would come from your API
  useEffect(() => {
    // Simulate API call
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        // Simulating network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock data
        const mockPosts: BlogPost[] = [
          {
            id: '1',
            title: 'Introduction to Online Learning: Benefits and Challenges',
            excerpt: 'Discover the advantages and potential hurdles of digital education in today\'s interconnected world.',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, diam quis aliquam ultricies, nisl nunc ultricies nunc, quis ultricies nisl nunc quis nisl.',
            author: {
              name: 'Dr. Jane Smith',
              avatar: 'https://randomuser.me/api/portraits/women/12.jpg'
            },
            date: '2025-03-15',
            category: 'Online Learning',
            tags: ['education', 'e-learning', 'technology'],
            image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
            slug: 'introduction-to-online-learning'
          },
          {
            id: '2',
            title: 'How to Stay Motivated During Your Educational Journey',
            excerpt: 'Practical tips and strategies to maintain motivation and focus while pursuing your academic goals.',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, diam quis aliquam ultricies, nisl nunc ultricies nunc, quis ultricies nisl nunc quis nisl.',
            author: {
              name: 'Prof. Michael Johnson',
              avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
            },
            date: '2025-03-10',
            category: 'Student Tips',
            tags: ['motivation', 'study habits', 'student life'],
            image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            slug: 'how-to-stay-motivated'
          },
          {
            id: '3',
            title: 'The Future of Education: AI and Machine Learning',
            excerpt: 'Exploring how artificial intelligence is transforming educational methods and revolutionizing personalized learning.',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, diam quis aliquam ultricies, nisl nunc ultricies nunc, quis ultricies nisl nunc quis nisl.',
            author: {
              name: 'Dr. Robert Chen',
              avatar: 'https://randomuser.me/api/portraits/men/67.jpg'
            },
            date: '2025-03-05',
            category: 'Educational Technology',
            tags: ['ai', 'machine learning', 'future', 'technology'],
            image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            slug: 'future-of-education-ai'
          },
          {
            id: '4',
            title: 'Best Practices for Online Teaching',
            excerpt: 'Expert guidelines for educators to create engaging and effective virtual learning experiences.',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, diam quis aliquam ultricies, nisl nunc ultricies nunc, quis ultricies nisl nunc quis nisl.',
            author: {
              name: 'Sarah Williams',
              avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
            },
            date: '2025-03-01',
            category: 'Teaching',
            tags: ['teaching', 'online', 'best practices'],
            image: 'https://images.unsplash.com/photo-1581078426770-6d336e5de7bf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            slug: 'best-practices-online-teaching'
          },
          {
            id: '5',
            title: 'Balancing Work and Education: A Guide for Working Students',
            excerpt: 'Practical advice for managing professional responsibilities alongside educational pursuits.',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, diam quis aliquam ultricies, nisl nunc ultricies nunc, quis ultricies nisl nunc quis nisl.',
            author: {
              name: 'Thomas Anderson',
              avatar: 'https://randomuser.me/api/portraits/men/94.jpg'
            },
            date: '2025-02-25',
            category: 'Student Tips',
            tags: ['work-life balance', 'time management', 'student life'],
            image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            slug: 'balancing-work-education'
          }
        ];

        setBlogPosts(mockPosts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  // Filter posts based on search term and category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  // Extract unique categories
  const categories = Array.from(new Set(blogPosts.map(post => post.category)));

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg">
      {/* Hero Section */}
      <section className="py-16 bg-indigo-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-5xl mb-4">
            Our Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Stay updated with the latest insights, tips, and trends in education
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                {/* Search */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Search</h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search posts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <HiSearch className="absolute right-3 top-3 text-gray-400" />
                  </div>
                </div>

                {/* Categories */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Categories</h3>
                  <ul className="space-y-2">
                    <li>
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`text-left w-full px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          selectedCategory === null ? 'text-primary dark:text-secondary font-medium' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        All Categories
                      </button>
                    </li>
                    {categories.map((category) => (
                      <li key={category}>
                        <button
                          onClick={() => setSelectedCategory(category)}
                          className={`text-left w-full px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            selectedCategory === category ? 'text-primary dark:text-secondary font-medium' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {category}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recent Posts */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Posts</h3>
                  <ul className="space-y-4">
                    {blogPosts.slice(0, 3).map((post) => (
                      <li key={post.id} className="border-b dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                        <Link to={`/blog/${post.slug}`} className="group">
                          <h4 className="text-gray-900 dark:text-gray-100 font-medium group-hover:text-primary dark:group-hover:text-secondary transition-colors line-clamp-2">
                            {post.title}
                          </h4>
                          <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <HiCalendar className="mr-1" />
                            <span>{new Date(post.date).toLocaleDateString()}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Blog Posts */}
            <div className="lg:col-span-3">
              {loading ? (
                // Loading skeleton
                <div className="space-y-8">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden animate-pulse">
                      <div className="h-64 bg-gray-300 dark:bg-gray-700"></div>
                      <div className="p-6">
                        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                // Error message
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                  <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="bg-primary dark:bg-secondary text-white px-4 py-2 rounded-md hover:bg-primary/90 dark:hover:bg-secondary/90"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredPosts.length === 0 ? (
                // No results
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No posts found matching your criteria.</p>
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory(null);
                    }} 
                    className="bg-primary dark:bg-secondary text-white px-4 py-2 rounded-md hover:bg-primary/90 dark:hover:bg-secondary/90"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                // Blog post list
                <div className="space-y-8">
                  {filteredPosts.map((post) => (
                    <article key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                      <Link to={`/blog/${post.slug}`}>
                        <img 
                          src={post.image} 
                          alt={post.title} 
                          className="w-full h-64 object-cover hover:opacity-90 transition-opacity"
                        />
                      </Link>
                      <div className="p-6">
                        <div className="flex items-center mb-2">
                          <span className="px-3 py-1 bg-indigo-50 dark:bg-gray-700 text-primary dark:text-secondary rounded-full text-sm">
                            {post.category}
                          </span>
                        </div>
                        <Link to={`/blog/${post.slug}`}>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 hover:text-primary dark:hover:text-secondary transition-colors mb-2">
                            {post.title}
                          </h2>
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <img 
                              src={post.author.avatar} 
                              alt={post.author.name} 
                              className="w-10 h-10 rounded-full object-cover mr-3"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {post.author.name}
                              </p>
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <HiCalendar className="mr-1" />
                                <span>{new Date(post.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <Link 
                            to={`/blog/${post.slug}`}
                            className="text-primary dark:text-secondary hover:underline"
                          >
                            Read More
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;