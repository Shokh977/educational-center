const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the uploads directory exists
const createUploadsDir = (type = 'videos') => {
  const uploadDir = path.join(__dirname, `../uploads/${type}`);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Define storage settings for multer
const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = createUploadsDir('videos');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a safe filename: timestamp + random string + original extension
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalname);
    cb(null, `${timestamp}-${randomString}${extension}`);
  },
});

// Storage for course thumbnails and other images
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = createUploadsDir('thumbnails');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a safe filename: timestamp + random string + original extension
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalname);
    cb(null, `${timestamp}-${randomString}${extension}`);
  },
});

// Storage for general content files (PDFs, etc.)
const contentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = createUploadsDir('content');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a safe filename: timestamp + random string + original extension
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalname);
    cb(null, `${timestamp}-${randomString}${extension}`);
  },
});

// Define file filter for videos
const videoFilter = (req, file, cb) => {
  // Only accept video files
  const acceptedTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime', // .mov files
    'video/x-msvideo' // .avi files
  ];
  
  if (acceptedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Only video files (mp4, webm, ogg, mov, avi) are allowed.`), false);
  }
};

// Define file filter for images
const imageFilter = (req, file, cb) => {
  // Only accept image files
  const acceptedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  if (acceptedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Only image files (jpg, jpeg, png, gif, webp) are allowed.`), false);
  }
};

// Define file filter for course content
const contentFilter = (req, file, cb) => {
  // Accept PDFs and other document types
  const acceptedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
  ];
  
  if (acceptedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Only document files (pdf, doc, docx, ppt, pptx, xls, xlsx) are allowed.`), false);
  }
};

// Create multer upload objects
const videoUpload = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB file size limit
  },
});

const imageUpload = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
});

const contentUpload = multer({
  storage: contentStorage,
  fileFilter: contentFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB file size limit
  },
});

// Combined upload for course creation (handles thumbnail and other fields)
const courseUpload = multer({
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    // Only filter the thumbnail field for images
    if (file.fieldname === 'thumbnail') {
      return imageFilter(req, file, cb);
    }
    // Allow any other fields
    return cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit for images
  },
});

module.exports = {
  videoUpload,
  imageUpload,
  contentUpload,
  courseUpload
};
