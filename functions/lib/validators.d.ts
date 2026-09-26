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
 * Log validation errors
 */
export declare function logValidationErrors(errors: ValidationError[]): void;
