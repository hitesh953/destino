/**
 * Notification Store
 * Mirrors the user's "Daily Rashifal" notification preference and the
 * current Android permission state for the bell icon / settings toggle on
 * the Dashboard.
 */

import { create } from 'zustand';
import { getUserData } from '@/services/firestore';
import {
  getNotificationPermissionStatus,
  setNotificationPreference,
  type PermissionState,
} from '@/services/notifications';

interface NotificationState {
  permissionStatus: PermissionState;
  notificationsEnabled: boolean;
  isLoading: boolean;

  initialize: (userId: string) => Promise<void>;
  toggleDailyRashifal: (userId: string, enabled: boolean) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  permissionStatus: 'undetermined',
  notificationsEnabled: true,
  isLoading: false,

  initialize: async (userId: string) => {
    if (!userId) return;
    set({ isLoading: true });
    try {
      const [permissionStatus, userData] = await Promise.all([
        getNotificationPermissionStatus(),
        getUserData(userId),
      ]);
      set({
        permissionStatus,
        notificationsEnabled: (userData?.notificationsEnabled as boolean | undefined) ?? true,
        isLoading: false,
      });
    } catch (error) {
      console.error('❌ Error initializing notification store:', error);
      set({ isLoading: false });
    }
  },

  toggleDailyRashifal: async (userId: string, enabled: boolean) => {
    // Optimistic update — the toggle is a settings switch, it should feel instant.
    set({ notificationsEnabled: enabled });
    try {
      await setNotificationPreference(userId, enabled);
    } catch (error) {
      console.error('❌ Error toggling notification preference:', error);
      set({ notificationsEnabled: !enabled });
    }
  },
}));
