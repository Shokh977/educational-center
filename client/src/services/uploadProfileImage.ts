import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a profile image to Firebase Storage and returns the download URL.
 * @param file The image file to upload
 * @param uid The current user's UID (used as the file name)
 * @returns The download URL of the uploaded image
 */
export async function uploadProfileImage(file: File, uid: string): Promise<string> {
  if (!file) throw new Error('No file provided');
  const fileRef = ref(storage, `profile-images/${uid}`);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  return url;
}
