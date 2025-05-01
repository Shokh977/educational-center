// Mux configuration
const Mux = require('@mux/mux-node');
require('dotenv').config();

// Initialize Mux client with API credentials
const { Video } = new Mux(
  process.env.MUX_TOKEN_ID,
  process.env.MUX_TOKEN_SECRET
);

// Default signing key for secure tokens
const DEFAULT_SIGNING_KEY = {
  id: process.env.MUX_SIGNING_KEY_ID,
  privateKey: process.env.MUX_SIGNING_PRIVATE_KEY
};

// Default Mux video settings
const DEFAULT_PLAYBACK_POLICY = ['signed'];
const DEFAULT_NEW_ASSET_SETTINGS = {
  playback_policy: DEFAULT_PLAYBACK_POLICY,
  mp4_support: 'standard', // Generate MP4s for download if needed
  encoding_tier: 'standard', // Using standard encoding tier
  passthrough: '',
};

module.exports = {
  Video,
  DEFAULT_SIGNING_KEY,
  DEFAULT_PLAYBACK_POLICY,
  DEFAULT_NEW_ASSET_SETTINGS,
  // Function to create JWT tokens for secure playback
  createPlaybackToken: (playbackId, options = {}) => {
    if (!DEFAULT_SIGNING_KEY.id || !DEFAULT_SIGNING_KEY.privateKey) {
      throw new Error('Mux signing key not properly configured');
    }

    const tokenOptions = {
      keyId: DEFAULT_SIGNING_KEY.id,
      keySecret: DEFAULT_SIGNING_KEY.privateKey,
      ...options
    };

    // Create playback token with the following parameters
    const token = Video.JWT.signPlaybackId(playbackId, {
      ...tokenOptions,
      // Token expiration time (default: 1 hour)
      expiration: options.expiration || Math.floor(Date.now() / 1000) + 60 * 60,
      type: 'video',
      // Additional claims/parameters as needed
      params: options.params || {}
    });

    return token;
  }
};