"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface CelebrationOverlayProps {
    trigger: boolean;
    message?: string;
    onComplete?: () => void;
}

/**
 * iOS-inspired celebration overlay with confetti
 * Triggers when all daily goals are completed
 */
export function CelebrationOverlay({ trigger, message = "All goals complete! 🎉", onComplete }: CelebrationOverlayProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (trigger) {
            setIsVisible(true);

            // Fire confetti
            const duration = 2000;
            const end = Date.now() + duration;

            const colors = ['#22c55e', '#3b82f6', '#f97316', '#8b5cf6', '#06b6d4'];

            (function frame() {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors,
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors,
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            })();

            // Auto-hide after 3 seconds
            const timer = setTimeout(() => {
                setIsVisible(false);
                onComplete?.();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [trigger, onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                    className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                >
                    <motion.div
                        initial={{ y: 50 }}
                        animate={{ y: 0 }}
                        className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-3xl px-8 py-6 shadow-2xl text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                            className="text-5xl mb-3"
                        >
                            🏆
                        </motion.div>
                        <h3 className="text-xl font-bold mb-1">{message}</h3>
                        <p className="text-sm text-muted-foreground">Keep up the great work!</p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/**
 * Goal completion pulse animation for individual cards
 */
export function GoalCompletePulse({ children, isComplete }: { children: React.ReactNode; isComplete: boolean }) {
    return (
        <motion.div
            animate={isComplete ? {
                boxShadow: [
                    "0 0 0 0 rgba(34, 197, 94, 0)",
                    "0 0 0 8px rgba(34, 197, 94, 0.3)",
                    "0 0 0 0 rgba(34, 197, 94, 0)",
                ],
            } : {}}
            transition={{ duration: 1, repeat: isComplete ? 2 : 0 }}
            className="rounded-2xl"
        >
            {children}
        </motion.div>
    );
}
