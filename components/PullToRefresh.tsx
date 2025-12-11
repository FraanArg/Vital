"use client";

import { useRef, useState, useCallback, ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";

interface PullToRefreshProps {
    children: ReactNode;
    onRefresh: () => Promise<void>;
    threshold?: number;
    className?: string;
}

export default function PullToRefresh({
    children,
    onRefresh,
    threshold = 80,
    className = "",
}: PullToRefreshProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isPulling, setIsPulling] = useState(false);

    const startY = useRef(0);
    const pullDistance = useMotionValue(0);
    const progress = useTransform(pullDistance, [0, threshold], [0, 1]);
    const rotation = useTransform(pullDistance, [0, threshold], [0, 360]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const container = containerRef.current;
        if (container && container.scrollTop === 0 && !isRefreshing) {
            startY.current = e.touches[0].clientY;
            setIsPulling(true);
        }
    }, [isRefreshing]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isPulling || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const delta = currentY - startY.current;

        if (delta > 0) {
            // Apply resistance - the further you pull, the harder it gets
            const resistance = Math.min(delta * 0.4, threshold * 1.5);
            pullDistance.set(resistance);
        }
    }, [isPulling, isRefreshing, pullDistance, threshold]);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling) return;
        setIsPulling(false);

        const currentPull = pullDistance.get();

        if (currentPull >= threshold && !isRefreshing) {
            // Trigger refresh
            setIsRefreshing(true);
            pullDistance.set(threshold / 2);

            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
                pullDistance.set(0);
            }
        } else {
            // Snap back
            pullDistance.set(0);
        }
    }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh]);

    const pullY = useTransform(pullDistance, (v) => v);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-y-auto ${className}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: isPulling ? "none" : "auto" }}
        >
            {/* Pull indicator */}
            <AnimatePresence>
                {(isPulling || isRefreshing) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ y: pullY }}
                        className="absolute top-0 left-0 right-0 z-10 flex justify-center py-3 pointer-events-none"
                    >
                        <motion.div
                            style={{ rotate: isRefreshing ? undefined : rotation }}
                            animate={isRefreshing ? { rotate: 360 } : undefined}
                            transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : undefined}
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${isRefreshing ? "bg-primary" : "bg-secondary"
                                }`}
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "text-primary-foreground" : "text-muted-foreground"}`} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main content */}
            <motion.div style={{ y: pullY }}>
                {children}
            </motion.div>
        </div>
    );
}
