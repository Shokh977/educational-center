import { getAuth, updateProfile } from 'firebase/auth';

/**
 * Updates the current Firebase user's profile with a new display name and photo URL.
 * @param newName The new display name
 * @param imageUrl The new photo URL
 */
export async function updateFirebaseUserProfile(newName: string, imageUrl: string) {
  const auth = getAuth();
  if (!auth.currentUser) throw new Error('No authenticated user');
  await updateProfile(auth.currentUser, {
    displayName: newName,
    photoURL: imageUrl,
  });
}
