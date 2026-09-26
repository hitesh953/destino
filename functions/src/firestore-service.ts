/**
 * Firestore Service
 * Handles Firestore database operations for Rashifal
 */

import * as admin from 'firebase-admin';
import { DailyRashifalData, FirestoreRashifal } from './types';

// Lazy-load Firestore to ensure Firebase Admin is initialized first
function getDb() {
  return admin.firestore();
}

/**
 * Check if Rashifal for today already exists
 */
export async function rashifalExists(date: string): Promise<boolean> {
  try {
    console.log(`🔍 Checking if Rashifal for ${date} exists...`);

    const docRef = getDb().collection('daily_rashifal').doc(date);
    const docSnapshot = await docRef.get();

    const exists = docSnapshot.exists;
    if (exists) {
      console.log(`✅ Rashifal for ${date} already exists`);
    } else {
      console.log(`✅ Rashifal for ${date} does not exist, will generate`);
    }

    return exists;
  } catch (error) {
    console.error('❌ Error checking Firestore:', error);
    throw new Error('Failed to check Firestore for existing Rashifal');
  }
}

/**
 * Save Rashifal to Firestore
 */
export async function saveRashifalToFirestore(
  date: string,
  rashifalData: DailyRashifalData
): Promise<void> {
  try {
    console.log(`💾 Saving Rashifal for ${date} to Firestore...`);

    const firestoreData: FirestoreRashifal = {
      ...rashifalData,
      generatedAt: admin.firestore.Timestamp.now(),
    };

    const docRef = getDb().collection('daily_rashifal').doc(date);
    await docRef.set(firestoreData);

    console.log(`✅ Rashifal successfully saved to Firestore`);
  } catch (error) {
    console.error('❌ Error saving to Firestore:', error);
    throw new Error('Failed to save Rashifal to Firestore');
  }
}

/**
 * Get Rashifal from Firestore
 */
export async function getRashifalFromFirestore(date: string): Promise<FirestoreRashifal | null> {
  try {
    console.log(`📖 Fetching Rashifal for ${date} from Firestore...`);

    const docRef = getDb().collection('daily_rashifal').doc(date);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      console.log(`⚠️  No Rashifal found for ${date}`);
      return null;
    }

    const data = docSnapshot.data() as FirestoreRashifal;
    console.log(`✅ Rashifal retrieved successfully`);
    return data;
  } catch (error) {
    console.error('❌ Error retrieving from Firestore:', error);
    throw new Error('Failed to retrieve Rashifal from Firestore');
  }
}

/**
 * Delete Rashifal from Firestore (for testing/cleanup)
 */
export async function deleteRashifalFromFirestore(date: string): Promise<void> {
  try {
    console.log(`🗑️  Deleting Rashifal for ${date} from Firestore...`);

    const docRef = getDb().collection('daily_rashifal').doc(date);
    await docRef.delete();

    console.log(`✅ Rashifal deleted successfully`);
  } catch (error) {
    console.error('❌ Error deleting from Firestore:', error);
    throw new Error('Failed to delete Rashifal from Firestore');
  }
}
