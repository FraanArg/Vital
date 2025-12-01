"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";

export default function StreakCounter() {
    const streakData = useQuery(api.gamification.getStreak);

    if (!streakData || streakData.currentStreak === 0) return null;

    return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
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
            <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                {streakData.currentStreak}
            </span>
        </div>
    );
}
