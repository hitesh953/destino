"use strict";
/**
 * Destino - Cloud Functions
 * Scheduled Rashifal Generation
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
exports.sendDailyHoroscopeNotification = exports.generateUserAstrologyProfile = exports.deleteRashifal = exports.generateRashifalManual = exports.generateDailyRashifal = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const gemini_service_1 = require("./gemini-service");
const firestore_service_1 = require("./firestore-service");
const validators_1 = require("./validators");
const notification_service_1 = require("./notification-service");
// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp();
}
/**
 * Scheduled Cloud Function: Generate Daily Rashifal
 * Runs every day at 5:00 AM IST (Asia/Kolkata timezone)
 *
 * Schedule pattern: "0 23 * * *" (23:30 UTC = 05:00 AM IST)
 * Note: IST is UTC+5:30, so 5:00 AM IST = 11:30 PM previous day UTC
 */
exports.generateDailyRashifal = functions
    .region('us-central1')
    .runWith({ secrets: ['GEMINI_API_KEY'] })
    .pubsub.schedule('0 23 * * *')
    .timeZone('UTC')
    .onRun(async (context) => {
    console.log('='.repeat(60));
    console.log('🌟 Starting Daily Rashifal Generation...');
    console.log('='.repeat(60));
    const startTime = Date.now();
    try {
        // Get today's date in IST (Asia/Kolkata)
        const istDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const dateStr = istDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        console.log(`📅 Processing date: ${dateStr} (IST)`);
        // Check if Rashifal for today already exists
        const exists = await (0, firestore_service_1.rashifalExists)(dateStr);
        if (exists) {
            console.log(`⏭️  Rashifal for ${dateStr} already exists. Skipping generation.`);
            console.log(`✅ Function completed successfully (no action needed)`);
            return {
                success: true,
                message: `Rashifal for ${dateStr} already exists`,
                action: 'skipped',
            };
        }
        // Generate Rashifal using Gemini
        console.log('🤖 Calling Gemini AI to generate Rashifal...');
        const rashifalData = await (0, gemini_service_1.generateRashifalWithGemini)(dateStr);
        console.log('✅ Gemini generation completed');
        // Validate the generated data
        console.log('✔️  Validating Rashifal structure...');
        const validationErrors = (0, validators_1.validateRashifal)(rashifalData);
        if (validationErrors.length > 0) {
            (0, validators_1.logValidationErrors)(validationErrors);
            console.error('❌ Validation failed. Not saving incomplete data to Firestore.');
            throw new Error(`Validation failed with ${validationErrors.length} errors. See logs for details.`);
        }
        console.log('✅ Validation passed: All fields are correct');
        // Save to Firestore
        await (0, firestore_service_1.saveRashifalToFirestore)(dateStr, rashifalData);
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        console.log('='.repeat(60));
        console.log('✅ Daily Rashifal Generation Completed Successfully!');
        console.log(`⏱️  Duration: ${duration}s`);
        console.log('='.repeat(60));
        return {
            success: true,
            message: `Rashifal for ${dateStr} generated and saved successfully`,
            action: 'generated',
            duration: `${duration}s`,
        };
    }
    catch (error) {
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        console.error('='.repeat(60));
        console.error('❌ Error during Rashifal generation:');
        if (error instanceof Error) {
            console.error(`Message: ${error.message}`);
            console.error(`Stack: ${error.stack}`);
        }
        else {
            console.error('Unknown error:', error);
        }
        console.error(`Duration before error: ${duration}s`);
        console.error('='.repeat(60));
        // Return error details but don't throw to prevent function from failing
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            action: 'failed',
            duration: `${duration}s`,
        };
    }
});
/**
 * HTTP Callable Function for manual Rashifal generation (for testing)
 * Call from backend with: curl -X POST https://your-region-project.cloudfunctions.net/generateRashifalManual
 */
exports.generateRashifalManual = functions
    .region('asia-south1')
    .runWith({ secrets: ['GEMINI_API_KEY'] })
    .https.onRequest(async (req, res) => {
    // Basic security: check for authorization header
    const authHeader = req.headers.authorization;
    const expectedKey = process.env.MANUAL_TRIGGER_KEY;
    if (!expectedKey || !authHeader || authHeader !== `Bearer ${expectedKey}`) {
        console.warn('⚠️  Unauthorized manual trigger attempt');
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    console.log('🔧 Manual Rashifal generation triggered');
    try {
        // Get today's date in IST
        const istDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const dateStr = istDate.toISOString().split('T')[0];
        // Check if exists
        const exists = await (0, firestore_service_1.rashifalExists)(dateStr);
        if (exists) {
            res.json({
                success: false,
                message: `Rashifal for ${dateStr} already exists`,
            });
            return;
        }
        // Generate
        const rashifalData = await (0, gemini_service_1.generateRashifalWithGemini)(dateStr);
        // Validate
        const validationErrors = (0, validators_1.validateRashifal)(rashifalData);
        if (validationErrors.length > 0) {
            (0, validators_1.logValidationErrors)(validationErrors);
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors,
            });
            return;
        }
        // Save
        await (0, firestore_service_1.saveRashifalToFirestore)(dateStr, rashifalData);
        res.json({
            success: true,
            message: `Rashifal for ${dateStr} generated and saved`,
            date: dateStr,
        });
    }
    catch (error) {
        console.error('❌ Manual generation error:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
/**
 * HTTP Callable Function to delete Rashifal for testing
 * Call with: curl -X DELETE https://your-region-project.cloudfunctions.net/deleteRashifal?key=KEY&date=YYYY-MM-DD
 */
exports.deleteRashifal = functions
    .region('asia-south1')
    .https.onRequest(async (req, res) => {
    // Security check
    const authKey = req.query.key;
    const expectedKey = process.env.MANUAL_TRIGGER_KEY;
    if (!expectedKey || authKey !== expectedKey) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const date = req.query.date;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        return;
    }
    try {
        const db = admin.firestore();
        await db.collection('daily_rashifal').doc(date).delete();
        res.json({
            success: true,
            message: `Rashifal for ${date} deleted`,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Delete failed',
        });
    }
});
/**
 * Callable Cloud Function: Generate a personalized astrology profile
 * Called once, right after signup, from the client (Firebase callable SDK).
 * Generates the profile with Gemini and caches it in user_astrology_data/{uid}.
 */
exports.generateUserAstrologyProfile = functions
    .region('us-central1')
    .runWith({ secrets: ['GEMINI_API_KEY'] })
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be signed in to generate an astrology profile.');
    }
    const { name, dateOfBirth, birthTime, placeOfBirth, zodiacSign } = data || {};
    if (!name || !dateOfBirth || !placeOfBirth || !zodiacSign) {
        throw new functions.https.HttpsError('invalid-argument', 'name, dateOfBirth, placeOfBirth and zodiacSign are required.');
    }
    const userId = context.auth.uid;
    console.log(`🌟 Generating astrology profile for user ${userId}...`);
    try {
        const profile = await (0, gemini_service_1.generateUserAstrologyProfile)({
            name,
            dateOfBirth,
            birthTime,
            placeOfBirth,
            zodiacSign,
        });
        const validationErrors = (0, validators_1.validateUserAstrologyProfile)(profile);
        if (validationErrors.length > 0) {
            (0, validators_1.logValidationErrors)(validationErrors);
            throw new functions.https.HttpsError('internal', `Validation failed with ${validationErrors.length} error(s). See logs for details.`);
        }
        const db = admin.firestore();
        await db
            .collection('user_astrology_data')
            .doc(userId)
            .set({
            ...profile,
            calculatedAt: admin.firestore.Timestamp.now(),
        });
        console.log(`✅ Astrology profile saved for user ${userId}`);
        return { success: true };
    }
    catch (error) {
        console.error('❌ Error generating user astrology profile:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', error instanceof Error ? error.message : 'Unknown error occurred');
    }
});
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
exports.sendDailyHoroscopeNotification = functions
    .region('us-central1')
    .pubsub.schedule('30 3 * * *')
    .timeZone('UTC')
    .onRun(async () => {
    console.log('='.repeat(60));
    console.log('🔔 Starting Daily Horoscope Notification Send...');
    console.log('='.repeat(60));
    try {
        const istDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const dateStr = istDate.toISOString().split('T')[0];
        const result = await (0, notification_service_1.sendRashifalNotificationForDate)(dateStr);
        console.log(result.success ? `✅ ${result.message}` : `❌ ${result.message}`);
        return result;
    }
    catch (error) {
        console.error('❌ Error sending daily horoscope notification:', error);
        // Don't throw — a failed send should never be retried into a crash loop.
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
});
//# sourceMappingURL=index.js.map