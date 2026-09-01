import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from environment variables
// In Expo, public variables must start with EXPO_PUBLIC_
const GENERATIVE_AI_API_KEY = process.env.EXPO_PUBLIC_GENERATIVE_AI_API_KEY || '';

if (!GENERATIVE_AI_API_KEY) {
  console.warn('⚠️ EXPO_PUBLIC_GENERATIVE_AI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(GENERATIVE_AI_API_KEY);

interface PalmReadingAnalysisRequest {
  imageBase64: string;
  imageMimeType?: string;
}

interface PalmReadingAnalysisResponse {
  reading: string;
  insights: string[];
  characteristics: Record<string, string>;
}

/**
 * Analyze palm image using Firebase AI Logic (Generative AI)
 */
export async function analyzePalmReading(
  request: PalmReadingAnalysisRequest
): Promise<PalmReadingAnalysisResponse> {
  try {
    console.log("🔌 [AI] Initializing Gemini model...");
    const model = genAI.getGenerativeModel({ model: 'models/gemini-3.5-flash-lite' });
    console.log("✅ [AI] Model initialized");

    console.log("📸 [AI] Preparing image data...");
    const imagePart = {
      inlineData: {
        data: request.imageBase64,
        mimeType: request.imageMimeType || 'image/jpeg',
      },
    };
    console.log("✅ [AI] Image data prepared, size:", request.imageBase64.length);

    const prompt = `You are Destino AI, an advanced palm-reading interpretation assistant.

Your task is to analyze the user's palm image and provide a detailed, engaging, personalized palm reading based ONLY on visible features in the provided image and traditional palmistry interpretations.

IMPORTANT:

* Treat palmistry as entertainment and cultural/traditional interpretation, not scientific fact.
* Never present predictions as guaranteed facts.
* Do not make medical, legal, or financial diagnoses or claims.
* Never invent a palm line or feature that is not reasonably visible.
* If the image quality is insufficient, clearly say that a reliable reading cannot be made and identify what needs to be improved.
* Distinguish between observations from the image and their traditional palmistry interpretation.
* Avoid generic statements that could apply to everyone.
* Be specific about the visible characteristics that lead to each interpretation.

IMAGE QUALITY CHECK

Before reading the palm, evaluate:

1. Is a human palm clearly visible?
2. Is most of the palm visible?
3. Are the major palm lines sufficiently clear?
4. Are the fingers visible?
5. Is the image sharp enough for analysis?
6. Is lighting sufficient?
7. Is the palm orientation understandable?

If the image fails these checks, return:

* validPalm: false
* qualityIssues: [specific problems]
* recommendation: what the user should do to capture a better image

If the image is suitable, continue with the reading.

PALM ANALYSIS

Analyze the following where visible:

1. LIFE LINE

* Length
* Depth
* Curvature
* Continuity
* Branches
* Breaks or unusual markings
* Traditional palmistry interpretation

2. HEAD LINE

* Length
* Depth
* Straight or curved appearance
* Direction
* Branches
* Breaks
* Traditional interpretation relating to thinking style, decision-making and creativity

3. HEART LINE

* Length
* Curvature
* Depth
* Ending position
* Branches
* Breaks
* Traditional interpretation relating to emotions and relationships

4. FATE LINE

* Presence or absence
* Strength
* Direction
* Continuity
* Starting point if visible
* Traditional interpretation relating to career and life direction

5. SUN/APOLLO LINE

* Presence
* Strength
* Visibility
* Traditional interpretation relating to recognition, creativity and achievement

6. MOUNTS
   Where reasonably visible, evaluate:

* Venus
* Jupiter
* Saturn
* Apollo/Sun
* Mercury
* Moon
* Mars

7. FINGER CHARACTERISTICS
   Where clearly visible:

* Finger proportions
* Spacing
* Thumb characteristics
* Finger shape
* Traditional palmistry interpretation

8. OVERALL PATTERN
   Combine the visible characteristics into an overall interpretation.

PERSONALIZED READING

Create sections for:

* Personality
* Strengths
* Challenges
* Love & Relationships
* Career & Ambition
* Money & Success
* Creativity
* Life Direction
* Personal Growth
* Overall Destiny Theme

For future-oriented statements, use language such as:
"Traditionally, this is interpreted as..."
"This may suggest..."
"In palmistry, this is often associated with..."

Do NOT say:
"You will definitely..."
"You are guaranteed to..."
"You will become rich..."
"You will get married at..."
"You will live until..."

Instead provide thoughtful, probabilistic, entertainment-style interpretations.

RESPONSE STYLE

Make the reading feel premium, insightful and personalized.

Use:

* Clear headings
* Short paragraphs
* Specific observations
* Positive but honest language
* A mystical/futuristic tone without sounding cheesy
* No excessive emojis

Do not overwhelm the user with technical palmistry terminology. Explain terms briefly when necessary.

FINAL SUMMARY

End with:

1. Overall reading
2. Three strongest personality traits
3. Three key strengths
4. Two areas for growth
5. One memorable "Destino Insight"

Return the result in the following JSON structure:

{
"validPalm": true,
"imageQuality": {
"score": 0,
"issues": []
},
"hand": {
"detected": true,
"side": "left/right/unknown"
},
"lines": {
"life": {
"observations": "",
"interpretation": ""
},
"head": {
"observations": "",
"interpretation": ""
},
"heart": {
"observations": "",
"interpretation": ""
},
"fate": {
"observations": "",
"interpretation": ""
},
"sun": {
"observations": "",
"interpretation": ""
}
},
"personality": "",
"strengths": [],
"challenges": [],
"loveAndRelationships": "",
"careerAndAmbition": "",
"moneyAndSuccess": "",
"creativity": "",
"lifeDirection": "",
"personalGrowth": "",
"overallDestinyTheme": "",
"destinoInsight": ""
}
`;

    console.log("🚀 [AI] Sending request to Gemini API...");
    const startTime = Date.now();

    const result = await model.generateContent([imagePart, prompt]);
    const responseTime = Date.now() - startTime;

    console.log("✅ [AI] Response received in", responseTime, "ms");
    const responseText = result.response.text();
    console.log("📝 [AI] Response length:", responseText.length, "chars");

    // Parse the response
    console.log("🔍 [AI] Parsing response...");
    let reading = '';
    let insights: string[] = [];
    let characteristics: Record<string, string> = {};

    // Try to parse as JSON first (new format)
    try {
      console.log("🔍 [AI] Attempting JSON parse...");
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = responseText.substring(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(jsonStr);

        console.log("✅ [AI] Successfully parsed JSON response");

        // Extract reading from various possible fields
        reading = parsed.overallDestinyTheme || parsed.personality || parsed.reading || '';

        // Extract detailed insights from specific palm reading fields
        insights = [
          parsed.loveAndRelationships || '',
          parsed.careerAndAmbition || '',
          parsed.personalGrowth || parsed.creativity || 'Growth and personal development',
          parsed.moneyAndSuccess || '',
        ].filter(s => s.length > 0);

        // Extract characteristics from palm lines
        if (parsed.lines) {
          characteristics = {
            'Life Line': parsed.lines.life?.interpretation || '',
            'Head Line': parsed.lines.head?.interpretation || '',
            'Heart Line': parsed.lines.heart?.interpretation || '',
            'Fate Line': parsed.lines.fate?.interpretation || '',
          };
        }

        console.log("✅ [AI] Extracted JSON - Reading length:", reading.length);
        console.log("✅ [AI] Extracted", insights.length, "insights from JSON");
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (jsonError) {
      console.warn("⚠️  [AI] JSON parsing failed, trying text format:", jsonError);

      // Fallback to text-based parsing (old format)
      const readingSection = extractSection(responseText, 'READING');
      const insightsText = extractSection(responseText, 'INSIGHTS');
      const characteristicsText = extractSection(responseText, 'CHARACTERISTICS');

      reading = readingSection || responseText.substring(0, 500);
      insights = parseInsights(insightsText);
      characteristics = parseCharacteristics(characteristicsText);

      console.log("⚠️  [AI] Using fallback text parsing");
    }

    // Ensure we have valid data
    if (!reading && insights.length > 0) {
      reading = insights[0];
    }
    if (insights.length === 0) {
      insights = [reading];
    }

    console.log("✅ [AI] Final parse - Reading:", reading.substring(0, 80) + "...");
    console.log("✅ [AI] Parsed", insights.length, "insights and", Object.keys(characteristics).length, "characteristics");

    return {
      reading,
      insights,
      characteristics,
    };
  } catch (error) {
    console.error('❌ [AI] Error analyzing palm reading:', error);
    console.error('❌ [AI] Error details:', (error as Error).message);
    throw new Error('Failed to analyze palm reading');
  }
}

/**
 * Generate a detailed spiritual reading based on palm analysis
 */
export async function generateSpiritualReading(
  palmAnalysis: PalmReadingAnalysisResponse
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Based on this palm reading analysis, generate a personalized spiritual reading:

Reading: ${palmAnalysis.reading}
Insights: ${palmAnalysis.insights.join(', ')}
Characteristics: ${Object.entries(palmAnalysis.characteristics)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')}

Generate a detailed, mystical spiritual interpretation that:
1. Connects to deeper spiritual meanings
2. Provides guidance for personal growth
3. Offers wisdom for the person's journey
4. Includes positive affirmations

Make it personal, meaningful, and inspiring.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating spiritual reading:', error);
    throw new Error('Failed to generate spiritual reading');
  }
}

// Helper functions
function extractSection(text: string, sectionName: string): string {
  const regex = new RegExp(`${sectionName}:?\\s*([\\s\\S]*?)(?=\\n[A-Z]+:|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

function parseInsights(insightsText: string): string[] {
  return insightsText
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => line.replace(/^[-•*]\s*/, '').trim());
}

function parseCharacteristics(characteristicsText: string): Record<string, string> {
  const characteristics: Record<string, string> = {};
  characteristicsText
    .split('\n')
    .filter((line) => line.includes(':'))
    .forEach((line) => {
      const [key, value] = line.split(':').map((s) => s.trim());
      if (key && value) {
        characteristics[key] = value;
      }
    });
  return characteristics;
}

export default {
  analyzePalmReading,
  generateSpiritualReading,
};
