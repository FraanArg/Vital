"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays } from "date-fns";
import StatsHeader from "../../components/stats/StatsHeader";
import ActivityRings from "../../components/stats/ActivityRings";
import TrendCharts from "../../components/stats/TrendCharts";
import ConsistencyGrid from "../../components/stats/ConsistencyGrid";
import { Skeleton } from "../../components/ui/Skeleton";

export default function StatisticsPage() {
    const [range, setRange] = useState<"week" | "month" | "year">("week");

    // Calculate date range
    const { start, end } = useMemo(() => {
        const now = new Date();
        switch (range) {
            case "week":
                return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
            case "month":
                return { start: startOfMonth(now), end: endOfMonth(now) };
            case "year":
                return { start: startOfYear(now), end: endOfYear(now) };
        }
    }, [range]);

    const logs = useQuery(api.logs.getStats, {
        from: start.toISOString(),
        to: end.toISOString()
    });

    // Fetch longer history for consistency grid (last 90 days)
    const consistencyStart = useMemo(() => subDays(new Date(), 90), []);
    const consistencyLogs = useQuery(api.logs.getStats, {
        from: consistencyStart.toISOString(),
        to: new Date().toISOString()
    });

    const processedData = useMemo(() => {
        if (!logs) return null;
        return logs.map(log => ({
            date: log.date,
            work: log.work || 0,
            sleep: log.sleep || 0,
            water: log.water || 0,
            mood: log.mood || 0,
            exerciseDuration: log.exercise?.duration || 0,
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [logs]);

    const averages = useMemo(() => {
        if (!processedData || processedData.length === 0) return { work: 0, sleep: 0, exercise: 0 };
        const total = processedData.reduce((acc, curr) => ({
            work: acc.work + curr.work,
            sleep: acc.sleep + curr.sleep,
            exercise: acc.exercise + curr.exerciseDuration
        }), { work: 0, sleep: 0, exercise: 0 });

        return {
            work: total.work / processedData.length,
            sleep: total.sleep / processedData.length,
            exercise: total.exercise / processedData.length
        };
    }, [processedData]);



    if (!logs || !consistencyLogs) {
        return (
            <div className="min-h-screen p-4 sm:p-8 pb-24 flex flex-col items-center">
                <div className="w-full max-w-4xl space-y-8">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-8 w-64 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-[250px] rounded-3xl" />
                        <div className="space-y-4">
                            <Skeleton className="h-20 rounded-2xl" />
                            <Skeleton className="h-20 rounded-2xl" />
                            <Skeleton className="h-20 rounded-2xl" />
                        </div>
                    </div>
                    <Skeleton className="h-[300px] rounded-3xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-8 pb-24 flex flex-col items-center">
            <div className="w-full max-w-4xl animate-fade-in">
                <StatsHeader range={range} setRange={setRange} />

                <ActivityRings averages={averages} />

                <TrendCharts data={processedData || []} range={range} />

                <ConsistencyGrid logs={consistencyLogs} />
            </div>
        </div>
    );
}
