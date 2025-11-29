"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion } from "framer-motion";
import { Briefcase, Moon, Droplets } from "lucide-react";
import { startOfDay, endOfDay } from "date-fns";
import { Skeleton } from "./ui/Skeleton";

interface StatsOverviewProps {
    selectedDate?: Date;
}

export default function StatsOverview({ selectedDate = new Date() }: StatsOverviewProps) {
    const start = startOfDay(selectedDate);
    const end = endOfDay(selectedDate);

    const logs = useQuery(api.logs.getStats, {
        from: start.toISOString(),
        to: end.toISOString()
    });

    const stats = useMemo(() => {
        if (!logs) return null;
        return {
            work: logs.reduce((acc, log) => acc + (log.work || 0), 0),
            sleep: logs.reduce((acc, log) => acc + (log.sleep || 0), 0),
            water: logs.reduce((acc, log) => acc + (log.water || 0), 0),
        };
    }, [logs]);

    if (!stats) {
        return (
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col items-center justify-center text-center h-[106px]">
                        <Skeleton className="w-10 h-10 rounded-full mb-2" />
                        <Skeleton className="w-16 h-8 mb-1" />
                        <Skeleton className="w-10 h-3" />
                    </div>
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
                <div className="mb-2 p-2 bg-green-100 dark:bg-green-500/20 rounded-full">
                    <Briefcase className="w-5 h-5 text-green-600 dark:text-green-300" />
                </div>
                <div className="text-2xl font-bold">{stats.work}h</div>
                <div className="text-xs text-muted">Work</div>
            </motion.div>

            <motion.div variants={item} className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="mb-2 p-2 bg-purple-100 dark:bg-purple-500/20 rounded-full">
                    <Moon className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                </div>
                <div className="text-2xl font-bold">{stats.sleep}h</div>
                <div className="text-xs text-muted">Sleep</div>
            </motion.div>

            <motion.div variants={item} className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="mb-2 p-2 bg-blue-100 dark:bg-blue-500/20 rounded-full">
                    <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="text-2xl font-bold">{stats.water}</div>
                <div className="text-xs text-muted">Water</div>
            </motion.div>
        </motion.div>
    );
}
