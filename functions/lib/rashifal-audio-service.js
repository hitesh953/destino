"use strict";
/**
 * Rashifal Audio Service
 * Builds a brief spoken summary of a user's daily Rashifal and caches the
 * synthesized audio so the same day/sign/language combo is only sent to
 * Text-to-Speech once, no matter how many users request it.
 *
 * Cached in its own `daily_rashifal_audio` collection (not on the
 * `daily_rashifal/{date}` doc itself) so base64 audio never risks pushing
 * that already-large document over Firestore's 1MiB limit.
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
exports.getOrCreateRashifalAudio = getOrCreateRashifalAudio;
const admin = __importStar(require("firebase-admin"));
const tts_service_1 = require("./tts-service");
const gemini_service_1 = require("./gemini-service");
async function getOrCreateRashifalAudio(date, zodiacSign, language) {
    const db = admin.firestore();
    const cacheRef = db.collection('daily_rashifal_audio').doc(`${date}_${zodiacSign}_${language}`);
    const cached = await cacheRef.get();
    if (cached.exists) {
        const data = cached.data();
        return { audioContent: data.audioContent, mimeType: data.mimeType };
    }
    const rashifalDoc = await db.collection('daily_rashifal').doc(date).get();
    if (!rashifalDoc.exists) {
        throw new Error(`No Rashifal found for ${date}`);
    }
    const zodiacData = rashifalDoc.data()?.zodiacSigns?.[zodiacSign];
    if (!zodiacData) {
        throw new Error(`No Rashifal found for sign "${zodiacSign}" on ${date}`);
    }
    const sourceText = `Cosmic Energy — ${zodiacData.cosmicEnergy.title}: ${zodiacData.cosmicEnergy.description[language]}\nAdvice: ${zodiacData.advice}\nAffirmation: ${zodiacData.affirmation}`;
    const summaryText = await (0, gemini_service_1.summarizeForSpeech)(sourceText, `today's Rashifal for ${zodiacData.name}`, language);
    const audioContent = await (0, tts_service_1.synthesizeSpeech)(summaryText, language);
    const mimeType = 'audio/mpeg';
    await cacheRef.set({
        audioContent,
        mimeType,
        summaryText,
        createdAt: admin.firestore.Timestamp.now(),
    });
    return { audioContent, mimeType };
}
//# sourceMappingURL=rashifal-audio-service.js.map