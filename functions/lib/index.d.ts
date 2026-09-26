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
 * 5:00 AM IST): the Rashifal is generated ahead of time, but users should
 * be notified at 9:00 AM IST. Idempotent — safe to re-run or retry.
 *
 * Limitation: all users are notified in a single 9:00 AM IST window today,
 * since `users/{uid}` has no per-user timezone field yet. The device/token
 * schema (`users/{uid}/devices/{deviceId}`) is intentionally independent of
 * this scheduling logic so per-timezone send windows can be added later
 * without touching how tokens are stored.
 */
export declare const sendDailyHoroscopeNotification: functions.CloudFunction<unknown>;
