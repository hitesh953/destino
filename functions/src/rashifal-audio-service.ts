/**
 * Rashifal Audio Service
 * Builds a brief spoken summary of a user's daily Rashifal and caches the
 * synthesized audio so the same day/sign/language combo is only sent to
 * Text-to-Speech once, no matter how many users request it.
 *
 * Cached in its own `daily_rashifal_audio` collection (not on the
 * `daily_rashifal/{date}` doc itself) so base64 audio never risks pushing
 * that already-large document over Firestore's 1MiB limit.
 */

import * as admin from 'firebase-admin';
import { synthesizeSpeech, type SpeechLanguage } from './tts-service';
import { summarizeForSpeech } from './gemini-service';
import { ZodiacSignRashifal } from './types';

interface RashifalAudio {
  audioContent: string;
  mimeType: string;
}

export async function getOrCreateRashifalAudio(
  date: string,
  zodiacSign: string,
  language: SpeechLanguage
): Promise<RashifalAudio> {
  const db = admin.firestore();
  const cacheRef = db.collection('daily_rashifal_audio').doc(`${date}_${zodiacSign}_${language}`);

  const cached = await cacheRef.get();
  if (cached.exists) {
    const data = cached.data() as RashifalAudio;
    return { audioContent: data.audioContent, mimeType: data.mimeType };
  }

  const rashifalDoc = await db.collection('daily_rashifal').doc(date).get();
  if (!rashifalDoc.exists) {
    throw new Error(`No Rashifal found for ${date}`);
  }

  const zodiacData = rashifalDoc.data()?.zodiacSigns?.[zodiacSign] as ZodiacSignRashifal | undefined;
  if (!zodiacData) {
    throw new Error(`No Rashifal found for sign "${zodiacSign}" on ${date}`);
  }

  const sourceText = `Cosmic Energy — ${zodiacData.cosmicEnergy.title}: ${zodiacData.cosmicEnergy.description[language]}\nAdvice: ${zodiacData.advice}\nAffirmation: ${zodiacData.affirmation}`;
  const summaryText = await summarizeForSpeech(sourceText, `today's Rashifal for ${zodiacData.name}`, language);
  const audioContent = await synthesizeSpeech(summaryText, language);
  const mimeType = 'audio/mpeg';

  await cacheRef.set({
    audioContent,
    mimeType,
    summaryText,
    createdAt: admin.firestore.Timestamp.now(),
  });

  return { audioContent, mimeType };
}
