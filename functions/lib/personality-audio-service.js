"use strict";
/**
 * Personality Audio Service
 * Lazily synthesizes a brief spoken summary of a user's personality reading
 * and caches it directly on their `user_personality/{userId}` doc (one
 * user's own audio, in one of two languages — no cross-user sharing needed,
 * so unlike Rashifal audio this doesn't need its own collection).
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
exports.getOrCreatePersonalityAudio = getOrCreatePersonalityAudio;
const admin = __importStar(require("firebase-admin"));
const tts_service_1 = require("./tts-service");
const gemini_service_1 = require("./gemini-service");
const SECTION_FIELD = { en: 'english', hi: 'hindi' };
async function getOrCreatePersonalityAudio(userId, language) {
    const db = admin.firestore();
    const personalityRef = db.collection('user_personality').doc(userId);
    const doc = await personalityRef.get();
    if (!doc.exists) {
        throw new Error('No personality reading found for this user yet.');
    }
    const data = doc.data();
    const fieldName = SECTION_FIELD[language];
    const section = data[fieldName];
    if (section.audioContent && section.audioMimeType) {
        return { audioContent: section.audioContent, mimeType: section.audioMimeType };
    }
    const sourceText = [
        section.summary,
        `Strengths: ${section.strengths.join(', ')}`,
        `Emotional nature: ${section.emotionalNature}`,
    ].join('\n');
    const summaryText = await (0, gemini_service_1.summarizeForSpeech)(sourceText, "this person's personality reading", language);
    const audioContent = await (0, tts_service_1.synthesizeSpeech)(summaryText, language);
    const mimeType = 'audio/mpeg';
    await personalityRef.update({
        [`${fieldName}.audioContent`]: audioContent,
        [`${fieldName}.audioMimeType`]: mimeType,
        updatedAt: admin.firestore.Timestamp.now(),
    });
    return { audioContent, mimeType };
}
//# sourceMappingURL=personality-audio-service.js.map