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
import { type SpeechLanguage } from './tts-service';
interface RashifalAudio {
    audioContent: string;
    mimeType: string;
}
export declare function getOrCreateRashifalAudio(date: string, zodiacSign: string, language: SpeechLanguage): Promise<RashifalAudio>;
export {};
