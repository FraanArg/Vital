"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { startOfDay, endOfDay } from "date-fns";
import dynamic from "next/dynamic";
import { Skeleton } from "./ui/Skeleton";

const ActivityRings = dynamic(() => import("./stats/ActivityRings"), { ssr: false });

interface DailySummaryProps {
    selectedDate: Date;
    compact?: boolean;
}

export default function DailySummary({ selectedDate, compact = false }: DailySummaryProps) {
    const start = startOfDay(selectedDate);
    const end = endOfDay(selectedDate);

    const logs = useQuery(api.logs.getStats, {
        from: start.toISOString(),
        to: end.toISOString()
    });

    if (!logs) {
        return (
            <div className="flex flex-col gap-4">
                <Skeleton className={`${compact ? 'h-[180px]' : 'h-[250px]'} rounded-2xl`} />
            </div>
        );
    }

    const totals = logs.reduce((acc, log) => ({
        work: acc.work + (log.work || 0),
        sleep: acc.sleep + (log.sleep || 0),
        exercise: acc.exercise + (log.exercise?.duration || 0),
    }), { work: 0, sleep: 0, exercise: 0 });

    return (
        <ActivityRings averages={totals} compact={compact} />
    );
}

