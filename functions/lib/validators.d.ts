/**
 * Validation utilities for Rashifal data
 */
export interface ValidationError {
    field: string;
    message: string;
}
/**
 * Validate the complete Rashifal JSON structure
 */
export declare function validateRashifal(data: any): ValidationError[];
/**
 * Validate a user's personalized astrology profile (from generateUserAstrologyProfile)
 */
export declare function validateUserAstrologyProfile(data: any): ValidationError[];
/**
 * Validate a bilingual personality profile (from generatePersonalityProfile)
 */
export declare function validatePersonalityProfile(data: any): ValidationError[];
/**
 * Validate a palm analysis result (from analyzePalmImage). Every text field
 * must be present — a missing/malformed field means the AI response is
 * rejected outright rather than silently filled in with placeholder text.
 */
export declare function validatePalmAnalysisResult(data: any): ValidationError[];
/**
 * Log validation errors
 */
export declare function logValidationErrors(errors: ValidationError[]): void;
