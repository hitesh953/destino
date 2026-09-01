/**
 * Palm Reader App - TypeScript Type Definitions
 */

/**
 * Palm Reading Analysis Result
 */
export interface PalmAnalysis {
  loveLife: string;
  career: string;
  health: string;
  finance: string;
}

/**
 * Palm Predictions
 */
export interface Prediction {
  category: "love" | "career" | "health" | "finance";
  emoji: string;
  title: string;
  description: string;
  confidence: number; // 0-100
}

/**
 * Complete Palm Reading Record
 */
export interface PalmReading {
  id: string;
  userId: string;
  timestamp: number;
  palmImageUri: string;
  palmImageBase64?: string;
  analysis: PalmAnalysis;
  predictions: Prediction[];
  metadata: {
    processingTimeMs: number;
    modelVersion: string;
    imageQuality: "low" | "medium" | "high";
  };
  isFavorite: boolean;
  notes?: string;
}

/**
 * Processing State for Scanning
 */
export type ProcessingStage = "detecting" | "analyzing" | "generating";

export interface ProcessingState {
  stage: ProcessingStage;
  progress: number; // 0-100
  message: string;
  startTime: number;
  estimatedDuration: number; // ms
}

/**
 * API Response Types
 */
export interface PalmReadingResponse {
  success: boolean;
  data?: PalmReading;
  error?: string;
  metadata?: {
    processingTimeMs: number;
    modelVersion: string;
  };
}

/**
 * Screen Navigation Params
 */
export interface NavigationParams {
  SplashScreen: undefined;
  HomeScreen: undefined;
  CameraScreen: undefined;
  ProcessingScreen: { imageUri: string };
  ReadingResultScreen: { readingId: string };
  HistoryScreen: undefined;
  ProfileScreen: undefined;
  SettingsScreen: undefined;
}

/**
 * Theme Configuration
 */
export interface ThemeColors {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  error: string;
  success: string;
}

/**
 * App Configuration
 */
export interface AppConfig {
  apiBaseUrl: string;
  apiKey: string;
  maxImageSize: number; // bytes
  maxRetries: number;
  retryDelay: number; // ms
}

/**
 * User Analytics Event
 */
export interface AnalyticsEvent {
  name: string;
  timestamp: number;
  properties?: Record<string, any>;
  userId?: string;
}

/**
 * Camera Permissions Status
 */
export type PermissionStatus = "granted" | "denied" | "pending";

export interface CameraPermissions {
  camera: PermissionStatus;
  photoLibrary: PermissionStatus;
}
