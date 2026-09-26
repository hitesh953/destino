/**
 * Notification Service
 * Sends push notifications over Firebase Cloud Messaging directly (no
 * intermediary push provider) using the Admin SDK, which runs only in this
 * trusted server environment — never exposed to the client.
 */
/**
 * Every notification type this app can send. Add an entry here (with its
 * `screen` destination and message variants) to support a new type — no
 * other server changes are needed. `screen` must match a key the client's
 * NOTIFICATION_ROUTES table (app/services/notifications.ts) understands.
 */
export type NotificationType = 'daily_horoscope' | 'palm_reading' | 'tarot' | 'compatibility' | 'daily_guidance' | 'love_reading';
interface NotificationTemplate {
    title: string;
    body: string;
}
interface NotificationDefinition {
    type: NotificationType;
    screen: string;
    templates: NotificationTemplate[];
}
export declare const NOTIFICATION_DEFINITIONS: Partial<Record<NotificationType, NotificationDefinition>>;
export declare const NOTIFICATION_CHANNEL_ID = "daily_insights";
interface DeviceTokenRecord {
    userId: string;
    deviceId: string;
    token: string;
    ref: FirebaseFirestore.DocumentReference;
}
/**
 * Finds every active device token belonging to a user who has the "Daily
 * Rashifal" preference enabled. Paginated over `users` so this scales past
 * what fits in memory in one query.
 */
export declare function getEligibleDeviceTokens(): Promise<DeviceTokenRecord[]>;
/**
 * Sends one notification definition to a batch of device tokens, chunked to
 * FCM's 500-token multicast limit, and cleans up any tokens FCM rejects as
 * invalid without affecting the rest of the sends.
 */
export declare function sendPushNotifications(records: DeviceTokenRecord[], definition: NotificationDefinition): Promise<{
    successCount: number;
    failureCount: number;
}>;
/**
 * Sends the "Daily Rashifal is ready" notification for a given date.
 * Idempotent: skips if the Rashifal isn't generated yet, or if a
 * notification for that date was already sent.
 */
export declare function sendRashifalNotificationForDate(dateStr: string): Promise<{
    success: boolean;
    message: string;
    sent?: number;
    failed?: number;
}>;
export {};
