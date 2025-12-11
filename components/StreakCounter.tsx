"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "./ui/Skeleton";
import { triggerConfetti } from "./ui/Confetti";
import { useAnimatedCounter } from "../hooks/useAnimatedCounter";

const MILESTONE_STREAKS = [7, 14, 30, 60, 100, 365];

export default function StreakCounter() {
    const streakData = useQuery(api.gamification.getStreak);
    const previousStreak = useRef<number | null>(null);

    // Animate the streak number
    const animatedStreak = useAnimatedCounter(streakData?.currentStreak || 0, {
        duration: 800,
        easing: "easeOut"
    });

    // Trigger confetti on milestone achievements
    useEffect(() => {
        if (streakData && previousStreak.current !== null) {
            const current = streakData.currentStreak;
            const previous = previousStreak.current;

            // Check if we just hit a milestone
            if (MILESTONE_STREAKS.includes(current) && current > previous) {
                if (current >= 100) {
                    triggerConfetti("milestone"); // Rainbow for big milestones
                } else {
                    triggerConfetti("streak"); // Gold for regular milestones
                }
            }
        }
        if (streakData) {
            previousStreak.current = streakData.currentStreak;
        }
    }, [streakData]);

    if (streakData === undefined) {
        return <Skeleton className="w-12 h-7 rounded-full" />;
    }

    if (streakData.currentStreak === 0) return null;

    const isMilestone = MILESTONE_STREAKS.includes(streakData.currentStreak);

    return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${isMilestone
            ? "bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30 shadow-lg shadow-orange-500/10"
            : "bg-orange-500/10 border border-orange-500/20"
            }`}>
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            </motion.div>
            <span className="text-2xl font-black text-orange-600 dark:text-orange-400 tabular-nums">
                {Math.round(animatedStreak)}
            </span>
            {isMilestone && (
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-[10px]"
                >
                    🎉
                </motion.span>
            )}
        </div>
    );
}

