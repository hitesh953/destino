/**
 * Palm Analysis Client
 * Thin wrapper around the secure server-side palm-scan Cloud Functions.
 * Gemini is never called directly from the client — the analysis and the
 * "detection" gate both happen server-side, grounded in the real captured
 * photo, using the same GEMINI_API_KEY secret already used by the rest of
 * this app's Cloud Functions.
 */

import { httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { functionsClient } from '@/services/firestore';

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

export interface PalmScanErrorInfo {
  code: string;
  message: string;
}

/** Reads a callable's failure into a stable {code, message} shape the UI can map to copy. */
function toScanError(error: unknown): PalmScanErrorInfo {
  const details = (error as { details?: { errorCode?: string } })?.details;
  const message = error instanceof Error ? error.message : 'Something went wrong.';
  return { code: details?.errorCode || 'AI_REQUEST_FAILED', message };
}

/** Real detection gate: asks Gemini to judge the actual captured photo. */
export async function validatePalmScan(imageBase64: string, mimeType = 'image/jpeg'): Promise<PalmValidationResult> {
  try {
    const callable = httpsCallable<{ imageBase64: string; mimeType: string }, PalmValidationResult>(
      functionsClient,
      'validatePalmScan'
    );
    const result: HttpsCallableResult<PalmValidationResult> = await callable({ imageBase64, mimeType });
    return result.data;
  } catch (error) {
    throw toScanError(error);
  }
}

/**
 * Full analysis — only call once validatePalmScan has returned valid:true.
 * Name/age/birthplace context comes from the signed-in user's own profile
 * server-side (collected at onboarding) — nothing personal is sent here.
 */
export async function analyzePalmScan(input: {
  imageBase64: string;
  mimeType?: string;
}): Promise<{ readingId: string; analysis: PalmAnalysisResult }> {
  try {
    const callable = httpsCallable<
      { imageBase64: string; mimeType: string },
      { readingId: string; analysis: PalmAnalysisResult }
    >(functionsClient, 'analyzePalmScan');

    const result = await callable({
      imageBase64: input.imageBase64,
      mimeType: input.mimeType || 'image/jpeg',
    });
    return result.data;
  } catch (error) {
    throw toScanError(error);
  }
}
