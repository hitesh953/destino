"use strict";
/**
 * Palm Analysis Service
 * Validates and analyzes a real captured palm photo via Gemini vision, and
 * persists a successful analysis to Firestore. There is no on-device
 * hand-tracking model in this app — this is the only genuine
 * image-understanding check available, so it is the real detection gate.
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
exports.validatePalmScan = validatePalmScan;
exports.analyzePalmScan = analyzePalmScan;
const admin = __importStar(require("firebase-admin"));
const gemini_service_1 = require("./gemini-service");
const validators_1 = require("./validators");
async function validatePalmScan(imageBase64, mimeType) {
    return (0, gemini_service_1.validatePalmImageWithGemini)(imageBase64, mimeType);
}
function calculateAge(dateOfBirth) {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
        age--;
    }
    return age;
}
async function analyzePalmScan(userId, imageBase64, mimeType) {
    const db = admin.firestore();
    // Reuse the profile already collected at onboarding rather than asking
    // the user to re-enter their name/age/birthplace for every scan.
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const nickname = userData.name ?? null;
    const dateOfBirthTimestamp = userData.dateOfBirth;
    const age = dateOfBirthTimestamp ? calculateAge(dateOfBirthTimestamp.toDate()) : null;
    const birthplace = userData.placeOfBirth ?? null;
    const context = { nickname, age, birthplace };
    const analysis = await (0, gemini_service_1.analyzePalmImageWithGemini)(imageBase64, mimeType, context);
    const validationErrors = (0, validators_1.validatePalmAnalysisResult)(analysis);
    if (validationErrors.length > 0) {
        (0, validators_1.logValidationErrors)(validationErrors);
        throw new Error(`AI_RESPONSE_INVALID: validation failed with ${validationErrors.length} error(s)`);
    }
    const readingRef = db.collection('readings').doc();
    const reading = {
        userId,
        nickname: context.nickname ?? null,
        age: context.age ?? null,
        birthplace: context.birthplace ?? null,
        analysis,
        isFavorite: false,
        createdAt: admin.firestore.Timestamp.now(),
    };
    try {
        await readingRef.set(reading);
    }
    catch (error) {
        console.error('❌ Error saving palm reading:', error);
        throw new Error('DATABASE_SAVE_FAILED');
    }
    return { readingId: readingRef.id, analysis };
}
//# sourceMappingURL=palm-analysis-service.js.map