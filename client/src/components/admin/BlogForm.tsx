import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { uploadImageToCloudinary } from '../../services/cloudinary';

interface BlogFormProps {
  onSubmit: (formData: BlogFormData) => void;
  initialData?: BlogFormData;
  isEditing?: boolean;
}

export interface BlogFormData {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  category: string;
  tags: string;
  status: 'draft' | 'published';
  _id?: string;
}

const BlogForm: React.FC<BlogFormProps> = ({ onSubmit, initialData, isEditing = false }) => {
  const { token } = useAuth();
  
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    category: 'other',
    tags: '',
    status: 'draft',
    ...initialData
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    // Set preview image if we have initialData with coverImage
    if (initialData?.coverImage) {
      setPreviewImage(initialData.coverImage);
    }
  }, [initialData]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // If we have a new image, upload it first
      if (imageFile) {
        setIsUploading(true);
        setUploadProgress(0);
        
        const imageUrl = await uploadImageToCloudinary(imageFile, 'blog_images');
        
        if (imageUrl) {
          setFormData(prev => ({
            ...prev,
            coverImage: imageUrl
          }));
          
          // Submit the form with the new image URL
          onSubmit({
            ...formData,
            coverImage: imageUrl
          });
        } else {
          throw new Error('Failed to upload image');
        }
        
        setIsUploading(false);
        setUploadProgress(100);
      } else {
        // If no new image, just submit the current form data
        onSubmit(formData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit blog post');
      setIsUploading(false);
    }
  };
  
  const categoryOptions = [
    { value: 'education', label: 'Education' },
    { value: 'technology', label: 'Technology' },
    { value: 'career', label: 'Career' },
    { value: 'learning', label: 'Learning' },
    { value: 'teaching', label: 'Teaching' },
    { value: 'other', label: 'Other' }
  ];
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Enter blog post title"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Excerpt *
          </label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Brief summary of the blog post (max 300 characters)"
            maxLength={300}
          />
        </div>
        
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Content *
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            required
            rows={12}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Write your blog post content here..."
          />
        </div>
        
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Cover Image *
          </label>
          <div className="flex flex-col space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            
            {isUploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
            
            {previewImage && (
              <div className="relative mt-2">
                <img 
                  src={previewImage} 
                  alt="Cover preview" 
                  className="max-h-64 rounded-md object-cover"
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="e.g., education, learning, technology"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="status"
                value="draft"
                checked={formData.status === 'draft'}
                onChange={handleInputChange}
                className="form-radio h-5 w-5 text-primary"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Draft</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="status"
                value="published"
                checked={formData.status === 'published'}
                onChange={handleInputChange}
                className="form-radio h-5 w-5 text-primary"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Published</span>
            </label>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUploading}
            className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : isEditing ? 'Update Post' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;
