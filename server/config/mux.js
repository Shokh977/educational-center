// Mux configuration
const dotenv = require('dotenv');
dotenv.config();

let Video = null;
let DEFAULT_SIGNING_KEY = null;
const DEFAULT_PLAYBACK_POLICY = ['signed'];
const DEFAULT_NEW_ASSET_SETTINGS = {
  playback_policy: DEFAULT_PLAYBACK_POLICY,
  mp4_support: 'standard', // Generate MP4s for download if needed
  encoding_tier: 'standard', // Using standard encoding tier
  passthrough: '',
};

// Try to initialize Mux if environment variables are available
try {
  if (process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET) {
    const Mux = require('@mux/mux-node');
    const { Video: MuxVideo } = new Mux(
      process.env.MUX_TOKEN_ID,
      process.env.MUX_TOKEN_SECRET
    );
    
    Video = MuxVideo;
    
    // Default signing key for secure tokens
    DEFAULT_SIGNING_KEY = {
      id: process.env.MUX_SIGNING_KEY_ID,
      privateKey: process.env.MUX_SIGNING_PRIVATE_KEY
    };
    
    console.log('Mux video service initialized successfully');
  } else {
    console.log('Mux configuration not available - using Cloudinary for video processing');
  }
} catch (error) {
  console.error('Failed to initialize Mux video service:', error.message);
  console.log('Continuing with Cloudinary for video processing');
}

module.exports = {
  Video,
  DEFAULT_SIGNING_KEY,
  DEFAULT_PLAYBACK_POLICY,
  DEFAULT_NEW_ASSET_SETTINGS,
  // Function to create JWT tokens for secure playback
  
  // Helper function to check if Mux is available
  isMuxAvailable: () => !!Video
};