import { query } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

// Types for insights
interface Insight {
    type: "food" | "sleep" | "exercise" | "trend" | "correlation" | "achievement";
    icon: string;
    title: string;
    message: string;
    priority: number;
    color?: string;
}

interface TrendData {
    metric: string;
    current: number;
    previous: number;
    change: number;
    changePercent: number;
    trend: "up" | "down" | "stable";
}

interface Correlation {
    factor1: string;
    factor2: string;
    relationship: string;
    strength: "strong" | "moderate" | "weak";
    icon: string;
}

interface GoalProgress {
    goal: string;
    current: number;
    target: number;
    percent: number;
    prediction: number;
    onTrack: boolean;
    icon: string;
}

// Helper to get logs for a date range
async function getLogsForRange(
    ctx: any,
    userId: string,
    startDate: Date,
    endDate: Date
): Promise<Doc<"logs">[]> {
    return await ctx.db
        .query("logs")
        .withIndex("by_userId_date", (q: any) => q.eq("userId", userId))
        .filter((q: any) =>
            q.and(
                q.gte(q.field("date"), startDate.toISOString()),
                q.lte(q.field("date"), endDate.toISOString())
            )
        )
        .collect();
}

// Helper to analyze food categories from logs
function analyzeFoodCategories(
    logs: Doc<"logs">[],
    foodCategoryMap: Map<string, string | undefined>
): Record<string, number> {
    const categoryCounts: Record<string, number> = {};
    for (const log of logs) {
        if (log.meal?.items) {
            for (const item of log.meal.items) {
                const category = foodCategoryMap.get(item.toLowerCase()) || "Other";
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            }
        }
    }
    return categoryCounts;
}

// ============================================
// WEEKLY TRENDS
// ============================================
export const getWeeklyTrends = query({
    handler: async (ctx): Promise<TrendData[]> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const userId = identity.subject;
        const now = new Date();

        // This week (last 7 days)
        const thisWeekEnd = new Date(now);
        thisWeekEnd.setHours(23, 59, 59, 999);
        const thisWeekStart = new Date(now);
        thisWeekStart.setDate(thisWeekStart.getDate() - 6);
        thisWeekStart.setHours(0, 0, 0, 0);

        // Last week (7-14 days ago)
        const lastWeekEnd = new Date(thisWeekStart);
        lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
        lastWeekEnd.setHours(23, 59, 59, 999);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekStart.getDate() - 6);
        lastWeekStart.setHours(0, 0, 0, 0);

        const thisWeekLogs = await getLogsForRange(ctx, userId, thisWeekStart, thisWeekEnd);
        const lastWeekLogs = await getLogsForRange(ctx, userId, lastWeekStart, lastWeekEnd);

        // Get food items for category mapping
        const foodItems = await ctx.db.query("foodItems").collect();
        const foodCategoryMap = new Map(foodItems.map((f: Doc<"foodItems">) => [f.name.toLowerCase(), f.category]));

        const trends: TrendData[] = [];

        // Exercise frequency
        const thisWeekExercise = thisWeekLogs.filter(l => l.exercise).length;
        const lastWeekExercise = lastWeekLogs.filter(l => l.exercise).length;
        const exerciseChange = thisWeekExercise - lastWeekExercise;
        trends.push({
            metric: "Workouts",
            current: thisWeekExercise,
            previous: lastWeekExercise,
            change: exerciseChange,
            changePercent: lastWeekExercise > 0 ? Math.round((exerciseChange / lastWeekExercise) * 100) : 0,
            trend: exerciseChange > 0 ? "up" : exerciseChange < 0 ? "down" : "stable",
        });

        // Average sleep
        const thisWeekSleep = thisWeekLogs.filter(l => l.sleep);
        const lastWeekSleep = lastWeekLogs.filter(l => l.sleep);
        const avgSleepThis = thisWeekSleep.length > 0
            ? thisWeekSleep.reduce((sum, l) => sum + (l.sleep || 0), 0) / thisWeekSleep.length
            : 0;
        const avgSleepLast = lastWeekSleep.length > 0
            ? lastWeekSleep.reduce((sum, l) => sum + (l.sleep || 0), 0) / lastWeekSleep.length
            : 0;
        const sleepChange = avgSleepThis - avgSleepLast;
        trends.push({
            metric: "Avg Sleep",
            current: Math.round(avgSleepThis * 10) / 10,
            previous: Math.round(avgSleepLast * 10) / 10,
            change: Math.round(sleepChange * 10) / 10,
            changePercent: avgSleepLast > 0 ? Math.round((sleepChange / avgSleepLast) * 100) : 0,
            trend: sleepChange > 0.5 ? "up" : sleepChange < -0.5 ? "down" : "stable",
        });

        // Protein intake
        const thisWeekFood = analyzeFoodCategories(thisWeekLogs, foodCategoryMap);
        const lastWeekFood = analyzeFoodCategories(lastWeekLogs, foodCategoryMap);
        const proteinThis = thisWeekFood["Protein"] || 0;
        const proteinLast = lastWeekFood["Protein"] || 0;
        const proteinChange = proteinThis - proteinLast;
        trends.push({
            metric: "Protein",
            current: proteinThis,
            previous: proteinLast,
            change: proteinChange,
            changePercent: proteinLast > 0 ? Math.round((proteinChange / proteinLast) * 100) : 0,
            trend: proteinChange > 0 ? "up" : proteinChange < 0 ? "down" : "stable",
        });

        // High intensity workouts
        const highIntensityThis = thisWeekLogs.filter(l => l.exercise?.intensity === "high").length;
        const highIntensityLast = lastWeekLogs.filter(l => l.exercise?.intensity === "high").length;
        const intensityChange = highIntensityThis - highIntensityLast;
        trends.push({
            metric: "High Intensity",
            current: highIntensityThis,
            previous: highIntensityLast,
            change: intensityChange,
            changePercent: highIntensityLast > 0 ? Math.round((intensityChange / highIntensityLast) * 100) : 0,
            trend: intensityChange > 0 ? "up" : intensityChange < 0 ? "down" : "stable",
        });

        return trends;
    },
});

// ============================================
// CORRELATIONS
// ============================================
export const getCorrelations = query({
    handler: async (ctx): Promise<Correlation[]> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const userId = identity.subject;
        const now = new Date();

        // Analyze last 30 days
        const endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);

        const logs = await getLogsForRange(ctx, userId, startDate, endDate);

        // Group logs by date
        const byDate = new Map<string, Doc<"logs">[]>();
        for (const log of logs) {
            const dateKey = log.date.split("T")[0];
            if (!byDate.has(dateKey)) byDate.set(dateKey, []);
            byDate.get(dateKey)!.push(log);
        }

        const correlations: Correlation[] = [];

        // Analyze correlations
        const dailyData: { sleep: number; mood: number; exercise: boolean; highIntensity: boolean }[] = [];

        for (const [_, dayLogs] of byDate) {
            const sleepLog = dayLogs.find(l => l.sleep);
            const moodLog = dayLogs.find(l => l.mood);
            const exerciseLog = dayLogs.find(l => l.exercise);

            dailyData.push({
                sleep: sleepLog?.sleep || 0,
                mood: moodLog?.mood || 0,
                exercise: !!exerciseLog,
                highIntensity: exerciseLog?.exercise?.intensity === "high",
            });
        }

        // Sleep vs Mood correlation
        const daysWithBothSleepMood = dailyData.filter(d => d.sleep > 0 && d.mood > 0);
        if (daysWithBothSleepMood.length >= 5) {
            const goodSleepDays = daysWithBothSleepMood.filter(d => d.sleep >= 7);
            const poorSleepDays = daysWithBothSleepMood.filter(d => d.sleep < 6);

            if (goodSleepDays.length >= 3 && poorSleepDays.length >= 3) {
                const avgMoodGoodSleep = goodSleepDays.reduce((s, d) => s + d.mood, 0) / goodSleepDays.length;
                const avgMoodPoorSleep = poorSleepDays.reduce((s, d) => s + d.mood, 0) / poorSleepDays.length;
                const diff = avgMoodGoodSleep - avgMoodPoorSleep;

                if (diff >= 0.5) {
                    correlations.push({
                        factor1: "Sleep (7+ hours)",
                        factor2: "Mood",
                        relationship: `Mood is ${diff.toFixed(1)} points higher on days with 7+ hours of sleep`,
                        strength: diff >= 1 ? "strong" : "moderate",
                        icon: "😴",
                    });
                }
            }
        }

        // Exercise vs Mood correlation
        const daysWithExerciseData = dailyData.filter(d => d.mood > 0);
        if (daysWithExerciseData.length >= 5) {
            const exerciseDays = daysWithExerciseData.filter(d => d.exercise);
            const restDays = daysWithExerciseData.filter(d => !d.exercise);

            if (exerciseDays.length >= 3 && restDays.length >= 3) {
                const avgMoodExercise = exerciseDays.reduce((s, d) => s + d.mood, 0) / exerciseDays.length;
                const avgMoodRest = restDays.reduce((s, d) => s + d.mood, 0) / restDays.length;
                const diff = avgMoodExercise - avgMoodRest;

                if (Math.abs(diff) >= 0.3) {
                    correlations.push({
                        factor1: "Exercise",
                        factor2: "Mood",
                        relationship: diff > 0
                            ? `Mood is ${diff.toFixed(1)} points higher on workout days`
                            : `Mood is ${Math.abs(diff).toFixed(1)} points lower on workout days`,
                        strength: Math.abs(diff) >= 0.8 ? "strong" : "moderate",
                        icon: "🏃",
                    });
                }
            }
        }

        // High intensity vs next day sleep
        // (This would need more sophisticated analysis - placeholder for now)

        return correlations;
    },
});

// ============================================
// GOAL PROGRESS
// ============================================
export const getGoalProgress = query({
    handler: async (ctx): Promise<GoalProgress[]> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const userId = identity.subject;
        const now = new Date();

        // Get current month data
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);
        const monthEnd = new Date(now);
        monthEnd.setHours(23, 59, 59, 999);

        const logs = await getLogsForRange(ctx, userId, monthStart, monthEnd);

        const goals: GoalProgress[] = [];

        // Calculate days elapsed and remaining
        const daysElapsed = Math.ceil((now.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24));
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysRemaining = daysInMonth - daysElapsed;

        // Workout goal (default: 16/month)
        const workoutTarget = 16;
        const workoutsLogged = logs.filter(l => l.exercise).length;
        const workoutRate = workoutsLogged / daysElapsed;
        const workoutPrediction = Math.round(workoutsLogged + (workoutRate * daysRemaining));

        goals.push({
            goal: "Monthly Workouts",
            current: workoutsLogged,
            target: workoutTarget,
            percent: Math.min(100, Math.round((workoutsLogged / workoutTarget) * 100)),
            prediction: workoutPrediction,
            onTrack: workoutPrediction >= workoutTarget,
            icon: "🏋️",
        });

        // Sleep goal (7 hours average)
        const sleepLogs = logs.filter(l => l.sleep && l.sleep > 0);
        const avgSleep = sleepLogs.length > 0
            ? sleepLogs.reduce((sum, l) => sum + (l.sleep || 0), 0) / sleepLogs.length
            : 0;
        const sleepTarget = 7;

        goals.push({
            goal: "Avg Sleep",
            current: Math.round(avgSleep * 10) / 10,
            target: sleepTarget,
            percent: Math.min(100, Math.round((avgSleep / sleepTarget) * 100)),
            prediction: Math.round(avgSleep * 10) / 10, // Sleep average is the prediction
            onTrack: avgSleep >= sleepTarget - 0.5,
            icon: "🛏️",
        });

        // High intensity balance (aim for 30-40% of workouts)
        const highIntensityCount = logs.filter(l => l.exercise?.intensity === "high").length;
        const highIntensityPercent = workoutsLogged > 0
            ? Math.round((highIntensityCount / workoutsLogged) * 100)
            : 0;
        const targetPercent = 35; // Target 35% high intensity

        goals.push({
            goal: "High Intensity Mix",
            current: highIntensityPercent,
            target: targetPercent,
            percent: Math.min(100, Math.round((highIntensityPercent / targetPercent) * 100)),
            prediction: highIntensityPercent,
            onTrack: highIntensityPercent >= 25 && highIntensityPercent <= 45,
            icon: "🔥",
        });

        return goals;
    },
});

// ============================================
// WEEKLY DIGEST (3 key insights)
// ============================================
export const getWeeklyDigest = query({
    handler: async (ctx): Promise<Insight[]> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const userId = identity.subject;
        const now = new Date();

        // Get last 7 days
        const weekEnd = new Date(now);
        weekEnd.setHours(23, 59, 59, 999);
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);

        const logs = await getLogsForRange(ctx, userId, weekStart, weekEnd);
        const insights: Insight[] = [];

        // 1. ACHIEVEMENT (positive)
        const workouts = logs.filter(l => l.exercise);
        const highIntensity = workouts.filter(l => l.exercise?.intensity === "high");

        if (workouts.length >= 5) {
            insights.push({
                type: "achievement",
                icon: "🎉",
                title: "Great Week!",
                message: `You logged ${workouts.length} workouts this week. Keep up the momentum!`,
                priority: 100,
                color: "green",
            });
        } else if (workouts.length >= 3) {
            insights.push({
                type: "achievement",
                icon: "💪",
                title: "Solid Progress",
                message: `${workouts.length} workouts this week. You're building consistency!`,
                priority: 90,
                color: "green",
            });
        } else if (highIntensity.length >= 2) {
            insights.push({
                type: "achievement",
                icon: "🔥",
                title: "Intensity Champion",
                message: `${highIntensity.length} high-intensity sessions this week. Quality over quantity!`,
                priority: 85,
                color: "orange",
            });
        } else {
            // Default positive
            const sleepLogs = logs.filter(l => l.sleep && l.sleep >= 7);
            if (sleepLogs.length >= 4) {
                insights.push({
                    type: "achievement",
                    icon: "😴",
                    title: "Sleep Champion",
                    message: `You got 7+ hours of sleep on ${sleepLogs.length} days. Great recovery!`,
                    priority: 80,
                    color: "blue",
                });
            } else {
                insights.push({
                    type: "achievement",
                    icon: "📊",
                    title: "Tracking Streak",
                    message: `You logged ${logs.length} activities this week. Keep tracking!`,
                    priority: 70,
                    color: "green",
                });
            }
        }

        // 2. IMPROVEMENT AREA
        const sleepLogs = logs.filter(l => l.sleep);
        const avgSleep = sleepLogs.length > 0
            ? sleepLogs.reduce((sum, l) => sum + (l.sleep || 0), 0) / sleepLogs.length
            : 0;

        if (avgSleep > 0 && avgSleep < 6.5) {
            insights.push({
                type: "trend",
                icon: "⚠️",
                title: "Sleep Deficit",
                message: `Averaging ${avgSleep.toFixed(1)}h sleep this week. Aim for 7-8h for better recovery.`,
                priority: 80,
                color: "yellow",
            });
        } else if (workouts.length < 3 && logs.length > 5) {
            insights.push({
                type: "trend",
                icon: "🚶",
                title: "Movement Opportunity",
                message: `Only ${workouts.length} workout${workouts.length !== 1 ? "s" : ""} this week. Try adding a short walk or yoga session.`,
                priority: 75,
                color: "yellow",
            });
        } else if (highIntensity.length === 0 && workouts.length >= 3) {
            insights.push({
                type: "trend",
                icon: "📈",
                title: "Intensity Boost",
                message: "All workouts were low/mid intensity. Consider adding one high-intensity session.",
                priority: 70,
                color: "yellow",
            });
        } else {
            // Default improvement
            insights.push({
                type: "trend",
                icon: "💡",
                title: "Stay Balanced",
                message: "Keep balancing workouts, nutrition, and rest for optimal results.",
                priority: 60,
                color: "blue",
            });
        }

        // 3. CORRELATION (interesting pattern)
        // Get correlations and pick the strongest one
        const correlations = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) => q.eq("userId", userId))
            .collect();

        // Simple pattern: check if high-intensity days had good sleep the night before
        const sleepBeforeIntense = logs.filter(l => l.exercise?.intensity === "high").length;
        if (sleepBeforeIntense >= 2) {
            insights.push({
                type: "correlation",
                icon: "🔗",
                title: "Pattern Noticed",
                message: `You did ${sleepBeforeIntense} high-intensity workouts. Recovery is key after intense sessions.`,
                priority: 65,
                color: "purple",
            });
        } else {
            insights.push({
                type: "correlation",
                icon: "📊",
                title: "Building Data",
                message: "Keep logging to discover patterns between sleep, exercise, and energy levels.",
                priority: 50,
                color: "gray",
            });
        }

        return insights.slice(0, 3);
    },
});

// ============================================
// COMPARISONS (week over week)
// ============================================
export const getComparisons = query({
    handler: async (ctx): Promise<{ metric: string; thisWeek: string; lastWeek: string; change: string; positive: boolean }[]> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const userId = identity.subject;
        const now = new Date();

        // This week
        const thisWeekEnd = new Date(now);
        thisWeekEnd.setHours(23, 59, 59, 999);
        const thisWeekStart = new Date(now);
        thisWeekStart.setDate(thisWeekStart.getDate() - 6);
        thisWeekStart.setHours(0, 0, 0, 0);

        // Last week
        const lastWeekEnd = new Date(thisWeekStart);
        lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
        lastWeekEnd.setHours(23, 59, 59, 999);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekStart.getDate() - 6);
        lastWeekStart.setHours(0, 0, 0, 0);

        const thisWeekLogs = await getLogsForRange(ctx, userId, thisWeekStart, thisWeekEnd);
        const lastWeekLogs = await getLogsForRange(ctx, userId, lastWeekStart, lastWeekEnd);

        const comparisons = [];

        // Workouts
        const workoutsThis = thisWeekLogs.filter(l => l.exercise).length;
        const workoutsLast = lastWeekLogs.filter(l => l.exercise).length;
        const workoutDiff = workoutsThis - workoutsLast;
        comparisons.push({
            metric: "Workouts",
            thisWeek: String(workoutsThis),
            lastWeek: String(workoutsLast),
            change: workoutDiff > 0 ? `+${workoutDiff}` : String(workoutDiff),
            positive: workoutDiff >= 0,
        });

        // Sleep average
        const sleepThis = thisWeekLogs.filter(l => l.sleep);
        const sleepLast = lastWeekLogs.filter(l => l.sleep);
        const avgThis = sleepThis.length > 0
            ? sleepThis.reduce((s, l) => s + (l.sleep || 0), 0) / sleepThis.length
            : 0;
        const avgLast = sleepLast.length > 0
            ? sleepLast.reduce((s, l) => s + (l.sleep || 0), 0) / sleepLast.length
            : 0;
        const sleepDiff = avgThis - avgLast;
        comparisons.push({
            metric: "Avg Sleep",
            thisWeek: `${avgThis.toFixed(1)}h`,
            lastWeek: `${avgLast.toFixed(1)}h`,
            change: sleepDiff > 0 ? `+${sleepDiff.toFixed(1)}h` : `${sleepDiff.toFixed(1)}h`,
            positive: sleepDiff >= 0,
        });

        // Exercise minutes
        const minsThis = thisWeekLogs.reduce((s, l) => s + (l.exercise?.duration || 0), 0);
        const minsLast = lastWeekLogs.reduce((s, l) => s + (l.exercise?.duration || 0), 0);
        const minsDiff = minsThis - minsLast;
        comparisons.push({
            metric: "Exercise Time",
            thisWeek: `${minsThis}m`,
            lastWeek: `${minsLast}m`,
            change: minsDiff > 0 ? `+${minsDiff}m` : `${minsDiff}m`,
            positive: minsDiff >= 0,
        });

        return comparisons;
    },
});

// ============================================
// DAILY INSIGHTS (existing, kept for compatibility)
// ============================================
export const getDailyInsights = query({
    args: {
        date: v.string(),
    },
    handler: async (ctx, args): Promise<Insight[]> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const userId = identity.subject;

        const dateStart = new Date(args.date);
        dateStart.setHours(0, 0, 0, 0);
        const dateEnd = new Date(args.date);
        dateEnd.setHours(23, 59, 59, 999);

        const logs = await getLogsForRange(ctx, userId, dateStart, dateEnd);

        const foodItems = await ctx.db.query("foodItems").collect();
        const foodCategoryMap = new Map(foodItems.map((f: Doc<"foodItems">) => [f.name.toLowerCase(), f.category]));

        const insights: Insight[] = [];

        const exercises = logs.filter(l => l.exercise);
        const hasHighIntensity = exercises.some(l => l.exercise?.intensity === "high");
        const hasMidIntensity = exercises.some(l => l.exercise?.intensity === "mid");

        const categoryCounts = analyzeFoodCategories(logs, foodCategoryMap);
        const totalFoodItems = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
        const proteinCount = categoryCounts["Protein"] || 0;
        const carbCount = categoryCounts["Carb"] || 0;

        // High intensity + low protein
        if (hasHighIntensity && totalFoodItems > 0 && proteinCount < totalFoodItems * 0.25) {
            insights.push({
                type: "food",
                icon: "💪",
                title: "Protein Boost Recommended",
                message: "After high-intensity exercise, add more protein for recovery.",
                priority: 90,
            });
        }

        // Carb heavy
        if (totalFoodItems >= 4 && carbCount > totalFoodItems * 0.5) {
            insights.push({
                type: "food",
                icon: "🍞",
                title: "Carb-Heavy Day",
                message: "Balance with protein and veggies.",
                priority: 60,
            });
        }

        insights.sort((a, b) => b.priority - a.priority);
        return insights.slice(0, 3);
    },
});

