/**
 * Type definitions for Rashifal generation
 */
export interface LuckyDetails {
    color: string;
    number: number;
    time: string;
    direction: string;
}
export interface ScoreSection {
    score: number;
    description: string;
}
export interface CosmicEnergySection {
    title: string;
    description: string;
}
/**
 * English + Hindi variant of a piece of generated text. Used only for the
 * daily Rashifal's long/short descriptions — field headings (Love, Career,
 * etc.) stay English-only and are handled client-side.
 */
export interface BilingualText {
    en: string;
    hi: string;
}
export interface BilingualCosmicEnergySection {
    title: string;
    description: BilingualText;
}
export interface BilingualScoreSection {
    score: number;
    description: BilingualText;
}
export interface ZodiacSignRashifal {
    name: string;
    dateRange: string;
    cosmicEnergy: BilingualCosmicEnergySection;
    love: BilingualScoreSection;
    career: BilingualScoreSection;
    wealth: BilingualScoreSection;
    health: BilingualScoreSection;
    life: BilingualScoreSection;
    lucky: LuckyDetails;
    advice: string;
    affirmation: string;
}
export interface DailyRashifalData {
    date: string;
    zodiacSigns: {
        aries: ZodiacSignRashifal;
        taurus: ZodiacSignRashifal;
        gemini: ZodiacSignRashifal;
        cancer: ZodiacSignRashifal;
        leo: ZodiacSignRashifal;
        virgo: ZodiacSignRashifal;
        libra: ZodiacSignRashifal;
        scorpio: ZodiacSignRashifal;
        sagittarius: ZodiacSignRashifal;
        capricorn: ZodiacSignRashifal;
        aquarius: ZodiacSignRashifal;
        pisces: ZodiacSignRashifal;
    };
}
export interface FirestoreRashifal extends DailyRashifalData {
    generatedAt: FirebaseFirestore.Timestamp;
}
export interface CosmicScoreSection {
    score: number;
    description: string;
}
export interface UserAstrologyProfile {
    zodiacSign: string;
    zodiacElement: string;
    rulingPlanet: string;
    lunarSign: string;
    birthNakshatra: string;
    luckyNumber: number;
    luckyColor: string;
    personalityTraits: string[];
    personalitySummary: string;
    cosmicEnergy: CosmicEnergySection;
    love: CosmicScoreSection;
    career: CosmicScoreSection;
    wealth: CosmicScoreSection;
    health: CosmicScoreSection;
    life: CosmicScoreSection;
    compatibleSigns: string[];
    incompatibleSigns: string[];
}
export interface FirestoreUserAstrologyProfile extends UserAstrologyProfile {
    calculatedAt: FirebaseFirestore.Timestamp;
}
export declare const ZODIAC_SIGNS: readonly ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
export declare const ZODIAC_INFO: Record<string, {
    name: string;
    dateRange: string;
}>;
