import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { BiPlay, BiLoaderCircle, BiLock, BiErrorCircle } from 'react-icons/bi';

interface SecureVideoPlayerProps {
  contentId: string;
  title?: string;
  height?: string;
}

const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({ 
  contentId,
  title = 'Video Lesson',
  height = '500px'
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [playbackToken, setPlaybackToken] = useState<string | null>(null);
  const [playbackId, setPlaybackId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // Get the API URL from environment variable or default
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Fetch the playback token from our server
    const fetchPlaybackToken = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${apiUrl}/api/secure-videos/playback-token/${contentId}`,
          { headers: { 'x-auth-token': token } }
        );
        
        const { playbackId, token: playbackToken } = response.data;
        setPlaybackId(playbackId);
        setPlaybackToken(playbackToken.token);
      } catch (error: any) {
        console.error('Failed to get video playback token:', error);
        setError(error.response?.data?.message || 'Failed to load video. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (contentId) {
      fetchPlaybackToken();
    }
    
    // Cleanup function
    return () => {
      if (playerRef.current) {
        playerRef.current.innerHTML = '';
      }
    };
  }, [contentId, apiUrl]);

  useEffect(() => {
    // Initialize the Mux player when we have both playbackId and token
    if (playbackId && playbackToken && playerRef.current) {
      // Clean up any previous instances
      if (playerRef.current) {
        playerRef.current.innerHTML = '';
      }
      
      // Load the Mux Player script
      if (!document.getElementById('mux-player-script')) {
        scriptRef.current = document.createElement('script');
        scriptRef.current.id = 'mux-player-script';
        scriptRef.current.src = 'https://cdn.jsdelivr.net/npm/@mux/mux-player';
        scriptRef.current.async = true;
        
        scriptRef.current.onload = () => {
          // Create the player element
          const playerEl = document.createElement('mux-player');
          playerEl.setAttribute('playback-id', playbackId);
          playerEl.setAttribute('stream-type', 'on-demand');
          
          // Set token for signed URLs
          playerEl.setAttribute('tokens', `playback=${playbackToken}`);
          
          // Set additional options
          playerEl.setAttribute('preload', 'auto');
          playerEl.setAttribute('muted', 'false');
          playerEl.style.height = '100%';
          playerEl.style.width = '100%';
          
          // Add to DOM
          if (playerRef.current) {
            playerRef.current.appendChild(playerEl);
          }
        };
        
        document.head.appendChild(scriptRef.current);
      } else {
        // If script already loaded, just create the player
        const playerEl = document.createElement('mux-player');
        playerEl.setAttribute('playback-id', playbackId);
        playerEl.setAttribute('stream-type', 'on-demand');
        playerEl.setAttribute('tokens', `playback=${playbackToken}`);
        playerEl.setAttribute('preload', 'auto');
        playerEl.style.height = '100%';
        playerEl.style.width = '100%';
        
        if (playerRef.current) {
          playerRef.current.appendChild(playerEl);
        }
      }
    }
  }, [playbackId, playbackToken]);

  if (isLoading) {
    return (
      <div 
        className="w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800" 
        style={{ height }}
      >
        <BiLoaderCircle className="animate-spin text-primary" size={50} />
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading secure video...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800" 
        style={{ height }}
      >
        <BiErrorCircle className="text-red-500" size={50} />
        <p className="mt-4 text-gray-700 dark:text-gray-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
        {title}
      </h2>
      
      <div 
        className="w-full rounded-lg overflow-hidden relative bg-black" 
        style={{ height }}
      >
        <div 
          ref={playerRef} 
          className="absolute inset-0 w-full h-full"
        ></div>
        
        {!playbackId && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <BiLock size={50} className="text-white/70" />
            <p className="mt-4 text-white/90">This content is protected</p>
          </div>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
        <BiLock className="mr-1" />
        <span>Secure playback - This video is encrypted and protected from downloading</span>
      </div>
    </div>
  );
};

export default SecureVideoPlayer;