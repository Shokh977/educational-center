require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db'); // Import the connectDB function
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const net = require('net');

const app = express();

// CORS Configuration - More permissive for development
app.use(cors({
  origin: true, // Allow any origin in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With', 'x-auth-token'],
  exposedHeaders: ['Access-Control-Allow-Origin']
}));

// Pre-flight requests
app.options('*', cors());

// Body parser middleware
app.use(express.json());

// Cookie parser middleware
app.use(cookieParser());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Find available port
function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        findAvailablePort(startPort + 1).then(resolve, reject);
      } else {
        reject(err);
      }
    });

    server.listen(startPort, () => {
      server.close(() => {
        resolve(startPort);
      });
    });
  });
}

// Check MongoDB connection
const checkMongoDBConnection = async () => {
  try {
    // Try to connect to MongoDB using our improved connectDB function
    await connectDB();
    console.log('MongoDB connection successful');
    return true;
  } catch (error) {
    console.error('\n=== MongoDB Connection Error ===');
    console.error('Unable to connect to MongoDB at:', process.env.MONGODB_URI);
    console.error(error);
    console.error('\nPossible solutions:');
    console.error('1. If using MongoDB locally:');
    console.error('   - Make sure MongoDB is installed and running');
    console.error('   - Run "mongod" in a separate terminal to start MongoDB server');
    console.error('   - Install MongoDB: https://www.mongodb.com/try/download/community');
    console.error('2. If using MongoDB Atlas:');
    console.error('   - Check your internet connection');
    console.error('   - Verify the connection string in .env is correct');
    console.error('   - Make sure IP whitelist in Atlas allows your connection');
    console.error('===================================\n');
    return false;
  }
};

// Start server function
const startServer = async () => {
  try {
    // Check MongoDB connection first
    const isConnected = await checkMongoDBConnection();
    
    if (!isConnected) {
      console.log('Warning: Starting server without MongoDB connection.');
      console.log('Limited functionality will be available.');
    }

    // Create uploads directory if it doesn't exist
    const fs = require('fs');
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }    // Register routes
    app.use('/api/auth', authRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/upload', uploadRoutes); // Add this line to register upload routes
    
    // Add other routes
    const publicRoutes = require('./routes/public');
    app.use('/api/public', publicRoutes);

    const coursesRoutes = require('./routes/courses');
    app.use('/api/courses', coursesRoutes);

    const usersRoutes = require('./routes/users');
    app.use('/api/users', usersRoutes);
    
    const modulesRoutes = require('./routes/modules');
    app.use('/api/modules', modulesRoutes);
    
    // Add profile routes for consistent user data updates
    const profileRoutes = require('./routes/profile');
    app.use('/api/profile', profileRoutes);
    
    // Add video upload routes for Cloudinary integration
    const videoRoutes = require('./routes/videos');
    app.use('/api/videos', videoRoutes);
    
    // Add secure videos routes for Mux integration
    const secureVideosRoutes = require('./routes/secureVideos');
    app.use('/api/secure-videos', secureVideosRoutes);
    
    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Server error:', err);
      
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json');
        
        const errorResponse = {
          message: err.message || 'Internal server error',
          status: err.status || 500
        };

        if (process.env.NODE_ENV === 'development') {
          errorResponse.stack = err.stack;
        }

        res.status(errorResponse.status).json(errorResponse);
      }
    });

    // Catch-all handler for unmatched routes
    app.use('*', (req, res) => {
      console.log('Not Found:', req.method, req.originalUrl);
      res.setHeader('Content-Type', 'application/json');
      res.status(404).json({ message: 'Not Found', path: req.originalUrl });
    });

    // Start the server
    const defaultPort = parseInt(process.env.PORT) || 5000;
    const port = await findAvailablePort(defaultPort);
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`API URL: http://localhost:${port}`);
      console.log(`CORS enabled for all origins in development mode`);
    }).on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during app termination:', err);
    process.exit(1);
  }
});