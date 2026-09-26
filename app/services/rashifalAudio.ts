/**
 * Rashifal Audio Service
 * Fetches (or lazily triggers generation of) a brief spoken summary of the
 * user's daily Rashifal via the `getRashifalAudio` Cloud Function, which
 * wraps Google Cloud Text-to-Speech.
 */

import { httpsCallable } from 'firebase/functions';
import { functionsClient } from '@/services/firestore';

interface RashifalAudioRequest {
  date: string;
  zodiacSign: string;
  language: 'en' | 'hi';
}

interface RashifalAudioResponse {
  audioContent: string;
  mimeType: string;
}

/**
 * Returns a `data:` URI playable directly by expo-audio — no file system
 * writes needed.
 */
export async function fetchRashifalAudioUri(request: RashifalAudioRequest): Promise<string> {
  const callable = httpsCallable<RashifalAudioRequest, RashifalAudioResponse>(
    functionsClient,
    'getRashifalAudio'
  );
  const result = await callable(request);
  return `data:${result.data.mimeType};base64,${result.data.audioContent}`;
}
