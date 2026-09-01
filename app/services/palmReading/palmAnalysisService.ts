/**
 * Palm Analysis Service
 * Handles API calls to AI backend for palm reading analysis
 */

import { PalmReading, PalmReadingResponse, Prediction } from "@/types/palmreader";
import { getConfig } from "@/config";

interface AnalysisRequestPayload {
  imageUri: string;
  imageBase64: string;
  metadata: {
    deviceModel: string;
    osVersion: string;
    timestamp: number;
  };
}

/**
 * Send palm image to AI backend for analysis
 */
export const analyzePalmImage = async (
  imageBase64: string,
  imageUri: string
): Promise<PalmReadingResponse> => {
  try {
    const config = getConfig();
    const startTime = Date.now();

    const payload: AnalysisRequestPayload = {
      imageUri,
      imageBase64,
      metadata: {
        deviceModel: "react-native",
        osVersion: "1.0",
        timestamp: Date.now(),
      },
    };

    const response = await fetch(`${config.apiBaseUrl}/api/v1/analyze-palm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const processingTimeMs = Date.now() - startTime;

    return {
      success: true,
      data: {
        id: data.readingId || generateReadingId(),
        userId: data.userId || "anonymous",
        timestamp: Date.now(),
        palmImageUri: imageUri,
        palmImageBase64: imageBase64,
        analysis: {
          loveLife: data.analysis.loveLife,
          career: data.analysis.career,
          health: data.analysis.health,
          finance: data.analysis.finance,
        },
        predictions: data.predictions || [],
        metadata: {
          processingTimeMs,
          modelVersion: data.modelVersion || "1.0",
          imageQuality: data.imageQuality || "medium",
        },
        isFavorite: false,
      },
      metadata: {
        processingTimeMs,
        modelVersion: data.modelVersion || "1.0",
      },
    };
  } catch (error) {
    console.error("Palm analysis error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Retry logic for failed analyses
 */
export const analyzePalmImageWithRetry = async (
  imageBase64: string,
  imageUri: string,
  maxRetries: number = 3
): Promise<PalmReadingResponse> => {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await analyzePalmImage(imageBase64, imageUri);
      if (result.success) {
        return result;
      }
      lastError = new Error(result.error);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  return {
    success: false,
    error: `Failed after ${maxRetries} retries: ${lastError?.message}`,
  };
};

/**
 * Generate unique reading ID
 */
function generateReadingId(): string {
  return `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format predictions for display
 */
export const formatPredictions = (analysis: {
  loveLife: string;
  career: string;
  health: string;
  finance: string;
}): Prediction[] => {
  return [
    {
      category: "love",
      emoji: "❤️",
      title: "Love Life",
      description: analysis.loveLife,
      confidence: 85,
    },
    {
      category: "career",
      emoji: "💼",
      title: "Career",
      description: analysis.career,
      confidence: 82,
    },
    {
      category: "health",
      emoji: "🏥",
      title: "Health",
      description: analysis.health,
      confidence: 78,
    },
    {
      category: "finance",
      emoji: "💰",
      title: "Finance",
      description: analysis.finance,
      confidence: 80,
    },
  ];
};

/**
 * Mock analysis for development
 */
export const getMockPalmAnalysis = (imageUri: string): PalmReadingResponse => {
  return {
    success: true,
    data: {
      id: generateReadingId(),
      userId: "demo_user",
      timestamp: Date.now(),
      palmImageUri: imageUri,
      analysis: {
        loveLife:
          "Love awaits in your future. Venus dances in your heart line, promising deep connections.",
        career:
          "Innovation leads to success. Your fate line suggests prosperity through bold decisions.",
        health: "Strong vitality flows through you. Your life line indicates longevity and wellness.",
        finance:
          "Prosperity comes through wise decisions. Your mount of Jupiter shows business acumen.",
      },
      predictions: formatPredictions({
        loveLife:
          "A soulmate awakens your heart. Deep connections form this season.",
        career: "Success through innovation. Leadership opportunities emerge.",
        health: "Strong vitality ahead. Wellness is your natural state.",
        finance: "Prosperity flows. Smart decisions yield abundance.",
      }),
      metadata: {
        processingTimeMs: 2000,
        modelVersion: "1.0-demo",
        imageQuality: "high",
      },
      isFavorite: false,
    },
  };
};
