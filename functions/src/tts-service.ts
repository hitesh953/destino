/**
 * Text-to-Speech Service
 * Synthesizes speech via Google Cloud Text-to-Speech. Runs only in this
 * trusted server environment, authenticated via the function's own runtime
 * service account (Application Default Credentials) — no API key needed.
 *
 * Requires the "Cloud Text-to-Speech API" to be enabled on the GCP project.
 */

import * as textToSpeech from '@google-cloud/text-to-speech';

const client = new textToSpeech.TextToSpeechClient();

export type SpeechLanguage = 'en' | 'hi';

const VOICE_BY_LANGUAGE: Record<SpeechLanguage, { languageCode: string; name: string }> = {
  en: { languageCode: 'en-IN', name: 'en-IN-Standard-A' },
  hi: { languageCode: 'hi-IN', name: 'hi-IN-Standard-A' },
};

/**
 * Synthesizes `text` into MP3 speech and returns it base64-encoded.
 * Standard voices (not Wavenet/Neural2) are used to keep per-call cost low —
 * swap the voice `name` in VOICE_BY_LANGUAGE for a higher-quality tier later
 * if desired.
 */
export async function synthesizeSpeech(text: string, language: SpeechLanguage): Promise<string> {
  const voice = VOICE_BY_LANGUAGE[language];

  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: { languageCode: voice.languageCode, name: voice.name },
    audioConfig: { audioEncoding: 'MP3' },
  });

  if (!response.audioContent) {
    throw new Error('Text-to-Speech returned no audio content');
  }

  return Buffer.from(response.audioContent as Uint8Array).toString('base64');
}
