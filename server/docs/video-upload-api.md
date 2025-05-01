# Video Upload API Documentation

This API allows you to upload, manage, and stream video content for your educational platform using Cloudinary.

## Authentication

All API endpoints require authentication. Include your JWT token in the request headers:

```
Authorization: Bearer YOUR_JWT_TOKEN
x-auth-token: YOUR_JWT_TOKEN
```

## Video Upload Endpoints

### Upload a Video

Upload a new video to be processed and stored on Cloudinary.

- **URL**: `/api/videos/upload`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Authentication**: Required

**Request Parameters**:

| Parameter    | Type   | Required | Description                              |
|--------------|--------|----------|------------------------------------------|
| video        | File   | Yes      | The video file to upload                 |
| title        | String | No       | Title for the video                      |
| description  | String | No       | Description for the video                |
| folder       | String | No       | Cloudinary folder (default: course_videos) |
| publicId     | String | No       | Custom public ID for the video           |
| courseId     | String | No       | Course ID to associate with video        |
| chapterId    | String | No       | Chapter ID to associate with video       |
| contentId    | String | No       | Content ID to associate with video       |

**Supported Video Formats**:

- MP4 (.mp4)
- WebM (.webm)
- Ogg (.ogg)
- QuickTime (.mov)
- AVI (.avi)

**Maximum File Size**: 100MB

**Response Example**:

```json
{
  "message": "Video uploaded successfully",
  "video": {
    "publicId": "course_videos/video_1234567890",
    "url": "https://res.cloudinary.com/yourcloudname/video/upload/v1234567890/course_videos/video_1234567890.mp4",
    "format": "mp4",
    "resourceType": "video",
    "duration": 125.5,
    "width": 1920,
    "height": 1080,
    "bytes": 12345678,
    "thumbnailUrl": "https://res.cloudinary.com/yourcloudname/video/upload/v1234567890/course_videos/video_1234567890.jpg",
    "playbackUrls": {
      "mp4": "https://res.cloudinary.com/yourcloudname/video/upload/v1234567890/course_videos/video_1234567890.mp4",
      "webm": "https://res.cloudinary.com/yourcloudname/video/upload/v1234567890/course_videos/video_1234567890.webm"
    }
  },
  "metadata": {
    "title": "Introduction to Mathematics",
    "description": "This video introduces basic mathematical concepts"
  }
}
```

### Delete a Video

Delete a video from Cloudinary.

- **URL**: `/api/videos/:publicId`
- **Method**: `DELETE`
- **Authentication**: Required

**URL Parameters**:

| Parameter | Type   | Required | Description                  |
|-----------|--------|----------|------------------------------|
| publicId  | String | Yes      | Public ID of video to delete |

**Response Example**:

```json
{
  "message": "Video deleted successfully",
  "result": {
    "result": "ok"
  }
}
```

### Replace a Video

Replace an existing video with a new one, maintaining the same public ID.

- **URL**: `/api/videos/replace`
- **Method**: `PUT`
- **Content-Type**: `multipart/form-data`
- **Authentication**: Required

**Request Parameters**:

| Parameter | Type   | Required | Description                         |
|-----------|--------|----------|-------------------------------------|
| video     | File   | Yes      | The new video file                  |
| publicId  | String | Yes      | Public ID of video to replace       |
| courseId  | String | No       | Course ID associated with video     |
| chapterId | String | No       | Chapter ID associated with video    |
| contentId | String | No       | Content ID associated with video    |

**Response Example**:

```json
{
  "message": "Video replaced successfully",
  "video": {
    "publicId": "course_videos/video_1234567890",
    "url": "https://res.cloudinary.com/yourcloudname/video/upload/v1234567891/course_videos/video_1234567890.mp4",
    "format": "mp4",
    "resourceType": "video",
    "duration": 130.2,
    "width": 1920,
    "height": 1080,
    "bytes": 13456789
  }
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages in case of failures:

- **400 Bad Request**: Missing required parameters or invalid request
- **401 Unauthorized**: Missing or invalid authentication token
- **413 Payload Too Large**: File size exceeds the 100MB limit
- **415 Unsupported Media Type**: File format is not supported
- **500 Internal Server Error**: Server-side error during processing

Example error response:

```json
{
  "message": "Unsupported file type: image/jpeg. Only video files (mp4, webm, ogg, mov, avi) are allowed."
}
```

## Integration with Course Content

When creating or updating course content, you can use the video upload API to add video content. Follow these steps:

1. Create a course and chapter
2. Create content item of type 'video' in the chapter
3. Upload video using this API, providing courseId, chapterId, and contentId
4. The API will automatically update the content item with the video details

## Sample Code for Frontend Implementation

```javascript
// Example using axios to upload a video
async function uploadVideo(file, title, description, courseId, chapterId, contentId) {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('title', title);
  formData.append('description', description);
  
  if (courseId) formData.append('courseId', courseId);
  if (chapterId) formData.append('chapterId', chapterId);
  if (contentId) formData.append('contentId', contentId);
  
  try {
    const response = await axios.post('/api/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${percentCompleted}%`);
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Video upload failed:', error.response?.data || error.message);
    throw error;
  }
}
```
