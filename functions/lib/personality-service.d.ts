/**
 * Personality Service
 * Fetches (or lazily generates and caches) a user's bilingual personality
 * reading, grounded in their onboarding profile and existing astrology data.
 */
import { PersonalityProfile } from './types';
export declare function getOrCreatePersonalityProfile(userId: string): Promise<PersonalityProfile>;
