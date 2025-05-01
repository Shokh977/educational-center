import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers['x-auth-token'] = token;
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    // Handle session timeout or auth errors
    if (response && response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login?session=expired';
    }
    
    return Promise.reject(error);
  }
);

// Course API functions
export const courseApi = {
  // Get all courses with optional filters
  getCourses: (filters = {}) => {
    return api.get('/api/courses', { params: filters });
  },
  
  // Get course by ID
  getCourseById: (courseId) => {
    return api.get(`/api/courses/${courseId}`);
  },
  
  // Create new course
  createCourse: (courseData) => {
    const formData = new FormData();
    
    // Convert regular fields
    Object.keys(courseData).forEach(key => {
      if (key === 'thumbnail') {
        if (courseData.thumbnail) {
          formData.append('thumbnail', courseData.thumbnail);
        }
      } else if (key === 'tags' || key === 'requirements') {
        formData.append(key, JSON.stringify(courseData[key]));
      } else {
        formData.append(key, courseData[key]);
      }
    });
    
    return api.post('/api/courses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Update course
  updateCourse: (courseId, courseData) => {
    const formData = new FormData();
    
    // Convert regular fields
    Object.keys(courseData).forEach(key => {
      if (key === 'thumbnail') {
        if (courseData.thumbnail instanceof File) {
          formData.append('thumbnail', courseData.thumbnail);
        }
      } else if (key === 'tags' || key === 'requirements') {
        formData.append(key, JSON.stringify(courseData[key]));
      } else {
        formData.append(key, courseData[key]);
      }
    });
    
    return api.put(`/api/courses/${courseId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Delete course
  deleteCourse: (courseId) => {
    return api.delete(`/api/courses/${courseId}`);
  },
  
  // Toggle course publish status
  togglePublishStatus: (courseId, status) => {
    return api.patch(`/api/courses/${courseId}/status`, { status });
  },
  
  // Get course preview (for prospective students)
  getCoursePreview: (courseId) => {
    return api.get(`/api/courses/${courseId}/preview`);
  },
  
  // Enrollment
  enrollInCourse: (courseId) => {
    return api.post(`/api/courses/${courseId}/enroll`);
  },
  
  // Get user's progress in a course
  getCourseProgress: (courseId) => {
    return api.get(`/api/courses/${courseId}/progress`);
  },
  
  // Mark content as completed
  markContentCompleted: (courseId, chapterId, contentId) => {
    return api.post(`/api/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/complete`);
  },
  
  // Add a chapter to a course
  addChapter: (courseId, chapterData) => {
    return api.post(`/api/courses/${courseId}/chapters`, chapterData);
  },
  
  // Add content to a chapter
  addContent: (courseId, chapterId, contentData) => {
    const formData = new FormData();
    
    // Convert regular fields
    Object.keys(contentData).forEach(key => {
      if (key === 'file') {
        if (contentData.file) {
          if (contentData.type === 'video') {
            formData.append('video', contentData.file);
          } else if (contentData.type === 'pdf') {
            formData.append('file', contentData.file);
          }
        }
      } else {
        formData.append(key, typeof contentData[key] === 'boolean' ? 
          (contentData[key] ? 'true' : 'false') : 
          contentData[key]);
      }
    });
    
    return api.post(`/api/courses/${courseId}/chapters/${chapterId}/contents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Update chapter order
  updateChapterOrder: (courseId, chapterOrders) => {
    return api.put(`/api/courses/${courseId}/chapters/order`, { chapterOrders });
  },
  
  // Get enrolled students for a course
  getEnrolledStudents: (courseId, page = 1, limit = 20) => {
    return api.get(`/api/courses/${courseId}/students`, {
      params: { page, limit }
    });
  }
};

// User API functions
export const userApi = {
  // Get current user
  getCurrentUser: () => {
    return api.get('/api/auth/me');
  },
  
  // Login
  login: (email, password) => {
    return api.post('/api/auth/login', { email, password });
  },
  
  // Register
  register: (userData) => {
    return api.post('/api/auth/register', userData);
  },
  
  // Update profile
  updateProfile: (profileData) => {
    const formData = new FormData();
    
    Object.keys(profileData).forEach(key => {
      if (key === 'profileImage' && profileData.profileImage instanceof File) {
        formData.append('profileImage', profileData.profileImage);
      } else {
        formData.append(key, profileData[key]);
      }
    });
    
    return api.put('/api/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Change password
  changePassword: (currentPassword, newPassword) => {
    return api.post('/api/auth/change-password', {
      currentPassword,
      newPassword
    });
  },
  
  // Get user enrollments
  getEnrollments: () => {
    return api.get('/api/profile/enrollments');
  }
};

// Admin API functions
export const adminApi = {
  // Get all users
  getUsers: () => {
    return api.get('/api/admin/users');
  },
  
  // Update user role
  updateUserRole: (userId, role) => {
    return api.patch(`/api/admin/users/${userId}/role`, { role });
  },
  
  // Delete user
  deleteUser: (userId) => {
    return api.delete(`/api/admin/users/${userId}`);
  },
  
  // Get all courses with statistics
  getCourses: () => {
    return api.get('/api/admin/courses');
  },
  
  // Save course draft
  saveDraft: (draftData) => {
    const formData = new FormData();
    
    // Convert regular fields
    Object.keys(draftData).forEach(key => {
      if (key === 'thumbnail') {
        if (draftData.thumbnail instanceof File) {
          formData.append('thumbnail', draftData.thumbnail);
        }
      } else if (key === 'tags' || key === 'requirements') {
        formData.append(key, JSON.stringify(draftData[key]));
      } else {
        formData.append(key, draftData[key]);
      }
    });
    
    return api.post('/api/admin/courses/drafts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Get course drafts
  getDrafts: () => {
    return api.get('/api/admin/courses/drafts');
  },
  
  // Get draft by ID
  getDraftById: (draftId) => {
    return api.get(`/api/admin/courses/drafts/${draftId}`);
  },
  
  // Delete draft
  deleteDraft: (draftId) => {
    return api.delete(`/api/admin/courses/drafts/${draftId}`);
  }
};

export default api;
