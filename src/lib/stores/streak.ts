import { useEffect } from "react";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { useAuth } from "@/lib/stores/auth";

// A daily-visit streak kept on the device. The backend has no streak table
// yet, so this is the source of truth: open the app on consecutive calendar
// days and the count climbs; miss a day and it resets to one. Idempotent per
// day, so it is safe to record a visit from more than one screen.
type StreakData = { lastDate: string; count: number; best: number };

type StreakState = {
  count: number;
  best: number;
  ready: boolean;
  hydratedFor: string | null;
  recordVisit: (userId: string) => Promise<void>;
  reset: () => void;
};

const storageKey = (userId: string) => `mathetes.streak.${userId}`;

export const useStreakStore = create<StreakState>((set, get) => ({
  count: 0,
  best: 0,
  ready: false,
  hydratedFor: null,

  recordVisit: async (userId) => {
    // One hydrate/record per user per session; the count cannot change again
    // until tomorrow anyway.
    if (get().hydratedFor === userId && get().ready) return;

    const today = format(new Date(), "yyyy-MM-dd");
    let prev: StreakData | null = null;
    try {
      const raw = await AsyncStorage.getItem(storageKey(userId));
      if (raw) prev = JSON.parse(raw) as StreakData;
    } catch {
      prev = null;
    }

    let count = 1;
    if (prev) {
      const gap = differenceInCalendarDays(
        parseISO(today),
        parseISO(prev.lastDate)
      );
      if (gap === 0) count = prev.count;
      else if (gap === 1) count = prev.count + 1;
      else count = 1;
    }
    const best = Math.max(prev?.best ?? 0, count);
    const next: StreakData = { lastDate: today, count, best };

    try {
      await AsyncStorage.setItem(storageKey(userId), JSON.stringify(next));
    } catch {
      // Non-fatal: the streak simply will not persist this session.
    }
    set({ count, best, ready: true, hydratedFor: userId });
  },

  reset: () => set({ count: 0, best: 0, ready: false, hydratedFor: null }),
}));

// Records today's visit for the signed-in user and returns the live streak.
// Safe to call from multiple screens.
export function useStreak() {
  const userId = useAuth((s) => s.session?.user.id ?? null);
  const count = useStreakStore((s) => s.count);
  const best = useStreakStore((s) => s.best);
  const ready = useStreakStore((s) => s.ready);
  const recordVisit = useStreakStore((s) => s.recordVisit);

  useEffect(() => {
    if (userId) recordVisit(userId);
  }, [userId, recordVisit]);

  return { count, best, ready };
}
