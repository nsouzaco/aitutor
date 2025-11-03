import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from 'firebase/auth'
import { app } from './firebaseService'

const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

/**
 * Convert Firebase User to AuthUser
 */
function mapFirebaseUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<AuthUser> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Update display name if provided
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName })
    }
    
    return mapFirebaseUser(userCredential.user)
  } catch (error: any) {
    throw handleAuthError(error)
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthUser> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return mapFirebaseUser(userCredential.user)
  } catch (error: any) {
    throw handleAuthError(error)
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<AuthUser> {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider)
    return mapFirebaseUser(userCredential.user)
  } catch (error: any) {
    throw handleAuthError(error)
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth)
  } catch (error: any) {
    throw handleAuthError(error)
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback(mapFirebaseUser(firebaseUser))
    } else {
      callback(null)
    }
  })
}

/**
 * Get current user
 */
export function getCurrentUser(): AuthUser | null {
  const user = auth.currentUser
  return user ? mapFirebaseUser(user) : null
}

/**
 * Handle Firebase Auth errors
 */
function handleAuthError(error: any): Error {
  let message = 'An authentication error occurred.'

  switch (error.code) {
    case 'auth/email-already-in-use':
      message = 'This email is already registered. Try signing in instead.'
      break
    case 'auth/invalid-email':
      message = 'Please enter a valid email address.'
      break
    case 'auth/user-not-found':
      message = 'No account found with this email. Try signing up instead.'
      break
    case 'auth/wrong-password':
      message = 'Incorrect password. Please try again.'
      break
    case 'auth/weak-password':
      message = 'Password should be at least 6 characters long.'
      break
    case 'auth/too-many-requests':
      message = 'Too many failed attempts. Please try again later.'
      break
    case 'auth/popup-closed-by-user':
      message = 'Sign-in popup was closed. Please try again.'
      break
    case 'auth/network-request-failed':
      message = 'Network error. Please check your internet connection.'
      break
    default:
      message = error.message || message
  }

  return new Error(message)
}

export default {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  onAuthChange,
  getCurrentUser,
}

