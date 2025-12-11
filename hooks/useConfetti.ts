"use client";

import { useState, useCallback } from "react";
import confetti from "canvas-confetti";

type ConfettiPreset = "celebration" | "streak" | "achievement" | "fireworks";

/**
 * Hook to trigger confetti celebrations
 */
export function useConfetti() {
    const [isActive, setIsActive] = useState(false);

    const presets: Record<ConfettiPreset, () => void> = {
        celebration: () => {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
            });
        },
        streak: () => {
            // Fire from left and right
            confetti({
                particleCount: 50,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.7 },
                colors: ["#ff6b35", "#f7c59f", "#ffb347"],
            });
            confetti({
                particleCount: 50,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.7 },
                colors: ["#ff6b35", "#f7c59f", "#ffb347"],
            });
        },
        achievement: () => {
            // Stars shape
            confetti({
                particleCount: 80,
                spread: 100,
                origin: { y: 0.5 },
                shapes: ["star"],
                colors: ["#ffd700", "#ffb347", "#ff6b35"],
            });
        },
        fireworks: () => {
            const duration = 3 * 1000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.8 },
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.8 },
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        },
    };

    const trigger = useCallback((preset: ConfettiPreset = "celebration") => {
        if (isActive) return;
        setIsActive(true);
        presets[preset]();
        setTimeout(() => setIsActive(false), 3000);
    }, [isActive]);

    return {
        isActive,
        trigger,
        celebration: () => trigger("celebration"),
        streak: () => trigger("streak"),
        achievement: () => trigger("achievement"),
        fireworks: () => trigger("fireworks"),
    };
}
