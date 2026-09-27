/**
 * Personality Audio Service
 * Lazily synthesizes a brief spoken summary of a user's personality reading
 * and caches it directly on their `user_personality/{userId}` doc (one
 * user's own audio, in one of two languages — no cross-user sharing needed,
 * so unlike Rashifal audio this doesn't need its own collection).
 */
import { type SpeechLanguage } from './tts-service';
interface PersonalityAudio {
    audioContent: string;
    mimeType: string;
}
export declare function getOrCreatePersonalityAudio(userId: string, language: SpeechLanguage): Promise<PersonalityAudio>;
export {};
