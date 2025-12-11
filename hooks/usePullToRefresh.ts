"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface PullToRefreshOptions {
    threshold?: number; // Pull distance to trigger refresh (px)
    maxPull?: number; // Maximum pull distance (px)
    onRefresh: () => Promise<void>;
}

interface PullToRefreshState {
    isPulling: boolean;
    pullDistance: number;
    isRefreshing: boolean;
}

/**
 * Hook to enable pull-to-refresh functionality
 */
export function usePullToRefresh(options: PullToRefreshOptions) {
    const { threshold = 80, maxPull = 120, onRefresh } = options;

    const [state, setState] = useState<PullToRefreshState>({
        isPulling: false,
        pullDistance: 0,
        isRefreshing: false,
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const startY = useRef(0);
    const currentY = useRef(0);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        // Only trigger if at top of scroll container
        if (containerRef.current && containerRef.current.scrollTop === 0) {
            startY.current = e.touches[0].clientY;
            setState(s => ({ ...s, isPulling: true }));
        }
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!state.isPulling || state.isRefreshing) return;

        currentY.current = e.touches[0].clientY;
        const pull = Math.max(0, currentY.current - startY.current);
        const dampedPull = Math.min(maxPull, pull * 0.5); // Damping effect

        if (pull > 10) {
            e.preventDefault();
        }

        setState(s => ({ ...s, pullDistance: dampedPull }));
    }, [state.isPulling, state.isRefreshing, maxPull]);

    const handleTouchEnd = useCallback(async () => {
        if (!state.isPulling) return;

        if (state.pullDistance >= threshold && !state.isRefreshing) {
            setState(s => ({ ...s, isRefreshing: true, pullDistance: threshold }));
            try {
                await onRefresh();
            } finally {
                setState({ isPulling: false, pullDistance: 0, isRefreshing: false });
            }
        } else {
            setState({ isPulling: false, pullDistance: 0, isRefreshing: false });
        }
    }, [state.isPulling, state.pullDistance, state.isRefreshing, threshold, onRefresh]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener("touchstart", handleTouchStart, { passive: true });
        container.addEventListener("touchmove", handleTouchMove, { passive: false });
        container.addEventListener("touchend", handleTouchEnd);

        return () => {
            container.removeEventListener("touchstart", handleTouchStart);
            container.removeEventListener("touchmove", handleTouchMove);
            container.removeEventListener("touchend", handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    const progress = Math.min(1, state.pullDistance / threshold);

    return {
        containerRef,
        ...state,
        progress,
        indicatorStyle: {
            transform: `translateY(${state.pullDistance}px)`,
            opacity: progress,
        },
    };
}
