/**
 * Palm Analysis Service
 * Validates and analyzes a real captured palm photo via Gemini vision, and
 * persists a successful analysis to Firestore. There is no on-device
 * hand-tracking model in this app — this is the only genuine
 * image-understanding check available, so it is the real detection gate.
 */
import { PalmAnalysisResult, PalmValidationResult } from './types';
export declare function validatePalmScan(imageBase64: string, mimeType: string): Promise<PalmValidationResult>;
export declare function analyzePalmScan(userId: string, imageBase64: string, mimeType: string): Promise<{
    readingId: string;
    analysis: PalmAnalysisResult;
}>;
