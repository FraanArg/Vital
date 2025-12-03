"use client";

import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useHaptic } from "../hooks/useHaptic";

export default function PullToRefresh({ children }: { children: React.ReactNode }) {
    const [startY, setStartY] = useState(0);
    const [pulling, setPulling] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [pullHeight, setPullHeight] = useState(0);
    const controls = useAnimation();
    const router = useRouter();
    const { trigger } = useHaptic();

    const THRESHOLD = 80;

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            if (window.scrollY === 0) {
                setStartY(e.touches[0].clientY);
                setPulling(true);
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!pulling) return;
            const currentY = e.touches[0].clientY;
            const diff = currentY - startY;

            if (diff > 0 && window.scrollY === 0) {
                // Resistance effect
                const height = Math.min(diff * 0.5, THRESHOLD * 1.5);
                setPullHeight(height);

                // Prevent default pull-to-refresh on some browsers
                if (e.cancelable) e.preventDefault();
            }
        };

        const handleTouchEnd = async () => {
            if (!pulling) return;
            setPulling(false);

            if (pullHeight > THRESHOLD) {
                setRefreshing(true);
                trigger("medium");
                setPullHeight(THRESHOLD);

                // Simulate refresh
                await new Promise(resolve => setTimeout(resolve, 1000));
                router.refresh();

                setRefreshing(false);
                trigger("success");
            }

            setPullHeight(0);
        };

        window.addEventListener("touchstart", handleTouchStart, { passive: true });
        window.addEventListener("touchmove", handleTouchMove, { passive: false });
        window.addEventListener("touchend", handleTouchEnd);

        return () => {
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, [pulling, startY, pullHeight, router, trigger]);

    return (
        <div className="relative">
            <motion.div
                className="fixed top-0 left-0 right-0 flex justify-center items-center z-50 pointer-events-none"
                animate={{ height: pullHeight }}
                style={{ overflow: 'hidden' }}
            >
                <div className="flex items-center justify-center h-full pb-4">
                    {refreshing ? (
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    ) : (
                        <div
                            className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent"
                            style={{ transform: `rotate(${pullHeight * 3}deg)` }}
                        />
                    )}
                </div>
            </motion.div>

            <motion.div
                animate={{ y: refreshing ? THRESHOLD : pullHeight }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {children}
            </motion.div>
        </div>
    );
}
