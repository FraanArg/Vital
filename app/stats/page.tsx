"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Moon, Dumbbell, Utensils, Sparkles, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";

import ConsistencyGrid from "../../components/stats/ConsistencyGrid";
import { Skeleton } from "../../components/ui/Skeleton";

// Lazy load all stat components
const ActivityRings = dynamic(() => import("../../components/stats/ActivityRings"), { ssr: false });
const TrendCharts = dynamic(() => import("../../components/stats/TrendCharts"), { ssr: false });
const InsightsSection = dynamic(() => import("../../components/insights/InsightsSection"), { ssr: false });
const NutritionBreakdown = dynamic(() => import("../../components/stats/NutritionBreakdown"), { ssr: false });
const SleepAnalysis = dynamic(() => import("../../components/stats/SleepAnalysis"), { ssr: false });
const ExerciseBreakdown = dynamic(() => import("../../components/stats/ExerciseBreakdown"), { ssr: false });
const TimePatterns = dynamic(() => import("../../components/stats/TimePatterns"), { ssr: false });
const PersonalBests = dynamic(() => import("../../components/stats/PersonalBests"), { ssr: false });
const PersonalRecords = dynamic(() => import("../../components/stats/PersonalRecords"), { ssr: false });
const Achievements = dynamic(() => import("../../components/stats/Achievements"), { ssr: false });
const WeekComparison = dynamic(() => import("../../components/stats/WeekComparison"), { ssr: false });
const MonthlySummary = dynamic(() => import("../../components/stats/MonthlySummary"), { ssr: false });
const FoodFrequency = dynamic(() => import("../../components/stats/FoodFrequency"), { ssr: false });
const ActivityCalendar = dynamic(() => import("../../components/stats/ActivityCalendar"), { ssr: false });
const CalendarView = dynamic(() => import("../../components/CalendarView"), { ssr: false });
const WeeklyReport = dynamic(() => import("../../components/stats/WeeklyReport"), { ssr: false });
const MonthlyReportComponent = dynamic(() => import("../../components/stats/MonthlyReport"), { ssr: false });
const HealthScore = dynamic(() => import("../../components/stats/HealthScore"), { ssr: false });
const AICoach = dynamic(() => import("../../components/stats/AICoach"), { ssr: false });
const Predictions = dynamic(() => import("../../components/stats/Predictions"), { ssr: false });
const DailyNutrientBalance = dynamic(() => import("../../components/stats/DailyNutrientBalance"), { ssr: false });
const AdvancedCorrelations = dynamic(() => import("../../components/stats/AdvancedCorrelations"), { ssr: false });
const MealSuggestions = dynamic(() => import("../../components/MealSuggestions"), { ssr: false });

type TabId = "overview" | "sleep" | "exercise" | "nutrition" | "insights";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "sleep", label: "Sleep", icon: Moon },
    { id: "exercise", label: "Exercise", icon: Dumbbell },
    { id: "nutrition", label: "Nutrition", icon: Utensils },
    { id: "insights", label: "Insights", icon: Sparkles },
];

export default function StatisticsPage() {
    const [range, setRange] = useState<"week" | "month" | "year">("week");
    const [activeTab, setActiveTab] = useState<TabId>("overview");

    const rangeToDays = (r: "week" | "month" | "year"): number => {
        switch (r) {
            case "week": return 7;
            case "month": return 30;
            case "year": return 365;
        }
    };

    const days = rangeToDays(range);

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

    const now = useMemo(() => new Date(), []);
    const consistencyStart = useMemo(() => subDays(now, 90), [now]);
    const consistencyLogs = useQuery(api.logs.getStats, {
        from: consistencyStart.toISOString(),
        to: now.toISOString()
    });

    interface AggregatedDay {
        date: string;
        work: number;
        sleep: number;
        water: number;
        mood: number;
        exerciseDuration: number;
        moodCount: number;
    }

    const processedData = useMemo(() => {
        if (!logs) return null;

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
                    <Skeleton className="h-12 w-full rounded-2xl" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-[250px] rounded-3xl" />
                        <Skeleton className="h-[250px] rounded-3xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-8 pb-24 flex flex-col items-center">
            <div className="w-full max-w-5xl space-y-6">
                {/* Header with Range Selector */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Statistics</h1>
                        <p className="text-sm text-muted-foreground">Track your progress over time</p>
                    </div>
                    <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-xl">
                        {(["week", "month", "year"] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${range === r
                                        ? "bg-card shadow-sm text-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 p-1 bg-secondary/30 rounded-2xl overflow-x-auto">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${isActive
                                        ? "bg-card shadow-sm text-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                                    }`}
                                aria-selected={isActive}
                                role="tab"
                            >
                                <Icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {activeTab === "overview" && (
                            <>
                                <HealthScore />
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <ActivityRings averages={averages} />
                                    <WeekComparison />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <WeeklyReport />
                                    <MonthlyReportComponent />
                                </div>
                                <MonthlySummary />
                                <TrendCharts data={processedData || []} range={range} />
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <ActivityCalendar />
                                    <ConsistencyGrid logs={consistencyLogs} />
                                </div>
                            </>
                        )}

                        {activeTab === "sleep" && (
                            <>
                                <SleepAnalysis days={days} />
                                <TimePatterns />
                                <CalendarView />
                            </>
                        )}

                        {activeTab === "exercise" && (
                            <>
                                <ExerciseBreakdown days={days} />
                                <PersonalBests />
                                <PersonalRecords />
                                <Achievements />
                            </>
                        )}

                        {activeTab === "nutrition" && (
                            <>
                                <DailyNutrientBalance />
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <NutritionBreakdown />
                                    <FoodFrequency />
                                </div>
                                <MealSuggestions />
                            </>
                        )}

                        {activeTab === "insights" && (
                            <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <AICoach />
                                    <Predictions />
                                </div>
                                <AdvancedCorrelations />
                                <InsightsSection />
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
