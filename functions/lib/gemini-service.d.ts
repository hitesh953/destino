/**
 * Gemini AI Integration Service
 * Generates daily Rashifal using Google Generative AI
 */
import { DailyRashifalData, PalmAnalysisResult, PalmValidationResult, PersonalityProfile, UserAstrologyProfile } from './types';
export declare const geminiApiKey: import("firebase-functions/lib/params/types").SecretParam;
/**
 * Generate daily Rashifal for all zodiac signs using Gemini
 */
export declare function generateRashifalWithGemini(date: string): Promise<DailyRashifalData>;
/**
 * Condenses arbitrary source text (a Rashifal, a personality reading, etc.)
 * into a short, natural-sounding spoken summary for text-to-speech, rather
 * than reading the full source text verbatim.
 */
export declare function summarizeForSpeech(sourceText: string, contentDescription: string, language: 'en' | 'hi'): Promise<string>;
/**
 * Generates a bilingual (English + Hindi) personality reading for a user,
 * grounded in their profile details and (if already generated) their
 * existing astrology profile from generateUserAstrologyProfile.
 */
export declare function generatePersonalityProfile(input: {
    name: string;
    zodiacSign: string;
    dateOfBirth: string;
    birthTime?: string;
    placeOfBirth: string;
    existingAstrologySummary?: string;
}): Promise<PersonalityProfile>;
/**
 * Generate a personalized astrology profile for a single user using Gemini.
 * Called once, right after signup, and cached in Firestore.
 */
export declare function generateUserAstrologyProfile(input: {
    name: string;
    dateOfBirth: string;
    birthTime?: string;
    placeOfBirth: string;
    zodiacSign: string;
}): Promise<UserAstrologyProfile>;
/**
 * Judges whether an actual captured photo is usable for a palm reading —
 * the real "detection" gate for the palm-scan flow. There is no on-device
 * hand-tracking model in this app, so this Gemini vision call against the
 * real image is the only genuine image-understanding check available.
 */
export declare function validatePalmImageWithGemini(imageBase64: string, mimeType: string): Promise<PalmValidationResult>;
/**
 * Analyzes an actual captured palm photo and returns a structured palm
 * reading grounded in the real image. Any line Gemini can't confidently
 * make out from the photo must come back as "not_detected" rather than
 * fabricated content — enforced in the prompt below.
 */
export declare function analyzePalmImageWithGemini(imageBase64: string, mimeType: string, context: {
    nickname?: string | null;
    age?: number | null;
    birthplace?: string | null;
}): Promise<PalmAnalysisResult>;
