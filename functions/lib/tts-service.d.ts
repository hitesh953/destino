/**
 * Text-to-Speech Service
 * Synthesizes speech via Google Cloud Text-to-Speech. Runs only in this
 * trusted server environment, authenticated via the function's own runtime
 * service account (Application Default Credentials) — no API key needed.
 *
 * Requires the "Cloud Text-to-Speech API" to be enabled on the GCP project.
 */
export type SpeechLanguage = 'en' | 'hi';
/**
 * Synthesizes `text` into MP3 speech and returns it base64-encoded.
 * Standard voices (not Wavenet/Neural2) are used to keep per-call cost low —
 * swap the voice `name` in VOICE_BY_LANGUAGE for a higher-quality tier later
 * if desired.
 */
export declare function synthesizeSpeech(text: string, language: SpeechLanguage): Promise<string>;
