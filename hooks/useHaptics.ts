"use client";

/**
 * Haptic feedback patterns for different interactions
 */
type HapticPattern = "light" | "medium" | "heavy" | "success" | "warning" | "error" | "selection";

/**
 * Hook to trigger haptic feedback on mobile devices
 */
export function useHaptics() {
    const isSupported = typeof navigator !== "undefined" && "vibrate" in navigator;

    const patterns: Record<HapticPattern, number | number[]> = {
        light: 10,
        medium: 25,
        heavy: 50,
        success: [10, 50, 20],
        warning: [30, 30, 30],
        error: [100, 50, 100],
        selection: 5,
    };

    const trigger = (pattern: HapticPattern = "light") => {
        if (!isSupported) return false;

        try {
            navigator.vibrate(patterns[pattern]);
            return true;
        } catch (e) {
            console.warn("Haptic feedback failed:", e);
            return false;
        }
    };

    return {
        isSupported,
        trigger,
        light: () => trigger("light"),
        medium: () => trigger("medium"),
        heavy: () => trigger("heavy"),
        success: () => trigger("success"),
        warning: () => trigger("warning"),
        error: () => trigger("error"),
        selection: () => trigger("selection"),
    };
}
