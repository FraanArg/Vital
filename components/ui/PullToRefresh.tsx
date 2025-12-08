"use client";

import { useState, useRef, useCallback, ReactNode } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
    children: ReactNode;
    onRefresh: () => Promise<void>;
    className?: string;
}

export default function PullToRefresh({ children, onRefresh, className = "" }: PullToRefreshProps) {
    const [isPulling, setIsPulling] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const startY = useRef(0);
    const THRESHOLD = 80;

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (containerRef.current?.scrollTop === 0) {
            startY.current = e.touches[0].clientY;
            setIsPulling(true);
        }
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isPulling || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;

        if (diff > 0 && containerRef.current?.scrollTop === 0) {
            e.preventDefault();
            // Dampen the pull distance
            setPullDistance(Math.min(diff * 0.5, THRESHOLD * 1.5));
        }
    }, [isPulling, isRefreshing]);

    const handleTouchEnd = useCallback(async () => {
        if (pullDistance >= THRESHOLD && !isRefreshing) {
            setIsRefreshing(true);
            setPullDistance(THRESHOLD);
            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
            }
        }
        setIsPulling(false);
        setPullDistance(0);
    }, [pullDistance, isRefreshing, onRefresh]);

    const progress = Math.min(pullDistance / THRESHOLD, 1);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-auto ${className}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull indicator */}
            <motion.div
                className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-50"
                style={{ top: pullDistance - 40 }}
                animate={{
                    opacity: progress > 0.3 ? 1 : 0,
                    scale: progress
                }}
            >
                <div className={`p-2 rounded-full bg-primary/10 ${isRefreshing ? "animate-spin" : ""}`}>
                    <RefreshCw
                        className="w-5 h-5 text-primary"
                        style={{
                            transform: isRefreshing ? undefined : `rotate(${progress * 360}deg)`
                        }}
                    />
                </div>
            </motion.div>

            {/* Content with pull offset */}
            <motion.div
                animate={{ y: pullDistance }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
                {children}
            </motion.div>
        </div>
    );
}
