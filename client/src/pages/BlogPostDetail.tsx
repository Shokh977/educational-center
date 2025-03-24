import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiCalendar, HiUser, HiTag, HiArrowLeft, HiThumbUp, HiReply, HiFlag } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  fullContent?: string;
  author: {
    name: string;
    avatar: string;
    bio?: string;
  };
  date: string;
  category: string;
  tags: string[];
  image: string;
  slug: string;
}

interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  date: string;
  likes: number;
  replies?: Comment[];
  isLiked?: boolean;
}

const BlogPostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Simulate API call to get blog post data
    const fetchBlogPost = async () => {
      try {
        setLoading(true);
        // Simulating network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock data - in a real app, you would fetch this from your API
        const mockPost: BlogPost = {
          id: '1',
          title: 'Introduction to Online Learning: Benefits and Challenges',
          content: 'Discover the advantages and potential hurdles of digital education in today\'s interconnected world.',
          fullContent: `
          <p class="mb-4">Online learning has revolutionized education by providing flexible, accessible, and personalized learning experiences. This digital transformation has broken down geographic barriers, allowing students worldwide to access quality education regardless of their location. However, like any educational approach, it comes with its own set of challenges and considerations.</p>
          
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-4">Key Benefits of Online Learning</h2>
          
          <p class="mb-4">The flexibility of online education allows students to learn at their own pace and on their own schedule, making it ideal for working professionals, parents, and individuals with other commitments. This accessibility extends education to those who might otherwise be unable to attend traditional institutions due to geographical, physical, or financial constraints.</p>
          
          <p class="mb-4">Additionally, many online courses offer personalized learning paths, adapting to individual student needs and learning styles. This customization can lead to better retention of information and more effective learning outcomes. The digital nature of online education also provides immediate access to a wealth of resources, from e-books to research papers, enhancing the learning experience.</p>
          
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-4">Challenges to Consider</h2>
          
          <p class="mb-4">Despite its advantages, online learning presents several challenges. The lack of face-to-face interaction can lead to feelings of isolation and reduced motivation for some students. Effective online learning requires strong self-discipline and time management skills, which not all learners have developed.</p>
          
          <p class="mb-4">Technical issues, such as unreliable internet connections or unfamiliarity with digital platforms, can also hinder the learning process. Additionally, not all subjects or skills are easily taught in a virtual environment, particularly those requiring hands-on practice or specialized equipment.</p>
          
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-4">Best Practices for Success</h2>
          
          <p class="mb-4">To maximize the benefits of online learning, both educators and learners should adopt certain best practices. Educators should design courses with clear objectives, engaging multimedia content, and regular opportunities for interaction and feedback. They should also provide comprehensive technical support and establish a strong online presence to guide and motivate students.</p>
          
          <p class="mb-4">For learners, establishing a regular study schedule, creating a dedicated learning environment, and actively participating in online discussions can enhance the educational experience. Developing digital literacy skills and maintaining open communication with instructors and peers are also crucial for success.</p>
          
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-4">Conclusion</h2>
          
          <p class="mb-4">Online learning offers tremendous potential to transform education and make it more accessible and personalized. While challenges exist, they can be overcome with thoughtful course design, appropriate support systems, and the development of essential skills for digital learning. As technology continues to evolve, the landscape of online education will undoubtedly continue to expand and improve, offering even more innovative and effective learning opportunities.</p>
          `,
          author: {
            name: 'Dr. Jane Smith',
            avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
            bio: 'Dr. Jane Smith is an educational technology researcher and online learning specialist with over 15 years of experience. She has published numerous papers on digital pedagogy and innovative teaching methods.'
          },
          date: '2025-03-15',
          category: 'Online Learning',
          tags: ['education', 'e-learning', 'technology', 'digital transformation'],
          image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
          slug: 'introduction-to-online-learning'
        };

        // Mock related posts
        const mockRelatedPosts: BlogPost[] = [
          {
            id: '2',
            title: 'How to Stay Motivated During Your Educational Journey',
            content: 'Practical tips and strategies to maintain motivation and focus while pursuing your academic goals.',
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
            content: 'Exploring how artificial intelligence is transforming educational methods and revolutionizing personalized learning.',
            author: {
              name: 'Dr. Robert Chen',
              avatar: 'https://randomuser.me/api/portraits/men/67.jpg'
            },
            date: '2025-03-05',
            category: 'Educational Technology',
            tags: ['ai', 'machine learning', 'future', 'technology'],
            image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            slug: 'future-of-education-ai'
          }
        ];

        // Mock comments
        const mockComments: Comment[] = [
          {
            id: '1',
            user: {
              id: '101',
              name: 'Emily Rodriguez',
              avatar: 'https://randomuser.me/api/portraits/women/33.jpg'
            },
            content: 'This article provides an excellent overview of online learning. I particularly appreciated the section on overcoming challenges, as that\'s something I\'ve struggled with as a remote student.',
            date: '2025-03-16T15:32:00',
            likes: 12,
            isLiked: false,
            replies: [
              {
                id: '1-1',
                user: {
                  id: '102',
                  name: 'William Chen',
                  avatar: 'https://randomuser.me/api/portraits/men/42.jpg'
                },
                content: 'I agree with you, Emily! The tips about creating a dedicated study space really helped me improve my focus during online classes.',
                date: '2025-03-16T16:04:00',
                likes: 3,
                isLiked: true
              }
            ]
          },
          {
            id: '2',
            user: {
              id: '103',
              name: 'Dr. Aisha Johnson',
              avatar: 'https://randomuser.me/api/portraits/women/84.jpg'
            },
            content: 'As someone who teaches both online and in-person courses, I can attest to the unique benefits and challenges of digital education. I would add that building a sense of community is crucial for successful online learning environments.',
            date: '2025-03-16T12:15:00',
            likes: 8,
            isLiked: false
          },
          {
            id: '3',
            user: {
              id: '104',
              name: 'Marcus Wilson',
              avatar: 'https://randomuser.me/api/portraits/men/78.jpg'
            },
            content: 'I\'d be interested in learning more about how different learning styles can be accommodated in online settings. Do you have any resources or follow-up articles on this topic?',
            date: '2025-03-16T09:47:00',
            likes: 5,
            isLiked: false,
            replies: [
              {
                id: '3-1',
                user: {
                  id: '105',
                  name: 'Dr. Jane Smith',
                  avatar: 'https://randomuser.me/api/portraits/women/12.jpg'
                },
                content: "Great question, Marcus! I'll be covering this topic in my next article, but in the meantime, check out the research by Dr. Lisa Martinez on \"Multimodal Learning in Digital Environments\" - it provides excellent insights on adapting online content for different learning preferences.",
                date: '2025-03-16T10:22:00',
                likes: 7,
                isLiked: false
              }
            ]
          }
        ];

        if (slug === 'introduction-to-online-learning') {
          setPost(mockPost);
          setRelatedPosts(mockRelatedPosts);
          setComments(mockComments);
        } else {
          // Simulate not finding the post
          setError('Blog post not found');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post. Please try again later.');
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlogPost();
    }
  }, [slug]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    // Create new comment object
    const newCommentObject: Comment = {
      id: `new-${Date.now()}`,
      user: {
        id: user?.id || 'guest',
        name: user?.name || 'Guest User',
        avatar: user?.role === 'teacher' 
          ? 'https://randomuser.me/api/portraits/women/22.jpg' // Placeholder teacher avatar
          : 'https://randomuser.me/api/portraits/men/22.jpg'   // Placeholder student avatar
      },
      content: newComment,
      date: new Date().toISOString(),
      likes: 0,
      isLiked: false
    };
    
    // Add to comments
    setComments([newCommentObject, ...comments]);
    setNewComment('');
  };

  const handleReplySubmit = (commentId: string, parentId: string = '') => {
    const replyId = parentId || commentId;
    const replyContent = replyText[replyId];
    
    if (!replyContent || !replyContent.trim()) return;
    
    // Create new reply
    const newReply: Comment = {
      id: `${commentId}-${Date.now()}`,
      user: {
        id: user?.id || 'guest',
        name: user?.name || 'Guest User',
        avatar: user?.role === 'teacher' 
          ? 'https://randomuser.me/api/portraits/women/22.jpg' 
          : 'https://randomuser.me/api/portraits/men/22.jpg'
      },
      content: replyContent,
      date: new Date().toISOString(),
      likes: 0,
      isLiked: false
    };
    
    // Add reply to the correct comment
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply]
        };
      }
      return comment;
    });
    
    setComments(updatedComments);
    
    // Clear the reply state
    const updatedReplyText = { ...replyText };
    delete updatedReplyText[replyId];
    setReplyText(updatedReplyText);
    setReplyingTo(null);
  };

  const toggleLike = (commentId: string, isReply: boolean = false, parentId: string = '') => {
    if (isReply) {
      // Handle liking a reply
      const updatedComments = comments.map(comment => {
        if (comment.id === parentId && comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                  isLiked: !reply.isLiked
                };
              }
              return reply;
            })
          };
        }
        return comment;
      });
      setComments(updatedComments);
    } else {
      // Handle liking a main comment
      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            isLiked: !comment.isLiked
          };
        }
        return comment;
      });
      setComments(updatedComments);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full mr-4"></div>
              <div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </div>
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
            <p className="text-red-500 dark:text-red-400 mb-4">{error || 'Blog post not found'}</p>
            <Link 
              to="/blog"
              className="bg-primary dark:bg-secondary text-white px-4 py-2 rounded-md hover:bg-primary/90 dark:hover:bg-secondary/90 inline-flex items-center"
            >
              <HiArrowLeft className="mr-2" />
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg">
      {/* Hero Image */}
      <div className="relative">
        <div className="h-80 sm:h-96 w-full object-cover bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-gray-800 dark:to-gray-900">
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {post.title}
            </h1>
            <div className="flex items-center text-white">
              <img 
                src={post.author.avatar} 
                alt={post.author.name} 
                className="w-10 h-10 rounded-full object-cover mr-3 shadow-md"
              />
              <div>
                <p className="font-medium">{post.author.name}</p>
                <div className="flex items-center text-sm opacity-80">
                  <HiCalendar className="mr-1" />
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Article Content */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="p-8">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map((tag) => (
                      <Link 
                        key={tag} 
                        to={`/blog?tag=${tag}`}
                        className="px-3 py-1 bg-indigo-50 dark:bg-gray-700 text-primary dark:text-secondary rounded-full text-sm hover:bg-indigo-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>

                  {/* Article body */}
                  <div 
                    className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-600 dark:prose-p:text-gray-400"
                    dangerouslySetInnerHTML={{ __html: post.fullContent || '' }}
                  />

                  {/* Author bio */}
                  <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-start">
                      <img 
                        src={post.author.avatar} 
                        alt={post.author.name} 
                        className="w-16 h-16 rounded-full object-cover mr-4"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          About {post.author.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {post.author.bio}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    Comments ({comments.length})
                  </h2>

                  {/* Comment Form */}
                  <div className="mb-8">
                    <form onSubmit={handleCommentSubmit}>
                      <div className="mb-4">
                        <textarea
                          placeholder={user ? "Add a comment..." : "Please login to comment"}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                          rows={4}
                          disabled={!user}
                        ></textarea>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-md hover:bg-primary/90 dark:hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!user || !newComment.trim()}
                        >
                          Submit Comment
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-start">
                          <img 
                            src={comment.user.avatar} 
                            alt={comment.user.name} 
                            className="w-10 h-10 rounded-full object-cover mr-3"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                  {comment.user.name}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(comment.date).toLocaleString()}
                                </p>
                              </div>
                              <button
                                className="text-gray-400 hover:text-gray-500"
                                title="Report"
                              >
                                <HiFlag className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 mb-3">
                              {comment.content}
                            </div>
                            <div className="flex items-center space-x-4">
                              <button
                                className={`flex items-center text-sm ${
                                  comment.isLiked 
                                    ? 'text-primary dark:text-secondary' 
                                    : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-secondary'
                                }`}
                                onClick={() => toggleLike(comment.id)}
                                disabled={!user}
                              >
                                <HiThumbUp className="w-4 h-4 mr-1" />
                                <span>{comment.likes}</span>
                              </button>
                              <button
                                className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-secondary"
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                disabled={!user}
                              >
                                <HiReply className="w-4 h-4 mr-1" />
                                <span>Reply</span>
                              </button>
                            </div>
                            
                            {/* Reply Form */}
                            {replyingTo === comment.id && (
                              <div className="mt-4">
                                <div className="ml-6 mb-3">
                                  <textarea
                                    placeholder="Write a reply..."
                                    value={replyText[comment.id] || ''}
                                    onChange={(e) => setReplyText({...replyText, [comment.id]: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                    rows={2}
                                  ></textarea>
                                </div>
                                <div className="ml-6 flex justify-end space-x-2">
                                  <button
                                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                                    onClick={() => setReplyingTo(null)}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    className="px-3 py-1 bg-primary dark:bg-secondary text-white rounded-md hover:bg-primary/90 dark:hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => handleReplySubmit(comment.id)}
                                    disabled={!replyText[comment.id] || !replyText[comment.id].trim()}
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="mt-4 ml-6 space-y-4">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                                    <div className="flex items-start">
                                      <img 
                                        src={reply.user.avatar} 
                                        alt={reply.user.name} 
                                        className="w-8 h-8 rounded-full object-cover mr-3"
                                      />
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                          <div>
                                            <h5 className="font-medium text-gray-900 dark:text-gray-100">
                                              {reply.user.name}
                                            </h5>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                              {new Date(reply.date).toLocaleString()}
                                            </p>
                                          </div>
                                          <button
                                            className="text-gray-400 hover:text-gray-500"
                                            title="Report"
                                          >
                                            <HiFlag className="w-4 h-4" />
                                          </button>
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-400 mb-2">
                                          {reply.content}
                                        </div>
                                        <div className="flex items-center space-x-4">
                                          <button
                                            className={`flex items-center text-sm ${
                                              reply.isLiked 
                                                ? 'text-primary dark:text-secondary' 
                                                : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-secondary'
                                            }`}
                                            onClick={() => toggleLike(reply.id, true, comment.id)}
                                            disabled={!user}
                                          >
                                            <HiThumbUp className="w-4 h-4 mr-1" />
                                            <span>{reply.likes}</span>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                {/* Related Posts */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Related Posts
                  </h3>
                  <div className="space-y-4">
                    {relatedPosts.map((related) => (
                      <div key={related.id} className="group">
                        <Link to={`/blog/${related.slug}`}>
                          <div className="mb-2 overflow-hidden rounded-lg">
                            <img 
                              src={related.image} 
                              alt={related.title} 
                              className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-secondary transition-colors">
                            {related.title}
                          </h4>
                        </Link>
                        <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <HiCalendar className="mr-1" />
                          <span>{new Date(related.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <Link 
                      to="/blog"
                      className="text-primary dark:text-secondary hover:underline"
                    >
                      View All Posts
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostDetail;