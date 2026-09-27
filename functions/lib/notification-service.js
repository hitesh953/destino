"use strict";
/**
 * Notification Service
 * Sends push notifications over Firebase Cloud Messaging directly (no
 * intermediary push provider) using the Admin SDK, which runs only in this
 * trusted server environment — never exposed to the client.
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
exports.NOTIFICATION_CHANNEL_ID = exports.NOTIFICATION_DEFINITIONS = void 0;
exports.getEligibleDeviceTokens = getEligibleDeviceTokens;
exports.sendPushNotifications = sendPushNotifications;
exports.sendRashifalNotificationForDate = sendRashifalNotificationForDate;
const admin = __importStar(require("firebase-admin"));
exports.NOTIFICATION_DEFINITIONS = {
    daily_horoscope: {
        type: 'daily_horoscope',
        screen: 'horoscope',
        templates: [
            {
                title: '✨ Your Rashifal is Ready',
                body: 'See what the stars have in store for you today.',
            },
            {
                title: '🌟 Your Daily Horoscope is Waiting',
                body: "Discover today's personalized guidance.",
            },
            {
                title: '🔮 Your Daily Insight is Ready',
                body: 'Take a moment to discover what today has in store.',
            },
            {
                title: '🌙 Today\'s Cosmic Guidance is Here',
                body: 'Open the app to explore your daily reading.',
            },
        ],
    },
};
exports.NOTIFICATION_CHANNEL_ID = 'daily_insights';
/**
 * Finds every active device token belonging to a user who has the "Daily
 * Rashifal" preference enabled. Paginated over `users` so this scales past
 * what fits in memory in one query.
 */
async function getEligibleDeviceTokens() {
    const db = admin.firestore();
    const records = [];
    const pageSize = 300;
    let lastDoc;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        let query = db
            .collection('users')
            .where('notificationsEnabled', '==', true)
            .orderBy('__name__')
            .limit(pageSize);
        if (lastDoc) {
            query = query.startAfter(lastDoc);
        }
        const snapshot = await query.get();
        if (snapshot.empty)
            break;
        await Promise.all(snapshot.docs.map(async (userDoc) => {
            const devicesSnapshot = await userDoc.ref
                .collection('devices')
                .where('active', '==', true)
                .get();
            devicesSnapshot.forEach((deviceDoc) => {
                const token = deviceDoc.data().fcmToken;
                if (token) {
                    records.push({
                        userId: userDoc.id,
                        deviceId: deviceDoc.id,
                        token,
                        ref: deviceDoc.ref,
                    });
                }
            });
        }));
        lastDoc = snapshot.docs[snapshot.docs.length - 1];
        if (snapshot.docs.length < pageSize)
            break;
    }
    return records;
}
/**
 * Soft-deactivates device docs whose token FCM reported as invalid/expired,
 * so a single bad token can never block sends to the rest of the batch.
 */
async function deactivateInvalidTokens(refs) {
    const db = admin.firestore();
    const batchSize = 400;
    for (let i = 0; i < refs.length; i += batchSize) {
        const batch = db.batch();
        refs.slice(i, i + batchSize).forEach((ref) => {
            batch.update(ref, {
                active: false,
                deactivatedAt: admin.firestore.Timestamp.now(),
                deactivationReason: 'invalid_token',
            });
        });
        await batch.commit();
    }
    console.log(`🧹 Deactivated ${refs.length} invalid device token(s)`);
}
const INVALID_TOKEN_ERROR_CODES = new Set([
    'messaging/registration-token-not-registered',
    'messaging/invalid-registration-token',
    'messaging/invalid-argument',
]);
/**
 * Sends one notification definition to a batch of device tokens, chunked to
 * FCM's 500-token multicast limit, and cleans up any tokens FCM rejects as
 * invalid without affecting the rest of the sends.
 */
async function sendPushNotifications(records, definition) {
    if (records.length === 0) {
        return { successCount: 0, failureCount: 0 };
    }
    const template = definition.templates[Math.floor(Math.random() * definition.templates.length)];
    const messaging = admin.messaging();
    const chunkSize = 500;
    let successCount = 0;
    let failureCount = 0;
    const invalidRefs = [];
    for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize);
        const response = await messaging.sendEachForMulticast({
            tokens: chunk.map((record) => record.token),
            notification: {
                title: template.title,
                body: template.body,
            },
            data: {
                type: definition.type,
                screen: definition.screen,
            },
            android: {
                priority: 'high',
                notification: {
                    channelId: exports.NOTIFICATION_CHANNEL_ID,
                },
            },
        });
        successCount += response.successCount;
        failureCount += response.failureCount;
        response.responses.forEach((result, index) => {
            if (result.success)
                return;
            const record = chunk[index];
            const code = result.error?.code;
            if (code && INVALID_TOKEN_ERROR_CODES.has(code)) {
                invalidRefs.push(record.ref);
            }
            else {
                console.error(`⚠️  Failed to send to user ${record.userId} / device ${record.deviceId}:`, result.error);
            }
        });
    }
    if (invalidRefs.length > 0) {
        await deactivateInvalidTokens(invalidRefs);
    }
    return { successCount, failureCount };
}
/**
 * Sends the "Daily Rashifal is ready" notification for a given date.
 * Idempotent: skips if the Rashifal isn't generated yet, or if a
 * notification for that date was already sent.
 */
async function sendRashifalNotificationForDate(dateStr) {
    const db = admin.firestore();
    const rashifalRef = db.collection('daily_rashifal').doc(dateStr);
    const rashifalSnap = await rashifalRef.get();
    if (!rashifalSnap.exists) {
        console.warn(`⚠️  No Rashifal found for ${dateStr}; skipping notification.`);
        return { success: false, message: `No Rashifal found for ${dateStr}` };
    }
    if (rashifalSnap.data()?.notificationSent) {
        console.log(`⏭️  Notification for ${dateStr} already sent. Skipping.`);
        return { success: true, message: `Notification for ${dateStr} already sent` };
    }
    const definition = exports.NOTIFICATION_DEFINITIONS.daily_horoscope;
    const records = await getEligibleDeviceTokens();
    const markSent = () => rashifalRef.update({
        notificationSent: true,
        notificationSentAt: admin.firestore.Timestamp.now(),
    });
    if (records.length === 0) {
        await markSent();
        console.log('ℹ️  No eligible devices to notify.');
        return { success: true, message: 'No eligible devices to notify', sent: 0, failed: 0 };
    }
    const { successCount, failureCount } = await sendPushNotifications(records, definition);
    await markSent();
    console.log(`✅ Daily horoscope notification sent: ${successCount} succeeded, ${failureCount} failed`);
    return {
        success: true,
        message: `Sent to ${successCount} device(s), ${failureCount} failed`,
        sent: successCount,
        failed: failureCount,
    };
}
//# sourceMappingURL=notification-service.js.map