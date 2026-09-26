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
  title: string; // English-only mystical title, not a "description"
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

export interface PersonalitySection {
  summary: string;
  traits: string[];
  strengths: string[];
  improvementAreas: string[];
  emotionalNature: string;
  socialNature: string;
  decisionMaking: string;
  careerPersonality: string;
  audioContent?: string;
  audioMimeType?: string;
}

export interface PersonalityProfile {
  english: PersonalitySection;
  hindi: PersonalitySection;
}

export interface FirestorePersonalityProfile extends PersonalityProfile {
  userId: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export type PalmValidationIssue =
  | 'NO_HAND'
  | 'MULTIPLE_HANDS'
  | 'POOR_LIGHTING'
  | 'TOO_BLURRY'
  | 'PALM_NOT_FACING_CAMERA'
  | 'PALM_OUT_OF_FRAME';

export interface PalmValidationResult {
  valid: boolean;
  issue?: PalmValidationIssue;
  message?: string;
}

export interface PalmStructure {
  lifeLine: string;
  headLine: string;
  heartLine: string;
  fateLine: string;
  sunLine: string;
}

export interface PalmPersonality {
  summary: string;
  traits: string[];
  strengths: string[];
  challenges: string[];
}

export interface PalmAnalysisResult {
  summary: string;
  palmStructure: PalmStructure;
  personality: PalmPersonality;
  career: string;
  love: string;
  wealth: string;
  generalGuidance: string;
}

export interface FirestorePalmReading {
  userId: string;
  nickname: string | null;
  age: number | null;
  birthplace: string | null;
  analysis: PalmAnalysisResult;
  isFavorite: boolean;
  createdAt: FirebaseFirestore.Timestamp;
}

export const ZODIAC_SIGNS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;

export const ZODIAC_INFO: Record<string, { name: string; dateRange: string }> = {
  aries: { name: 'Aries', dateRange: 'Mar 21 - Apr 19' },
  taurus: { name: 'Taurus', dateRange: 'Apr 20 - May 20' },
  gemini: { name: 'Gemini', dateRange: 'May 21 - Jun 20' },
  cancer: { name: 'Cancer', dateRange: 'Jun 21 - Jul 22' },
  leo: { name: 'Leo', dateRange: 'Jul 23 - Aug 22' },
  virgo: { name: 'Virgo', dateRange: 'Aug 23 - Sep 22' },
  libra: { name: 'Libra', dateRange: 'Sep 23 - Oct 22' },
  scorpio: { name: 'Scorpio', dateRange: 'Oct 23 - Nov 21' },
  sagittarius: { name: 'Sagittarius', dateRange: 'Nov 22 - Dec 21' },
  capricorn: { name: 'Capricorn', dateRange: 'Dec 22 - Jan 19' },
  aquarius: { name: 'Aquarius', dateRange: 'Jan 20 - Feb 18' },
  pisces: { name: 'Pisces', dateRange: 'Feb 19 - Mar 20' },
};
