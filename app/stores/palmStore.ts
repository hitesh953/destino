/**
 * Palm Reader App - State Management with Zustand
 * Handles user data, readings, and app preferences
 */

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Reading Data Type
 */
export interface PalmReading {
  id: string;
  userId?: string;
  timestamp: number;
  palmImageUri: string;
  analysis: {
    loveLife: string;
    career: string;
    health: string;
    finance: string;
  };
  predictions?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  metadata?: {
    processingTimeMs: number;
    modelVersion: string;
    imageQuality: "low" | "medium" | "high";
  };
  isFavorite: boolean;
}

/**
 * User State Type
 */
export interface UserState {
  userId: string | null;
  name: string | null;
  totalReadings: number;
  firstReadingDate: number | null;
}

/**
 * App Preferences Type
 */
export interface AppPreferences {
  theme: "light" | "dark" | "auto";
  animationSpeed: "normal" | "slow" | "reduced";
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  language: string;
}

/**
 * Palm Store State & Actions
 */
interface PalmState {
  // User data
  user: UserState;
  setUser: (user: UserState) => void;

  // Readings
  readings: PalmReading[];
  addReading: (reading: PalmReading) => void;
  updateReading: (id: string, reading: Partial<PalmReading>) => void;
  deleteReading: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getReading: (id: string) => PalmReading | undefined;

  // App preferences
  preferences: AppPreferences;
  setPreferences: (preferences: Partial<AppPreferences>) => void;
  setTheme: (theme: "light" | "dark" | "auto") => void;

  // UI State
  isLoadingReading: boolean;
  setIsLoadingReading: (loading: boolean) => void;
  currentReadingId: string | null;
  setCurrentReadingId: (id: string | null) => void;

  // Persistence
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

/**
 * Create Zustand store
 */
export const usePalmStore = create<PalmState>((set, get) => ({
  // Initial user state
  user: {
    userId: null,
    name: null,
    totalReadings: 0,
    firstReadingDate: null,
  },

  // Initial readings
  readings: [],

  // Initial preferences
  preferences: {
    theme: "auto",
    animationSpeed: "normal",
    notificationsEnabled: true,
    soundEnabled: true,
    language: "en",
  },

  // Initial UI state
  isLoadingReading: false,
  currentReadingId: null,

  // User actions
  setUser: (user) => set({ user }),

  // Readings actions
  addReading: (reading) =>
    set((state) => ({
      readings: [reading, ...state.readings],
      user: {
        ...state.user,
        totalReadings: state.user.totalReadings + 1,
        firstReadingDate:
          state.user.firstReadingDate || reading.timestamp,
      },
    })),

  updateReading: (id, updatedReading) =>
    set((state) => ({
      readings: state.readings.map((r) =>
        r.id === id ? { ...r, ...updatedReading } : r
      ),
    })),

  deleteReading: (id) =>
    set((state) => ({
      readings: state.readings.filter((r) => r.id !== id),
      user: {
        ...state.user,
        totalReadings: Math.max(0, state.user.totalReadings - 1),
      },
    })),

  toggleFavorite: (id) =>
    set((state) => ({
      readings: state.readings.map((r) =>
        r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
      ),
    })),

  getReading: (id) => {
    const reading = get().readings.find((r) => r.id === id);
    return reading;
  },

  // Preferences actions
  setPreferences: (prefs) =>
    set((state) => ({
      preferences: { ...state.preferences, ...prefs },
    })),

  setTheme: (theme) =>
    set((state) => ({
      preferences: { ...state.preferences, theme },
    })),

  // UI State actions
  setIsLoadingReading: (loading) => set({ isLoadingReading: loading }),
  setCurrentReadingId: (id) => set({ currentReadingId: id }),

  // Persistence
  loadFromStorage: async () => {
    try {
      const [userJson, readingsJson, prefsJson] = await Promise.all([
        AsyncStorage.getItem("palm_user"),
        AsyncStorage.getItem("palm_readings"),
        AsyncStorage.getItem("palm_preferences"),
      ]);

      if (userJson) set({ user: JSON.parse(userJson) });
      if (readingsJson) set({ readings: JSON.parse(readingsJson) });
      if (prefsJson) set({ preferences: JSON.parse(prefsJson) });
    } catch (error) {
      console.error("Failed to load from storage:", error);
    }
  },

  saveToStorage: async () => {
    try {
      const { user, readings, preferences } = get();
      await Promise.all([
        AsyncStorage.setItem("palm_user", JSON.stringify(user)),
        AsyncStorage.setItem("palm_readings", JSON.stringify(readings)),
        AsyncStorage.setItem("palm_preferences", JSON.stringify(preferences)),
      ]);
    } catch (error) {
      console.error("Failed to save to storage:", error);
    }
  },
}));
