"use client";

import { motion } from "framer-motion";

interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
    showDots?: boolean;
    showArea?: boolean;
    className?: string;
}

/**
 * Tiny inline sparkline chart for showing trends
 */
export default function Sparkline({
    data,
    width = 60,
    height = 20,
    color = "currentColor",
    showDots = false,
    showArea = true,
    className = "",
}: SparklineProps) {
    if (!data || data.length < 2) {
        return <div className={`inline-block ${className}`} style={{ width, height }} />;
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const padding = 2;
    const drawWidth = width - padding * 2;
    const drawHeight = height - padding * 2;

    // Normalize points to SVG coordinates
    const points = data.map((value, index) => {
        const x = padding + (index / (data.length - 1)) * drawWidth;
        const y = padding + drawHeight - ((value - min) / range) * drawHeight;
        return { x, y, value };
    });

    // Create path for the line
    const linePath = points
        .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
        .join(" ");

    // Create path for the area (closed shape)
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

    // Determine trend color based on first vs last value
    const trendUp = data[data.length - 1] > data[0];
    const trendColor = color === "currentColor"
        ? (trendUp ? "#22c55e" : "#ef4444")
        : color;

    return (
        <svg
            width={width}
            height={height}
            className={`inline-block align-middle ${className}`}
            viewBox={`0 0 ${width} ${height}`}
        >
            {/* Area fill */}
            {showArea && (
                <motion.path
                    d={areaPath}
                    fill={trendColor}
                    fillOpacity={0.1}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                />
            )}

            {/* Line */}
            <motion.path
                d={linePath}
                fill="none"
                stroke={trendColor}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            />

            {/* End dot */}
            {showDots && (
                <motion.circle
                    cx={points[points.length - 1].x}
                    cy={points[points.length - 1].y}
                    r={2}
                    fill={trendColor}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.2 }}
                />
            )}
        </svg>
    );
}

/**
 * Sparkline with trend indicator
 */
export function SparklineWithTrend({
    data,
    label,
    className = "",
}: {
    data: number[];
    label?: string;
    className?: string;
}) {
    if (!data || data.length < 2) return null;

    const trend = data[data.length - 1] - data[0];
    const trendPercent = data[0] !== 0 ? Math.round((trend / data[0]) * 100) : 0;

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Sparkline data={data} showDots />
            <span className={`text-xs font-medium ${trend >= 0 ? "text-green-500" : "text-red-500"}`}>
                {trend >= 0 ? "+" : ""}{trendPercent}%
            </span>
            {label && <span className="text-xs text-muted-foreground">{label}</span>}
        </div>
    );
}
