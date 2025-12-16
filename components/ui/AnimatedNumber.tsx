"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";

interface AnimatedNumberProps {
    value: number;
    duration?: number;
    className?: string;
    formatValue?: (value: number) => string;
}

/**
 * Animated number that counts up/down with spring physics
 */
export function AnimatedNumber({
    value,
    duration = 0.8,
    className = "",
    formatValue = (v) => Math.round(v).toString(),
}: AnimatedNumberProps) {
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        stiffness: 100,
        damping: 30,
        duration: duration * 1000,
    });
    const displayValue = useTransform(springValue, (v) => formatValue(v));
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        motionValue.set(value);
    }, [value, motionValue]);

    useEffect(() => {
        const unsubscribe = displayValue.on("change", (v) => {
            if (ref.current) {
                ref.current.textContent = v;
            }
        });
        return unsubscribe;
    }, [displayValue]);

    return (
        <motion.span
            ref={ref}
            className={className}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {formatValue(value)}
        </motion.span>
    );
}
