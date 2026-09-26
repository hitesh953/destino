/**
 * Personality Audio Service
 * Lazily synthesizes a brief spoken summary of a user's personality reading
 * and caches it directly on their `user_personality/{userId}` doc (one
 * user's own audio, in one of two languages — no cross-user sharing needed,
 * so unlike Rashifal audio this doesn't need its own collection).
 */

import * as admin from 'firebase-admin';
import { synthesizeSpeech, type SpeechLanguage } from './tts-service';
import { summarizeForSpeech } from './gemini-service';
import { FirestorePersonalityProfile, PersonalitySection } from './types';

const SECTION_FIELD: Record<SpeechLanguage, 'english' | 'hindi'> = { en: 'english', hi: 'hindi' };

interface PersonalityAudio {
  audioContent: string;
  mimeType: string;
}

export async function getOrCreatePersonalityAudio(
  userId: string,
  language: SpeechLanguage
): Promise<PersonalityAudio> {
  const db = admin.firestore();
  const personalityRef = db.collection('user_personality').doc(userId);
  const doc = await personalityRef.get();

  if (!doc.exists) {
    throw new Error('No personality reading found for this user yet.');
  }

  const data = doc.data() as FirestorePersonalityProfile;
  const fieldName = SECTION_FIELD[language];
  const section = data[fieldName] as PersonalitySection;

  if (section.audioContent && section.audioMimeType) {
    return { audioContent: section.audioContent, mimeType: section.audioMimeType };
  }

  const sourceText = [
    section.summary,
    `Strengths: ${section.strengths.join(', ')}`,
    `Emotional nature: ${section.emotionalNature}`,
  ].join('\n');

  const summaryText = await summarizeForSpeech(sourceText, "this person's personality reading", language);
  const audioContent = await synthesizeSpeech(summaryText, language);
  const mimeType = 'audio/mpeg';

  await personalityRef.update({
    [`${fieldName}.audioContent`]: audioContent,
    [`${fieldName}.audioMimeType`]: mimeType,
    updatedAt: admin.firestore.Timestamp.now(),
  });

  return { audioContent, mimeType };
}
