/**
 * Firestore Service
 * Handles Firestore database operations for Rashifal
 */
import { DailyRashifalData, FirestoreRashifal } from './types';
/**
 * Check if Rashifal for today already exists
 */
export declare function rashifalExists(date: string): Promise<boolean>;
/**
 * Save Rashifal to Firestore
 */
export declare function saveRashifalToFirestore(date: string, rashifalData: DailyRashifalData): Promise<void>;
/**
 * Get Rashifal from Firestore
 */
export declare function getRashifalFromFirestore(date: string): Promise<FirestoreRashifal | null>;
/**
 * Delete Rashifal from Firestore (for testing/cleanup)
 */
export declare function deleteRashifalFromFirestore(date: string): Promise<void>;
