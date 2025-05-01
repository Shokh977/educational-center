import { getAuth, updateProfile } from 'firebase/auth';
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a profile image to Firebase Storage and updates the user's profile
 * 
 * @param name The user's new display name
 * @param imageFile The new profile image file (optional)
 * @param userId The user's ID for file naming
 * @returns The download URL of the uploaded image (or empty string if no image)
 */
export async function updateUserProfileWithImage(
  name: string,
  imageFile: File | null,
  userId: string
): Promise<string> {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error('No authenticated user found');
  }
  
  let imageUrl = '';
  
  // Step 1: Upload the image if provided
  if (imageFile) {
    try {
      // Create a reference to the file in Firebase Storage
      const fileRef = ref(storage, `profile-images/${userId}-${Date.now()}`);
      
      // Upload the file
      await uploadBytes(fileRef, imageFile);
      
      // Get the download URL
      imageUrl = await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw new Error('Failed to upload profile image');
    }
  }
  
  // Step 2: Update the Firebase Auth profile
  try {
    await updateProfile(currentUser, {
      displayName: name,
      // Use the new image URL if available, otherwise keep the current photoURL
      photoURL: imageUrl || currentUser.photoURL || '',
    });
    
    console.log('Firebase Auth profile updated successfully');
  } catch (error) {
    console.error('Error updating Firebase Auth profile:', error);
    throw new Error('Failed to update Firebase Auth profile');
  }
  
  // Return the image URL (or empty string if no new image)
  return imageUrl;
}
