/**
 * Destino - Cloud Functions
 * Scheduled Rashifal Generation
 */
import * as functions from 'firebase-functions';
/**
 * Scheduled Cloud Function: Generate Daily Rashifal
 * Runs every day at 5:00 AM IST (Asia/Kolkata timezone)
 *
 * Schedule pattern: "0 23 * * *" (23:30 UTC = 05:00 AM IST)
 * Note: IST is UTC+5:30, so 5:00 AM IST = 11:30 PM previous day UTC
 */
export declare const generateDailyRashifal: functions.CloudFunction<unknown>;
/**
 * HTTP Callable Function for manual Rashifal generation (for testing)
 * Call from backend with: curl -X POST https://your-region-project.cloudfunctions.net/generateRashifalManual
 */
export declare const generateRashifalManual: functions.HttpsFunction;
/**
 * HTTP Callable Function to delete Rashifal for testing
 * Call with: curl -X DELETE https://your-region-project.cloudfunctions.net/deleteRashifal?key=KEY&date=YYYY-MM-DD
 */
export declare const deleteRashifal: functions.HttpsFunction;
/**
 * Callable Cloud Function: Generate a personalized astrology profile
 * Called once, right after signup, from the client (Firebase callable SDK).
 * Generates the profile with Gemini and caches it in user_astrology_data/{uid}.
 */
export declare const generateUserAstrologyProfile: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Scheduled Cloud Function: Send the "Your Rashifal is Ready" push
 * notification.
 *
 * Deliberately separate from `generateDailyRashifal` (which runs at
 * 5:00 AM IST): the Rashifal is generated ahead of time, and users are
 * notified at 6:30 AM IST — early enough to catch them before they start
 * their day, with a comfortable buffer after generation. Idempotent — safe
 * to re-run or retry.
 *
 * Limitation: all users are notified in a single 6:30 AM IST window today,
 * since `users/{uid}` has no per-user timezone field yet. The device/token
 * schema (`users/{uid}/devices/{deviceId}`) is intentionally independent of
 * this scheduling logic so per-timezone send windows can be added later
 * without touching how tokens are stored.
 */
export declare const sendDailyHoroscopeNotification: functions.CloudFunction<unknown>;
/**
 * Callable Cloud Function: Get (or lazily generate) a brief spoken summary
 * of a user's daily Rashifal via Google Cloud Text-to-Speech.
 *
 * Requires the "Cloud Text-to-Speech API" to be enabled on the GCP project —
 * no key/secret needed, it authenticates via this function's own runtime
 * service account. Results are cached per date/sign/language in
 * `daily_rashifal_audio`, so the same combination is only synthesized once.
 */
export declare const getRashifalAudio: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Callable Cloud Function: Get (or lazily generate) the signed-in user's
 * bilingual personality reading. Generated once via Gemini and cached in
 * `user_personality/{uid}`; subsequent calls just return the cached data
 * without calling Gemini again.
 */
export declare const generatePersonalityProfile: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Callable Cloud Function: Get (or lazily generate) spoken audio for the
 * signed-in user's personality reading, in the requested language. Requires
 * a personality reading to already exist (call generatePersonalityProfile
 * first). Cached directly on the user's own `user_personality/{uid}` doc.
 */
export declare const getPersonalityAudio: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Callable Cloud Function: Validate a captured palm photo before running
 * full analysis. Real "detection" grounded in the actual image via Gemini
 * vision — there is no on-device hand-tracking model in this app.
 */
export declare const validatePalmScan: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Callable Cloud Function: Analyze a captured palm photo (only call after
 * validatePalmScan reports valid:true) and persist the result to
 * `readings/{readingId}`. Name/age/birthplace context comes from the
 * signed-in user's own `users/{uid}` profile (collected at onboarding) —
 * never returns canned/fallback content, any failure surfaces as a typed
 * error instead.
 */
export declare const analyzePalmScan: functions.HttpsFunction & functions.Runnable<any>;
