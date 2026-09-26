/**
 * Palm Analysis Service
 * Validates and analyzes a real captured palm photo via Gemini vision, and
 * persists a successful analysis to Firestore. There is no on-device
 * hand-tracking model in this app — this is the only genuine
 * image-understanding check available, so it is the real detection gate.
 */

import * as admin from 'firebase-admin';
import { validatePalmImageWithGemini, analyzePalmImageWithGemini } from './gemini-service';
import { validatePalmAnalysisResult, logValidationErrors } from './validators';
import { FirestorePalmReading, PalmAnalysisResult, PalmValidationResult } from './types';

export async function validatePalmScan(imageBase64: string, mimeType: string): Promise<PalmValidationResult> {
  return validatePalmImageWithGemini(imageBase64, mimeType);
}

function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
}

export async function analyzePalmScan(
  userId: string,
  imageBase64: string,
  mimeType: string
): Promise<{ readingId: string; analysis: PalmAnalysisResult }> {
  const db = admin.firestore();

  // Reuse the profile already collected at onboarding rather than asking
  // the user to re-enter their name/age/birthplace for every scan.
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.exists ? userDoc.data()! : {};

  const nickname = (userData.name as string | undefined) ?? null;
  const dateOfBirthTimestamp = userData.dateOfBirth as admin.firestore.Timestamp | undefined;
  const age = dateOfBirthTimestamp ? calculateAge(dateOfBirthTimestamp.toDate()) : null;
  const birthplace = (userData.placeOfBirth as string | undefined) ?? null;

  const context = { nickname, age, birthplace };
  const analysis = await analyzePalmImageWithGemini(imageBase64, mimeType, context);

  const validationErrors = validatePalmAnalysisResult(analysis);
  if (validationErrors.length > 0) {
    logValidationErrors(validationErrors);
    throw new Error(`AI_RESPONSE_INVALID: validation failed with ${validationErrors.length} error(s)`);
  }

  const readingRef = db.collection('readings').doc();

  const reading: FirestorePalmReading = {
    userId,
    nickname: context.nickname ?? null,
    age: context.age ?? null,
    birthplace: context.birthplace ?? null,
    analysis,
    isFavorite: false,
    createdAt: admin.firestore.Timestamp.now(),
  };

  try {
    await readingRef.set(reading);
  } catch (error) {
    console.error('❌ Error saving palm reading:', error);
    throw new Error('DATABASE_SAVE_FAILED');
  }

  return { readingId: readingRef.id, analysis };
}
