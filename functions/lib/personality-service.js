"use strict";
/**
 * Personality Service
 * Fetches (or lazily generates and caches) a user's bilingual personality
 * reading, grounded in their onboarding profile and existing astrology data.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreatePersonalityProfile = getOrCreatePersonalityProfile;
const admin = __importStar(require("firebase-admin"));
const gemini_service_1 = require("./gemini-service");
const validators_1 = require("./validators");
async function getOrCreatePersonalityProfile(userId) {
    const db = admin.firestore();
    const personalityRef = db.collection('user_personality').doc(userId);
    const existing = await personalityRef.get();
    if (existing.exists) {
        const data = existing.data();
        return { english: data.english, hindi: data.hindi };
    }
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
        throw new Error('User profile not found. Complete onboarding first.');
    }
    const userData = userDoc.data();
    const name = userData.name;
    const zodiacSign = userData.zodiacSign;
    const dateOfBirthTimestamp = userData.dateOfBirth;
    const birthTimeTimestamp = userData.birthTime;
    const placeOfBirth = userData.placeOfBirth;
    if (!name || !zodiacSign || !dateOfBirthTimestamp || !placeOfBirth) {
        throw new Error('Incomplete profile. Add your birth details to generate a personality reading.');
    }
    const dateOfBirth = dateOfBirthTimestamp.toDate().toISOString().split('T')[0];
    const birthTime = birthTimeTimestamp
        ? birthTimeTimestamp.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : undefined;
    // Ground the reading in the user's already-generated astrology profile
    // when available, rather than starting from nothing.
    const astrologyDoc = await db.collection('user_astrology_data').doc(userId).get();
    const existingAstrologySummary = astrologyDoc.exists
        ? astrologyDoc.data()?.personalitySummary
        : undefined;
    const profile = await (0, gemini_service_1.generatePersonalityProfile)({
        name,
        zodiacSign,
        dateOfBirth,
        birthTime,
        placeOfBirth,
        existingAstrologySummary,
    });
    const validationErrors = (0, validators_1.validatePersonalityProfile)(profile);
    if (validationErrors.length > 0) {
        (0, validators_1.logValidationErrors)(validationErrors);
        throw new Error(`Personality profile validation failed with ${validationErrors.length} error(s)`);
    }
    await personalityRef.set({
        userId,
        ...profile,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
    });
    return profile;
}
//# sourceMappingURL=personality-service.js.map