"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { motion } from "framer-motion";
import { Battery, Moon, Droplets } from "lucide-react";

export default function StatsOverview() {
    const stats = useLiveQuery(async () => {
        const logs = await db.logs.toArray();
        const moodLogs = logs.filter(l => l.mood);
        const sleepLogs = logs.filter(l => l.sleep);
        const waterLogs = logs.filter(l => l.water);

        const avgMood = moodLogs.length ? (moodLogs.reduce((a, b) => a + (b.mood || 0), 0) / moodLogs.length).toFixed(1) : "-";
        const avgSleep = sleepLogs.length ? (sleepLogs.reduce((a, b) => a + (b.sleep || 0), 0) / sleepLogs.length).toFixed(1) : "-";
        const totalWater = waterLogs.reduce((a, b) => a + (b.water || 0), 0);

        return { avgMood, avgSleep, totalWater };
    });

    if (!stats) {
        return (
            <div className="grid grid-cols-3 gap-4 mb-8 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-2xl bg-card/50 border border-border/50" />
                ))}
            </div>
        );
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-3 gap-4 mb-8"
        >
            <motion.div variants={item} className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="mb-2 p-2 bg-purple-100 dark:bg-purple-500/20 rounded-full">
                    <Moon className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                </div>
                <div className="text-2xl font-bold">{stats.avgSleep}h</div>
                <div className="text-xs text-muted">Avg Sleep</div>
            </motion.div>

            <motion.div variants={item} className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="mb-2 p-2 bg-green-100 dark:bg-green-500/20 rounded-full">
                    <Battery className="w-5 h-5 text-green-600 dark:text-green-300" />
                </div>
                <div className="text-2xl font-bold">{stats.avgMood}/5</div>
                <div className="text-xs text-muted">Avg Mood</div>
            </motion.div>

            <motion.div variants={item} className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="mb-2 p-2 bg-blue-100 dark:bg-blue-500/20 rounded-full">
                    <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="text-2xl font-bold">{stats.totalWater}</div>
                <div className="text-xs text-muted">Total Water</div>
            </motion.div>
        </motion.div>
    );
}
