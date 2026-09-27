/**
 * Gemini AI Integration Service
 * Generates daily Rashifal using Google Generative AI
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { defineSecret } from 'firebase-functions/params';
import {
  DailyRashifalData,
  PalmAnalysisResult,
  PalmValidationResult,
  PersonalityProfile,
  UserAstrologyProfile,
  ZODIAC_INFO,
} from './types';

// Define the secret parameter for Gemini API key
export const geminiApiKey = defineSecret('GEMINI_API_KEY');

// Initialize client lazily
let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!client) {
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

const MODEL_NAME = 'gemini-3.8-flash';

/**
 * Generate daily Rashifal for all zodiac signs using Gemini
 */
export async function generateRashifalWithGemini(date: string): Promise<DailyRashifalData> {
  console.log('📞 Calling Gemini API to generate Rashifal...');

  const zodiacList = Object.entries(ZODIAC_INFO)
    .map(([key, { name, dateRange }]) => `${name} (${dateRange})`)
    .join(', ');

  const prompt = `You are an expert Vedic astrologer creating daily horoscopes for a premium astrology app called Destino.

Generate a daily Rashifal (horoscope) for ${date} in India Standard Time (IST).

For ALL 12 zodiac signs (Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces), provide:

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no explanations, no code blocks.

{
  "date": "${date}",
  "zodiacSigns": {
    "aries": {
      "name": "Aries",
      "dateRange": "Mar 21 - Apr 19",
      "cosmicEnergy": {
        "title": "3-6 word mystical title, English only",
        "description": {
          "en": "50-120 word warm and mystical description of today's cosmic energy for this sign, in English",
          "hi": "Natural, fluent Hindi (Devanagari script) telling of the SAME cosmic energy insight as the English version above — not a literal word-for-word translation, 50-120 words"
        }
      },
      "love": {
        "score": number between 55-95,
        "description": {
          "en": "30-80 word warm romantic insight specific to Aries, in English",
          "hi": "Natural, fluent Hindi (Devanagari script) with the SAME romantic insight, 30-80 words"
        }
      },
      "career": {
        "score": number between 55-95,
        "description": {
          "en": "30-80 word professional guidance specific to Aries, in English",
          "hi": "Natural, fluent Hindi (Devanagari script) with the SAME professional guidance, 30-80 words"
        }
      },
      "wealth": {
        "score": number between 55-95,
        "description": {
          "en": "30-80 word financial insight specific to Aries, in English",
          "hi": "Natural, fluent Hindi (Devanagari script) with the SAME financial insight, 30-80 words"
        }
      },
      "health": {
        "score": number between 55-95,
        "description": {
          "en": "30-80 word wellness advice specific to Aries, in English",
          "hi": "Natural, fluent Hindi (Devanagari script) with the SAME wellness advice, 30-80 words"
        }
      },
      "life": {
        "score": number between 55-95,
        "description": {
          "en": "30-80 word life guidance specific to Aries, in English",
          "hi": "Natural, fluent Hindi (Devanagari script) with the SAME life guidance, 30-80 words"
        }
      },
      "lucky": {
        "color": "single color name",
        "number": number between 1-99,
        "time": "time range like 10:30 - 12:00 PM",
        "direction": "cardinal direction like East, West, North, South"
      },
      "advice": "Maximum 30 words of specific actionable advice, English only",
      "affirmation": "Maximum 20 words of empowering affirmation, English only"
    },
    "taurus": { ... same structure for Taurus ... },
    "gemini": { ... same structure for Gemini ... },
    "cancer": { ... same structure for Cancer ... },
    "leo": { ... same structure for Leo ... },
    "virgo": { ... same structure for Virgo ... },
    "libra": { ... same structure for Libra ... },
    "scorpio": { ... same structure for Scorpio ... },
    "sagittarius": { ... same structure for Sagittarius ... },
    "capricorn": { ... same structure for Capricorn ... },
    "aquarius": { ... same structure for Aquarius ... },
    "pisces": { ... same structure for Pisces ... }
  }
}

CONTENT REQUIREMENTS:
- Tone: Warm, positive, mystical, engaging, easy to understand
- Suitable for: Premium mobile astrology application
- Each zodiac sign must have UNIQUE content (no repetition between signs)
- Only the fields explicitly marked above as having "en"/"hi" should be bilingual objects — name, dateRange, cosmicEnergy.title, lucky.*, advice, and affirmation must stay plain English strings, not objects
- The Hindi text must read as if written natively by a Hindi-speaking astrologer, not a mechanical translation — same meaning and tone as the English, in natural Devanagari script
- Do NOT use Romanized Hindi (Hinglish) for the "hi" fields
- Do NOT use emojis
- Do NOT use Markdown
- Do NOT make medical diagnoses or health claims
- Do NOT make guaranteed financial claims
- Do NOT make frightening predictions
- Do NOT mention death, disasters, or serious illness
- Do NOT claim astrology is scientifically proven

Return ONLY the JSON object, nothing else.`;

  try {
    const model = getClient().getGenerativeModel({ model: MODEL_NAME });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log('✅ Gemini response received');

    // Parse the JSON response
    let parsedData: DailyRashifalData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response as JSON');
      console.error('Response:', responseText.substring(0, 500));
      throw new Error('Gemini response is not valid JSON');
    }

    return parsedData;
  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    throw error;
  }
}

/**
 * Condenses arbitrary source text (a Rashifal, a personality reading, etc.)
 * into a short, natural-sounding spoken summary for text-to-speech, rather
 * than reading the full source text verbatim.
 */
export async function summarizeForSpeech(
  sourceText: string,
  contentDescription: string,
  language: 'en' | 'hi'
): Promise<string> {
  console.log(`📞 Calling Gemini API to summarize "${contentDescription}" for speech (${language})...`);

  const languageName = language === 'hi' ? 'Hindi (Devanagari script, not Hinglish)' : 'English';

  const prompt = `You are writing a short spoken-audio summary for a premium astrology app called Destino.

Here is ${contentDescription}:

${sourceText}

Condense this into ONE warm, natural-sounding spoken summary of no more than 40 words, in ${languageName}. It should feel like a friend briefly sharing the highlight — a genuine summary of the core message, not a list of the sections above and not a literal translation.

Do NOT include headings or labels. Do NOT use emojis or Markdown. Return ONLY the summary text, nothing else.`;

  try {
    const model = getClient().getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();

    console.log('✅ Gemini summary received');
    return summary;
  } catch (error) {
    console.error('❌ Gemini API Error (summary):', error);
    throw error;
  }
}

/**
 * Generates a bilingual (English + Hindi) personality reading for a user,
 * grounded in their profile details and (if already generated) their
 * existing astrology profile from generateUserAstrologyProfile.
 */
export async function generatePersonalityProfile(input: {
  name: string;
  zodiacSign: string;
  dateOfBirth: string;
  birthTime?: string;
  placeOfBirth: string;
  existingAstrologySummary?: string;
}): Promise<PersonalityProfile> {
  console.log(`📞 Calling Gemini API to generate personality profile for ${input.name}...`);

  const zodiacInfo = ZODIAC_INFO[input.zodiacSign.toLowerCase()];
  const zodiacName = zodiacInfo?.name || input.zodiacSign;

  const prompt = `You are an expert personality analyst and Vedic astrologer creating an in-depth personality reading for a user of a premium astrology app called Destino.

User details:
- Name: ${input.name}
- Zodiac sign: ${zodiacName}
- Date of birth: ${input.dateOfBirth}
- Birth time: ${input.birthTime || 'Not provided'}
- Place of birth: ${input.placeOfBirth}
${input.existingAstrologySummary ? `- Existing cosmic profile notes: ${input.existingAstrologySummary}` : ''}

Generate a deep, personal personality reading for this specific person, based on their zodiac sign and birth details. Make it feel personal and specific, not generic.

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no explanations, no code blocks.

{
  "english": {
    "summary": "80-150 word warm, personal overview of who this person is at their core",
    "traits": ["exactly 6 short trait words or 2-3 word phrases, English"],
    "strengths": ["exactly 4 positive strengths, each a short phrase, English"],
    "improvementAreas": ["exactly 3 growth areas, each a short, gently and constructively framed phrase (never harsh or negative), English"],
    "emotionalNature": "40-70 word description of how this person experiences and expresses emotion",
    "socialNature": "40-70 word description of this person's social style and how they communicate with others",
    "decisionMaking": "40-70 word description of how this person tends to make decisions",
    "careerPersonality": "40-70 word description of this person's work style and career tendencies"
  },
  "hindi": {
    "summary": "Natural, fluent Hindi (Devanagari script) telling of the SAME overview as the English version — not a literal word-for-word translation, 80-150 words",
    "traits": ["the SAME 6 traits, naturally phrased in Hindi (Devanagari)"],
    "strengths": ["the SAME 4 strengths, naturally phrased in Hindi (Devanagari)"],
    "improvementAreas": ["the SAME 3 growth areas, naturally phrased in Hindi (Devanagari), gentle tone"],
    "emotionalNature": "SAME insight as English version, natural Hindi (Devanagari), 40-70 words",
    "socialNature": "SAME insight as English version, natural Hindi (Devanagari), 40-70 words",
    "decisionMaking": "SAME insight as English version, natural Hindi (Devanagari), 40-70 words",
    "careerPersonality": "SAME insight as English version, natural Hindi (Devanagari), 40-70 words"
  }
}

CONTENT REQUIREMENTS:
- Tone: Warm, positive, insightful, personal, easy to understand
- Address this person's traits directly and specifically, not generically
- The Hindi text must read as if written natively by a Hindi-speaking writer, not a mechanical translation — same meaning and tone as the English, in natural Devanagari script
- Do NOT use Romanized Hindi (Hinglish) for Hindi fields
- Do NOT use emojis
- Do NOT use Markdown
- improvementAreas must stay encouraging and constructive, never harsh, shaming, or clinical
- Do NOT make medical or psychological diagnoses
- Do NOT make frightening statements

Return ONLY the JSON object, nothing else.`;

  try {
    const model = getClient().getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log('✅ Gemini response received');

    let parsedData: PersonalityProfile;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response as JSON');
      console.error('Response:', responseText.substring(0, 500));
      throw new Error('Gemini response is not valid JSON');
    }

    return parsedData;
  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    throw error;
  }
}

/**
 * Generate a personalized astrology profile for a single user using Gemini.
 * Called once, right after signup, and cached in Firestore.
 */
export async function generateUserAstrologyProfile(input: {
  name: string;
  dateOfBirth: string;
  birthTime?: string;
  placeOfBirth: string;
  zodiacSign: string;
}): Promise<UserAstrologyProfile> {
  console.log('📞 Calling Gemini API to generate user astrology profile...');

  const zodiacInfo = ZODIAC_INFO[input.zodiacSign.toLowerCase()];
  const zodiacName = zodiacInfo?.name || input.zodiacSign;

  const prompt = `You are an expert Vedic astrologer creating a personalized astrology profile for a user of a premium astrology app called Destino.

User details:
- Name: ${input.name}
- Zodiac sign: ${zodiacName}
- Date of birth: ${input.dateOfBirth}
- Birth time: ${input.birthTime || 'Not provided'}
- Place of birth: ${input.placeOfBirth}

Generate a personalized astrology profile for this specific person. Base it on their zodiac sign and birth details, and make it feel personal rather than generic.

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no explanations, no code blocks.

{
  "zodiacSign": "${zodiacName}",
  "zodiacElement": "Fire, Earth, Air, or Water - whichever matches ${zodiacName}",
  "rulingPlanet": "the ruling planet for ${zodiacName}",
  "lunarSign": "a plausible Vedic Rashi (moon sign) name",
  "birthNakshatra": "a plausible Nakshatra name",
  "luckyNumber": number between 1-9,
  "luckyColor": "single color name",
  "personalityTraits": ["exactly 4 short personality trait words specific to this person"],
  "personalitySummary": "50-100 word warm, personal summary of this person's character, strengths and tendencies based on their zodiac sign and birth details",
  "cosmicEnergy": {
    "title": "3-6 word mystical title describing their current cosmic energy",
    "description": "50-120 word warm and mystical description of this person's cosmic energy right now"
  },
  "love": { "score": number between 55-95, "description": "30-80 word personal insight about their romantic life" },
  "career": { "score": number between 55-95, "description": "30-80 word personal insight about their career path" },
  "wealth": { "score": number between 55-95, "description": "30-80 word personal insight about their finances" },
  "health": { "score": number between 55-95, "description": "30-80 word personal insight about their wellbeing" },
  "life": { "score": number between 55-95, "description": "30-80 word personal insight about their overall life journey" },
  "compatibleSigns": ["exactly 4 zodiac sign names most compatible with ${zodiacName}"],
  "incompatibleSigns": ["exactly 3 zodiac sign names least compatible with ${zodiacName}"]
}

CONTENT REQUIREMENTS:
- Tone: Warm, positive, mystical, personal, easy to understand
- Address the person's traits directly, not generically
- Do NOT use emojis
- Do NOT use Markdown
- Do NOT make medical diagnoses or health claims
- Do NOT make guaranteed financial claims
- Do NOT make frightening predictions
- Do NOT mention death, disasters, or serious illness
- Do NOT claim astrology is scientifically proven

Return ONLY the JSON object, nothing else.`;

  try {
    const model = getClient().getGenerativeModel({ model: MODEL_NAME });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log('✅ Gemini response received');

    let parsedData: UserAstrologyProfile;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response as JSON');
      console.error('Response:', responseText.substring(0, 500));
      throw new Error('Gemini response is not valid JSON');
    }

    return parsedData;
  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    throw error;
  }
}

/**
 * Judges whether an actual captured photo is usable for a palm reading —
 * the real "detection" gate for the palm-scan flow. There is no on-device
 * hand-tracking model in this app, so this Gemini vision call against the
 * real image is the only genuine image-understanding check available.
 */
export async function validatePalmImageWithGemini(
  imageBase64: string,
  mimeType: string
): Promise<PalmValidationResult> {
  console.log('📞 Calling Gemini API to validate palm image...');

  const imagePart = { inlineData: { data: imageBase64, mimeType } };

  const prompt = `You are checking whether a photo is usable for a palm reading.

Look at the actual image provided and judge, honestly and only from what is visible:
1. Is a human hand/palm visible in the photo at all?
2. Is exactly one hand visible (not zero, not more than one)?
3. Is the palm reasonably facing the camera (not just the back of the hand or an extreme angle)?
4. Does the palm fill a reasonable portion of the frame (not tiny/far away, not cut off at the edges)?
5. Is the image bright and sharp enough that palm lines could plausibly be made out (not too dark, not too blurry)?

Return ONLY valid JSON, no markdown, no explanation:

{
  "valid": boolean,
  "issue": "NO_HAND" | "MULTIPLE_HANDS" | "POOR_LIGHTING" | "TOO_BLURRY" | "PALM_NOT_FACING_CAMERA" | "PALM_OUT_OF_FRAME" | null,
  "message": "one short sentence explaining the verdict"
}

Set "valid": true only if all five checks pass. If more than one check fails, report the single most significant issue. Be honest — do not say valid:true unless a palm is genuinely, clearly visible in the actual image.`;

  try {
    const model = getClient().getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent([imagePart, prompt]);
    const responseText = result.response.text();

    console.log('✅ Gemini validation response received');
    return JSON.parse(responseText) as PalmValidationResult;
  } catch (error) {
    console.error('❌ Gemini API Error (palm validation):', error);
    throw error;
  }
}

/**
 * Analyzes an actual captured palm photo and returns a structured palm
 * reading grounded in the real image. Any line Gemini can't confidently
 * make out from the photo must come back as "not_detected" rather than
 * fabricated content — enforced in the prompt below.
 */
export async function analyzePalmImageWithGemini(
  imageBase64: string,
  mimeType: string,
  context: { nickname?: string | null; age?: number | null; birthplace?: string | null }
): Promise<PalmAnalysisResult> {
  console.log('📞 Calling Gemini API to analyze palm image...');

  const imagePart = { inlineData: { data: imageBase64, mimeType } };

  const contextLines = [
    context.nickname ? `Name: ${context.nickname}` : null,
    context.age ? `Age: ${context.age}` : null,
    context.birthplace ? `Birthplace: ${context.birthplace}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const prompt = `You are Destino AI, a palmistry interpretation assistant, analyzing the actual palm photo provided.

${contextLines ? `Person details:\n${contextLines}\n` : ''}
Analyze ONLY what is genuinely visible in the provided image. Treat palmistry as entertainment/traditional interpretation, not scientific fact — never present predictions as guaranteed, and never make medical, legal, or financial diagnoses.

CRITICAL RULE: For each palm line (life, head, heart, fate, sun/Apollo), only describe it if you can actually make it out in the image. If a specific line is not clearly visible or you're not confident about it, its value MUST be exactly the string "not_detected" — never invent a plausible-sounding description for a line you can't really see.

Return ONLY valid JSON, no markdown, no explanation, matching exactly this structure:

{
  "summary": "80-150 word warm, engaging overall summary of this palm reading",
  "palmStructure": {
    "lifeLine": "description of what's visible + traditional interpretation, or exactly \\"not_detected\\"",
    "headLine": "description + interpretation, or \\"not_detected\\"",
    "heartLine": "description + interpretation, or \\"not_detected\\"",
    "fateLine": "description + interpretation, or \\"not_detected\\"",
    "sunLine": "description + interpretation, or \\"not_detected\\""
  },
  "personality": {
    "summary": "60-100 word personality overview based on visible palm characteristics",
    "traits": ["exactly 4 short trait words/phrases"],
    "strengths": ["exactly 3 positive strengths, short phrases"],
    "challenges": ["exactly 2 gently-framed growth areas, short phrases, never harsh"]
  },
  "career": "40-80 word career/ambition insight",
  "love": "40-80 word love/relationships insight",
  "wealth": "40-80 word money/success insight",
  "generalGuidance": "40-80 word general life-direction guidance"
}

Use language like "traditionally interpreted as..." / "this may suggest..." — never "you will definitely...". Do not use emojis or Markdown. Return ONLY the JSON object.`;

  try {
    const model = getClient().getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent([imagePart, prompt]);
    const responseText = result.response.text();

    console.log('✅ Gemini palm analysis response received');
    return JSON.parse(responseText) as PalmAnalysisResult;
  } catch (error) {
    console.error('❌ Gemini API Error (palm analysis):', error);
    throw error;
  }
}
