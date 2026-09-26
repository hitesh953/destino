/**
 * Personality Service
 * Fetches (or lazily generates and caches) a user's bilingual personality
 * reading, grounded in their onboarding profile and existing astrology data.
 */

import * as admin from 'firebase-admin';
import { generatePersonalityProfile } from './gemini-service';
import { validatePersonalityProfile, logValidationErrors } from './validators';
import { FirestorePersonalityProfile, PersonalityProfile } from './types';

export async function getOrCreatePersonalityProfile(userId: string): Promise<PersonalityProfile> {
  const db = admin.firestore();
  const personalityRef = db.collection('user_personality').doc(userId);

  const existing = await personalityRef.get();
  if (existing.exists) {
    const data = existing.data() as FirestorePersonalityProfile;
    return { english: data.english, hindi: data.hindi };
  }

  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    throw new Error('User profile not found. Complete onboarding first.');
  }
  const userData = userDoc.data()!;

  const name = userData.name as string | undefined;
  const zodiacSign = userData.zodiacSign as string | undefined;
  const dateOfBirthTimestamp = userData.dateOfBirth as admin.firestore.Timestamp | undefined;
  const birthTimeTimestamp = userData.birthTime as admin.firestore.Timestamp | undefined;
  const placeOfBirth = userData.placeOfBirth as string | undefined;

  if (!name || !zodiacSign || !dateOfBirthTimestamp || !placeOfBirth) {
    throw new Error('Incomplete profile. Add your birth details to generate a personality reading.');
  }

  const dateOfBirth = dateOfBirthTimestamp.toDate().toISOString().split('T')[0];
  const birthTime = birthTimeTimestamp
    ? birthTimeTimestamp.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : undefined;

  // Ground the reading in the user's already-generated astrology profile
  // when available, rather than starting from nothing.
  const astrologyDoc = await db.collection('user_astrology_data').doc(userId).get();
  const existingAstrologySummary = astrologyDoc.exists
    ? (astrologyDoc.data()?.personalitySummary as string | undefined)
    : undefined;

  const profile = await generatePersonalityProfile({
    name,
    zodiacSign,
    dateOfBirth,
    birthTime,
    placeOfBirth,
    existingAstrologySummary,
  });

  const validationErrors = validatePersonalityProfile(profile);
  if (validationErrors.length > 0) {
    logValidationErrors(validationErrors);
    throw new Error(`Personality profile validation failed with ${validationErrors.length} error(s)`);
  }

  await personalityRef.set({
    userId,
    ...profile,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  });

  return profile;
}
