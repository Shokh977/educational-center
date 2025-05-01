// Cloudinary configuration and upload services
import axios from 'axios';

// Base API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Uploads an image to Cloudinary via the server and returns the secure URL
 * @param {File} file - The image file to upload
 * @param {string} folder - Optional folder name to organize uploads (e.g., 'profile_images', 'course_thumbnails')
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export const uploadImageToCloudinary = async (file: File, folder: string = ''): Promise<string> => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Get token from localStorage for authentication
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }    // Create form data for the upload
    const formData = new FormData();
    formData.append('image', file);
    
    // Log the API URL and folder for debugging
    console.log(`Uploading to API URL: ${API_URL}, folder: ${folder}`);
    
    if (folder === 'profile_images') {
      // Use profile-specific endpoint for profile images
      const response = await axios.post(
        `${API_URL}/upload/profile`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data.imageUrl;
    } else if (folder === 'blog_images') {
      // Use blog-specific endpoint for blog images
      const response = await axios.post(
        `${API_URL}/upload/blog`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data.imageUrl;
    } else {
      // Use general upload endpoint for all other images (courses, etc.)
      const response = await axios.post(
        `${API_URL}/upload/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          params: {
            folder: folder // Pass the folder as a query parameter
          }
        }
      );
      
      return response.data.imageUrl;
    }
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Generates a Cloudinary URL with transformations
 * @param {string} imageUrl - The original Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {string} - The transformed image URL
 */
export const getTransformedImageUrl = (imageUrl: string, options: any = {}): string => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return imageUrl; // Return original URL if not a Cloudinary URL
  }

  // Default transformations for profile images
  const defaults = {
    width: options.width || 300,
    height: options.height || 300,
    crop: options.crop || 'fill',
    gravity: options.gravity || 'face',
    quality: options.quality || 'auto',
    fetchFormat: options.fetchFormat || 'auto'
  };

  // Split the URL to insert transformations
  const parts = imageUrl.split('/upload/');
  if (parts.length !== 2) return imageUrl;

  // Build transformation string
  const transformations = [
    `w_${defaults.width}`,
    `h_${defaults.height}`,
    `c_${defaults.crop}`,
    `g_${defaults.gravity}`,
    `q_${defaults.quality}`,
    `f_${defaults.fetchFormat}`
  ].join(',');

  // Return transformed URL
  return `${parts[0]}/upload/${transformations}/${parts[1]}`;
};

/**
 * Updates a user's profile with a new image uploaded to Cloudinary
 * @param {string} name - The user's name
 * @param {File|null} imageFile - The new profile image file (or null if not changing)
 * @param {string} userId - The user's ID (for tracking purposes)
 * @returns {Promise<string>} - The URL of the new profile image (or empty if no new image)
 */
export const updateUserProfileWithCloudinary = async (
  name: string,
  imageFile: File | null,
  userId: string
): Promise<string> => {
  try {
    let imageUrl = '';
    
    // Upload the new image to Cloudinary if provided
    if (imageFile) {
      console.log('Attempting to upload image to Cloudinary...');
      
      // Get token for authorization
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token missing');
      }
        // Create form data for the upload
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('userId', userId); // Include userId for tracking

      // Make sure we're using the correct API URL format
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Ensure URL format is consistent (remove any trailing slashes)
      const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
      const uploadEndpoint = `${baseUrl}/api/upload/profile`;
      
      console.log('Uploading to endpoint:', uploadEndpoint);
      
      const response = await axios.post(
        uploadEndpoint, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.imageUrl) {
        imageUrl = response.data.imageUrl;
        console.log('Successfully uploaded image, received URL:', imageUrl);
      } else {
        console.error('Upload succeeded but no image URL was returned:', response.data);
      }
    }
    
    return imageUrl;
  } catch (error) {
    console.error('Error updating profile with Cloudinary:', error);
    if (axios.isAxiosError(error)) {
      console.error('API error details:', error.response?.data);
    }
    throw error;
  }
};
