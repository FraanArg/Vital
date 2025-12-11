"use client";

import { useEffect, useState, useRef } from "react";

interface AnimatedCounterOptions {
    duration?: number; // Animation duration in ms
    delay?: number; // Delay before starting
    easing?: "linear" | "easeOut" | "easeInOut";
}

/**
 * Hook to animate a number from 0 to target value
 */
export function useAnimatedCounter(
    targetValue: number,
    options: AnimatedCounterOptions = {}
): number {
    const { duration = 1000, delay = 0, easing = "easeOut" } = options;
    const [displayValue, setDisplayValue] = useState(0);
    const previousValue = useRef(0);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        // Cancel any running animation
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        const startValue = previousValue.current;
        const startTime = performance.now() + delay;
        const endValue = targetValue;

        if (startValue === endValue) return;

        const easingFunctions = {
            linear: (t: number) => t,
            easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
            easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
        };

        const animate = (currentTime: number) => {
            if (currentTime < startTime) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }

            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easingFunctions[easing](progress);

            const current = startValue + (endValue - startValue) * easedProgress;
            setDisplayValue(current);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                previousValue.current = endValue;
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [targetValue, duration, delay, easing]);

    return displayValue;
}

/**
 * Format animated counter value
 */
export function formatAnimatedValue(
    value: number,
    options: { decimals?: number; suffix?: string; prefix?: string } = {}
): string {
    const { decimals = 0, suffix = "", prefix = "" } = options;
    const formatted = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
    return `${prefix}${formatted}${suffix}`;
}
