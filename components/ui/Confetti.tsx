"use client";

import confetti from "canvas-confetti";

// Trigger celebration confetti
export function triggerConfetti(type: "streak" | "pr" | "milestone" = "streak") {
    const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
    };

    switch (type) {
        case "streak":
            // Gold/orange for streaks
            confetti({
                ...defaults,
                particleCount: 100,
                spread: 70,
                colors: ["#FFD700", "#FFA500", "#FF8C00"],
            });
            break;

        case "pr":
            // Trophy colors (gold, silver, bronze)
            confetti({
                ...defaults,
                particleCount: 80,
                spread: 60,
                colors: ["#FFD700", "#C0C0C0", "#CD7F32"],
            });
            // Extra burst for PR
            setTimeout(() => {
                confetti({
                    ...defaults,
                    particleCount: 50,
                    spread: 100,
                    origin: { y: 0.6 },
                    colors: ["#FFD700"],
                });
            }, 150);
            break;

        case "milestone":
            // Rainbow celebration for big milestones
            const end = Date.now() + 500;
            const colors = ["#ff0000", "#ff7700", "#ffff00", "#00ff00", "#0000ff", "#8b00ff"];

            (function frame() {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors,
                    zIndex: 9999,
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors,
                    zIndex: 9999,
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            })();
            break;
    }
}

// Component for easy triggering via effects
export default function Confetti({
    trigger,
    type = "streak"
}: {
    trigger: boolean;
    type?: "streak" | "pr" | "milestone"
}) {
    if (trigger) {
        // Trigger on mount when trigger is true
        setTimeout(() => triggerConfetti(type), 100);
    }
    return null;
}
