"use strict";
/**
 * Text-to-Speech Service
 * Synthesizes speech via Google Cloud Text-to-Speech. Runs only in this
 * trusted server environment, authenticated via the function's own runtime
 * service account (Application Default Credentials) — no API key needed.
 *
 * Requires the "Cloud Text-to-Speech API" to be enabled on the GCP project.
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
exports.synthesizeSpeech = synthesizeSpeech;
const textToSpeech = __importStar(require("@google-cloud/text-to-speech"));
const client = new textToSpeech.TextToSpeechClient();
const VOICE_BY_LANGUAGE = {
    en: { languageCode: 'en-IN', name: 'en-IN-Standard-A' },
    hi: { languageCode: 'hi-IN', name: 'hi-IN-Standard-A' },
};
/**
 * Synthesizes `text` into MP3 speech and returns it base64-encoded.
 * Standard voices (not Wavenet/Neural2) are used to keep per-call cost low —
 * swap the voice `name` in VOICE_BY_LANGUAGE for a higher-quality tier later
 * if desired.
 */
async function synthesizeSpeech(text, language) {
    const voice = VOICE_BY_LANGUAGE[language];
    const [response] = await client.synthesizeSpeech({
        input: { text },
        voice: { languageCode: voice.languageCode, name: voice.name },
        audioConfig: { audioEncoding: 'MP3' },
    });
    if (!response.audioContent) {
        throw new Error('Text-to-Speech returned no audio content');
    }
    return Buffer.from(response.audioContent).toString('base64');
}
//# sourceMappingURL=tts-service.js.map