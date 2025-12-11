"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, format } from "date-fns";
import StatsHeader from "../../components/stats/StatsHeader";
import dynamic from "next/dynamic";

import ConsistencyGrid from "../../components/stats/ConsistencyGrid";
import { Skeleton } from "../../components/ui/Skeleton";

const ActivityRings = dynamic(() => import("../../components/stats/ActivityRings"), { ssr: false });
const TrendCharts = dynamic(() => import("../../components/stats/TrendCharts"), { ssr: false });
const InsightsSection = dynamic(() => import("../../components/insights/InsightsSection"), { ssr: false });

// New stats components
const NutritionBreakdown = dynamic(() => import("../../components/stats/NutritionBreakdown"), { ssr: false });
const SleepAnalysis = dynamic(() => import("../../components/stats/SleepAnalysis"), { ssr: false });
const ExerciseBreakdown = dynamic(() => import("../../components/stats/ExerciseBreakdown"), { ssr: false });
const TimePatterns = dynamic(() => import("../../components/stats/TimePatterns"), { ssr: false });
const PersonalBests = dynamic(() => import("../../components/stats/PersonalBests"), { ssr: false });
const Achievements = dynamic(() => import("../../components/stats/Achievements"), { ssr: false });
const WeekComparison = dynamic(() => import("../../components/stats/WeekComparison"), { ssr: false });
const MonthlySummary = dynamic(() => import("../../components/stats/MonthlySummary"), { ssr: false });
const FoodFrequency = dynamic(() => import("../../components/stats/FoodFrequency"), { ssr: false });
const ActivityCalendar = dynamic(() => import("../../components/stats/ActivityCalendar"), { ssr: false });
const CalendarView = dynamic(() => import("../../components/CalendarView"), { ssr: false });
const WeeklyReport = dynamic(() => import("../../components/stats/WeeklyReport"), { ssr: false });
const MonthlyReportComponent = dynamic(() => import("../../components/stats/MonthlyReport"), { ssr: false });

// AI-powered components
const HealthScore = dynamic(() => import("../../components/stats/HealthScore"), { ssr: false });
const AICoach = dynamic(() => import("../../components/stats/AICoach"), { ssr: false });
const Predictions = dynamic(() => import("../../components/stats/Predictions"), { ssr: false });
const DailyNutrientBalance = dynamic(() => import("../../components/stats/DailyNutrientBalance"), { ssr: false });
const AdvancedCorrelations = dynamic(() => import("../../components/stats/AdvancedCorrelations"), { ssr: false });
const MealSuggestions = dynamic(() => import("../../components/MealSuggestions"), { ssr: false });

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
    const now = useMemo(() => new Date(), []);
    const consistencyStart = useMemo(() => subDays(now, 90), [now]);
    const consistencyLogs = useQuery(api.logs.getStats, {
        from: consistencyStart.toISOString(),
        to: now.toISOString()
    });



    const processedData = useMemo(() => {
        if (!logs) return null;

        interface AggregatedDay {
            date: string;
            work: number;
            sleep: number;
            water: number;
            mood: number;
            exerciseDuration: number;
            moodCount: number;
        }

        const aggregated = logs.reduce((acc, log) => {
            const dateKey = format(new Date(log.date), "yyyy-MM-dd");
            if (!acc[dateKey]) {
                acc[dateKey] = {
                    date: dateKey,
                    work: 0,
                    sleep: 0,
                    water: 0,
                    mood: 0,
                    exerciseDuration: 0,
                    moodCount: 0,
                };
            }

            acc[dateKey].work += log.work || 0;
            acc[dateKey].sleep += log.sleep || 0;
            acc[dateKey].water += log.water || 0;
            acc[dateKey].exerciseDuration += log.exercise?.duration || 0;

            if (log.mood) {
                acc[dateKey].mood += log.mood;
                acc[dateKey].moodCount += 1;
            }

            return acc;
        }, {} as Record<string, AggregatedDay>);

        return Object.values(aggregated).map((day) => ({
            ...day,
            mood: day.moodCount > 0 ? Number((day.mood / day.moodCount).toFixed(1)) : 0,
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
            <div className="min-h-screen p-4 sm:p-8 pb-24 flex flex-col items-center justify-center">
                <div className="w-full max-w-5xl space-y-8">
                    <div className="text-center text-muted-foreground mb-4">Loading statistics...</div>
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
            <div className="w-full max-w-5xl space-y-6">
                <StatsHeader range={range} setRange={setRange} />

                {/* AI Hero Section - Health Score */}
                <HealthScore />

                {/* AI Coach & Predictions Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AICoach />
                    <Predictions />
                </div>

                {/* Weekly & Monthly Reports */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <WeeklyReport />
                    <MonthlyReportComponent />
                </div>

                {/* Monthly Summary - compact version */}
                <MonthlySummary />

                {/* Overview Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ActivityRings averages={averages} />
                    <WeekComparison />
                </div>

                {/* Personal Bests & Achievements */}
                <PersonalBests />
                <Achievements />

                {/* Detailed Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SleepAnalysis />
                    <TimePatterns />
                </div>

                <ExerciseBreakdown />

                {/* Nutrition */}
                <DailyNutrientBalance />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <NutritionBreakdown />
                    <FoodFrequency />
                </div>

                {/* Trends & Charts */}
                <TrendCharts data={processedData || []} range={range} />

                {/* Calendar Views */}
                <CalendarView />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ActivityCalendar />
                    <ConsistencyGrid logs={consistencyLogs} />
                </div>

                {/* AI Insights & Correlations */}
                <AdvancedCorrelations />

                {/* Meal Suggestions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <MealSuggestions />
                    <InsightsSection />
                </div>
            </div>
        </div>
    );
}
