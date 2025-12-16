"use client";

import { motion } from "framer-motion";

interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
    className?: string;
}

/**
 * Apple Stocks-style mini sparkline chart
 * Shows 7-day trend visualization
 */
export function Sparkline({
    data,
    width = 60,
    height = 24,
    color = "currentColor",
    className
}: SparklineProps) {
    if (!data || data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    // Normalize data to fit within height
    const normalizedData = data.map(value =>
        ((value - min) / range) * (height - 4) + 2
    );

    // Create SVG path
    const points = normalizedData.map((y, i) => ({
        x: (i / (data.length - 1)) * width,
        y: height - y,
    }));

    // Create smooth path using quadratic curves
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const midX = (prev.x + curr.x) / 2;
        path += ` Q ${prev.x} ${prev.y} ${midX} ${(prev.y + curr.y) / 2}`;
    }
    const lastPoint = points[points.length - 1];
    path += ` T ${lastPoint.x} ${lastPoint.y}`;

    // Determine trend direction
    const isUp = data[data.length - 1] > data[0];
    const isFlat = Math.abs(data[data.length - 1] - data[0]) < range * 0.1;

    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox={`0 0 ${width} ${height}`}
        >
            <motion.path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            />
            {/* End dot */}
            <motion.circle
                cx={lastPoint.x}
                cy={lastPoint.y}
                r={3}
                fill={color}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 }}
            />
        </svg>
    );
}
