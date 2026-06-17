import { create } from "zustand";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme } from "nativewind";
import { setActivePalette } from "@/theme/colors";

export type ThemeMode = "system" | "light" | "dark";

const STORAGE_KEY = "mathetes.theme-mode";

function resolve(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    return Appearance.getColorScheme() === "dark" ? "dark" : "light";
  }
  return mode;
}

// Apply to both layers: NativeWind (className colors via CSS vars) and the
// JS palette (icon/prop colors via the reactive `colors` proxy).
function apply(mode: ThemeMode): void {
  colorScheme.set(mode);
  setActivePalette(resolve(mode));
}

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  init: () => Promise<void>;
};

export const useTheme = create<ThemeState>((set, get) => ({
  mode: "system",
  setMode: (mode) => {
    apply(mode);
    set({ mode });
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {});
  },
  init: async () => {
    const saved = (await AsyncStorage.getItem(STORAGE_KEY).catch(
      () => null
    )) as ThemeMode | null;
    const mode = saved ?? "system";
    apply(mode);
    set({ mode });
    // Keep the JS palette in sync when the OS theme changes under "system".
    Appearance.addChangeListener(() => {
      if (get().mode === "system") setActivePalette(resolve("system"));
    });
  },
}));
