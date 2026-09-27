/**
 * Personality Service
 * Fetches a user's bilingual personality reading — checking Firestore
 * directly first (fast path, no function call when already generated) and
 * falling back to the `generatePersonalityProfile` Cloud Function only when
 * it doesn't exist yet.
 */

import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functionsClient } from '@/services/firestore';

export interface PersonalitySection {
  summary: string;
  traits: string[];
  strengths: string[];
  improvementAreas: string[];
  emotionalNature: string;
  socialNature: string;
  decisionMaking: string;
  careerPersonality: string;
}

export interface PersonalityProfile {
  english: PersonalitySection;
  hindi: PersonalitySection;
}

/**
 * Returns the user's personality reading, generating it via Gemini on the
 * server (once) if it doesn't exist yet.
 */
export async function getOrCreatePersonality(userId: string): Promise<PersonalityProfile> {
  const personalityRef = doc(db, 'user_personality', userId);
  const existing = await getDoc(personalityRef);

  if (existing.exists()) {
    const data = existing.data();
    return { english: data.english, hindi: data.hindi };
  }

  const callable = httpsCallable<undefined, PersonalityProfile>(functionsClient, 'generatePersonalityProfile');
  const result = await callable();
  return result.data;
}

/**
 * Returns a `data:` URI playable directly by expo-audio for the requested
 * language's personality reading. Lazily generated and cached server-side.
 */
export async function fetchPersonalityAudioUri(language: 'en' | 'hi'): Promise<string> {
  const callable = httpsCallable<{ language: 'en' | 'hi' }, { audioContent: string; mimeType: string }>(
    functionsClient,
    'getPersonalityAudio'
  );
  const result = await callable({ language });
  return `data:${result.data.mimeType};base64,${result.data.audioContent}`;
}
