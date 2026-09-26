/**
 * Notifications Service
 * Android push notifications over Firebase Cloud Messaging, using
 * expo-notifications purely as a native wrapper (permissions, the Android
 * notification channel, and foreground/background/killed-state handling).
 *
 * Delivery is FCM end-to-end: we read the raw device FCM registration token
 * via `getDevicePushTokenAsync()` and the Cloud Function sends to it with
 * `admin.messaging()` directly — Expo's hosted push relay is never used.
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import { navigateToRoute } from '@/navigation/navigationRef';
import { getOrCreateDeviceId } from '@/utils/deviceId';
import {
  auth,
  saveDeviceToken,
  updateNotificationPreference as updateNotificationPreferenceInFirestore,
} from '@/services/firestore';

export const NOTIFICATION_CHANNEL_ID = 'daily_insights';

/**
 * Every notification type this app can send. `screen` is looked up in
 * NOTIFICATION_ROUTES to decide where a tap should navigate.
 * Add a new entry here (and to NOTIFICATION_ROUTES) to support a new type —
 * no other client changes are needed.
 */
export type NotificationType =
  | 'daily_horoscope'
  | 'palm_reading'
  | 'tarot'
  | 'compatibility'
  | 'daily_guidance'
  | 'love_reading';

interface NotificationData {
  type?: NotificationType;
  screen?: string;
  [key: string]: unknown;
}

const NOTIFICATION_ROUTES: Record<string, keyof RootStackParamList> = {
  horoscope: 'TodaysRashifal',
  dashboard: 'Dashboard',
};

/** Lightweight analytics seam. Swap the body for a real SDK call (e.g.
 * @react-native-firebase/analytics) when one is added to the project —
 * none is installed today. */
function logNotificationEvent(name: string, params?: Record<string, unknown>): void {
  console.log(`📊 [analytics] ${name}`, params ?? {});
}

let listenersRegistered = false;

/**
 * Call once at app startup. Sets the foreground display policy, creates the
 * Android notification channel, and registers tap/receive listeners. Safe to
 * call regardless of permission state — none of this requires permission.
 */
export function initializeNotifications(): void {
  if (Platform.OS !== 'android') return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Noticeable but not alarm-like: DEFAULT importance (no heads-up bypass,
  // makes a sound) rather than HIGH/MAX.
  Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: 'Daily Insights',
    description: 'Daily horoscope, palm reading and personalized insights.',
    importance: Notifications.AndroidImportance.DEFAULT,
  }).catch((error) => console.error('❌ Error creating notification channel:', error));

  if (listenersRegistered) return;
  listenersRegistered = true;

  // Tapped while foreground/background.
  Notifications.addNotificationResponseReceivedListener((response) => {
    handleNotificationTap(response.notification.request.content.data as NotificationData);
  });

  // App launched by tapping a notification from a fully closed state.
  Notifications.getLastNotificationResponseAsync()
    .then((response) => {
      if (response) {
        handleNotificationTap(response.notification.request.content.data as NotificationData);
      }
    })
    .catch((error) => console.error('❌ Error reading last notification response:', error));

  // The OS can rotate the FCM token at any time during an active session
  // (not just on reinstall). Re-associate it with whichever user is
  // currently signed in so it never goes stale.
  Notifications.addPushTokenListener((token) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    console.log('🔄 FCM token refreshed');
    saveDeviceToken(userId, getOrCreateDeviceId(), token.data).catch((error) =>
      console.error('❌ Error saving refreshed device token:', error)
    );
  });
}

export type PermissionState = 'granted' | 'denied' | 'undetermined';

export async function getNotificationPermissionStatus(): Promise<PermissionState> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch (error) {
    console.error('❌ Error reading notification permission status:', error);
    return 'undetermined';
  }
}

/**
 * Prompts the Android 13+ POST_NOTIFICATIONS system dialog. Only call this
 * from an explicit user action (e.g. tapping "Enable Notifications") — never
 * automatically on app start. No-ops safely below Android 13, where the
 * permission is granted implicitly.
 */
export async function requestNotificationPermission(): Promise<PermissionState> {
  if (Platform.OS !== 'android') return 'denied';

  try {
    logNotificationEvent('notification_permission_requested');
    const { status } = await Notifications.requestPermissionsAsync();
    logNotificationEvent(
      status === 'granted' ? 'notification_permission_granted' : 'notification_permission_denied'
    );
    return status;
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return 'denied';
  }
}

/**
 * Reads this device's raw FCM registration token and saves it under
 * users/{userId}/devices/{deviceId}. Call after permission is confirmed
 * granted — either right after the user enables notifications, or silently
 * on app start for a user who already granted permission previously, so a
 * rotated token is never allowed to go stale.
 */
export async function registerDeviceToken(userId: string): Promise<string | null> {
  if (Platform.OS !== 'android' || !userId) return null;

  try {
    const status = await getNotificationPermissionStatus();
    if (status !== 'granted') return null;

    const devicePushToken = await Notifications.getDevicePushTokenAsync();
    const deviceId = getOrCreateDeviceId();

    await saveDeviceToken(userId, deviceId, devicePushToken.data);
    logNotificationEvent('fcm_token_registered', { userId });
    return devicePushToken.data;
  } catch (error) {
    console.error('❌ Error registering device token:', error);
    return null;
  }
}

/** Updates the user-level "Daily Rashifal" preference (separate from the OS permission). */
export async function setNotificationPreference(userId: string, enabled: boolean): Promise<void> {
  await updateNotificationPreferenceInFirestore(userId, enabled);
  logNotificationEvent(enabled ? 'notification_preference_enabled' : 'notification_preference_disabled', {
    userId,
  });

  // Re-registering when turning back on covers the case where the token
  // rotated while the preference was off.
  if (enabled) {
    await registerDeviceToken(userId);
  }
}

function handleNotificationTap(data: NotificationData | undefined): void {
  try {
    if (!data || !data.screen) {
      logNotificationEvent('notification_opened', { valid: false });
      return;
    }

    const route = NOTIFICATION_ROUTES[data.screen];
    logNotificationEvent('notification_opened', { type: data.type, screen: data.screen, valid: !!route });

    // Unknown/invalid destination: fall back to Dashboard rather than doing
    // nothing or crashing.
    navigateToRoute(route ?? 'Dashboard');
  } catch (error) {
    console.error('❌ Error handling notification tap:', error);
  }
}
