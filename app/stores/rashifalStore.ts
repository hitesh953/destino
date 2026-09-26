/**
 * Daily Rashifal Store
 *
 * Single entry point (`initializeDailyRashifal`) that, after login:
 *   1. Reads the user's Rashi from their Firestore profile (source of truth)
 *   2. Checks the MMKV cache for today's Rashifal for that Rashi/user
 *   3. Falls back to fetching `daily_rashifal/{today}` only when needed
 *   4. Caches the result in MMKV so it's fetched at most once per day/user
 *
 * MMKV holds the persisted cache; this store just mirrors it for the UI.
 */

import { create } from 'zustand';
import { doc, getDoc } from 'firebase/firestore';
import { db, getUserData } from '@/services/firestore';
import { load, save, remove } from '@/utils/storage';

export interface BilingualText {
  en: string;
  hi: string;
}

export interface DailyRashifalSummary {
  shortDescription: BilingualText;
  love: number;
  career: number;
  wealth: number;
  health: number;
  life: number;
}

interface CachedDailyRashifal {
  schemaVersion: number;
  userId: string;
  rashifalDate: string; // "YYYY-MM-DD"
  rashi: string; // lowercase key, e.g. "gemini"
  rashiName: string; // display name, e.g. "Gemini"
  rashifal: DailyRashifalSummary;
}

interface RashifalState {
  userName: string | null;
  rashi: string | null;
  rashiName: string | null;
  rashifalDate: string | null;
  rashifal: DailyRashifalSummary | null;
  isLoading: boolean;
  error: string | null;
  /** true when the displayed data is a fallback from cache after a failed refresh */
  isStale: boolean;

  initializeDailyRashifal: (userId: string) => Promise<void>;
  clearRashifal: () => void;
}

const CACHE_KEY = 'daily_rashifal_cache';
// Bump this whenever DailyRashifalSummary's shape changes so old cached
// entries (which would otherwise pass the date/rashi/user checks and get
// reused as-is) are treated as a cache miss instead of served broken.
const CACHE_SCHEMA_VERSION = 2;

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function deriveShortDescription(text: string | undefined, maxWords = 28): string {
  const trimmed = (text ?? '').trim();
  if (!trimmed) return '';
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return trimmed;
  return words.slice(0, maxWords).join(' ') + '…';
}

function deriveBilingualShortDescription(
  description: Partial<BilingualText> | undefined,
  maxWords = 28
): BilingualText {
  return {
    en: deriveShortDescription(description?.en, maxWords),
    hi: deriveShortDescription(description?.hi, maxWords),
  };
}

// Prevents duplicate concurrent fetches for the same user (e.g. re-renders,
// effect double-invocation) without blocking future/retry calls.
let inFlightUserId: string | null = null;

export const useRashifalStore = create<RashifalState>((set) => ({
  userName: null,
  rashi: null,
  rashiName: null,
  rashifalDate: null,
  rashifal: null,
  isLoading: false,
  error: null,
  isStale: false,

  initializeDailyRashifal: async (userId: string) => {
    if (!userId || inFlightUserId === userId) {
      return;
    }
    inFlightUserId = userId;
    set({ isLoading: true, error: null });

    const rawCached = load<CachedDailyRashifal>(CACHE_KEY);
    const cached = rawCached && rawCached.schemaVersion === CACHE_SCHEMA_VERSION ? rawCached : null;
    const today = getTodayDateString();

    try {
      // Source of truth: the user's own profile. Never recalculate/guess it.
      const userData = await getUserData(userId);
      const zodiacSign = userData?.zodiacSign as string | undefined;
      const userName = (userData?.name as string | undefined) ?? null;

      if (!zodiacSign) {
        set({
          userName,
          isLoading: false,
          error: 'Add your birth details to unlock your daily Rashifal.',
        });
        return;
      }

      const rashi = zodiacSign.toLowerCase();

      // Cache hit: same user, same calendar day, same Rashi.
      if (
        cached &&
        cached.userId === userId &&
        cached.rashifalDate === today &&
        cached.rashi === rashi
      ) {
        set({
          userName,
          rashi: cached.rashi,
          rashiName: cached.rashiName,
          rashifalDate: cached.rashifalDate,
          rashifal: cached.rashifal,
          isLoading: false,
          error: null,
          isStale: false,
        });
        return;
      }

      // Cache miss (new day, different Rashi, or different user) — fetch
      // just today's document and read only this user's Rashi out of it.
      const docRef = doc(db, 'daily_rashifal', today);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        throw new Error("Today's Rashifal is not ready yet");
      }

      const data = snap.data();
      const zodiacData = data?.zodiacSigns?.[rashi];

      if (!zodiacData) {
        throw new Error("Couldn't find today's Rashifal for your sign");
      }

      const summary: DailyRashifalSummary = {
        shortDescription: deriveBilingualShortDescription(zodiacData.cosmicEnergy?.description),
        love: zodiacData.love?.score ?? 0,
        career: zodiacData.career?.score ?? 0,
        wealth: zodiacData.wealth?.score ?? 0,
        health: zodiacData.health?.score ?? 0,
        life: zodiacData.life?.score ?? 0,
      };
      const rashiName = zodiacData.name ?? zodiacSign;

      const toCache: CachedDailyRashifal = {
        schemaVersion: CACHE_SCHEMA_VERSION,
        userId,
        rashifalDate: today,
        rashi,
        rashiName,
        rashifal: summary,
      };
      save(CACHE_KEY, toCache);

      set({
        userName,
        rashi,
        rashiName,
        rashifalDate: today,
        rashifal: summary,
        isLoading: false,
        error: null,
        isStale: false,
      });
    } catch (error) {
      console.error('❌ Error initializing daily rashifal:', error);

      // Prefer showing stale cached data over an empty card.
      if (cached && cached.userId === userId) {
        set({
          rashi: cached.rashi,
          rashiName: cached.rashiName,
          rashifalDate: cached.rashifalDate,
          rashifal: cached.rashifal,
          isLoading: false,
          error: "Couldn't refresh — showing your last saved Rashifal.",
          isStale: true,
        });
      } else {
        set({
          isLoading: false,
          error: "Couldn't load your Rashifal. Pull down to retry.",
        });
      }
    } finally {
      inFlightUserId = null;
    }
  },

  clearRashifal: () => {
    remove(CACHE_KEY);
    set({
      userName: null,
      rashi: null,
      rashiName: null,
      rashifalDate: null,
      rashifal: null,
      isLoading: false,
      error: null,
      isStale: false,
    });
  },
}));
