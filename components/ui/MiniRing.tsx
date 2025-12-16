"use client";

import { motion } from "framer-motion";

interface MiniRingProps {
    progress: number; // 0-100
    size?: number;
    strokeWidth?: number;
    color: string;
    bgColor?: string;
    showCheck?: boolean;
    delay?: number;
}

/**
 * Lightweight mini activity ring for KPI cards
 * Uses pure SVG instead of recharts for performance
 */
export function MiniRing({
    progress,
    size = 44,
    strokeWidth = 4,
    color,
    bgColor = "rgba(128,128,128,0.15)",
    showCheck = false,
    delay = 0,
}: MiniRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const clampedProgress = Math.min(Math.max(progress, 0), 100);
    const offset = circumference - (clampedProgress / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                {/* Background ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={bgColor}
                    strokeWidth={strokeWidth}
                />
                {/* Progress ring */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.8, delay, ease: "easeOut" }}
                />
            </svg>
            {/* Center content */}
            {showCheck && clampedProgress >= 100 && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: delay + 0.5, type: "spring", stiffness: 500, damping: 25 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </motion.div>
            )}
        </div>
    );
}
