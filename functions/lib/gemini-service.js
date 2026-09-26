"use strict";
/**
 * Gemini AI Integration Service
 * Generates daily Rashifal using Google Generative AI
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiApiKey = void 0;
exports.generateRashifalWithGemini = generateRashifalWithGemini;
exports.generateUserAstrologyProfile = generateUserAstrologyProfile;
const generative_ai_1 = require("@google/generative-ai");
const params_1 = require("firebase-functions/params");
const types_1 = require("./types");
// Define the secret parameter for Gemini API key
exports.geminiApiKey = (0, params_1.defineSecret)('GEMINI_API_KEY');
// Initialize client lazily
let client = null;
function getClient() {
    if (!client) {
        const apiKey = exports.geminiApiKey.value();
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not set');
        }
        client = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    return client;
}
const MODEL_NAME = 'gemini-3.8-flash';
/**
 * Generate daily Rashifal for all zodiac signs using Gemini
 */
async function generateRashifalWithGemini(date) {
    console.log('📞 Calling Gemini API to generate Rashifal...');
    const zodiacList = Object.entries(types_1.ZODIAC_INFO)
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
        let parsedData;
        try {
            parsedData = JSON.parse(responseText);
        }
        catch (parseError) {
            console.error('❌ Failed to parse Gemini response as JSON');
            console.error('Response:', responseText.substring(0, 500));
            throw new Error('Gemini response is not valid JSON');
        }
        return parsedData;
    }
    catch (error) {
        console.error('❌ Gemini API Error:', error);
        throw error;
    }
}
/**
 * Generate a personalized astrology profile for a single user using Gemini.
 * Called once, right after signup, and cached in Firestore.
 */
async function generateUserAstrologyProfile(input) {
    console.log('📞 Calling Gemini API to generate user astrology profile...');
    const zodiacInfo = types_1.ZODIAC_INFO[input.zodiacSign.toLowerCase()];
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
        let parsedData;
        try {
            parsedData = JSON.parse(responseText);
        }
        catch (parseError) {
            console.error('❌ Failed to parse Gemini response as JSON');
            console.error('Response:', responseText.substring(0, 500));
            throw new Error('Gemini response is not valid JSON');
        }
        return parsedData;
    }
    catch (error) {
        console.error('❌ Gemini API Error:', error);
        throw error;
    }
}
//# sourceMappingURL=gemini-service.js.map