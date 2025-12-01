"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "../../components/ui/Skeleton";

const StatsOverview = dynamic(() => import("../../components/StatsOverview"), {
    loading: () => (
        <div className="grid grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col items-center justify-center text-center h-[106px] animate-pulse bg-muted/20" />
            ))}
        </div>
    ),
    ssr: false
});

const StatsCharts = dynamic(() => import("../../components/StatsCharts"), {
    loading: () => (
        <div className="space-y-8">
            {[1, 2].map((i) => (
                <div key={i} className="p-6 rounded-3xl bg-card border border-border/50 shadow-sm space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-[300px] w-full rounded-xl" />
                </div>
            ))}
        </div>
    ),
    ssr: false
});

export default function StatisticsPage() {
    return (
        <div className="min-h-screen p-4 sm:p-8 pb-24 flex flex-col items-center">
            <div className="w-full max-w-2xl animate-fade-in">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
                    <p className="text-muted-foreground mt-2">Visualize your progress over time.</p>
                </header>

                <StatsOverview />
                <StatsCharts />
            </div>
        </div>
    );
}
