"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { startOfDay, endOfDay } from "date-fns";
import dynamic from "next/dynamic";
import { Skeleton } from "./ui/Skeleton";

const ActivityRings = dynamic(() => import("./stats/ActivityRings"), { ssr: false });

interface DailySummaryProps {
    selectedDate: Date;
}

export default function DailySummary({ selectedDate }: DailySummaryProps) {
    const start = startOfDay(selectedDate);
    const end = endOfDay(selectedDate);

    const logs = useQuery(api.logs.getStats, {
        from: start.toISOString(),
        to: end.toISOString()
    });

    if (!logs) {
        return (
            <div className="flex flex-col gap-6 mb-8">
                <Skeleton className="h-[250px] rounded-3xl" />
                <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-20 rounded-2xl" />
                    <Skeleton className="h-20 rounded-2xl" />
                    <Skeleton className="h-20 rounded-2xl" />
                </div>
            </div>
        );
    }

    const totals = logs.reduce((acc, log) => ({
        work: acc.work + (log.work || 0),
        sleep: acc.sleep + (log.sleep || 0),
        exercise: acc.exercise + (log.exercise?.duration || 0),
    }), { work: 0, sleep: 0, exercise: 0 });

    return (
        <ActivityRings averages={totals} />
    );
}
