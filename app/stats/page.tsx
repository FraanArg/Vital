"use client";

import StatsCharts from "../../components/StatsCharts";
import StatsOverview from "../../components/StatsOverview";

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
