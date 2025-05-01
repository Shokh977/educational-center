import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiCalendar, HiSearch } from 'react-icons/hi';
import axios from 'axios';

// Empty export to ensure this file is treated as a module
export {};

interface Author {
  _id: string;
  name: string;
  profileImage?: string;
}

interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  author: Author;
  createdAt: string;
  category: string;
  coverImage: string;
  slug: string;
}

const Blog: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      setLoading(true);
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        let params = `?page=${currentPage}`;
        if (selectedCategory) params += `&category=${selectedCategory}`;
        if (searchTerm) params += `&search=${searchTerm}`;
        const { data } = await axios.get(`${API_URL}/blog${params}`);
        setBlogPosts(data.blogPosts || []);
        setTotalPages(data.totalPages || 1);
      } catch (e) {
        setError('Failed to load blog posts. Please try again later.');
      }
      setLoading(false);
    };
    fetchBlogPosts();
  }, [currentPage, selectedCategory, searchTerm]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const categories = Array.from(new Set(blogPosts.map(p => p.category))).filter(Boolean);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  const getProfileImage = (author: Author) =>
    author.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=random`;

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg">
      <section className="py-16 bg-indigo-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold">Our Blog</h1>
          <input
            type="text"
            className="mt-4 p-2 border rounded w-full max-w-md"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <div className="max-w-7xl mx-auto py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 sticky top-24 space-y-6">
          <div>
            <h2 className="font-bold mb-2">Categories</h2>
            <button onClick={() => setSelectedCategory(null)} className="block mb-1">All</button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className="block mb-1">
                {cat}
              </button>
            ))}
          </div>
        </aside>

        <main className="lg:col-span-3 space-y-8">
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && blogPosts.length === 0 && <p>No posts found.</p>}

          {!loading && !error && blogPosts.map(post => (
            <article key={post._id} className="border rounded">
              <Link to={`/blog/${post.slug}`}>
                <img src={post.coverImage} alt={post.title} className="w-full h-48 object-cover" />
              </Link>
              <div className="p-4">
                <h3 className="text-xl font-bold">
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="text-sm text-gray-600">{formatDate(post.createdAt)}</p>
                <p className="mt-2">{post.excerpt}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <img src={getProfileImage(post.author)} alt={post.author.name} className="w-8 h-8 rounded-full" />
                    <span className="ml-2">{post.author.name}</span>
                  </div>
                  <Link to={`/blog/${post.slug}`} className="text-blue-600">Read More →</Link>
                </div>
              </div>
            </article>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => handlePageChange(i+1)}>{i+1}</button>
              ))}
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Blog;
