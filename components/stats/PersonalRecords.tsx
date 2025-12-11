"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Trophy, Timer, Droplets, Moon, Flame, Dumbbell } from "lucide-react";
import { Skeleton } from "../ui/Skeleton";
import { useAnimatedCounter } from "../../hooks/useAnimatedCounter";

interface RecordCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    suffix: string;
    color: string;
    delay?: number;
}

function RecordCard({ icon, label, value, suffix, color, delay = 0 }: RecordCardProps) {
    const animatedValue = useAnimatedCounter(value, { duration: 1000, delay: delay * 100 });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.1 }}
            className={`p-4 rounded-xl bg-gradient-to-br ${color} border border-white/10`}
        >
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-xs text-white/80">{label}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white tabular-nums">
                    {Math.round(animatedValue)}
                </span>
                <span className="text-sm text-white/70">{suffix}</span>
            </div>
        </motion.div>
    );
}

function PersonalRecordsSkeleton() {
    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-4">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-5 w-32" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
            </div>
        </div>
    );
}

export default function PersonalRecords() {
    const data = useQuery(api.stats.getPersonalBests);

    if (data === undefined) {
        return <PersonalRecordsSkeleton />;
    }

    if (!data) {
        return null;
    }

    const records = [
        {
            icon: <Timer className="w-4 h-4 text-white" />,
            label: "Longest Workout",
            value: data.longestWorkout,
            suffix: "min",
            color: "from-blue-500 to-blue-600",
        },
        {
            icon: <Moon className="w-4 h-4 text-white" />,
            label: "Best Sleep",
            value: data.bestSleep,
            suffix: "h",
            color: "from-indigo-500 to-indigo-600",
        },
        {
            icon: <Droplets className="w-4 h-4 text-white" />,
            label: "Most Water",
            value: data.mostWater,
            suffix: "L",
            color: "from-cyan-500 to-cyan-600",
        },
        {
            icon: <Flame className="w-4 h-4 text-white" />,
            label: "Longest Streak",
            value: data.longestStreak,
            suffix: "days",
            color: "from-orange-500 to-orange-600",
        },
        {
            icon: <Dumbbell className="w-4 h-4 text-white" />,
            label: "Total Workouts",
            value: data.totalWorkouts,
            suffix: "",
            color: "from-green-500 to-green-600",
        },
    ];

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold">Personal Records</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {records.map((record, i) => (
                    <RecordCard key={record.label} {...record} delay={i} />
                ))}
            </div>
        </div>
    );
}
