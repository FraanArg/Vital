"use client";

import { motion } from "framer-motion";

interface AnimatedProgressRingProps {
    progress: number; // 0-100
    size?: number;
    strokeWidth?: number;
    color?: string;
    trackColor?: string;
    showValue?: boolean;
    label?: string;
    icon?: React.ReactNode;
    className?: string;
}

/**
 * Animated circular progress ring
 */
export default function AnimatedProgressRing({
    progress,
    size = 60,
    strokeWidth = 4,
    color = "#22c55e",
    trackColor = "rgba(0,0,0,0.1)",
    showValue = true,
    label,
    icon,
    className = "",
}: AnimatedProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const clampedProgress = Math.min(100, Math.max(0, progress));
    const offset = circumference - (clampedProgress / 100) * circumference;

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="-rotate-90"
            >
                {/* Background track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                    className="dark:opacity-20"
                />

                {/* Progress arc */}
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
                    transition={{
                        duration: 1,
                        ease: "easeOut",
                        delay: 0.2
                    }}
                />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {icon && <div className="mb-0.5">{icon}</div>}
                {showValue && !icon && (
                    <motion.span
                        className="text-sm font-bold tabular-nums"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {Math.round(clampedProgress)}%
                    </motion.span>
                )}
                {label && (
                    <span className="text-[8px] text-muted-foreground uppercase tracking-wider">
                        {label}
                    </span>
                )}
            </div>
        </div>
    );
}

/**
 * Multiple progress rings in a row
 */
export function ProgressRingGroup({
    items,
    size = 48,
    className = "",
}: {
    items: {
        progress: number;
        color: string;
        label: string;
        icon?: React.ReactNode;
    }[];
    size?: number;
    className?: string;
}) {
    return (
        <div className={`flex items-center gap-4 ${className}`}>
            {items.map((item, index) => (
                <div key={index} className="text-center">
                    <AnimatedProgressRing
                        progress={item.progress}
                        size={size}
                        color={item.color}
                        icon={item.icon}
                        showValue={!item.icon}
                    />
                    <span className="text-xs text-muted-foreground mt-1 block">
                        {item.label}
                    </span>
                </div>
            ))}
        </div>
    );
}
