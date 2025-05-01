const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Define the video file to upload
const videoFilePath = path.join(__dirname, '../uploads/test-video.mp4');
// Make sure you have a test video in this location, or update the path to an existing video

// Get authentication token (replace with your actual login or token retrieval)
async function getToken() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'your-email@example.com',  // Replace with valid credentials
      password: 'your-password'
    });
    
    return response.data.token;
  } catch (error) {
    console.error('Error getting token:', error.response?.data || error.message);
    throw new Error('Authentication failed');
  }
}

// Upload video
async function uploadVideo(token) {
  try {
    // Check if the test video exists
    if (!fs.existsSync(videoFilePath)) {
      console.error('Test video not found at path:', videoFilePath);
      return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('video', fs.createReadStream(videoFilePath));
    formData.append('title', 'Test Video Upload');
    formData.append('description', 'This is a test video uploaded via the test script');
    
    // Make the API request
    const response = await axios.post(
      'http://localhost:5000/api/videos/upload',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );
    
    console.log('Video uploaded successfully:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error uploading video:');
    console.error(error.response?.data || error.message);
  }
}

// Main function
async function main() {
  try {
    console.log('Getting authentication token...');
    const token = await getToken();
    
    console.log('Uploading video...');
    await uploadVideo(token);
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  main();
}

module.exports = { getToken, uploadVideo };
