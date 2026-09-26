"use strict";
/**
 * Validation utilities for Rashifal data
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRashifal = validateRashifal;
exports.validateUserAstrologyProfile = validateUserAstrologyProfile;
exports.logValidationErrors = logValidationErrors;
const types_1 = require("./types");
/**
 * Validate the complete Rashifal JSON structure
 */
function validateRashifal(data) {
    const errors = [];
    // Check root structure
    if (!data || typeof data !== 'object') {
        errors.push({ field: 'root', message: 'Rashifal data must be an object' });
        return errors;
    }
    // Validate date format
    if (!data.date || typeof data.date !== 'string') {
        errors.push({ field: 'date', message: 'Date is required and must be a string' });
    }
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
        errors.push({ field: 'date', message: 'Date must be in YYYY-MM-DD format' });
    }
    // Validate zodiacSigns object exists
    if (!data.zodiacSigns || typeof data.zodiacSigns !== 'object') {
        errors.push({ field: 'zodiacSigns', message: 'zodiacSigns must be an object' });
        return errors;
    }
    // Validate each zodiac sign
    for (const sign of types_1.ZODIAC_SIGNS) {
        const signData = data.zodiacSigns[sign];
        if (!signData) {
            errors.push({ field: `zodiacSigns.${sign}`, message: `${sign} zodiac sign data is missing` });
            continue;
        }
        const signErrors = validateZodiacSign(sign, signData);
        errors.push(...signErrors);
    }
    return errors;
}
/**
 * Validate individual zodiac sign data
 */
function validateZodiacSign(sign, data) {
    const errors = [];
    const prefix = `zodiacSigns.${sign}`;
    // Validate name
    if (!data.name || typeof data.name !== 'string') {
        errors.push({ field: `${prefix}.name`, message: 'name is required' });
    }
    // Validate dateRange
    if (!data.dateRange || typeof data.dateRange !== 'string') {
        errors.push({ field: `${prefix}.dateRange`, message: 'dateRange is required' });
    }
    // Validate cosmicEnergy
    if (!data.cosmicEnergy || typeof data.cosmicEnergy !== 'object') {
        errors.push({ field: `${prefix}.cosmicEnergy`, message: 'cosmicEnergy is required' });
    }
    else {
        if (!data.cosmicEnergy.title || typeof data.cosmicEnergy.title !== 'string') {
            errors.push({ field: `${prefix}.cosmicEnergy.title`, message: 'title is required' });
        }
        else if (data.cosmicEnergy.title.split(' ').length > 6) {
            errors.push({ field: `${prefix}.cosmicEnergy.title`, message: 'title must be 3-6 words' });
        }
        errors.push(...validateBilingualDescription(`${prefix}.cosmicEnergy.description`, data.cosmicEnergy.description, 25, 180));
    }
    // Validate score sections (love, career, wealth, health, life)
    const scoreFields = ['love', 'career', 'wealth', 'health', 'life'];
    for (const field of scoreFields) {
        const sectionErrors = validateScoreSection(sign, field, data[field]);
        errors.push(...sectionErrors);
    }
    // Validate lucky
    if (!data.lucky || typeof data.lucky !== 'object') {
        errors.push({ field: `${prefix}.lucky`, message: 'lucky is required' });
    }
    else {
        if (!data.lucky.color || typeof data.lucky.color !== 'string') {
            errors.push({ field: `${prefix}.lucky.color`, message: 'color is required' });
        }
        if (typeof data.lucky.number !== 'number' || data.lucky.number < 1 || data.lucky.number > 99) {
            errors.push({ field: `${prefix}.lucky.number`, message: 'number must be between 1 and 99' });
        }
        if (!data.lucky.time || typeof data.lucky.time !== 'string') {
            errors.push({ field: `${prefix}.lucky.time`, message: 'time is required' });
        }
        if (!data.lucky.direction || typeof data.lucky.direction !== 'string') {
            errors.push({ field: `${prefix}.lucky.direction`, message: 'direction is required' });
        }
    }
    // Validate advice
    if (!data.advice || typeof data.advice !== 'string') {
        errors.push({ field: `${prefix}.advice`, message: 'advice is required' });
    }
    else if (data.advice.split(' ').length > 30) {
        errors.push({ field: `${prefix}.advice`, message: 'advice must be maximum 30 words' });
    }
    // Validate affirmation
    if (!data.affirmation || typeof data.affirmation !== 'string') {
        errors.push({ field: `${prefix}.affirmation`, message: 'affirmation is required' });
    }
    else if (data.affirmation.split(' ').length > 20) {
        errors.push({ field: `${prefix}.affirmation`, message: 'affirmation must be maximum 20 words' });
    }
    return errors;
}
/**
 * Validate score section (love, career, wealth, health, life)
 */
function validateScoreSection(sign, field, data) {
    const errors = [];
    const prefix = `zodiacSigns.${sign}.${field}`;
    if (!data || typeof data !== 'object') {
        errors.push({ field: prefix, message: `${field} is required` });
        return errors;
    }
    if (typeof data.score !== 'number' || data.score < 55 || data.score > 95) {
        errors.push({ field: `${prefix}.score`, message: 'score must be a number between 55 and 95' });
    }
    errors.push(...validateBilingualDescription(`${prefix}.description`, data.description, 15, 150));
    return errors;
}
/**
 * Validate a { en, hi } bilingual description object. Word counting works
 * the same way for Hindi (Devanagari) as English since both are
 * space-separated scripts.
 */
function validateBilingualDescription(field, data, minWords, maxWords) {
    const errors = [];
    if (!data || typeof data !== 'object') {
        errors.push({ field, message: `${field} must be an object with "en" and "hi" strings` });
        return errors;
    }
    for (const lang of ['en', 'hi']) {
        const text = data[lang];
        if (!text || typeof text !== 'string') {
            errors.push({ field: `${field}.${lang}`, message: `${lang} description is required` });
            continue;
        }
        const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
        if (wordCount < minWords || wordCount > maxWords) {
            errors.push({
                field: `${field}.${lang}`,
                message: `${lang} description must be ${minWords}-${maxWords} words`,
            });
        }
    }
    return errors;
}
/**
 * Validate a user's personalized astrology profile (from generateUserAstrologyProfile)
 */
function validateUserAstrologyProfile(data) {
    const errors = [];
    if (!data || typeof data !== 'object') {
        errors.push({ field: 'root', message: 'Profile data must be an object' });
        return errors;
    }
    const requiredStringFields = [
        'zodiacSign',
        'zodiacElement',
        'rulingPlanet',
        'lunarSign',
        'birthNakshatra',
        'luckyColor',
        'personalitySummary',
    ];
    for (const field of requiredStringFields) {
        if (!data[field] || typeof data[field] !== 'string') {
            errors.push({ field, message: `${field} is required and must be a string` });
        }
    }
    if (typeof data.luckyNumber !== 'number' || data.luckyNumber < 1 || data.luckyNumber > 9) {
        errors.push({ field: 'luckyNumber', message: 'luckyNumber must be a number between 1 and 9' });
    }
    if (!Array.isArray(data.personalityTraits) || data.personalityTraits.length === 0) {
        errors.push({ field: 'personalityTraits', message: 'personalityTraits must be a non-empty array' });
    }
    if (!Array.isArray(data.compatibleSigns) || data.compatibleSigns.length === 0) {
        errors.push({ field: 'compatibleSigns', message: 'compatibleSigns must be a non-empty array' });
    }
    if (!Array.isArray(data.incompatibleSigns) || data.incompatibleSigns.length === 0) {
        errors.push({ field: 'incompatibleSigns', message: 'incompatibleSigns must be a non-empty array' });
    }
    if (!data.cosmicEnergy || typeof data.cosmicEnergy !== 'object') {
        errors.push({ field: 'cosmicEnergy', message: 'cosmicEnergy is required' });
    }
    else {
        if (!data.cosmicEnergy.title || typeof data.cosmicEnergy.title !== 'string') {
            errors.push({ field: 'cosmicEnergy.title', message: 'title is required' });
        }
        if (!data.cosmicEnergy.description || typeof data.cosmicEnergy.description !== 'string') {
            errors.push({ field: 'cosmicEnergy.description', message: 'description is required' });
        }
        else {
            const wordCount = data.cosmicEnergy.description.trim().split(/\s+/).filter(Boolean).length;
            if (wordCount < 25 || wordCount > 180) {
                errors.push({ field: 'cosmicEnergy.description', message: 'description must be 25-180 words' });
            }
        }
    }
    const scoreFields = ['love', 'career', 'wealth', 'health', 'life'];
    for (const field of scoreFields) {
        const section = data[field];
        if (!section || typeof section !== 'object') {
            errors.push({ field, message: `${field} is required` });
            continue;
        }
        if (typeof section.score !== 'number' || section.score < 55 || section.score > 95) {
            errors.push({ field: `${field}.score`, message: 'score must be a number between 55 and 95' });
        }
        if (!section.description || typeof section.description !== 'string') {
            errors.push({ field: `${field}.description`, message: 'description is required' });
        }
        else {
            const wordCount = section.description.trim().split(/\s+/).filter(Boolean).length;
            if (wordCount < 15 || wordCount > 150) {
                errors.push({ field: `${field}.description`, message: 'description must be 15-150 words' });
            }
        }
    }
    return errors;
}
/**
 * Log validation errors
 */
function logValidationErrors(errors) {
    if (errors.length === 0) {
        console.log('✅ Validation passed: All fields are valid');
        return;
    }
    console.error(`❌ Validation failed with ${errors.length} error(s):`);
    errors.forEach((error, index) => {
        console.error(`  ${index + 1}. [${error.field}] ${error.message}`);
    });
}
//# sourceMappingURL=validators.js.map