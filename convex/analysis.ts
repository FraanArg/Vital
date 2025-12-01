import { query } from "./_generated/server";
import { v } from "convex/values";

export const getInsights = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Fetch last 30 days of logs
        const logs = await ctx.db
            .query("logs")
            .withIndex("by_userId_date", (q) =>
                q.eq("userId", identity.subject).gte("date", thirtyDaysAgo.toISOString())
            )
            .collect();

        const insights: { type: "trend" | "correlation" | "achievement"; message: string; icon: string; color: string }[] = [];

        // --- Trend Analysis (Current Week vs Previous Week) ---
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const currentWeekLogs = logs.filter(l => l.date >= oneWeekAgo.toISOString());
        const previousWeekLogs = logs.filter(l => l.date >= twoWeeksAgo.toISOString() && l.date < oneWeekAgo.toISOString());

        // Water Trend
        const currentWaterAvg = currentWeekLogs.reduce((acc, l) => acc + (l.water || 0), 0) / (currentWeekLogs.length || 1);
        const previousWaterAvg = previousWeekLogs.reduce((acc, l) => acc + (l.water || 0), 0) / (previousWeekLogs.length || 1);

        if (previousWaterAvg > 0) {
            const diff = ((currentWaterAvg - previousWaterAvg) / previousWaterAvg) * 100;
            if (diff > 10) {
                insights.push({
                    type: "trend",
                    message: `💧 Water intake is up ${Math.round(diff)}% this week!`,
                    icon: "TrendingUp",
                    color: "text-blue-500"
                });
            } else if (diff < -10) {
                insights.push({
                    type: "trend",
                    message: `💧 Water intake is down ${Math.round(Math.abs(diff))}% this week.`,
                    icon: "TrendingDown",
                    color: "text-blue-500"
                });
            }
        }

        // --- Correlation Analysis (Exercise Impact) ---
        const exerciseDays = logs.filter(l => l.exercise);
        const restDays = logs.filter(l => !l.exercise);

        // Sleep Correlation
        if (exerciseDays.length > 3 && restDays.length > 3) {
            const exerciseSleepAvg = exerciseDays.reduce((acc, l) => acc + (l.sleep || 0), 0) / exerciseDays.length;
            const restSleepAvg = restDays.reduce((acc, l) => acc + (l.sleep || 0), 0) / restDays.length;

            if (exerciseSleepAvg > restSleepAvg * 1.05) { // 5% better
                insights.push({
                    type: "correlation",
                    message: `💡 You sleep ${(exerciseSleepAvg - restSleepAvg).toFixed(1)}h longer on days you workout.`,
                    icon: "Lightbulb",
                    color: "text-purple-500"
                });
            }
        }

        // Mood Correlation
        if (exerciseDays.length > 3 && restDays.length > 3) {
            const exerciseMoodAvg = exerciseDays.reduce((acc, l) => acc + (l.mood || 0), 0) / exerciseDays.length;
            const restMoodAvg = restDays.reduce((acc, l) => acc + (l.mood || 0), 0) / restDays.length;

            if (exerciseMoodAvg > restMoodAvg * 1.05) {
                insights.push({
                    type: "correlation",
                    message: `💡 Your mood is ${(exerciseMoodAvg - restMoodAvg).toFixed(1)} points higher when you exercise.`,
                    icon: "Smile",
                    color: "text-yellow-500"
                });
            }
        }

        return insights;
    },
});
