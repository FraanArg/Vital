"use client";

import { useCallback } from "react";

type HapticType = "success" | "warning" | "error" | "light" | "medium" | "heavy";

export function useHaptic() {
    const trigger = useCallback((type: HapticType) => {
        if (typeof navigator === "undefined" || !navigator.vibrate) return;

        switch (type) {
            case "success":
                navigator.vibrate([10, 30, 10]);
                break;
            case "warning":
                navigator.vibrate([30, 50, 10]);
                break;
            case "error":
                navigator.vibrate([50, 100, 50, 100, 50]);
                break;
            case "light":
                navigator.vibrate(5);
                break;
            case "medium":
                navigator.vibrate(15);
                break;
            case "heavy":
                navigator.vibrate(30);
                break;
            default:
                break;
        }
    }, []);

    return { trigger };
}
