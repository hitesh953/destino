/**
 * Firestore Service
 * Handles all Firestore database operations for the Destino app
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  getAuth,
  initializeAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  linkWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
  signOut,
  type User,
} from 'firebase/auth';
// getReactNativePersistence is only exposed under the "react-native" export
// condition, which our Metro config resolves (see metro.config.js) but
// TypeScript's "bundler" moduleResolution does not know about — so its types
// aren't visible here even though the real function is present at runtime.
// @ts-expect-error - see comment above
import { getReactNativePersistence } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateZodiacSign } from '@/utils/validation';
import { getOrCreateDeviceId } from '@/utils/deviceId';

// Firebase configuration (extracted from google-services.json)
const firebaseConfig = {
  apiKey: 'AIzaSyCBc-FW2eoytWMfaDCqPzQ2X1mCOdwf9ms',
  authDomain: 'destinoai-90296.firebaseapp.com',
  projectId: 'destinoai-90296',
  storageBucket: 'destinoai-90296.firebasestorage.app',
  messagingSenderId: '286136811486',
  appId: '1:286136811486:android:9f868782cbe9a29552e74f',
};

// Initialize Firebase only once
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);

// On native platforms, auth state must be explicitly persisted to
// AsyncStorage or it's lost on every app restart (plain getAuth() only
// keeps the session in memory). Web uses the SDK's own default persistence.
export const auth =
  Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

export const functionsClient = getFunctions(app, 'us-central1');

/**
 * Resolves once Firebase has finished restoring any persisted session from
 * AsyncStorage. auth.currentUser is unreliable to read synchronously right
 * after app start — it's null until this initial restoration completes.
 */
export const waitForAuthReady = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * Ensure user is authenticated (anonymous if needed)
 */
export const ensureUserAuthenticated = async (): Promise<string> => {
  try {
    const restoredUser = auth.currentUser ?? (await waitForAuthReady());
    if (restoredUser) {
      return restoredUser.uid;
    }

    // Sign in anonymously if not already signed in
    const result = await signInAnonymously(auth);
    console.log('✅ Anonymous user created:', result.user.uid);
    return result.user.uid;
  } catch (error) {
    console.error('❌ Error ensuring authentication:', error);
    throw error;
  }
};

/**
 * Create an email/password account.
 * If the current session is still anonymous (from onboarding), the credential
 * is linked to that account so the user keeps the profile data already saved
 * under their anonymous UID. Otherwise, a fresh account is created.
 */
export const signUpWithEmail = async (email: string, password: string): Promise<string> => {
  try {
    if (auth.currentUser?.isAnonymous) {
      const credential = EmailAuthProvider.credential(email, password);
      const result = await linkWithCredential(auth.currentUser, credential);
      console.log('✅ Anonymous account upgraded to email account:', result.user.uid);
      return result.user.uid;
    }

    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Email account created:', result.user.uid);
    return result.user.uid;
  } catch (error) {
    console.error('❌ Error signing up with email:', error);
    throw error;
  }
};

/**
 * Convert a Firebase Auth error code into a user-friendly message
 */
export const getFriendlyAuthErrorMessage = (code?: string): string => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try logging in instead.';
    case 'auth/invalid-email':
      return "That email address doesn't look right.";
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    default:
      return 'Something went wrong. Please check your connection and try again.';
  }
};

/**
 * Sign in with an existing email/password account
 */
export const signInWithEmail = async (email: string, password: string): Promise<string> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Signed in with email:', result.user.uid);
    return result.user.uid;
  } catch (error) {
    console.error('❌ Error signing in with email:', error);
    throw error;
  }
};

/**
 * Send a password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('✅ Password reset email sent');
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Sign the current user out and clear the login flag.
 * Onboarding status is left intact so the user lands on Login (not
 * the full onboarding flow) next time.
 */
export const logout = async (): Promise<void> => {
  try {
    // Deactivate this device's push token under the outgoing user before
    // signing out, so a different account logging in on the same device
    // later never inherits this user's notification association.
    const outgoingUserId = auth.currentUser?.uid;
    if (outgoingUserId) {
      await deactivateDevice(outgoingUserId, getOrCreateDeviceId());
    }

    await signOut(auth);
    await AsyncStorage.removeItem('userLoggedIn');
    console.log('✅ Signed out');
  } catch (error) {
    console.error('❌ Error signing out:', error);
    throw error;
  }
};

/**
 * Save/update this device's FCM push token under the user's `devices`
 * subcollection. One document per physical device, keyed by a locally
 * persisted device id (see `@/utils/deviceId`) so a user can have several
 * devices registered at once.
 */
export const saveDeviceToken = async (
  userId: string,
  deviceId: string,
  fcmToken: string
): Promise<void> => {
  try {
    const deviceRef = doc(db, 'users', userId, 'devices', deviceId);
    const existing = await getDoc(deviceRef);

    await setDoc(
      deviceRef,
      {
        fcmToken,
        platform: 'android',
        active: true,
        updatedAt: Timestamp.now(),
        ...(existing.exists() ? {} : { createdAt: Timestamp.now() }),
      },
      { merge: true }
    );
    console.log('✅ Device token saved');
  } catch (error) {
    console.error('❌ Error saving device token:', error);
    throw error;
  }
};

/**
 * Soft-deactivate a device's push token (rather than deleting it) so it
 * stops receiving notifications while keeping the doc around for audit/
 * debugging. Never throws — this runs during logout and must not block it.
 */
export const deactivateDevice = async (userId: string, deviceId: string): Promise<void> => {
  try {
    const deviceRef = doc(db, 'users', userId, 'devices', deviceId);
    await updateDoc(deviceRef, { active: false, updatedAt: Timestamp.now() });
  } catch (error) {
    console.error('❌ Error deactivating device (non-fatal):', error);
  }
};

/**
 * Update the user-level "Daily Rashifal" notification preference. This is
 * separate from the Android OS notification permission — both must be
 * satisfied for the user to actually receive pushes (see notifications.ts).
 */
export const updateNotificationPreference = async (
  userId: string,
  enabled: boolean
): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      notificationsEnabled: enabled,
      updatedAt: Timestamp.now(),
    });
    console.log(`✅ Notification preference set to ${enabled}`);
  } catch (error) {
    console.error('❌ Error updating notification preference:', error);
    throw error;
  }
};

/**
 * Save user onboarding data to Firestore
 */
export const saveUserOnboardingData = async (
  data: {
    name: string;
    dateOfBirth: Date;
    birthTime: Date;
    placeOfBirth: string;
  }
) => {
  try {
    // Ensure user is authenticated
    const userId = await ensureUserAuthenticated();
    const zodiacSign = calculateZodiacSign(data.dateOfBirth);

    const userDocRef = doc(db, 'users', userId);

    const userData = {
      name: data.name.trim(),
      dateOfBirth: Timestamp.fromDate(data.dateOfBirth),
      birthTime: data.birthTime ? Timestamp.fromDate(data.birthTime) : null,
      placeOfBirth: data.placeOfBirth.trim(),
      zodiacSign,
      subscriptionStatus: 'free',
      totalReadingsCount: 0,
      isOnboarded: true,
      language: 'en',
      profileImage: null,
      updatedAt: Timestamp.now(),
    };

    // Check if user document exists
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      // Update existing user document
      await updateDoc(userDocRef, userData);
    } else {
      // Create new user document
      await setDoc(userDocRef, {
        ...userData,
        createdAt: Timestamp.now(),
        email: auth.currentUser?.email || '',
        phone: '',
      });
    }

    // Initialize readings_history collection
    await initializeReadingsHistory(userId);

    console.log('✅ User data saved to Firestore successfully');
    return true;
  } catch (error) {
    console.error('❌ Error saving user data to Firestore:', error);
    throw error;
  }
};

/**
 * Generate this user's personalized astrology profile via Gemini AI
 * (Cloud Function) and cache it in user_astrology_data/{uid}. Called once,
 * right after signup.
 */
export const generateAstrologyProfile = async (data: {
  name: string;
  dateOfBirth: Date;
  birthTime?: Date | null;
  placeOfBirth: string;
}): Promise<void> => {
  const zodiacSign = calculateZodiacSign(data.dateOfBirth);

  const callable = httpsCallable(functionsClient, 'generateUserAstrologyProfile');
  await callable({
    name: data.name.trim(),
    dateOfBirth: data.dateOfBirth.toISOString().split('T')[0],
    birthTime: data.birthTime
      ? data.birthTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : undefined,
    placeOfBirth: data.placeOfBirth.trim(),
    zodiacSign,
  });

  console.log('✅ Astrology profile generation requested');
};

/**
 * Fetch this user's personalized astrology profile from Firestore
 */
export const getUserAstrologyData = async (userId: string) => {
  try {
    const astrologyDocRef = doc(db, 'user_astrology_data', userId);
    const astrologySnapshot = await getDoc(astrologyDocRef);

    if (astrologySnapshot.exists()) {
      return astrologySnapshot.data();
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching astrology data:', error);
    throw error;
  }
};

/**
 * Initialize readings history for user
 */
const initializeReadingsHistory = async (userId: string) => {
  try {
    const historyDocRef = doc(db, 'readings_history', userId);

    const historyData = {
      totalReadings: 0,
      readingsByType: {
        love: 0,
        career: 0,
        health: 0,
        life: 0,
        general: 0,
      },
      averageRating: 0,
      readingStreak: 0,
      longestReadingStreak: 0,
      lastUpdated: Timestamp.now(),
    };

    await setDoc(historyDocRef, historyData);
    console.log('✅ Readings history initialized');
  } catch (error) {
    console.error('❌ Error initializing readings history:', error);
  }
};

/**
 * Fetch user data from Firestore
 */
export const getUserData = async (userId: string) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      return userSnapshot.data();
    } else {
      console.log('No user data found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching user data:', error);
    throw error;
  }
};
