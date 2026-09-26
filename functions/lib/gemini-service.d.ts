/**
 * Gemini AI Integration Service
 * Generates daily Rashifal using Google Generative AI
 */
import { DailyRashifalData, UserAstrologyProfile } from './types';
export declare const geminiApiKey: import("firebase-functions/lib/params/types").SecretParam;
/**
 * Generate daily Rashifal for all zodiac signs using Gemini
 */
export declare function generateRashifalWithGemini(date: string): Promise<DailyRashifalData>;
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
