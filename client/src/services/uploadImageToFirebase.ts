import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

/**
 * Uploads an image to Firebase Storage and returns the download URL.
 * Uses the current user's UID as part of the filename to ensure uniqueness.
 * 
 * @param file The image file to upload
 * @param folderPath The path in storage where the file should be saved (e.g., 'course-images', 'lesson-materials')
 * @param customFileName Optional custom filename to use instead of the original file name
 * @returns The download URL of the uploaded image
 */
export async function uploadImageToFirebase(
  file: File, 
  folderPath: string,
  customFileName?: string
): Promise<string> {
  // Validation
  if (!file) throw new Error('No file provided');
  
  // Get current user
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error('User must be logged in to upload images');
  }
  
  const uid = currentUser.uid;
  
  // Create a unique filename using the user's UID and timestamp
  const fileExtension = file.name.split('.').pop();
  const fileName = customFileName || `${Date.now()}-${file.name}`;
  const fullPath = `${folderPath}/${uid}-${fileName}`;
  
  // Create a reference to the file location in Firebase Storage
  const fileRef = ref(storage, fullPath);
  
  // Upload the file
  await uploadBytes(fileRef, file);
  
  // Get and return the download URL
  const url = await getDownloadURL(fileRef);
  return url;
}
